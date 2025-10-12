import { createGlobalStyle } from 'styled-components';

// Esses estilos vão ser aplicados em toda a aplicação
const GlobalStyle = createGlobalStyle`
  /* Reset básico - tira aqueles espaços que vem por padrão */
  * {
    margin: 0;   /* tira as margens */
    padding: 0;  /* tira os paddings */
    box-sizing: border-box; /* faz o padding contar na largura */
  }

  /* Estilização do body - onde tudo acontece */
  body {
    font-family: 'Arial', sans-serif; /* fonte segura pra todo mundo */

    /* Fundo pega do tema ou usa um cinza claro */
    background: ${({ theme }) => theme?.colors?.background || '#f5f5f5'};

    /* Texto pega do tema ou usa um cinza escuro */
    color: ${({ theme }) => theme?.colors?.text || '#333'};

    /* Transição suave quando mudar o tema */
    transition: background-color 0.3s ease, color 0.3s ease;

    /* Melhora a aparência do texto */
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;
  }

  /* Estilo básico para links - tira o sublinhado */
  a {
    text-decoration: none;
    color: inherit; /* herda a cor do elemento pai */
  }

  /* Imagens responsivas por padrão */
  img {
    max-width: 100%;
    height: auto;
  }
`;

export default GlobalStyle;
