import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPokemonDetails } from '../services/api';
import styled from 'styled-components';

// Componente que mostra os detalhes de um Pokémon
const PokemonDetail = () => {
  // Pega o nome do Pokémon da URL
  const { name } = useParams();
  
  // Estados pra controlar o que aparece na tela
  const [pokemon, setPokemon] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Quando o componente carrega, busca os dados
  useEffect(() => {
    const pegarPokemon = async () => {
      try {
        setCarregando(true);
        setErro(null);
        
        // Faz a chamada pra API
        const dadosPokemon = await getPokemonDetails(name);
        setPokemon(dadosPokemon);
        
      } catch (error) {
        // Se der erro, guarda a mensagem
        setErro('Opa, deu ruim ao buscar o Pokémon!');
        console.error('Erro ao buscar Pokémon:', error);
      } finally {
        setCarregando(false);
      }
    };

    pegarPokemon();
  }, [name]);

  // Mostra que está carregando
  if (carregando) {
    return (
      <DivCarregando>
        <p>Procurando o Pokémon...</p>
      </DivCarregando>
    );
  }

  // Mostra erro se tiver ocorrido
  if (erro) {
    return (
      <DivErro>
        <p>{erro}</p>
      </DivErro>
    );
  }

  // Se não encontrou o Pokémon
  if (!pokemon) {
    return (
      <DivNaoEncontrado>
        <p>Não achei esse Pokémon :(</p>
      </DivNaoEncontrado>
    );
  }

  // Mostra os detalhes do Pokémon
  return (
    <DivPrincipal>
      {/* Cabeçalho com imagem e nome */}
      <Cabecalho>
        <ImagemPokemon
          src={pokemon.sprites?.front_default || '/placeholder.png'}
          alt={pokemon.name}
          onError={(e) => {
            e.target.src = '/placeholder.png'; // Se a imagem não carregar
          }}
        />
        <NomePokemon>{pokemon.name}</NomePokemon>
      </Cabecalho>

      {/* Seção de tipos */}
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

      {/* Seção de habilidades */}
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

      {/* Seção de movimentos (só mostra 10 pra não ficar enorme) */}
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

/* Estilos usando styled-components */

const DivPrincipal = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background: var(--color-cardBackground);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--color-shadow);
  color: var(--color-text);
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
  background: #3b82f6;
  border-radius: 8px;
  filter: var(--image-filter);
`;

const NomePokemon = styled.h1`
  text-transform: capitalize;
  margin: 0;
  color: var(--color-text);
`;

const Secao = styled.section`
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: rgba(120, 120, 120, 0.15);
  border-radius: 8px;
  color: var(--color-text);
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
  background-color: #F08030; /* Laranja fixo pra todos os tipos */
`;

const ListaHabilidades = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.5rem;
`;

const Habilidade = styled.li`
  padding: 0.5rem;
  border-radius: 4px;
  text-transform: capitalize;
  color: var(--color-text);
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
  color: var(--color-text);
`;

const DivCarregando = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: var(--color-text);
`;

const DivErro = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--color-error);
  font-size: 1.1rem;
`;

const DivNaoEncontrado = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--color-warning);
  font-size: 1.1rem;
`;

export default PokemonDetail;