import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import PokemonCard from '../pokemon-card/pokemon-card';
import ThemeToggle from '../theme-toggle/theme-toggle';
import SearchBar from '../search-bar/search-bar';
import { getPokemons, getPokemonDetails, getAllPokemonNames } from '../services/api';
import styled from 'styled-components';

// Reducer para gerenciar estado de busca
const searchReducer = (state, action) => {
  switch (action.type) {
    case 'SEARCH_START':
      return {
        ...state,
        term: action.payload,
        isSearching: true,
        error: null,
      };
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        result: action.payload,
        isSearching: false,
        error: null,
      };
    case 'SEARCH_ERROR':
      return {
        ...state,
        result: null,
        isSearching: false,
        error: action.payload,
      };
    case 'SEARCH_CLEAR':
      return {
        term: '',
        result: null,
        isSearching: false,
        error: null,
      };
    default:
      return state;
  }
};

const initialSearchState = {
  term: '',
  result: null,
  isSearching: false,
  error: null,
};

const Home = () => {
  const [pokemons, setPokemons] = useState([]);
  const [allPokemonNames, setAllPokemonNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [tipoSelecionado, setTipoSelecionado] = useState('all');
  const [tiposDisponiveis, setTiposDisponiveis] = useState(['all']);

  const [searchState, dispatchSearch] = useReducer(searchReducer, initialSearchState);

  const LIMITE = useMemo(() => 10, []);
  // ✅ NOVO: Tamanho dos lotes para carregar detalhes
  const BATCH_SIZE = useMemo(() => 3, []);

  // Carrega lista completa de nomes uma vez
  useEffect(() => {
    const loadAllNames = async () => {
      const names = await getAllPokemonNames();
      setAllPokemonNames(names);
    };
    loadAllNames();
  }, []);

  const tipos = useMemo(() => {
    if (pokemons.length === 0) return ['all'];

    const todosTipos = new Set();
    pokemons.forEach((p) => {
      if (p.types && Array.isArray(p.types)) {
        p.types.forEach((t) => todosTipos.add(t));
      }
    });

    return ['all', ...Array.from(todosTipos).sort()];
  }, [pokemons]);

  useEffect(() => {
    setTiposDisponiveis(tipos);
  }, [tipos]);

  const pokemonsFiltrados = useMemo(() => {
    if (searchState.result) {
      return [searchState.result];
    }

    const hasTypeFilter = tipoSelecionado !== 'all';
    const hasSearchTerm = searchState.term && searchState.term.length >= 2;

    if (!hasTypeFilter && !hasSearchTerm) {
      return pokemons;
    }

    let resultado = pokemons;

    if (hasTypeFilter) {
      resultado = resultado.filter((p) =>
        p.types && p.types.includes(tipoSelecionado)
      );
    }

    if (hasSearchTerm) {
      const termLower = searchState.term.toLowerCase();
      resultado = resultado.filter((p) =>
        p.name && p.name.toLowerCase().includes(termLower)
      );
    }

    return resultado;
  }, [pokemons, tipoSelecionado, searchState.term, searchState.result]);

  // ✅ NOVO: Função para carregar detalhes em background (lotes)
  const loadPokemonDetailsInBackground = useCallback(async (pokemonsList) => {
    // Carrega em lotes para não sobrecarregar a API
    for (let i = 0; i < pokemonsList.length; i += BATCH_SIZE) {
      const batch = pokemonsList.slice(i, i + BATCH_SIZE);

      const detailsPromises = batch.map(async (pokemon) => {
        try {
          const detalhes = await getPokemonDetails(pokemon.name);
          return {
            name: pokemon.name,
            types: detalhes.types || [],
          };
        } catch (error) {
          console.error(`Erro ao carregar detalhes de ${pokemon.name}:`, error);
          return {
            name: pokemon.name,
            types: ['unknown'],
          };
        }
      });

      const batchDetails = await Promise.all(detailsPromises);

      // Atualiza estado com detalhes do lote
      setPokemons((prev) =>
        prev.map((p) => {
          const detail = batchDetails.find((d) => d.name === p.name);
          if (detail && !p.isDetailsLoaded) {
            return {
              ...p,
              types: detail.types,
              isDetailsLoaded: true
            };
          }
          return p;
        })
      );

      // Pequeno delay entre lotes para não sobrecarregar
      if (i + BATCH_SIZE < pokemonsList.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }, [BATCH_SIZE]);

  // ✅ MODIFICADO: fetchPokemons agora carrega estrutura básica primeiro
  const fetchPokemons = useCallback(async (offsetAtual) => {
    try {
      offsetAtual === 0 ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const listaPokemons = await getPokemons(offsetAtual, LIMITE);

      // ✅ MUDANÇA CRÍTICA: Não buscar detalhes aqui, apenas estrutura básica
      const pokemonsBasicos = listaPokemons.map((pokemon) => ({
        ...pokemon,
        types: [], // Será carregado depois em background
        isDetailsLoaded: false,
      }));

      // Atualiza estado imediatamente com dados básicos
      setPokemons((prev) => {
        if (offsetAtual === 0) {
          return pokemonsBasicos;
        }

        const prevIds = new Set(prev.map(p => p.id || p.name));
        const novos = pokemonsBasicos.filter(p => !prevIds.has(p.id || p.name));

        return novos.length > 0 ? [...prev, ...novos] : prev;
      });

      setOffset(offsetAtual + LIMITE);

      // ✅ Remove loading ANTES de carregar detalhes (UX melhor!)
      setLoading(false);
      setLoadingMore(false);

      // ✅ NOVO: Carrega detalhes em background (não bloqueia UI)
      loadPokemonDetailsInBackground(pokemonsBasicos);

    } catch (e) {
      console.error('Erro ao buscar pokémons:', e);
      setError('Erro ao carregar pokémons. Tente novamente.');
      setLoading(false);
      setLoadingMore(false);
    }
  }, [LIMITE, loadPokemonDetailsInBackground]);

  const handleSearch = useCallback(
    async (term) => {
      dispatchSearch({ type: 'SEARCH_CLEAR' });

      if (!term || term.length < 2) {
        return;
      }

      const searchTermLower = term.toLowerCase().trim();

      const localMatch = pokemons.find(
        (p) => p.name && p.name.toLowerCase() === searchTermLower
      );

      if (localMatch) {
        dispatchSearch({ type: 'SEARCH_START', payload: term });
        dispatchSearch({ type: 'SEARCH_SUCCESS', payload: null });
        return;
      }

      const nameInList = allPokemonNames.find(
        (p) => p.name && p.name.toLowerCase() === searchTermLower
      );

      if (!nameInList) {
        dispatchSearch({
          type: 'SEARCH_ERROR',
          payload: 'Pokémon não encontrado'
        });
        return;
      }

      dispatchSearch({ type: 'SEARCH_START', payload: term });

      try {
        const details = await getPokemonDetails(nameInList.name);

        const pokemonData = {
          id: details.id,
          name: details.name,
          url: `https://pokeapi.co/api/v2/pokemon/${details.id}/`,
          types: details.types || [],
          sprites: details.sprites,
          isDetailsLoaded: true, // ✅ Já vem com detalhes
        };

        dispatchSearch({
          type: 'SEARCH_SUCCESS',
          payload: pokemonData,
        });
      } catch (error) {
        console.error('Erro ao buscar pokémon:', error);
        dispatchSearch({
          type: 'SEARCH_ERROR',
          payload: 'Erro ao buscar pokémon. Tente novamente.'
        });
      }
    },
    [pokemons, allPokemonNames]
  );

  const handleLoadMore = useCallback(() => {
    fetchPokemons(offset);
  }, [offset, fetchPokemons]);

  const handleFilterChange = useCallback((e) => {
    const newValue = e.target.value;
    setTipoSelecionado(newValue);
  }, []);

  const handleClearSearch = useCallback(() => {
    dispatchSearch({ type: 'SEARCH_CLEAR' });
  }, []);

  const handleClearAllFilters = useCallback(() => {
    dispatchSearch({ type: 'SEARCH_CLEAR' });
    setTipoSelecionado('all');
  }, []);

  const handleRetry = useCallback(() => {
    fetchPokemons(offset);
  }, [offset, fetchPokemons]);

  useEffect(() => {
    fetchPokemons(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasNoResults = pokemonsFiltrados.length === 0 && !loading && !searchState.isSearching;
  const showLoadMoreButton = !loading &&
                              !loadingMore &&
                              tipoSelecionado === 'all' &&
                              !searchState.term &&
                              !searchState.result;

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner>⚡</LoadingSpinner>
        <LoadingText>Carregando pokémons...</LoadingText>
        <LoadingSubtext>Preparando sua Pokédex...</LoadingSubtext>
      </LoadingContainer>
    );
  }

  return (
    <MainContainer>
      <Header>
        <Title>POKEDEX</Title>
        <ThemeToggle />
      </Header>

      <SearchSection>
        <SearchBar
          onSearch={handleSearch}
          pokemonList={allPokemonNames.length > 0 ? allPokemonNames : pokemons}
          disabled={loading || loadingMore}
        />
        {searchState.isSearching && <SearchingText>Buscando...</SearchingText>}
        {searchState.error && <SearchErrorText>{searchState.error}</SearchErrorText>}
      </SearchSection>

      <FilterSection>
        <FilterLabel>
          Filtrar por tipo:
          <TypeSelect
            value={tipoSelecionado}
            onChange={handleFilterChange}
            disabled={loading || loadingMore}
          >
            {tiposDisponiveis.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo === 'all' ? 'Todos' : tipo}
              </option>
            ))}
          </TypeSelect>
        </FilterLabel>
      </FilterSection>

      {searchState.result && (
        <BackButtonContainer>
          <BackButton onClick={handleClearSearch}>
            ← Voltar para todos os pokémons
          </BackButton>
        </BackButtonContainer>
      )}

      {error && (
        <ErrorBox>
          {error}
          <RetryButton onClick={handleRetry}>Tentar de novo</RetryButton>
        </ErrorBox>
      )}

      {hasNoResults && (
        <NoResultsContainer>
          <NoResultsIcon>🔍</NoResultsIcon>
          <NoResultsText>
            Nenhum Pokémon encontrado
            {searchState.term && ` com o nome "${searchState.term}"`}
            {tipoSelecionado !== 'all' && ` do tipo "${tipoSelecionado}"`}
          </NoResultsText>
          <ClearFiltersButton onClick={handleClearAllFilters}>
            Limpar filtros
          </ClearFiltersButton>
        </NoResultsContainer>
      )}

      <PokemonGrid>
        {pokemonsFiltrados.map((pokemon) => (
          <PokemonCard
            key={pokemon.id || pokemon.name}
            pokemon={pokemon}
          />
        ))}
      </PokemonGrid>

      {loadingMore && (
        <LoadingMoreContainer>
          <LoadingMoreSpinner>⚡</LoadingMoreSpinner>
          <LoadingMoreText>Carregando mais pokémons...</LoadingMoreText>
        </LoadingMoreContainer>
      )}

      {showLoadMoreButton && (
        <LoadMoreButton onClick={handleLoadMore}>
          Ver mais pokémons
        </LoadMoreButton>
      )}
    </MainContainer>
  );
};

/* ============================= ESTILOS ============================= */

const MainContainer = styled.main`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  color: ${({ theme }) => theme.colors.success};
  margin: 0;
  font-family: Verdana, sans-serif;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const SearchSection = styled.div`
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FilterSection = styled.div`
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const TypeSelect = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PokemonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 30px;
  font-family: Arial, Helvetica, sans-serif;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.text};
  min-height: 60vh;
  justify-content: center;
`;

const LoadingSpinner = styled.div`
  font-size: 4rem;
  animation: bounce 0.6s ease-in-out infinite alternate;

  @keyframes bounce {
    from {
      transform: translateY(0) scale(1);
    }
    to {
      transform: translateY(-20px) scale(1.1);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const LoadingSubtext = styled.small`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
`;

const LoadingMoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0;
`;

const LoadingMoreSpinner = styled.div`
  font-size: 2rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingMoreText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  margin: 0;
`;

const NoResultsContainer = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const NoResultsIcon = styled.div`
  font-size: 4rem;
  opacity: 0.5;
`;

const NoResultsText = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  max-width: 400px;
  margin: 0;
`;

const ClearFiltersButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorBox = styled.div`
  background: ${({ theme }) => theme.colors.error}22;
  color: ${({ theme }) => theme.colors.error};
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
  border: 2px solid ${({ theme }) => theme.colors.error};
`;

const RetryButton = styled.button`
  margin-top: 10px;
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 30px auto;
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchingText = styled.p`
  text-align: center;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  font-weight: 500;
`;

const SearchErrorText = styled.p`
  text-align: center;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
  font-weight: 600;
`;

const BackButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export default Home;
