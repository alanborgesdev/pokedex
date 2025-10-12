import { describe, it, afterEach, expect } from '@jest/globals';
import { getPokemons } from './api';
import axios from 'axios';
import axiosMockAdapter from 'axios-mock-adapter'; // Importamos direto

// Cria o mock do axios - jeito novo que aprendi
const mockAxios = new axiosMockAdapter(axios);

describe('Testes da API Pokémon', () => {
  afterEach(() => {
    mockAxios.reset(); // Limpa depois de cada teste
  });

  it('pega a lista de pokémons direito', async () => {
    // Dados que a API deveria retornar
    const pokemonsFake = {
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' }
      ]
    };

    // Configura o mock
    mockAxios.onGet('https://pokeapi.co/api/v2/pokemon').reply(200, pokemonsFake);

    // Testa nossa função
    const resultado = await getPokemons();

    // Verifica se veio certo
    expect(resultado).toEqual([
      {
        name: 'pikachu',
        url: 'https://pokeapi.co/api/v2/pokemon/25/',
        id: '25'
      },
      {
        name: 'charmander',
        url: 'https://pokeapi.co/api/v2/pokemon/4/',
        id: '4'
      }
    ]);
  });

  it('deveria lidar com erro da API', async () => {
    mockAxios.onGet('https://pokeapi.co/api/v2/pokemon').networkError();
    try {
      await getPokemons();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
