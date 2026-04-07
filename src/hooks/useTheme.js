import { useState, useEffect, useCallback } from 'react';
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

  /* On mount: load accent from Supabase profile (overrides localStorage) */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      if (!userId || !mounted) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('accent_theme')
        .eq('id', userId)
        .maybeSingle();

      if (!mounted) return;
      if (profile?.accent_theme && profile.accent_theme !== accent) {
        setAccentState(profile.accent_theme);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMode = () => {
    setMode((m) => {
      const next = m === 'dark' ? 'light' : 'dark';
      window.dispatchEvent(new CustomEvent('macrovault-mode-change', { detail: next }));
      return next;
    });
  };

  /* Set accent: update state + broadcast + persist to Supabase in background */
  const setAccent = useCallback((a) => {
    setAccentState(a);
    window.dispatchEvent(new CustomEvent('macrovault-accent-change', { detail: a }));
    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      if (!userId) return;
      await supabase
        .from('profiles')
        .update({ accent_theme: a })
        .eq('id', userId);
    })();
  }, []);

  const setUiMode = useCallback((m) => {
    setUiModeState(m);
    window.dispatchEvent(new CustomEvent('macrovault-ui-mode-change', { detail: m }));
  }, []);

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
