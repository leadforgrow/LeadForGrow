"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);
  }, []);

  const setThemeMode = useCallback((mode) => {
    if (mode !== 'light' && mode !== 'dark') return;
    setTheme(mode);
    localStorage.setItem('theme', mode);
    applyTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(theme === 'light' ? 'dark' : 'light');
  }, [theme, setThemeMode]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
