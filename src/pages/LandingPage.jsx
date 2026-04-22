import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ruler,
  Target,
  Zap,
  TrendingUp,
  CalendarDays,
  BookOpen,
  Check,
  Lock,
  Play,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import '../styles/landing.css';
import '../styles/legal.css';

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);
  return reduced;
}

function useScrollPosition(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: Ruler,
    title: 'Measurements',
    desc: 'Log body measurements and track composition changes over time.',
  },
  {
    icon: Target,
    title: 'Goal Planner',
    desc: 'Set weight, strength, and body goals and follow the path to hitting them.',
  },
  {
    icon: Zap,
    title: 'Workout Logger',
    desc: 'Log sets, reps, and weight for every session. Build real training history.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Charts',
    desc: 'Visualize weight, strength, and measurement trends in clean charts.',
  },
  {
    icon: CalendarDays,
    title: 'Consistency Calendar',
    desc: 'Mark active days and build streaks that keep you accountable.',
  },
  {
    icon: BookOpen,
    title: 'Exercise Library',
    desc: 'Browse hundreds of exercises with instructions, muscles worked, and more.',
  },
];

const FEATURE_STRIP = [
  { label: 'Meal planner', desc: 'AI-powered weekly meal suggestions' },
  { label: 'Macro calculator', desc: 'Full TDEE + macro breakdown' },
  { label: 'Workout tracking', desc: 'Log sessions, track PRs, view charts' },
];

const STATS = [
  { value: 'Free', label: 'to get started' },
  { value: '96+', label: 'exercises tracked' },
  { value: '5 min', label: 'to set up' },
];

const FREE_FEATURES = [
  '10 workout logs per month',
  'Goal Planner & Progress Charts',
  'Consistency Calendar',
  'Exercise Library',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited measurements',
  'Unlimited workout logs',
  'Advanced progress charts',
  'Priority support',
  'Data export (CSV)',
];

const PRO_PLUS_FEATURES = [
  'Everything in Pro',
  'AI Meal Suggestions (300/mo)',
  'AI-powered nutrition planning',
  'Personalized macro-fit meals',
];

/* ------------------------------------------------------------------ */
/* Navbar                                                             */
/* ------------------------------------------------------------------ */

function Navbar() {
  const scrolled = useScrollPosition(20);
  return (
    <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
      <Link to="/" className="lp-nav__logo">
        <span className="lp-nav__logo-icon"><Lock size={14} /></span>
        <span className="lp-nav__logo-name">MacroVault</span>
      </Link>

      <div className="lp-nav__links">
        <a href="#features" className="lp-nav__link">Features</a>
        <a href="#pricing" className="lp-nav__link">Pricing</a>
        <Link to="/about" className="lp-nav__link">About</Link>
      </div>

      <div className="lp-nav__actions">
        <Link to="/auth" className="lp-nav__signin">Sign in</Link>
        <Link to="/auth" className="lp-nav__cta">Get started</Link>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero() {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();

  const fadeUp = (delay) =>
    reduced
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1], delay },
        };

  return (
    <section className="lp-hero" id="hero">
      {/* Background orbs */}
      <motion.div
        className="lp-hero__orb lp-hero__orb--1"
        aria-hidden
        animate={reduced ? {} : { x: [0, 20, 0], y: [0, 12, 0] }}
        transition={reduced ? {} : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="lp-hero__orb lp-hero__orb--2"
        aria-hidden
        animate={reduced ? {} : { x: [0, -16, 0], y: [0, -10, 0] }}
        transition={reduced ? {} : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="lp-hero__grid">
        {/* LEFT COLUMN */}
        <div className="lp-hero__left">
          <motion.div className="lp-hero__badge" {...fadeUp(0.1)}>
            <span className="lp-hero__badge-dot" />
            Track smarter. Train harder.
          </motion.div>

          <motion.h1 className="lp-hero__heading" {...fadeUp(0.25)}>
            <span>Data-driven fitness,</span>
            <br />
            <span className="lp-hero__heading--accent">without the guesswork.</span>
          </motion.h1>

          <motion.p className="lp-hero__sub" {...fadeUp(0.4)}>
            Track workouts, estimate your body composition and hit your goals all in one place.
            Built for people who want real data, not just motivation.
          </motion.p>

          <motion.div className="lp-hero__ctas" {...fadeUp(0.55)}>
            <button
              className="lp-hero__cta-primary"
              onClick={() => navigate('/auth')}
            >
              Start for free
            </button>
            <a href="#features" className="lp-hero__cta-secondary">
              <Play size={12} />
              See how it works
            </a>
          </motion.div>

          <motion.div className="lp-hero__stats-wrap" {...fadeUp(0.7)}>
            <div className="lp-hero__stats-divider" />
            <div className="lp-hero__stats">
              {STATS.map((s, i) => (
                <React.Fragment key={s.value}>
                  {i > 0 && <div className="lp-hero__stat-sep" />}
                  <div className="lp-hero__stat">
                    <div className="lp-hero__stat-value">{s.value}</div>
                    <div className="lp-hero__stat-label">{s.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN — dashboard preview */}
        <div className="lp-hero__right">
          <DashboardPreview reduced={reduced} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard preview mockup                                           */
/* ------------------------------------------------------------------ */

function DashboardPreview({ reduced }) {
  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const floatAnim = reduced
    ? {}
    : { y: [0, -12, 0] };
  const floatTrans = reduced
    ? {}
    : { duration: 5, repeat: Infinity, ease: 'easeInOut' };

  return (
    <motion.div
      className="lp-preview"
      animate={floatAnim}
      transition={floatTrans}
    >
      <div className="lp-preview__frame">
        {/* Browser header */}
        <div className="lp-preview__header">
          <div className="lp-preview__dots">
            <span className="lp-preview__dot" style={{ background: '#ff5f57' }} />
            <span className="lp-preview__dot" style={{ background: '#febc2e' }} />
            <span className="lp-preview__dot" style={{ background: '#28c840' }} />
          </div>
          <div className="lp-preview__url">macro-vault.com/dashboard</div>
        </div>

        {/* Dashboard body */}
        <div className="lp-preview__body">
          <div className="lp-preview__greet-row">
            <span className="lp-preview__eyebrow">GOOD MORNING</span>
            <span className="lp-preview__date">{today}</span>
          </div>

          {/* 2x2 stat grid */}
          <div className="lp-preview__stats">
            <div className="lp-preview__stat-card">
              <div className="lp-preview__stat-label">CALORIES</div>
              <div className="lp-preview__stat-value">1,640</div>
              <div className="lp-preview__stat-sub lp-preview__stat-sub--teal">540 kcal remaining</div>
            </div>
            <div className="lp-preview__stat-card">
              <div className="lp-preview__stat-label">PROTEIN</div>
              <div className="lp-preview__stat-value">120g</div>
              <div className="lp-preview__stat-sub lp-preview__stat-sub--teal">on track for goal</div>
            </div>
            <div className="lp-preview__stat-card">
              <div className="lp-preview__stat-label">WORKOUTS</div>
              <div className="lp-preview__stat-value">3</div>
              <div className="lp-preview__stat-sub">this week</div>
            </div>
            <div className="lp-preview__stat-card">
              <div className="lp-preview__stat-label">STREAK</div>
              <div className="lp-preview__stat-value">11d</div>
              <div className="lp-preview__stat-sub lp-preview__stat-sub--teal">keep it going</div>
            </div>
          </div>

          {/* Macro split */}
          <div className="lp-preview__card">
            <div className="lp-preview__card-title">MACRO SPLIT</div>
            <div className="lp-preview__bars">
              <div className="lp-preview__bar-row">
                <span className="lp-preview__bar-label">Protein</span>
                <div className="lp-preview__bar-track">
                  <motion.div
                    className="lp-preview__bar-fill"
                    style={{ background: '#7f77dd' }}
                    initial={reduced ? { width: '100%' } : { width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={reduced ? { duration: 0 } : { duration: 1.2, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </div>
              <div className="lp-preview__bar-row">
                <span className="lp-preview__bar-label">Carbs</span>
                <div className="lp-preview__bar-track">
                  <motion.div
                    className="lp-preview__bar-fill"
                    style={{ background: '#1D9E75' }}
                    initial={reduced ? { width: '65%' } : { width: 0 }}
                    whileInView={{ width: '65%' }}
                    viewport={{ once: true }}
                    transition={reduced ? { duration: 0 } : { duration: 1.2, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </div>
              <div className="lp-preview__bar-row">
                <span className="lp-preview__bar-label">Fat</span>
                <div className="lp-preview__bar-track">
                  <motion.div
                    className="lp-preview__bar-fill"
                    style={{ background: '#f59e0b' }}
                    initial={reduced ? { width: '70%' } : { width: 0 }}
                    whileInView={{ width: '70%' }}
                    viewport={{ once: true }}
                    transition={reduced ? { duration: 0 } : { duration: 1.2, delay: 1.0, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meal plan */}
          <div className="lp-preview__card">
            <div className="lp-preview__card-title">TODAY&apos;S MEAL PLAN</div>
            <div className="lp-preview__meal-row">
              <span className="lp-preview__meal-name">Protein Smoothie Bowl</span>
              <span className="lp-preview__meal-kcal">580 kcal</span>
            </div>
            <div className="lp-preview__meal-row">
              <span className="lp-preview__meal-name">Chicken Rice Bowl</span>
              <span className="lp-preview__meal-kcal">600 kcal</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Feature strip                                                      */
/* ------------------------------------------------------------------ */

function FeatureStrip() {
  return (
    <section className="lp-strip">
      <div className="lp-strip__inner">
        {FEATURE_STRIP.map((f, i) => (
          <React.Fragment key={f.label}>
            {i > 0 && <div className="lp-strip__sep" />}
            <div className="lp-strip__item">
              <div className="lp-strip__label">{f.label}</div>
              <div className="lp-strip__desc">{f.desc}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                           */
/* ------------------------------------------------------------------ */

function Features() {
  const reduced = usePrefersReducedMotion();
  return (
    <section className="lp-features" id="features">
      <div className="lp-features__header">
        <span className="lp-features__eyebrow">FEATURES</span>
        <h2 className="lp-features__heading">
          <span>Everything you need</span>
          <br />
          <span className="lp-features__heading--accent">to reach your goals</span>
        </h2>
        <p className="lp-features__sub">
          A complete fitness toolkit for body measurements, workout logging and goal tracking.
        </p>
      </div>

      <div className="lp-features__grid">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            className="lp-feat-card"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="lp-feat-card__icon">
              <Icon size={22} />
            </div>
            <div className="lp-feat-card__title">{title}</div>
            <div className="lp-feat-card__desc">{desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                            */
/* ------------------------------------------------------------------ */

function Pricing() {
  const navigate = useNavigate();

  return (
    <section className="lp-pricing" id="pricing">
      <div className="lp-pricing__header">
        <span className="lp-pricing__eyebrow">PRICING</span>
        <h2 className="lp-pricing__heading">Simple, transparent pricing</h2>
        <p className="lp-pricing__sub">Start free, upgrade when you&apos;re ready. No hidden fees.</p>
      </div>

      <div className="lp-pricing__cards">
        {/* Free */}
        <div className="lp-price-card">
          <div className="lp-price-card__tier">FREE</div>
          <div className="lp-price-card__price">
            <span className="lp-price-card__amount">$0</span>
          </div>
          <div className="lp-price-card__tag">
            Everything you need to get started.
          </div>
          <div className="lp-price-card__divider" />
          <ul className="lp-price-card__list">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="lp-price-card__item">
                <Check size={14} className="lp-price-card__check" />
                {f}
              </li>
            ))}
          </ul>
          <button
            className="lp-price-card__cta lp-price-card__cta--outline"
            onClick={() => navigate('/auth')}
          >
            Get started
          </button>
        </div>

        {/* Pro */}
        <div className="lp-price-card lp-price-card--featured">
          <div className="lp-price-card__badge lp-price-card__badge--popular">MOST POPULAR</div>
          <div className="lp-price-card__tier lp-price-card__tier--accent">PRO</div>
          <div className="lp-price-card__price">
            <span className="lp-price-card__amount">$4.99</span>
            <span className="lp-price-card__period">/mo</span>
          </div>
          <div className="lp-price-card__tag">
            Unlock the full MacroVault experience with no limits.
          </div>
          <div className="lp-price-card__divider" />
          <ul className="lp-price-card__list">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="lp-price-card__item">
                <Check size={14} className="lp-price-card__check" />
                {f}
              </li>
            ))}
          </ul>
          <button
            className="lp-price-card__cta lp-price-card__cta--solid"
            onClick={() => navigate('/auth')}
          >
            Upgrade to Pro
          </button>
        </div>

        {/* Pro+ */}
        <div className="lp-price-card">
          <div className="lp-price-card__badge lp-price-card__badge--value">BEST VALUE</div>
          <div className="lp-price-card__tier">PRO+</div>
          <div className="lp-price-card__price">
            <span className="lp-price-card__amount">$9.99</span>
            <span className="lp-price-card__period">/mo</span>
          </div>
          <div className="lp-price-card__tag">
            Everything in Pro plus AI-powered meal planning.
          </div>
          <div className="lp-price-card__divider" />
          <ul className="lp-price-card__list">
            {PRO_PLUS_FEATURES.map((f) => (
              <li key={f} className="lp-price-card__item">
                <Check size={14} className="lp-price-card__check" />
                {f}
              </li>
            ))}
          </ul>
          <button
            className="lp-price-card__cta lp-price-card__cta--solid"
            onClick={() => navigate('/auth')}
          >
            Upgrade to Pro+
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                          */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="lp-cta">
      <span className="lp-cta__eyebrow">READY TO START?</span>
      <h2 className="lp-cta__heading">
        <span>Stop guessing. </span>
        <span className="lp-cta__heading--accent">Start tracking.</span>
      </h2>
      <p className="lp-cta__sub">Free forever. No credit card required.</p>
      <button className="lp-cta__btn" onClick={() => navigate('/auth')}>
        Create your free account
      </button>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer (preserved)                                                 */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__inner">
        <div className="lp-footer__top">
          <div className="lp-footer__brand">
            <Link to="/" className="lp-footer__logo">
              <span className="lp-footer__logo-icon"><Lock size={14} /></span>
              <span className="lp-footer__logo-name">MacroVault</span>
            </Link>
            <p className="lp-footer__tagline">Data-driven fitness for everyone.</p>
          </div>

          <div className="lp-footer__links">
            <Link to="/about" className="lp-footer__link">About</Link>
            <Link to="/help" className="lp-footer__link">Contact</Link>
            <a href="#pricing" className="lp-footer__link">Pricing</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Legal footer — copyright + Terms / Privacy links                   */
/* ------------------------------------------------------------------ */

function LegalFooter() {
  return (
    <div className="legal-footer legal-footer--landing">
      <p className="legal-footer__copy">
        &copy; 2026 MacroVault. All rights reserved.
      </p>
      <div className="legal-footer__links">
        <Link to="/terms" className="legal-footer__link">Terms of Service</Link>
        <span className="legal-footer__sep" aria-hidden="true">·</span>
        <Link to="/privacy" className="legal-footer__link">Privacy Policy</Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const navigate = useNavigate();

  // Redirect authenticated users to /home (preserved)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) navigate('/home', { replace: true });
    });
  }, [navigate]);

  return (
    <div className="lp-page">
      <Navbar />
      <main>
        <Hero />
        <FeatureStrip />
        <Features />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
      <LegalFooter />
    </div>
  );
}
