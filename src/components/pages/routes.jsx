import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from './home';
import PokemonDetail from './pokemon-detail';

// Aqui eu configuro as rotas da aplicação
const router = createBrowserRouter([
  {
    // Rota principal - página inicial
    path: '/',
    element: <Home />,
    errorElement: <div>Ops, algo deu errado!</div> // Adicionei um tratamento básico de erro
  },
  {
    // Rota para ver os detalhes de um Pokémon
    path: '/pokemon/:name',  // :name é o nome do Pokémon que vai variar
    element: <PokemonDetail />,
  }
]);

// Exporta as rotas configuradas
export default router;