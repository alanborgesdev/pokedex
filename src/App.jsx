import { RouterProvider } from 'react-router-dom';
import './App.css'; // Importa os estilos
import router from './components/pages/routes';
import ThemeToggle from './components/theme-toggle/theme-toggle';

// Componente principal que roda a aplicaÃ§Ã£o
function App() {
    return (
        <div className='app-container'>
            {/* BotÃ£o pra trocar o tema - fica fixo no canto */}
            <ThemeToggle />

            {/* Aqui entra toda a navegaÃ§Ã£o da aplicaÃ§Ã£o */}
            <RouterProvider router={router} />
        </div>
    );
}

export default App;
