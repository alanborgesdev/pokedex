import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ ADICIONAR useNavigate
import { getPokemonDetails } from '../services/api';
import styled from 'styled-components';

const PokemonDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate(); // ✅ ADICIONAR
  const [pokemon, setPokemon] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const pegarPokemon = async () => {
      try {
        setCarregando(true);
        setErro(null);
        const dadosPokemon = await getPokemonDetails(name);
        setPokemon(dadosPokemon);
      } catch (error) {
        setErro('Erro ao buscar o Pokémon!');
        console.error('Erro ao buscar Pokémon:', error);
      } finally {
        setCarregando(false);
      }
    };

    pegarPokemon();
  }, [name]);

  if (carregando) {
    return (
      <DivCarregando>
        <LoadingSpinner>⏳</LoadingSpinner>
        <p>Procurando o Pokémon...</p>
      </DivCarregando>
    );
  }

  if (erro) {
    return (
      <DivErro>
        <ErrorIcon>⚠️</ErrorIcon>
        <p>{erro}</p>
        {/* ✅ ADICIONAR botão de voltar no erro */}
        <BackButton onClick={() => navigate('/')}>
          ← Voltar para Home
        </BackButton>
      </DivErro>
    );
  }

  if (!pokemon) {
    return (
      <DivNaoEncontrado>
        <p>Não achei esse Pokémon :(</p>
        {/* ✅ ADICIONAR botão de voltar */}
        <BackButton onClick={() => navigate('/')}>
          ← Voltar para Home
        </BackButton>
      </DivNaoEncontrado>
    );
  }

  return (
    <DivPrincipal>
      {/* ✅ ADICIONAR botão de voltar no topo */}
      <BackButton onClick={() => navigate('/')}>
        ← Voltar para todos os pokémons
      </BackButton>

      <Cabecalho>
        <ImagemPokemon
          src={pokemon.sprites?.front_default || '/placeholder.png'}
          alt={pokemon.name}
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
        <NomePokemon>{pokemon.name}</NomePokemon>
      </Cabecalho>

      <Secao>
        <h2>Tipos</h2>
        <ListaTipos>
          {pokemon.types?.map((tipo, i) => (
            <Tipo key={i}>
              {tipo.type?.name || tipo || '???'}
            </Tipo>
          ))}
        </ListaTipos>
      </Secao>

      <Secao>
        <h2>Habilidades</h2>
        <ListaHabilidades>
          {pokemon.abilities?.slice(0, 5).map((habilidade, i) => (
            <Habilidade key={i}>
              {habilidade.ability?.name || habilidade || '???'}
            </Habilidade>
          ))}
        </ListaHabilidades>
      </Secao>

      <Secao>
        <h2>Movimentos</h2>
        <ListaMovimentos>
          {pokemon.moves?.slice(0, 10).map((movimento, i) => (
            <Movimento key={i}>
              {movimento.move?.name || movimento || '???'}
            </Movimento>
          ))}
        </ListaMovimentos>
      </Secao>
    </DivPrincipal>
  );
};

/* Estilos */

// ✅ ADICIONAR: Estilo do botão voltar
const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  margin-bottom: 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.shadows.card};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }
`;

const DivPrincipal = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  color: ${({ theme }) => theme.colors.text};
`;

const Cabecalho = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ImagemPokemon = styled.img`
  width: 96px;
  height: 96px;
  object-fit: contain;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 0.5rem;
`;

const NomePokemon = styled.h1`
  text-transform: capitalize;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 2rem;
`;

const Secao = styled.section`
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.secondary};
  border-radius: 8px;

  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ListaTipos = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Tipo = styled.span`
  padding: 0.25rem 0.75rem;
  color: white;
  border-radius: 1rem;
  font-weight: bold;
  text-transform: capitalize;
  background-color: #f08030;
`;

const ListaHabilidades = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.5rem;
`;

const Habilidade = styled.li`
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 4px;
  text-transform: capitalize;
  color: ${({ theme }) => theme.colors.text};
`;

const ListaMovimentos = styled.ul`
  columns: 2;
  list-style: none;
  padding: 0;
  gap: 0.5rem;

  @media (max-width: 600px) {
    columns: 1;
  }
`;

const Movimento = styled.li`
  padding: 0.25rem 0;
  text-transform: capitalize;
  break-inside: avoid;
  color: ${({ theme }) => theme.colors.text};
`;

const DivCarregando = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const LoadingSpinner = styled.div`
  font-size: 3rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const DivErro = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.error};
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const DivNaoEncontrado = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export default PokemonDetail;
