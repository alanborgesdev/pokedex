import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import PokemonCard from '../pokemon-card/pokemon-card';
import ThemeToggle from '../theme-toggle/theme-toggle';
import SearchBar from '../search-bar/search-bar';
import { getPokemons, getPokemonDetails, getAllPokemonNames } from '../services/api';
import styled from 'styled-components';

// ✅ CORREÇÃO #3: Reducer para gerenciar estado de busca
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

  // ✅ CORREÇÃO #3: Usar useReducer ao invés de múltiplos useState
  const [searchState, dispatchSearch] = useReducer(searchReducer, initialSearchState);

  const LIMITE = 10;

  // Carrega lista completa de nomes uma vez
  useEffect(() => {
    const loadAllNames = async () => {
      const names = await getAllPokemonNames();
      setAllPokemonNames(names);
    };
    loadAllNames();
  }, []);

  const tipos = useMemo(() => {
    const todosTipos = new Set();
    pokemons.forEach((p) => p.types?.forEach((t) => todosTipos.add(t)));
    return ['all', ...Array.from(todosTipos).sort()];
  }, [pokemons]);

  useEffect(() => {
    setTiposDisponiveis(tipos);
  }, [tipos]);

  // ✅ CORREÇÃO #2: Filtro otimizado usando searchState
  const pokemonsFiltrados = useMemo(() => {
    // Se há resultado de busca específico, retorna apenas ele
    if (searchState.result) {
      return [searchState.result];
    }

    // Otimização: se não há filtros, retorna original
    if (tipoSelecionado === 'all' && !searchState.term) {
      return pokemons;
    }

    let resultado = pokemons;

    // Filtra por tipo (se selecionado)
    if (tipoSelecionado !== 'all') {
      resultado = resultado.filter((p) => p.types?.includes(tipoSelecionado));
    }

    // Filtra por termo de busca (se existe)
    if (searchState.term) {
      const termLower = searchState.term.toLowerCase();
      resultado = resultado.filter((p) =>
        p.name.toLowerCase().includes(termLower)
      );
    }

    return resultado;
  }, [pokemons, tipoSelecionado, searchState.term, searchState.result]);

  // ✅ CORREÇÃO #2: Lógica de busca consolidada e refatorada
  const handleSearch = useCallback(
    async (term) => {
      // Limpa busca anterior
      dispatchSearch({ type: 'SEARCH_CLEAR' });

      // Validação básica
      if (!term || term.length < 2) {
        return;
      }

      const searchTermLower = term.toLowerCase().trim();

      // 1ª tentativa: busca local (pokémons já carregados)
      const localMatch = pokemons.find(
        (p) => p.name.toLowerCase() === searchTermLower
      );

      if (localMatch) {
        // Pokémon encontrado localmente, apenas atualiza o termo
        // O filtro pokemonsFiltrados vai mostrar automaticamente
        dispatchSearch({ type: 'SEARCH_START', payload: term });
        dispatchSearch({ type: 'SEARCH_SUCCESS', payload: null });
        return;
      }

      // 2ª tentativa: busca na lista completa de nomes
      const nameInList = allPokemonNames.find(
        (p) => p.name.toLowerCase() === searchTermLower
      );

      if (!nameInList) {
        // Pokémon não existe na lista completa
        dispatchSearch({
          type: 'SEARCH_ERROR',
          payload: 'Pokémon não encontrado'
        });
        return;
      }

      // 3ª tentativa: busca na API (pokémon existe mas não está carregado)
      dispatchSearch({ type: 'SEARCH_START', payload: term });

      try {
        const details = await getPokemonDetails(nameInList.name);

        const pokemonData = {
          id: details.id,
          name: details.name,
          url: `https://pokeapi.co/api/v2/pokemon/${details.id}/`,
          types: details.types,
          sprites: details.sprites,
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

  // ✅ Função fetchPokemons memoizada
  const fetchPokemons = useCallback(async (offsetAtual) => {
    try {
      offsetAtual === 0 ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const listaPokemons = await getPokemons(offsetAtual, LIMITE);

      const pokemonsCompleto = await Promise.all(
        listaPokemons.map(async (pokemon) => {
          const detalhes = await getPokemonDetails(pokemon.name);
          return {
            ...pokemon,
            types: detalhes.types,
          };
        })
      );

      setPokemons((prev) => {
        const novosPokemons =
          offsetAtual === 0 ? pokemonsCompleto : [...prev, ...pokemonsCompleto];
        return novosPokemons;
      });

      setOffset(offsetAtual + LIMITE);
    } catch (e) {
      console.error('Erro ao buscar pokémons:', e);
      setError('Erro ao carregar pokémons. Tente novamente.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [LIMITE]);

  // ✅ Callbacks memoizados
  const handleLoadMore = useCallback(() => {
    fetchPokemons(offset);
  }, [offset, fetchPokemons]);

  const handleFilterChange = useCallback((e) => {
    setTipoSelecionado(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    dispatchSearch({ type: 'SEARCH_CLEAR' });
  }, []);

  useEffect(() => {
    fetchPokemons(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner>⏳</LoadingSpinner>
        <p>Carregando pokémons...</p>
        <small>Isso pode demorar um pouco</small>
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

      {/* ✅ Botão de voltar quando há resultado de busca específico */}
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
          <RetryButton onClick={() => fetchPokemons(offset)}>Tentar de novo</RetryButton>
        </ErrorBox>
      )}

      {/* ✅ Mensagem quando não há resultados */}
      {pokemonsFiltrados.length === 0 && !loading && !searchState.isSearching && (
        <NoResultsContainer>
          <NoResultsIcon>🔍</NoResultsIcon>
          <NoResultsText>
            Nenhum Pokémon encontrado
            {searchState.term && ` com o nome "${searchState.term}"`}
            {tipoSelecionado !== 'all' && ` do tipo "${tipoSelecionado}"`}
          </NoResultsText>
          <ClearFiltersButton
            onClick={() => {
              handleClearSearch();
              setTipoSelecionado('all');
            }}
          >
            Limpar filtros
          </ClearFiltersButton>
        </NoResultsContainer>
      )}

      <PokemonGrid>
        {pokemonsFiltrados.map((pokemon) => (
          <PokemonCard key={pokemon.id || pokemon.name} pokemon={pokemon} />
        ))}
      </PokemonGrid>

      {loadingMore && <LoadingMoreText>Carregando mais pokémons...</LoadingMoreText>}

      {/* ✅ Botão "Ver mais" só aparece quando não há filtros ativos */}
      {!loading &&
       !loadingMore &&
       tipoSelecionado === 'all' &&
       !searchState.term &&
       !searchState.result && (
        <LoadMoreButton onClick={handleLoadMore}>Ver mais pokémons</LoadMoreButton>
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
`;

const LoadingSpinner = styled.div`
  font-size: 3rem;
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
`;

const ClearFiltersButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
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

  &:hover {
    opacity: 0.8;
  }
`;

const LoadingMoreText = styled.p`
  text-align: center;
  margin: 2rem 0;
  color: ${({ theme }) => theme.colors.text};
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 30px auto;
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SearchingText = styled.p`
  text-align: center;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  font-weight: 500;
`;

// ✅ NOVO: Mensagem de erro de busca
const SearchErrorText = styled.p`
  text-align: center;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
  font-weight: 500;
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
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export default Home;
