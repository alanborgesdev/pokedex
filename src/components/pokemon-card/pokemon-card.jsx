import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../hook/use-theme';

// Componente do card do Pokémon
const PokemonCard = ({ pokemon }) => {
  // Pega o tema atual (dark/light)
  const { theme } = useTheme();
  
  // Pega o ID do Pokémon da URL
  const pokemonId = pokemon.url.split('/')[6]; // posição fixa porque a URL sempre vem no mesmo formato
  
  // Monta a URL da imagem
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

  return (
    <CardLink 
      to={`/pokemon/${pokemon.name}`} 
      $tema={theme} // Alterado para $tema
    >
      {/* Imagem - se não carregar, usa placeholder */}
      <PokemonImg
        src={imageUrl}
        alt={pokemon.name}
        $tema={theme} // Alterado para $tema
        onError={(e) => {
          e.target.src = '/placeholder.png'; // Fallback image
        }}
      />
      
      {/* Nome */}
      <PokemonNome $tema={theme}> {/* Alterado para $tema */}
        {pokemon.name}
      </PokemonNome>
    </CardLink>
  );
};

// Validação das props (o ESLint fica feliz)
PokemonCard.propTypes = {
  pokemon: PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

/* Estilos com Styled Components */

// O card que é clicável
const CardLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ $tema }) => $tema?.colors?.cardBackground || '#fff'};
  border-radius: 8px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  box-shadow: ${({ $tema }) => $tema?.shadows?.card || '0 2px 4px rgba(0,0,0,0.1)'};
  border: 1px solid ${({ $tema }) => $tema?.colors?.border || '#eee'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ $tema }) => $tema?.shadows?.hover || '0 4px 8px rgba(0,0,0,0.15)'};
  }

  /* Efeito quando clica */
  &:active {
    transform: translateY(1px);
  }
`;

// Estilo da imagem do Pokémon
const PokemonImg = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 0.5rem;
  background: ${({ $tema }) => $tema?.colors?.secondary || '#f0f0f0'};
  border-radius: 50%;
  padding: 6px;
  
  /* Melhora a qualidade da imagem */
  image-rendering: -webkit-optimize-contrast;
`;

// Estilo do nome
const PokemonNome = styled.p`
  margin: 0;
  font-weight: 500;
  text-transform: capitalize;
  text-align: center;
  color: ${({ $tema }) => $tema?.colors?.text || '#333'};
  font-size: 0.9rem;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default PokemonCard;