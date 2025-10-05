import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// ✅ NÃO precisa mais importar useTheme!
// const { theme } = useTheme(); ← REMOVER

const PokemonCard = ({ pokemon }) => {
  const pokemonId = pokemon.url.split('/')[6];
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

  return (
    <CardLink to={`/pokemon/${pokemon.name}`}>
      {/* ✅ NÃO precisa mais passar $tema como prop */}
      <PokemonImg
        src={imageUrl}
        alt={pokemon.name}
        onError={(e) => {
          e.target.src = '/placeholder.png';
        }}
      />
      <PokemonNome>{pokemon.name}</PokemonNome>
    </CardLink>
  );
};

PokemonCard.propTypes = {
  pokemon: PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

/* ✅ Styled components agora recebem 'theme' automaticamente */

const CardLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 8px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const PokemonImg = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 0.5rem;
  background: ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  padding: 6px;
  image-rendering: -webkit-optimize-contrast;
`;

const PokemonNome = styled.p`
  margin: 0;
  font-weight: 500;
  text-transform: capitalize;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default PokemonCard;
