import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './components/pages/routes';
import ThemeToggle from './components/theme-toggle/theme-toggle';
import './App.css'; // Importa os estilos

// Componente principal que roda a aplicação
function App() {
  return (
    <div className="app-container">
      {/* Botão pra trocar o tema - fica fixo no canto */}
      <ThemeToggle />
      
      {/* Aqui entra toda a navegação da aplicação */}
      <RouterProvider router={router} />
    </div>
  );
}

export default App;