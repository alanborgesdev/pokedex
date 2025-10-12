import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PokemonCard from './pokemon-card';
import { test, expect } from '@jest/globals';
import { ThemeProvider } from '../contexts/theme-context';

// Dados de teste que eu criei
const pokemonFake = {
  name: 'pikachu',
  url: 'https://pokeapi.co/api/v2/pokemon/25/'
};

// Teste do componente PokemonCard
test('mostra o nome e imagem do Pokémon', () => {
  render(
    <MemoryRouter>
      <ThemeProvider>
        <PokemonCard pokemon={pokemonFake} />
      </ThemeProvider>
    </MemoryRouter>
  );

  // Verifica se o nome aparece
  const nome = screen.getByText('pikachu');
  expect(nome).toBeInTheDocument();

  // Verifica se a imagem está lá
  const imagem = screen.getByAltText('pikachu');
  expect(imagem).toBeInTheDocument();
});

test('o link leva pra página de detalhes certa', () => {
  render(
    <MemoryRouter>
      <ThemeProvider>
        <PokemonCard pokemon={pokemonFake} />
      </ThemeProvider>
    </MemoryRouter>
  );

  const link = screen.getByRole('link');
  expect(link.getAttribute('href')).toBe('/pokemon/pikachu');
});
