import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { lightTheme, darkTheme } from '../styles/theme';

// Contexto pra gerenciar o tema da aplicação
const ThemeContext = createContext();

// O provider vai ficar em volta dos componentes pra fornecer o tema
function ThemeProvider({ children }) {
  // Estado pra controlar se tá no modo escuro
  const [darkMode, setDarkMode] = useState(() => {
    // Quando carrega, verifica se tem preferência salva
    const saved = localStorage.getItem('tema');
    return saved === 'dark';
  });

  // Toda vez que o tema muda, atualiza o CSS e salva
  useEffect(() => {
    // Atualiza o data-theme no body
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
    
    // Isso aqui é importante pro CSS saber qual tema usar
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    
    // Guarda a preferência no localStorage
    localStorage.setItem('tema', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Função básica pra alternar entre claro e escuro
  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  // Tudo que vai ficar disponível pra outros componentes
  const themeValues = {
    isDark: darkMode,
    toggleTheme: toggleTheme,
    theme: darkMode ? darkTheme : lightTheme
  };

  return (
    <ThemeContext.Provider value={themeValues}>
      {children}
    </ThemeContext.Provider>
  );
}

// Validação das props (sempre bom colocar)
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ThemeContext };
export default ThemeProvider;