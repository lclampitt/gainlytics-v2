import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

const MODE_KEY = 'macrovault-theme';
const ACCENT_KEY = 'macrovault-accent';
const UI_MODE_KEY = 'macrovault-ui-mode';

export function useTheme() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem(MODE_KEY) || 'dark';
  });

  const [accent, setAccentState] = useState(() => {
    if (typeof window === 'undefined') return 'teal';
    return localStorage.getItem(ACCENT_KEY) || 'teal';
  });

  const initialLoadDone = useRef(false);

  /* Apply mode to DOM + localStorage */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  /* Apply accent to DOM + localStorage */
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  /* One-time: strip the legacy ui-mode attribute + localStorage key.
     Y2K UI was removed; treat any stored 'y2k' as 'modern'. */
  useEffect(() => {
    document.documentElement.removeAttribute('data-ui-mode');
    try { localStorage.removeItem(UI_MODE_KEY); } catch {}
  }, []);

  /* Sync across components: listen for changes from other useTheme instances */
  useEffect(() => {
    const onModeChange = (e) => setMode(e.detail);
    const onAccentChange = (e) => setAccentState(e.detail);
    window.addEventListener('macrovault-mode-change', onModeChange);
    window.addEventListener('macrovault-accent-change', onAccentChange);
    return () => {
      window.removeEventListener('macrovault-mode-change', onModeChange);
      window.removeEventListener('macrovault-accent-change', onAccentChange);
    };
  }, []);

  const PRO_ONLY_ACCENTS = new Set([
    'blue', 'violet', 'orange', 'rose', 'crimson',
    'xp-aqua', 'myspace', 'y2k-chrome', 'spectrum',
  ]);

  /* On mount: load theme settings from Supabase profile (overrides localStorage).
     Also enforces free-tier defaults: free users with a Pro-only accent are
     silently reset to 'teal'. Legacy ui_mode='y2k' is silently migrated to 'modern'. */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      if (!userId || !mounted) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('accent_theme, theme_mode, ui_mode, subscription_tier')
        .eq('id', userId)
        .maybeSingle();

      if (!mounted) return;

      const tier = profile?.subscription_tier || 'free';
      const isFree = tier === 'free';

      let resolvedAccent = profile?.accent_theme || accent;
      let resolvedMode = profile?.theme_mode || mode;

      if (isFree && PRO_ONLY_ACCENTS.has(resolvedAccent)) {
        resolvedAccent = 'teal';
      }

      if (resolvedAccent !== accent) {
        setAccentState(resolvedAccent);
        window.dispatchEvent(new CustomEvent('macrovault-accent-change', { detail: resolvedAccent }));
      }
      if (resolvedMode !== mode) {
        setMode(resolvedMode);
        window.dispatchEvent(new CustomEvent('macrovault-mode-change', { detail: resolvedMode }));
      }

      // Persist free-tier accent reset + legacy ui_mode='y2k' migration back to Supabase
      const updates = {};
      if (isFree && profile?.accent_theme && PRO_ONLY_ACCENTS.has(profile.accent_theme)) {
        updates.accent_theme = 'teal';
      }
      if (profile?.ui_mode === 'y2k') {
        updates.ui_mode = 'modern';
      }
      if (Object.keys(updates).length > 0) {
        supabase.from('profiles').update(updates).eq('id', userId).then(() => {});
      }

      initialLoadDone.current = true;
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistToSupabase = useCallback(async (fields) => {
    const { data } = await supabase.auth.getSession();
    const userId = data?.session?.user?.id;
    if (!userId) return;
    await supabase
      .from('profiles')
      .update(fields)
      .eq('id', userId);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((m) => {
      const next = m === 'dark' ? 'light' : 'dark';
      window.dispatchEvent(new CustomEvent('macrovault-mode-change', { detail: next }));
      persistToSupabase({ theme_mode: next });
      return next;
    });
  }, [persistToSupabase]);

  const setAccent = useCallback((a) => {
    setAccentState(a);
    window.dispatchEvent(new CustomEvent('macrovault-accent-change', { detail: a }));
    persistToSupabase({ accent_theme: a });
  }, [persistToSupabase]);

  const isSpectrum = accent === 'spectrum';
  const isXpAqua = accent === 'xp-aqua';
  const isMyspace = accent === 'myspace';
  const isY2kChrome = accent === 'y2k-chrome';
  const isRetro = isXpAqua || isMyspace || isY2kChrome;

  return {
    mode,
    accent,
    toggleMode,
    setAccent,
    isDark: mode === 'dark',
    isSpectrum,
    isXpAqua,
    isMyspace,
    isY2kChrome,
    isRetro,
    theme: mode,
    toggle: toggleMode,
  };
}
