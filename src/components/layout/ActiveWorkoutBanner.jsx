import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, X, ChevronRight } from 'lucide-react';
import {
  useActiveWorkout,
  clearActiveWorkout,
} from '../../hooks/useActiveWorkout';
import ConfirmDialog from '../common/ConfirmDialog';
import './ActiveWorkoutBanner.css';

/**
 * Global "you have a workout in progress" banner.
 *
 * Rendered by <AppShell> so it appears on every authenticated page
 * EXCEPT /workouts (where the user is already looking at the session).
 * Clicking "Continue" navigates to /workouts — WorkoutLogger restores
 * the session from the same localStorage snapshot on mount.
 *
 * The timer label ("Started 7m ago", "Started 1h ago") is derived on
 * render from the stored session_start_time; we intentionally skip a
 * 1s tick because the banner doesn't need minute-level precision and
 * re-rendering the entire shell every second would be wasteful.
 */
function formatElapsed(startIso) {
  if (!startIso) return '';
  const start = new Date(startIso).getTime();
  if (Number.isNaN(start)) return '';
  const ms = Date.now() - start;
  if (ms < 60 * 1000) return 'Started just now';
  const mins = Math.floor(ms / (60 * 1000));
  if (mins < 60) return `Started ${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (remMins === 0) return `Started ${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `Started ${hours}h ${remMins}m ago`;
}

export default function ActiveWorkoutBanner({ userId }) {
  const { snapshot } = useActiveWorkout(userId);
  const location = useLocation();
  const navigate = useNavigate();
  const [discardOpen, setDiscardOpen] = useState(false);

  const elapsedLabel = useMemo(
    () => formatElapsed(snapshot?.session_start_time),
    [snapshot?.session_start_time],
  );

  // Hide on /workouts — the user already sees the session there, and
  // WorkoutLogger auto-restores the session on mount anyway.
  if (!snapshot) return null;
  if (location.pathname.startsWith('/workouts')) return null;

  const exerciseCount = Array.isArray(snapshot.session_exercises)
    ? snapshot.session_exercises.length
    : 0;

  const handleContinue = () => {
    navigate('/workouts');
  };

  /* Open the themed confirm modal instead of the native window.confirm
     so the discard flow stays on-brand and respects the user's accent. */
  const openDiscard = (e) => {
    e.stopPropagation();
    setDiscardOpen(true);
  };

  const confirmDiscard = () => {
    clearActiveWorkout();
    setDiscardOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="active-workout-banner"
        onClick={handleContinue}
        aria-label="Continue workout in progress"
      >
        <div className="active-workout-banner__left">
          <div className="active-workout-banner__icon">
            <span className="active-workout-banner__pulse" aria-hidden="true" />
            <Dumbbell size={16} />
          </div>
          <div className="active-workout-banner__text">
            <span className="active-workout-banner__title">
              Workout in progress
              {snapshot.session_name ? ` — ${snapshot.session_name}` : ''}
            </span>
            <span className="active-workout-banner__meta">
              {elapsedLabel}
              {exerciseCount > 0
                ? ` · ${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'}`
                : ''}
            </span>
          </div>
        </div>
        <div className="active-workout-banner__actions">
          <span className="active-workout-banner__continue">
            Continue <ChevronRight size={14} />
          </span>
          <span
            role="button"
            tabIndex={0}
            className="active-workout-banner__discard"
            onClick={openDiscard}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') openDiscard(e);
            }}
            aria-label="Discard workout"
          >
            <X size={14} />
          </span>
        </div>
      </button>
      <ConfirmDialog
        open={discardOpen}
        title="Discard this workout?"
        body="This will clear all sets you've logged in this session. This can't be undone."
        primaryLabel="Discard"
        secondaryLabel="Keep editing"
        onPrimary={confirmDiscard}
        onSecondary={() => setDiscardOpen(false)}
        destructive
      />
    </>
  );
}
