import { useCallback, useEffect, useState } from 'react';

/**
 * Cross-page active-workout persistence.
 *
 * When a user starts a workout session in /workouts, we want them to be
 * able to navigate away (to meal planner, macros, etc.) and come back
 * without losing their in-progress sets, timer, or exercise list.
 *
 * This hook wraps localStorage reads/writes with a tiny pub-sub so that
 * multiple components (WorkoutLogger, AppShell recovery banner, Sidebar
 * indicator) stay in sync when the active workout changes.
 *
 * Shape of the stored object:
 * {
 *   user_id,          // owner — we only show the session to that user
 *   session_name,
 *   session_muscle_group,
 *   session_exercises,        // same shape WorkoutLogger already uses
 *   session_timer,            // seconds elapsed at snapshot time
 *   session_start_time,       // Date.toISOString() when the session began
 *   session_notes,
 *   mobile_view,              // 'home' | 'session' — restore UI state
 *   updated_at,               // Date.toISOString() — used for 4h freshness check
 * }
 *
 * Anything older than RECOVERY_WINDOW_MS is considered stale and
 * automatically cleared on read — we do not want to restore a workout
 * the user forgot about two days ago.
 */

export const ACTIVE_WORKOUT_KEY = 'macrovault_active_workout';
export const RECOVERY_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours
export const STORAGE_EVENT = 'macrovault:active-workout';

function readRaw() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function isFresh(snapshot) {
  if (!snapshot?.updated_at) return false;
  const t = new Date(snapshot.updated_at).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < RECOVERY_WINDOW_MS;
}

function dispatch() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

/** Imperative helpers — safe to call from anywhere (e.g. inside async finish handlers). */
export function saveActiveWorkout(snapshot) {
  if (typeof window === 'undefined') return;
  try {
    const payload = { ...snapshot, updated_at: new Date().toISOString() };
    window.localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(payload));
    dispatch();
  } catch {
    /* quota / private mode — silently ignore */
  }
}

export function clearActiveWorkout() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    dispatch();
  } catch {
    /* noop */
  }
}

export function readActiveWorkout(userId) {
  const snap = readRaw();
  if (!snap) return null;
  if (!isFresh(snap)) {
    clearActiveWorkout();
    return null;
  }
  // Belt-and-suspenders: never surface another user's session.
  if (userId && snap.user_id && snap.user_id !== userId) return null;
  return snap;
}

/**
 * Reactive hook — components subscribe to the active-workout snapshot
 * and re-render when it changes in *any* tab (via the native `storage`
 * event) or in the *same* tab (via our custom `macrovault:active-workout`
 * event, since storage events do not fire in the originating tab).
 */
export function useActiveWorkout(userId) {
  const [snapshot, setSnapshot] = useState(() => readActiveWorkout(userId));

  const refresh = useCallback(() => {
    setSnapshot(readActiveWorkout(userId));
  }, [userId]);

  useEffect(() => {
    refresh();
    if (typeof window === 'undefined') return undefined;

    const onStorage = (e) => {
      if (e.key && e.key !== ACTIVE_WORKOUT_KEY) return;
      refresh();
    };
    const onCustom = () => refresh();

    window.addEventListener('storage', onStorage);
    window.addEventListener(STORAGE_EVENT, onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(STORAGE_EVENT, onCustom);
    };
  }, [refresh]);

  return {
    snapshot,
    hasActive: !!snapshot,
    refresh,
    save: saveActiveWorkout,
    clear: clearActiveWorkout,
  };
}

export default useActiveWorkout;
