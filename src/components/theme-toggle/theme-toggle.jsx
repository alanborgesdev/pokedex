import React from 'react';
import { useTheme } from '../hook/use-theme';

// Botão que troca entre tema claro e escuro
const ThemeToggle = () => {
  // Pega o tema atual e a função pra trocar
  const { isDark, toggleTheme } = useTheme();

  // Texto e ícone mudam conforme o tema
  const buttonText = isDark ? 'Light' : 'Dark';
  const emoji = isDark ? '☀️' : '🌙';

  return (
    <button
      className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label={`Trocar para tema ${isDark ? 'claro' : 'escuro'}`}
      title={`Clique para tema ${isDark ? 'claro' : 'escuro'}`}
    >
      <span className="emoji" role="img">
        {emoji}
      </span>
      {' '}
      {buttonText}
    </button>
  );
};

export default ThemeToggle;