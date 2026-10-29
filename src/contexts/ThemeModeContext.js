import PropTypes from 'prop-types';
import { createContext, useEffect, useMemo } from 'react';
// material
import { useMediaQuery } from '@mui/material';
// hooks
import useLocalStorage from '../hooks/useLocalStorage';

// ----------------------------------------------------------------------

// Keep in sync with the pre-hydration script in src/app/theme-mode-script.js
export const THEME_MODE_STORAGE_KEY = 'themeMode';
export const THEME_MODES = ['light', 'dark', 'system'];

// Before this provider existed the mode lived in the `settings` object; carry that choice over.
function getLegacyMode() {
  try {
    const mode = JSON.parse(localStorage.getItem('settings'))?.themeMode;
    return THEME_MODES.includes(mode) ? mode : null;
  } catch {
    return null;
  }
}

const initialState = {
  mode: 'light',
  resolvedMode: 'light',
  setMode: () => {},
  toggleMode: () => {}
};

const ThemeModeContext = createContext(initialState);

ThemeModeProvider.propTypes = {
  children: PropTypes.node,
  defaultMode: PropTypes.oneOf(THEME_MODES)
};

function ThemeModeProvider({ children, defaultMode = 'light' }) {
  const [storedMode, setStoredMode] = useLocalStorage(THEME_MODE_STORAGE_KEY, getLegacyMode() || defaultMode);
  const mode = THEME_MODES.includes(storedMode) ? storedMode : defaultMode;

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const systemMode = prefersDark ? 'dark' : 'light';
  const resolvedMode = mode === 'system' ? systemMode : mode;

  // mirror the mode on <html> (native form controls, scrollbars, and the pre-hydration background)
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedMode;
    root.style.colorScheme = resolvedMode;
  }, [resolvedMode]);

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      setMode: (nextMode) => {
        if (THEME_MODES.includes(nextMode)) {
          setStoredMode(nextMode);
        }
      },
      toggleMode: () => setStoredMode(resolvedMode === 'dark' ? 'light' : 'dark')
    }),
    [mode, resolvedMode, setStoredMode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export { ThemeModeProvider, ThemeModeContext };
