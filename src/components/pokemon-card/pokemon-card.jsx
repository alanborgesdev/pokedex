import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const PokemonCard = ({ pokemon }) => {
  const pokemonId = pokemon.url.split('/')[6];
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

  return (
    <CardLink to={`/pokemon/${pokemon.name}`}>
      <PokemonImg
        src={imageUrl}
        alt={pokemon.name}
        onError={(e) => {
          e.target.src = '/placeholder.png';
        }}
      />
      <PokemonNome>{pokemon.name}</PokemonNome>

      {/* ✅ NOVO: Mostra tipos quando carregados */}
      {pokemon.isDetailsLoaded && pokemon.types && pokemon.types.length > 0 ? (
        <TypeBadgesContainer>
          {pokemon.types.slice(0, 2).map((type, idx) => (
            <TypeBadge key={idx} $type={type}>
              {type}
            </TypeBadge>
          ))}
        </TypeBadgesContainer>
      ) : (
        /* ✅ NOVO: Skeleton enquanto carrega detalhes */
        <TypeSkeleton>
          <SkeletonBar />
          <SkeletonBar $delay="0.2s" />
        </TypeSkeleton>
      )}
    </CardLink>
  );
};

PokemonCard.propTypes = {
  pokemon: PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    types: PropTypes.arrayOf(PropTypes.string),
    isDetailsLoaded: PropTypes.bool,
  }).isRequired,
};

/* ============================= ESTILOS ============================= */

const CardLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 12px;
  padding: 1.25rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  min-height: 180px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const PokemonImg = styled.img`
  width: 96px;
  height: 96px;
  object-fit: contain;
  margin-bottom: 0.75rem;
  background: ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  padding: 8px;
  image-rendering: pixelated;
  transition: transform 0.3s ease;

  ${CardLink}:hover & {
    transform: scale(1.1);
  }
`;

const PokemonNome = styled.p`
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  text-transform: capitalize;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// ✅ NOVO: Container para badges de tipo
const TypeBadgesContainer = styled.div`
  display: flex;
  gap: 0.35rem;
  margin-top: auto;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
`;

// ✅ NOVO: Badge de tipo com cores
const TypeBadge = styled.span`
  padding: 0.25rem 0.65rem;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  background: ${({ $type }) => getTypeColor($type)};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.3px;
`;

// ✅ NOVO: Container para skeleton
const TypeSkeleton = styled.div`
  margin-top: auto;
  display: flex;
  gap: 0.35rem;
  justify-content: center;
  width: 100%;
`;

// ✅ NOVO: Animação de loading
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// ✅ NOVO: Barra de skeleton animada
const SkeletonBar = styled.div`
  width: ${({ $width }) => $width || '45%'};
  height: 20px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.border} 25%,
    ${({ theme }) => theme.colors.secondary} 50%,
    ${({ theme }) => theme.colors.border} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  border-radius: 16px;
`;

// ✅ NOVO: Função helper para cores dos tipos
const getTypeColor = (type) => {
  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
    unknown: '#68A090',
  };
  return typeColors[type?.toLowerCase()] || typeColors.unknown;
};

export default PokemonCard;
