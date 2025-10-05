import React, { useState, useEffect, useMemo } from 'react';
import PokemonCard from '../pokemon-card/pokemon-card';
import ThemeToggle from '../theme-toggle/theme-toggle';
import { getPokemons, getPokemonDetails } from '../services/api';
import styled from 'styled-components';

const Home = () => {
    // Estados que vou usar
    const [pokemons, setPokemons] = useState([]); // Lista completa
    const [loading, setLoading] = useState(true); // Loading inicial
    const [loadingMore, setLoadingMore] = useState(false); // Loading ao carregar mais
    const [error, setError] = useState(null); // Mensagem de erro
    const [offset, setOffset] = useState(0); // Paginação
    const [tipoSelecionado, setTipoSelecionado] = useState('all'); // Tipo selecionado
    const [tiposDisponiveis, setTiposDisponiveis] = useState(['all']); // Tipos para filtro
    const LIMITE = 10; // Quantos pokémons carregar por vez

    // ✅ MELHORIA: useMemo em vez de estado duplicado
    const pokemonsFiltrados = useMemo(() => {
        if (tipoSelecionado === 'all') return pokemons;
        return pokemons.filter((p) => p.types.includes(tipoSelecionado));
    }, [pokemons, tipoSelecionado]);

    // Busca os pokémons na API
    const fetchPokemons = async (offsetAtual) => {
        try {
            offsetAtual === 0 ? setLoading(true) : setLoadingMore(true);
            setError(null);

            const listaPokemons = await getPokemons(offsetAtual, LIMITE);

            // ✅ Promise.all para requests paralelos
            const pokemonsCompleto = await Promise.all(
                listaPokemons.map(async (pokemon) => {
                    const detalhes = await getPokemonDetails(pokemon.name);
                    return {
                        ...pokemon,
                        types: detalhes.types,
                    };
                })
            );

            // ✅ Atualiza estado de forma funcional
            setPokemons((prev) => {
                const novosPokemons = offsetAtual === 0
                    ? pokemonsCompleto
                    : [...prev, ...pokemonsCompleto];

                // ✅ Calcula tipos enquanto já tem os dados
                const todosTipos = new Set();
                novosPokemons.forEach((p) => p.types.forEach((t) => todosTipos.add(t)));
                setTiposDisponiveis(['all', ...Array.from(todosTipos).sort()]);

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

    // Carrega mais pokémons
    const handleLoadMore = () => {
        fetchPokemons(offset);
    };

    // ✅ SIMPLIFICADO: só atualiza o estado
    const handleFilterChange = (e) => {
        setTipoSelecionado(e.target.value);
        // O useMemo acima já cuida de recalcular pokemonsFiltrados
    };

    // Efeito pra carregar os pokémons iniciais
    useEffect(() => {
        fetchPokemons(0);
    }, []); // ✅ Array vazio = só executa uma vez

    // Tela de loading
    if (loading) {
        return (
            <LoadingContainer>
                <p>Carregando pokémons...</p>
                <small>Isso pode demorar um pouco</small>
            </LoadingContainer>
        );
    }

    return (
        <MainContainer>
            <header>
                <Title>Pokedex</Title>
                <ThemeToggle />
            </header>

            <FilterSection>
                <label>
                    Filtrar:
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
                </label>
            </FilterSection>

            {error && (
                <ErrorBox>
                    {error}
                    <RetryButton onClick={() => fetchPokemons(offset)}>
                        Tentar de novo
                    </RetryButton>
                </ErrorBox>
            )}

            <PokemonGrid>
                {pokemonsFiltrados.map((pokemon) => (
                    <PokemonCard key={pokemon.id || pokemon.name} pokemon={pokemon} />
                ))}
            </PokemonGrid>

            {loadingMore && <p>Carregando mais pokémons...</p>}

            {!loading && !loadingMore && tipoSelecionado === 'all' && (
                <LoadMoreButton onClick={handleLoadMore}>Ver mais pokémons</LoadMoreButton>
            )}
        </MainContainer>
    );
};

/* Estilos */

const MainContainer = styled.main`
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
`;

const Title = styled.h1`
    text-align: center;
    color: #4caf50;
`;

const FilterSection = styled.div`
    margin: 20px 0;
    display: flex;
    justify-content: center;
`;

const TypeSelect = styled.select`
    margin-left: 10px;
    padding: 5px 10px;
    border-radius: 5px;
`;

const PokemonGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 30px;
`;

const LoadingContainer = styled.div`
    text-align: center;
    padding: 50px;
`;

const ErrorBox = styled.div`
    background: #ffebee;
    color: #c62828;
    padding: 15px;
    border-radius: 5px;
    text-align: center;
    margin: 20px 0;
`;

const RetryButton = styled.button`
    margin-top: 10px;
    padding: 8px 16px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const LoadMoreButton = styled.button`
    display: block;
    margin: 30px auto;
    padding: 10px 20px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
        background: #388e3c;
    }
`;

export default Home;
