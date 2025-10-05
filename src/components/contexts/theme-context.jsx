import { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { lightTheme, darkTheme } from '../styles/theme';

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  // ✅ Detecta preferência do sistema
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // ✅ Atualiza apenas CSS, sem localStorage
  useEffect(() => {
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const themeValues = {
    isDark: darkMode,
    toggleTheme,
    theme: darkMode ? darkTheme : lightTheme
  };

  return (
    <ThemeContext.Provider value={themeValues}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ThemeContext };
export default ThemeProvider;
