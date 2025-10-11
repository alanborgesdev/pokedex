import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PokemonCard from '../pokemon-card/pokemon-card';
import ThemeToggle from '../theme-toggle/theme-toggle';
import SearchBar from '../search-bar/search-bar';
import { getPokemons, getPokemonDetails, getAllPokemonNames } from '../services/api'; // ✅ ADICIONAR getAllPokemonNames
import styled from 'styled-components';

const Home = () => {
    const [pokemons, setPokemons] = useState([]);
    const [allPokemonNames, setAllPokemonNames] = useState([]); // ✅ ADICIONAR
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const [tipoSelecionado, setTipoSelecionado] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [tiposDisponiveis, setTiposDisponiveis] = useState(['all']);
    const [searchResult, setSearchResult] = useState(null);
    const [searching, setSearching] = useState(false);
    const LIMITE = 10; // ✅ Mantém 10

    // ✅ ADICIONAR: Carrega lista completa de nomes uma vez
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

    const pokemonsFiltrados = useMemo(() => {
        if (searchResult) {
            return [searchResult];
        }

        let resultado = pokemons;

        if (tipoSelecionado !== 'all') {
            resultado = resultado.filter((p) => p.types.includes(tipoSelecionado));
        }

        if (searchTerm) {
            resultado = resultado.filter((p) =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return resultado;
    }, [pokemons, tipoSelecionado, searchTerm, searchResult]);

    const searchPokemonByName = useCallback(async (name) => {
        try {
            const details = await getPokemonDetails(name.toLowerCase());
            return {
                id: details.id,
                name: details.name,
                url: `https://pokeapi.co/api/v2/pokemon/${details.id}/`,
                types: details.types,
                sprites: details.sprites,
            };
        } catch (error) {
            console.error('Pokémon não encontrado:', error);
            return null;
        }
    }, []);

    // ✅ MODIFICAR: Agora busca na lista completa quando não encontra local
    const handleSearch = useCallback(
        async (term) => {
            setSearchTerm(term);
            setSearchResult(null);

            if (!term || term.length < 2) {
                return;
            }

            // Primeiro: busca nos pokémons já carregados
            const localResult = pokemons.find((p) => p.name.toLowerCase() === term.toLowerCase());

            if (localResult) {
                return;
            }

            // Segundo: busca na lista completa de nomes (NOVO!)
            const nameMatch = allPokemonNames.find(
                (p) => p.name.toLowerCase() === term.toLowerCase()
            );

            if (nameMatch) {
                setSearching(true);
                try {
                    const result = await searchPokemonByName(nameMatch.name);
                    if (result) {
                        setSearchResult(result);
                    }
                } catch (error) {
                    console.error('Erro na busca:', error);
                } finally {
                    setSearching(false);
                }
            }
        },
        [pokemons, allPokemonNames, searchPokemonByName]
    );

    const fetchPokemons = async (offsetAtual) => {
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
    };

    const handleLoadMore = () => {
        fetchPokemons(offset);
    };

    const handleFilterChange = (e) => {
        setTipoSelecionado(e.target.value);
    };

    useEffect(() => {
        fetchPokemons(0);
    }, []);

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
                {searching && <SearchingText>Buscando...</SearchingText>}
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

            {searchResult && (
                <BackButtonContainer>
                    <BackButton
                        onClick={() => {
                            setSearchResult(null);
                            setSearchTerm('');
                        }}
                    >
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

            {pokemonsFiltrados.length === 0 && !loading && !searching && (
                <NoResultsContainer>
                    <NoResultsIcon>🔍</NoResultsIcon>
                    <NoResultsText>
                        Nenhum Pokémon encontrado
                        {searchTerm && ` com o nome "${searchTerm}"`}
                        {tipoSelecionado !== 'all' && ` do tipo "${tipoSelecionado}"`}
                    </NoResultsText>
                    <ClearFiltersButton
                        onClick={() => {
                            setSearchTerm('');
                            setTipoSelecionado('all');
                            setSearchResult(null);
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

            {!loading && !loadingMore && tipoSelecionado === 'all' && !searchTerm && (
                <LoadMoreButton onClick={handleLoadMore}>Ver mais pokémons</LoadMoreButton>
            )}
        </MainContainer>
    );
};

/* Estilos (mantém os mesmos) */

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
`;

const SearchingText = styled.p`
    text-align: center;
    margin-top: 0.5rem;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
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
