import { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider as StyledThemeProvider } from 'styled-components'; // ✅ ADICIONAR
import { theme } from '../styles/theme-config'; // ✅ MUDAR (em vez de lightTheme/darkTheme)

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  // Detecta preferência do sistema
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Atualiza apenas CSS, sem localStorage
  useEffect(() => {
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // ✅ MUDAR: pega o tema do novo arquivo
  const currentTheme = darkMode ? theme.dark : theme.light;

  const themeValues = {
    isDark: darkMode,
    toggleTheme,
    theme: currentTheme
  };

  return (
    <ThemeContext.Provider value={themeValues}>
      {/* ✅ ADICIONAR: Wrapper do styled-components */}
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ThemeContext };
export default ThemeProvider;
