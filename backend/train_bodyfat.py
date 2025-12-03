# train_bodyfat.py
#
# Train a RandomForestRegressor on a real body-fat dataset and save it
# as bodyfat_model.joblib for the FastAPI backend to use.

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import joblib

MODEL_PATH = "bodyfat_model.joblib"
CSV_PATH = "bodyfat_training.csv"  # <- rename your CSV to this, or change this path.


def load_data():
    """
    Load the body-fat dataset from CSV and map columns to:
      - gender       (0=female, 1=male)
      - height_cm
      - weight_kg
      - waist_cm
      - hip_cm
      - neck_cm
      - bodyfat_pct  (target)

    The CSV you uploaded has columns:
      Density, BodyFat, Age, Weight, Height, Neck, Chest, Abdomen, Hip, ...
    """
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(
            f"{CSV_PATH} not found. "
            "Place your body-fat CSV in the backend folder and rename it to 'bodyfat_training.csv', "
            "or update CSV_PATH in train_bodyfat.py."
        )

    df = pd.read_csv(CSV_PATH)

    # Rename columns to a standardized schema
    df = df.rename(
        columns={
            "BodyFat": "bodyfat_pct",
            "Weight": "weight_lb",
            "Height": "height_in",
            "Neck": "neck_cm",
            "Abdomen": "waist_cm",  # abdomen girth is effectively waist
            "Hip": "hip_cm",
        }
    )

    # Convert to metric units
    df["weight_kg"] = df["weight_lb"] * 0.453592
    df["height_cm"] = df["height_in"] * 2.54

    # Dataset is all male → encode as gender=1
    df["gender"] = 1

    # Drop rows missing the target to be safe
    df = df.dropna(subset=["bodyfat_pct"])

    # Keep only the columns we care about
    df = df[
        [
            "gender",
            "height_cm",
            "weight_kg",
            "waist_cm",
            "hip_cm",
            "neck_cm",
            "bodyfat_pct",
        ]
    ]

    return df


def train_and_save():
    df = load_data()

    feature_cols = [
        "gender",
        "height_cm",
        "weight_kg",
        "waist_cm",
        "hip_cm",
        "neck_cm",
    ]
    target_col = "bodyfat_pct"

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=None,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    print("=== Bodyfat Model Metrics ===")
    print(f"R^2:  {r2:.3f}")
    print(f"MAE:  {mae:.2f} % body fat")

    joblib.dump(model, MODEL_PATH)
    print(f"✅ Saved model to {MODEL_PATH}")


if __name__ == "__main__":
    train_and_save()
