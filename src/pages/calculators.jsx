// src/pages/calculators.jsx
import React, { useState, useEffect } from 'react';
import { Flame, Zap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/CalculatorsPage.css';
import CalculatorCard from '../components/ui/CalculatorCard';

const calculators = [
  {
    title: 'TDEE Calculator',
    subtitle: 'Calories & energy',
    icon: Flame,
    href: '/calculators/tdee',
    description:
      'Estimate daily calories based on activity level, weight, height and age using the Mifflin-St Jeor equation.',
  },
  {
    title: 'Protein Calculator',
    subtitle: 'Daily intake targets',
    icon: Zap,
    href: '/calculators/protein',
    description:
      'Find your optimal daily protein intake for muscle growth, fat loss, or maintenance based on lean body mass.',
  },
  {
    title: '1RM Calculator',
    subtitle: 'Strength estimation',
    icon: Trophy,
    href: '/calculators/1rm',
    description:
      'Calculate your estimated one-rep max using Epley, Brzycki, and Lombardi formulas.',
  },
];

const howRows = [
  {
    icon: Flame,
    title: 'TDEE — Mifflin-St Jeor equation',
    body: 'Calculates your basal metabolic rate then multiplies by your activity level to estimate total daily energy expenditure. Most accurate equation for non-athletes.',
  },
  {
    icon: Zap,
    title: 'Protein — lean body mass method',
    body: 'Uses lean mass rather than total bodyweight to calculate protein needs, since muscle tissue drives protein requirements. Adjusts for training volume and age.',
  },
  {
    icon: Trophy,
    title: '1RM — Epley formula (primary)',
    body: 'Estimates your theoretical one-rep maximum from a submaximal set. Shows results from three formulas so you can see the range rather than relying on one number.',
  },
];

const tips = [
  {
    title: 'Use lean mass for protein',
    body: 'Enter your body fat % in the protein calculator for a more accurate target than weight-based estimates.',
  },
  {
    title: 'TDEE changes over time',
    body: 'Recalculate every 4–6 weeks as your weight changes. A 10 lb drop can shift your TDEE by 80–100 kcal.',
  },
  {
    title: '1RM is an estimate',
    body: 'Use a set of 3–5 reps for the most accurate 1RM estimate. High-rep sets of 10 or more lose accuracy quickly.',
  },
];

function SectionLabel({ text }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 500,
      color: '#888',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: 10,
    }}>
      {text}
    </div>
  );
}

function ResultChip({ value, label, source }) {
  return (
    <div style={{
      background: '#0f1117',
      border: '1px solid #1e2536',
      borderRadius: 8,
      padding: '10px 14px',
    }}>
      <div style={{ fontSize: 18, fontWeight: 500, color: '#1D9E75', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>{label}</div>
      <div style={{ fontSize: 9, color: '#2a3548', marginTop: 2 }}>{source}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CalculatorsPage() {
  const [saved, setSaved] = useState({ tdee: null, protein: null, orm: null });

  useEffect(() => {
    setSaved({
      tdee:    JSON.parse(localStorage.getItem('gainlytics_tdee_results')    || 'null'),
      protein: JSON.parse(localStorage.getItem('gainlytics_protein_results') || 'null'),
      orm:     JSON.parse(localStorage.getItem('gainlytics_1rm_results')     || 'null'),
    });
  }, []);

  const dates = [saved.tdee?.updatedAt, saved.protein?.updatedAt, saved.orm?.updatedAt].filter(Boolean);
  const lastUpdated = dates.length > 0 ? formatDate([...dates].sort().at(-1)) : null;
  const hasAnyResults = dates.length > 0;

  return (
    <div className="calculators-container">
      {/* ── Page title ── */}
      <motion.h1
        className="calculators-title"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        Fitness Calculators
      </motion.h1>

      {/* ── Calculator cards ── */}
      <div className="calculator-grid">
        {calculators.map((calc, index) => (
          <CalculatorCard
            key={calc.href}
            index={index}
            title={calc.title}
            subtitle={calc.subtitle}
            description={calc.description}
            icon={calc.icon}
            href={calc.href}
          />
        ))}
      </div>

      {/* ── Section 1: Your last results ── */}
      <div>
        <SectionLabel text="Your Last Results" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.25 }}
          style={{
            background: '#161b27',
            border: '1px solid #1e2536',
            borderRadius: 10,
            padding: '16px 20px',
          }}
        >
          {hasAnyResults ? (
            <>
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>Based on your profile</span>
                <span style={{ fontSize: 10, color: '#555' }}>Last updated {lastUpdated}</span>
              </div>
              {/* Chips grid */}
              <div className="results-chips-grid">
                <ResultChip
                  value={saved.tdee?.tdee?.toLocaleString()}
                  label="kcal maintenance"
                  source="TDEE"
                />
                <ResultChip
                  value={saved.tdee?.cutting?.toLocaleString()}
                  label="kcal cutting"
                  source="TDEE"
                />
                <ResultChip
                  value={saved.protein?.optimal != null ? `${saved.protein.optimal}g` : null}
                  label="protein / day"
                  source="Protein calc"
                />
                <ResultChip
                  value={saved.orm?.oneRepMax != null ? `${saved.orm.oneRepMax} ${saved.orm.unit}` : null}
                  label="est. 1RM"
                  source="1RM calc"
                />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: '#555' }}>
              Run a calculator to see your results here
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Section 2: How these work ── */}
      <div>
        <SectionLabel text="How These Work" />
        <div style={{
          background: '#161b27',
          border: '1px solid #1e2536',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          {howRows.map((row, i) => (
            <motion.div
              key={row.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.32 + i * 0.06 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '14px 16px',
                borderBottom: i < howRows.length - 1 ? '1px solid #1e2536' : 'none',
              }}
            >
              {/* Icon square */}
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                background: '#0a2a1e',
                border: '1px solid #1D9E75',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <row.icon width={13} height={13} stroke="#1D9E75" strokeWidth={1.5} fill="none" />
              </div>
              {/* Text */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#fff', marginBottom: 3 }}>{row.title}</div>
                <div style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}>{row.body}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Tips for accuracy ── */}
      <div>
        <SectionLabel text="Tips for Accuracy" />
        <div className="tips-grid">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.5 + i * 0.06 }}
              style={{
                background: '#161b27',
                border: '1px solid #1e2536',
                borderRadius: 8,
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 500, color: '#5DCAA5', marginBottom: 4 }}>{tip.title}</div>
              <div style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}>{tip.body}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalculatorsPage;
