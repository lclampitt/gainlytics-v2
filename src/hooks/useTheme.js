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

  const [uiMode, setUiModeState] = useState(() => {
    if (typeof window === 'undefined') return 'modern';
    return localStorage.getItem(UI_MODE_KEY) || 'modern';
  });

  // Track whether initial Supabase load is done to avoid writing defaults back
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

  /* Apply UI mode to DOM + localStorage */
  useEffect(() => {
    document.documentElement.setAttribute('data-ui-mode', uiMode);
    localStorage.setItem(UI_MODE_KEY, uiMode);
  }, [uiMode]);

  /* Sync across components: listen for changes from other useTheme instances */
  useEffect(() => {
    const onModeChange = (e) => setMode(e.detail);
    const onAccentChange = (e) => setAccentState(e.detail);
    const onUiModeChange = (e) => setUiModeState(e.detail);
    window.addEventListener('macrovault-mode-change', onModeChange);
    window.addEventListener('macrovault-accent-change', onAccentChange);
    window.addEventListener('macrovault-ui-mode-change', onUiModeChange);
    return () => {
      window.removeEventListener('macrovault-mode-change', onModeChange);
      window.removeEventListener('macrovault-accent-change', onAccentChange);
      window.removeEventListener('macrovault-ui-mode-change', onUiModeChange);
    };
  }, []);

  // Accents that require a Pro subscription — free users get reset to 'teal'
  const PRO_ONLY_ACCENTS = new Set([
    'blue', 'violet', 'orange', 'rose', 'crimson',
    'xp-aqua', 'myspace', 'y2k-chrome', 'spectrum',
  ]);

  /* On mount: load ALL theme settings from Supabase profile (overrides localStorage).
     Also enforces free-tier defaults: if the user is on the free plan and has a
     Pro-only accent or Y2K UI mode, reset them to 'teal' / 'modern'. */
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

      // Determine which values to apply — enforce defaults for free users
      let resolvedAccent = profile?.accent_theme || accent;
      let resolvedMode = profile?.theme_mode || mode;
      let resolvedUiMode = profile?.ui_mode || uiMode;

      if (isFree) {
        if (PRO_ONLY_ACCENTS.has(resolvedAccent)) resolvedAccent = 'teal';
        if (resolvedUiMode === 'y2k') resolvedUiMode = 'modern';
      }

      // Override local state with resolved values
      if (resolvedAccent !== accent) {
        setAccentState(resolvedAccent);
        window.dispatchEvent(new CustomEvent('macrovault-accent-change', { detail: resolvedAccent }));
      }
      if (resolvedMode !== mode) {
        setMode(resolvedMode);
        window.dispatchEvent(new CustomEvent('macrovault-mode-change', { detail: resolvedMode }));
      }
      if (resolvedUiMode !== uiMode) {
        setUiModeState(resolvedUiMode);
        window.dispatchEvent(new CustomEvent('macrovault-ui-mode-change', { detail: resolvedUiMode }));
      }

      // Persist the reset back to Supabase so it sticks
      if (isFree) {
        const updates = {};
        if (profile?.accent_theme && PRO_ONLY_ACCENTS.has(profile.accent_theme)) updates.accent_theme = 'teal';
        if (profile?.ui_mode === 'y2k') updates.ui_mode = 'modern';
        if (Object.keys(updates).length > 0) {
          supabase.from('profiles').update(updates).eq('id', userId).then(() => {});
        }
      }

      initialLoadDone.current = true;
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Helper: persist a partial update to Supabase profiles (fire-and-forget) */
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

  /* Set accent: update state + broadcast + persist to Supabase */
  const setAccent = useCallback((a) => {
    setAccentState(a);
    window.dispatchEvent(new CustomEvent('macrovault-accent-change', { detail: a }));
    persistToSupabase({ accent_theme: a });
  }, [persistToSupabase]);

  /* Set UI mode: update state + broadcast + persist to Supabase */
  const setUiMode = useCallback((m) => {
    setUiModeState(m);
    window.dispatchEvent(new CustomEvent('macrovault-ui-mode-change', { detail: m }));
    persistToSupabase({ ui_mode: m });
  }, [persistToSupabase]);

  const isY2K = uiMode === 'y2k';
  const isSpectrum = accent === 'spectrum';
  const isXpAqua = accent === 'xp-aqua';
  const isMyspace = accent === 'myspace';
  const isY2kChrome = accent === 'y2k-chrome';
  const isRetro = isXpAqua || isMyspace || isY2kChrome;

  return {
    mode,
    accent,
    uiMode,
    toggleMode,
    setAccent,
    setUiMode,
    isDark: mode === 'dark',
    isY2K,
    isSpectrum,
    isXpAqua,
    isMyspace,
    isY2kChrome,
    isRetro,
    // backward compat aliases
    theme: mode,
    toggle: toggleMode,
  };
}
