import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const SearchBar = ({
  onSearch,
  pokemonList = [], // Lista completa de pokémons carregados
  placeholder = "Buscar Pokémon...",
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gera sugestões enquanto digita
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = pokemonList
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 8); // Mostra no máximo 8 sugestões

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, pokemonList]);

  // Debounce para busca na API
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm.toLowerCase().trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch('');
  };

  const handleSelectSuggestion = (pokemonName) => {
    setSearchTerm(pokemonName);
    setShowSuggestions(false);
    setSuggestions([]);
    onSearch(pokemonName.toLowerCase());
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex].name);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  return (
    <SearchWrapper ref={wrapperRef}>
      <SearchContainer>
        <SearchIcon>🔍</SearchIcon>
        <SearchInput
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Buscar Pokémon por nome"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
          aria-expanded={showSuggestions}
        />
        {searchTerm && (
          <ClearButton
            onClick={handleClear}
            aria-label="Limpar busca"
            type="button"
          >
            ✕
          </ClearButton>
        )}
      </SearchContainer>

      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsList id="suggestions-list" role="listbox">
          {suggestions.map((pokemon, index) => (
            <SuggestionItem
              key={pokemon.id || pokemon.name}
              onClick={() => handleSelectSuggestion(pokemon.name)}
              $isSelected={index === selectedIndex}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <PokemonIcon
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                alt=""
                onError={(e) => e.target.style.display = 'none'}
              />
              <PokemonName>
                {pokemon.name}
              </PokemonName>
              {pokemon.types && (
                <TypeBadge>
                  {pokemon.types[0]}
                </TypeBadge>
              )}
            </SuggestionItem>
          ))}
        </SuggestionsList>
      )}
    </SearchWrapper>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  pokemonList: PropTypes.array,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

/* Estilos */

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 3rem;
  font-size: 1rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 25px;
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}33;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text}66;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.6;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadows.hover};
  z-index: 1000;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary + '22' : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.primary}22;
  }
`;

const PokemonIcon = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const PokemonName = styled.span`
  flex: 1;
  text-transform: capitalize;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const TypeBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 12px;
  font-size: 0.75rem;
  text-transform: capitalize;
`;

export default SearchBar;
