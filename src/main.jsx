import React from 'react';
import { createRoot } from 'react-dom/client'; // Isso aqui é novo no React 18
import App from './App';
import ThemeProvider from './components/contexts/theme-context';

// Pega a div root do HTML (aquela que tem no index.html)
const rootElement = document.getElementById('root');

// Cria o root da aplicação
const root = createRoot(rootElement);

// Renderiza tudo dentro do root
root.render(
  <React.StrictMode> {/* Isso ajuda a pegar bugs */}
    <ThemeProvider> {/* Provê o tema pra toda a app */}
      <App /> {/* Componente principal */}
    </ThemeProvider>
  </React.StrictMode>
);