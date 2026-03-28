import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Read from localStorage immediately (the inline script already applied it to <html>)
    return localStorage.getItem('gainlytics_theme') || 'dark';
  });

  // Keep <html data-theme> and localStorage in sync whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gainlytics_theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // Allow external callers (e.g. after loading the saved profile preference)
  const setThemeValue = (val) => {
    if (val === 'light' || val === 'dark') setTheme(val);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle, setThemeValue }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
