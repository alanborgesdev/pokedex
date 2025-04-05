// Tema claro - padrão do sistema
export const lightTheme = {
  name: 'light', // identificador do tema
  colors: {
    // Cores principais
    background: 'var(--bg-color)',          // cor de fundo geral
    text: 'var(--text-color)',              // cor do texto principal
    cardBackground: 'var(--container-bg)',  // fundo dos cards
    primary: 'var(--primary-color)',        // cor primária (botões, etc)
    secondary: 'var(--secondary-color)',     // cor secundária
    border: 'var(--border-color)',          // cor das bordas
    
    // Cores de status
    error: 'var(--error-color)',            // vermelho pra erros
    success: 'var(--success-color)',        // verde pra sucesso
    warning: 'var(--warning-color)',        // amarelo/laranja pra alertas
    
    // Cores extremas
    pureWhite: '#ffffff',                   // branco puro
    pureBlack: '#000000',                   // preto puro
  },
  shadows: {
    card: 'var(--shadow-card)',             // sombra padrão dos cards
    hover: 'var(--shadow-hover)',           // sombra quando passa o mouse
  }
};

// Tema escuro - pro modo noturno
export const darkTheme = {
  name: 'dark', // identificador do tema
  colors: {
    // Mesmas cores mas os valores vão mudar via CSS variables
    background: 'var(--bg-color)',
    text: 'var(--text-color)',
    cardBackground: 'var(--container-bg)',
    primary: 'var(--primary-color)',
    secondary: 'var(--secondary-color)',
    border: 'var(--border-color)',
    error: 'var(--error-color)',
    success: 'var(--success-color)',
    warning: 'var(--warning-color)',
    
    // Aqui inverte o branco e preto
    pureWhite: '#000000',                   // no dark, branco vira preto
    pureBlack: '#ffffff',                   // e preto vira branco
  },
  shadows: {
    card: 'var(--shadow-card)',
    hover: 'var(--shadow-hover)',
  }
};