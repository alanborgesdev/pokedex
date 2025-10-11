import axios from 'axios';

// Configuração básica do cliente HTTP para a PokeAPI
const apiPokemon = axios.create({
  baseURL: 'https://pokeapi.co/api/v2/',
  timeout: 10000, // timeout de 10 segundos
});

// Busca lista paginada de pokémons
export const getPokemons = async (offset = 0, limit = 20) => {
  try {
    // Validações básicas
    if (offset < 0) {
      console.error('Offset não pode ser negativo');
      throw new Error('Offset deve ser um número positivo');
    }
    if (limit <= 0) {
      console.error('Limit deve ser maior que zero');
      throw new Error('Limit deve ser maior que zero');
    }

    const response = await apiPokemon.get('pokemon', {
      params: { offset, limit }
    });

    if (!response.data?.results) {
      console.error('Resposta inesperada da API:', response.data);
      throw new Error('Formato de resposta inesperado da API');
    }

    // Adiciona ID baseado na URL
    return response.data.results.map(pokemon => ({
      ...pokemon,
      id: pokemon.url.split('/').filter(Boolean).pop()
    }));

  } catch (error) {
    console.error('Falha ao buscar lista de pokémons:', {
      offset,
      limit,
      error: error.message
    });
    throw new Error(`Falha ao carregar pokémons: ${error.message}`);
  }
};

// Busca detalhes de um pokémon específico
export const getPokemonDetails = async (identifier) => {
  try {
    if (!identifier) {
      console.error('Identificador não fornecido');
      throw new Error('Nome ou ID do pokémon é obrigatório');
    }

    const response = await apiPokemon.get(`pokemon/${identifier}`);

    if (!response.data) {
      console.error('Dados do pokémon não encontrados para:', identifier);
      throw new Error('Pokémon não encontrado');
    }

    // Formata os dados de resposta
    return {
      id: response.data.id,
      name: response.data.name,
      sprites: response.data.sprites,
      types: response.data.types.map(t => t.type.name),
      abilities: response.data.abilities.map(a => a.ability.name),
      moves: response.data.moves.map(m => m.move.name),
      stats: response.data.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat,
      })),
      height: response.data.height,
      weight: response.data.weight,
    };

  } catch (error) {
    console.error(`Falha ao buscar detalhes do pokémon ${identifier}:`, {
      identifier,
      error: error.message
    });
    throw new Error(`Não foi possível carregar os detalhes: ${error.message}`);
  }
};

// Cache simples em memória
const pokemonCache = new Map();

// Função com cache para evitar requisições repetidas
export const fetchWithCache = async (key, fetchFunction) => {
  if (pokemonCache.has(key)) {
    console.debug(`Retornando dados do cache para: ${key}`);
    return pokemonCache.get(key);
  }

  console.debug(`Buscando dados da API para: ${key}`);
  const data = await fetchFunction();
  pokemonCache.set(key, data);
  return data;
};

export const searchPokemonByName = async (name) => {
  try {
    if (!name || name.length < 2) {
      return null;
    }

    const response = await apiPokemon.get(`pokemon/${name.toLowerCase()}`);

    if (!response.data) {
      return null;
    }

    return {
      id: response.data.id,
      name: response.data.name,
      url: `https://pokeapi.co/api/v2/pokemon/${response.data.id}/`,
      types: response.data.types.map(t => t.type.name),
      sprites: response.data.sprites,
    };
  } catch (error) {
    // Se não encontrar, retorna null (não é erro grave)
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Erro ao buscar pokémon:', error.message);
    return null;
  }
};

export const getAllPokemonNames = async () => {
  try {
    // Busca TODOS os nomes (são ~1000 pokémons)
    const response = await apiPokemon.get('pokemon', {
      params: { limit: 1000, offset: 0 }
    });

    if (!response.data?.results) {
      throw new Error('Formato de resposta inesperado');
    }

    // Retorna só nome e ID (leve e rápido)
    return response.data.results.map(pokemon => ({
      name: pokemon.name,
      id: pokemon.url.split('/').filter(Boolean).pop()
    }));

  } catch (error) {
    console.error('Erro ao buscar lista de nomes:', error.message);
    return [];
  }
};
