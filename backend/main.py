# main.py
#
# FastAPI backend for the AI Body Analyzer.
# - /analyze-measurements: main endpoint, uses dataset-trained RandomForest
# - /analyze-image: experimental, heuristic-only (no model blending)
# - /: simple health check

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import cv2
from PIL import Image
import io
import joblib
import os

app = FastAPI(title="AI Body Analyzer")

# -------------------------------------------------
# CORS – allow browser clients to call API
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # OK for school/portfolio; tighten for production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Load ML model (dataset-trained, numeric metrics)
# -------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "bodyfat_model.joblib")

bodyfat_model = None
if os.path.exists(MODEL_PATH):
    try:
        bodyfat_model = joblib.load(MODEL_PATH)
        print("✅ Loaded bodyfat model from", MODEL_PATH)
    except Exception as e:
        print("⚠️ Could not load model:", e)
else:
    print("⚠️ bodyfat_model.joblib not found. /analyze-measurements will error until you train it.")


# -------------------------------------------------
# Pydantic schemas
# -------------------------------------------------
class AnalysisResponse(BaseModel):
    bodyfat: float
    category: str
    goal_suggestion: str
    suggested_calories: int
    notes: list[str]


class MeasurementRequest(BaseModel):
    """
    Measurement-based analysis request.

    Frontend collects imperial units and converts to:
      gender: 0=female, 1=male
      height_cm, weight_kg, waist_cm, hip_cm, neck_cm
    """
    gender: int          # 0=female, 1=male
    height_cm: float
    weight_kg: float
    waist_cm: float
    hip_cm: float
    neck_cm: float


# -------------------------------------------------
# Helper: extract numeric features + shape metrics from image
# (For experimental image-based analysis; not dataset-trained)
# -------------------------------------------------
def extract_image_features(image_bytes: bytes):
    """
    Returns:
      feature_vec: (1,6) numpy array (pseudo measurements)
      metrics: dict with simple shape features for heuristics

    feature_vec is a rough guess of:
      [gender, height_cm, weight_kg, waist_cm, hip_cm, neck_cm]
    """
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    pil_img = pil_img.resize((256, 256))
    img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    img_h, img_w = gray.shape[:2]

    if not contours:
        # fallback vector + neutral metrics
        vec = np.array([1, 170, 75, 85, 95, 38], dtype=float)  # [gender, h, w, waist, hip, neck]
        metrics = {
            "aspect_ratio": 1.6,
            "area_ratio": 0.3,
            "width_ratio": 0.35,
        }
        return vec.reshape(1, -1), metrics

    # Pick the most "human-like" contour
    best = None
    best_score = -1e9

    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        area = cv2.contourArea(c)

        aspect_ratio = h / (w + 1e-6)
        area_ratio = area / (img_h * img_w + 1e-6)
        width_ratio = w / (img_w + 1e-6)

        score = 0.0
        score -= abs(aspect_ratio - 2.0)
        score -= max(0.0, (width_ratio - 0.6)) * 2.0
        score -= max(0.0, (0.18 - width_ratio)) * 2.0
        score -= max(0.0, (area_ratio - 0.7)) * 2.0
        score -= max(0.0, (0.04 - area_ratio)) * 2.0

        if score > best_score:
            best_score = score
            best = (x, y, w, h, area_ratio, aspect_ratio, width_ratio)

    if best is None:
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        area_ratio = cv2.contourArea(largest) / (img_h * img_w + 1e-6)
        aspect_ratio = h / (w + 1e-6)
        width_ratio = w / (img_w + 1e-6)
    else:
        x, y, w, h, area_ratio, aspect_ratio, width_ratio = best

    # Pseudo-measurements for debugging / optional model use
    gender = 1  # assume male by default
    height_cm = 170.0
    weight_kg = 70 + (area_ratio - 0.25) * 80
    waist_cm = 80 + (1.8 - aspect_ratio) * 15
    neck_cm = 38 - (aspect_ratio - 1.5) * 4
    hip_cm = waist_cm + 5

    vec = np.array([gender, height_cm, weight_kg, waist_cm, hip_cm, neck_cm], dtype=float)
    metrics = {
        "aspect_ratio": float(aspect_ratio),
        "area_ratio": float(area_ratio),
        "width_ratio": float(width_ratio),
    }

    return vec.reshape(1, -1), metrics


# -------------------------------------------------
# Heuristic bodyfat from shape metrics (for image-based path)
# -------------------------------------------------
def heuristic_bodyfat_from_shape(metrics: dict) -> float:
    width_ratio = metrics.get("width_ratio", 0.35)
    area_ratio = metrics.get("area_ratio", 0.30)
    aspect_ratio = metrics.get("aspect_ratio", 1.7)

    if width_ratio < 0.22:
        bf = 11.0
    elif width_ratio < 0.30:
        bf = 17.0
    elif width_ratio < 0.38:
        bf = 25.0
    elif width_ratio < 0.48:
        bf = 30.0
    else:
        bf = 36.0

    if area_ratio < 0.06:
        bf -= 1.0
    elif area_ratio > 0.40:
        bf += 3.0

    if 0.28 <= width_ratio <= 0.40 and 0.08 <= area_ratio <= 0.18:
        bf += 5.0

    if aspect_ratio > 2.2:
        bf -= 1.0
    elif aspect_ratio > 1.8:
        bf -= 0.5
    elif aspect_ratio < 1.4:
        bf += 2.0

    bf = max(5.0, min(45.0, bf))
    return bf


# -------------------------------------------------
# Helper: map bodyfat to category + recommendations
# -------------------------------------------------
def interpretation_and_plan(bodyfat: float) -> tuple[str, str, int, list[str]]:
    bf = float(bodyfat)

    if bf < 12:
        category = "Very lean / athletic"
        goal = "Maintenance or lean bulk"
        cals = 2600
        notes = [
            "You’re already quite lean. Focus on performance and strength.",
            "A small surplus or maintenance calories can help build muscle.",
            "Keep protein high (0.8–1.0 g per lb of body weight).",
        ]
    elif bf < 20:
        category = "Average to fit"
        goal = "Mild cut or recomposition"
        cals = 2300
        notes = [
            "You’re in a good spot. Decide if you want more definition or muscle.",
            "A small deficit with 3–4 days of lifting works well.",
            "Aim for 7–9k steps per day to support fat loss.",
        ]
    elif bf < 28:
        category = "Higher bodyfat"
        goal = "Fat loss (cutting)"
        cals = 2100
        notes = [
            "Focus on a moderate calorie deficit you can stick to.",
            "Combine 3–4 lifting sessions with daily walking (7–10k steps).",
            "Try not to lose more than ~1% of bodyweight per week.",
        ]
    else:
        category = "Obese range (est.)"
        goal = "Gradual fat loss"
        cals = 1900
        notes = [
            "Start with simple, sustainable changes. No crash diets.",
            "Prioritize walking and light activity to build habits.",
            "Talk with a healthcare provider before aggressive dieting or training.",
        ]

    return category, goal, cals, notes


# -------------------------------------------------
# Measurement-based analysis endpoint (dataset model)
# -------------------------------------------------
@app.post("/analyze-measurements", response_model=AnalysisResponse)
async def analyze_measurements(data: MeasurementRequest):
    if bodyfat_model is None:
        raise HTTPException(
            status_code=500,
            detail="Bodyfat model is not loaded. Train it with train_bodyfat.py.",
        )

    features = np.array(
        [
            [
                data.gender,
                data.height_cm,
                data.weight_kg,
                data.waist_cm,
                data.hip_cm,
                data.neck_cm,
            ]
        ],
        dtype=float,
    )

    try:
        pred = bodyfat_model.predict(features)
        bodyfat = float(pred[0])
    except Exception as e:
        print("Model prediction error (measurements):", e)
        raise HTTPException(
            status_code=500,
            detail="Could not generate prediction from measurements.",
        )

    bodyfat = max(4.0, min(45.0, bodyfat))

    category, goal, cals, notes = interpretation_and_plan(bodyfat)

    return AnalysisResponse(
        bodyfat=round(bodyfat, 1),
        category=category,
        goal_suggestion=goal,
        suggested_calories=int(cals),
        notes=notes,
    )


# -------------------------------------------------
# Image-based analysis (experimental – heuristic only)
# -------------------------------------------------
@app.post("/analyze-image", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    if file.content_type not in ("image/jpeg", "image/png", "image/jpg"):
        raise HTTPException(
            status_code=400, detail="Please upload a JPG or PNG image."
        )

    image_bytes = await file.read()

    # 1) extract silhouette metrics
    _features, metrics = extract_image_features(image_bytes)

    # 2) heuristic estimate from shape ONLY (no ML blending)
    bodyfat = heuristic_bodyfat_from_shape(metrics)

    # 3) clamp + interpret
    bodyfat = max(4.0, min(45.0, bodyfat))
    category, goal, cals, notes = interpretation_and_plan(bodyfat)

    return AnalysisResponse(
        bodyfat=round(bodyfat, 1),
        category=category,
        goal_suggestion=goal,
        suggested_calories=int(cals),
        notes=notes,
    )


# -------------------------------------------------
# Health check
# -------------------------------------------------
@app.get("/")
def root():
    return {"message": "AI Body Analyzer backend is running"}
