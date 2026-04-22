import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import ActiveWorkoutBanner from './ActiveWorkoutBanner';
import { useUsage } from '../../hooks/useUsage';
import { useTheme } from '../../hooks/useTheme';
import './AppShell.css';
import '../../styles/y2k.css';
import '../../styles/legal.css';

/* Map routes to page titles and optional quick-action buttons */
const PAGE_META = {
  '/home':        { title: 'Home' },
  '/measurements':    { title: 'Measurements' },
  '/calculators': { title: 'Calculators' },
  '/goalplanner': { title: 'Goal Planner' },
  '/meal-planner': { title: 'Meal Planner' },
  '/workouts':    { title: 'Workouts' },
  '/progress':    { title: 'Progress' },
  '/billing':     { title: 'Billing' },
  '/exercises':   { title: 'Exercise Library' },
  '/settings':    { title: 'Settings' },
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

const mobilePageVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -8, transition: { duration: 0.18, ease: 'easeOut' } },
};

export default function AppShell({ session, onLogout, isPro, isProPlus, children }) {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? { title: 'MacroVault' };
  const userId = session?.user?.id ?? null;
  const { usage } = useUsage(userId);
  const { isY2K } = useTheme();
  const [shaking, setShaking] = useState(false);

  const handleFakeClose = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 300);
  };

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const activeVariants = isMobile ? mobilePageVariants : pageVariants;

  return (
    <div className="app-shell">
      <Sidebar session={session} onLogout={onLogout} isPro={isPro} isProPlus={isProPlus} usage={usage} />

      <div className="app-shell__main">
        {/* Active-workout recovery banner — auto-hides on /workouts
            and when there's no fresh session snapshot in localStorage. */}
        <ActiveWorkoutBanner userId={userId} />

        {/* Top bar */}
        <div className="app-shell__topbar">
          <div className="app-shell__topbar-left">
            <h1 className="app-shell__page-title" data-page={location.pathname}>{meta.title}</h1>
          </div>
          {meta.action && (
            <button className="app-shell__action-btn">{meta.action}</button>
          )}
        </div>

        {/* Y2K title bar */}
        <div className="y2k-titlebar">
          <span className="y2k-titlebar__name">{meta.title} — MacroVault v2.0</span>
          <div className="y2k-titlebar__controls">
            <button className="y2k-titlebar__btn y2k-titlebar__btn--min">–</button>
            <button className="y2k-titlebar__btn y2k-titlebar__btn--max">□</button>
            <button className="y2k-titlebar__btn y2k-titlebar__btn--close" onClick={handleFakeClose}>×</button>
          </div>
        </div>

        {/* Page content with animation */}
        <div className={`app-shell__content${shaking ? ' y2k-shake' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={activeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Legal footer — scrolls with content, stays out from under sidebar */}
          <div className="legal-footer legal-footer--app">
            <p className="legal-footer__copy">
              &copy; 2026 MacroVault. All rights reserved.
            </p>
            <div className="legal-footer__links">
              <Link to="/terms" className="legal-footer__link">Terms of Service</Link>
              <span className="legal-footer__sep" aria-hidden="true">·</span>
              <Link to="/privacy" className="legal-footer__link">Privacy Policy</Link>
            </div>
          </div>
        </div>

        {/* Y2K status bar */}
        <div className="y2k-statusbar">
          <div className="y2k-statusbar__item">
            <span className="y2k-statusbar__dot" />
            Connected
          </div>
          <div className="y2k-statusbar__item">
            {isPro ? 'Pro Member' : 'Free Plan'}
          </div>
          <div className="y2k-statusbar__spacer" />
          <div className="y2k-statusbar__item">
            MacroVault v2.0
          </div>
        </div>
      </div>
    </div>
  );
}
