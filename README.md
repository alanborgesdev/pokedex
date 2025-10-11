# 🎮 Pokédex React

Uma Pokédex interativa e moderna desenvolvida com React, permitindo explorar todos os Pokémons, filtrar por tipos, visualizar detalhes completos e alternar entre temas claro e escuro.

![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite)
![Styled Components](https://img.shields.io/badge/Styled_Components-6.1.16-DB7093?style=for-the-badge&logo=styled-components)

---

## 🚀 Tecnologias Utilizadas

### Core
- **React 19.0.0** - Biblioteca JavaScript para construção de interfaces
- **React Router DOM 7.4.1** - Roteamento e navegação
- **Vite 6.2.0** - Build tool e dev server ultrarrápido

### Estilização
- **Styled Components 6.1.16** - CSS-in-JS com suporte a temas
- **Design Responsivo** - Layout adaptável para diferentes dispositivos

### Requisições HTTP
- **Axios 1.8.4** - Cliente HTTP para consumir a PokéAPI

### Qualidade de Código
- **ESLint 9.23.0** - Linter JavaScript/JSX
- **Jest 29.7.0** - Framework de testes
- **React Testing Library 16.2.0** - Testes de componentes React

---

## 🎯 Funcionalidades

- ✅ **Listagem Paginada** - Carregamento incremental de Pokémons (10 por vez)
- 🔍 **Filtro por Tipo** - Filtre Pokémons por tipo (Fire, Water, Grass, etc.)
- 📱 **Design Responsivo** - Interface adaptada para mobile, tablet e desktop
- 🎨 **Tema Claro/Escuro** - Alternância entre temas com detecção automática de preferência do sistema
- 📄 **Página de Detalhes** - Visualize tipos, habilidades, movimentos e estatísticas
- ⚡ **Performance Otimizada** - Uso de useMemo, Promise.all e requisições paralelas
- 🖼️ **Fallback de Imagens** - Placeholder automático para imagens quebradas
- ♿ **Acessibilidade** - Atributos ARIA e navegação por teclado

---

## 🗂️ Estrutura do Projeto

```
pokedex1/
├── src/
│   ├── components/
│   │   ├── contexts/
│   │   │   └── theme-context.jsx      # Context API para gerenciamento de tema
│   │   ├── hook/
│   │   │   └── use-theme.jsx          # Hook customizado para tema
│   │   ├── pages/
│   │   │   ├── home.jsx               # Página principal com listagem
│   │   │   ├── pokemon-detail.jsx     # Página de detalhes do Pokémon
│   │   │   └── routes.jsx             # Configuração de rotas
│   │   ├── pokemon-card/
│   │   │   ├── pokemon-card.jsx       # Card individual do Pokémon
│   │   │   └── pokemon-card.test.jsx  # Testes do card
│   │   ├── services/
│   │   │   ├── api.jsx                # Cliente Axios e funções da API
│   │   │   └── api.test.jsx           # Testes da API
│   │   ├── styles/
│   │   │   ├── global-styles.jsx      # Estilos globais
│   │   │   └── theme-config.js        # Configuração de temas
│   │   └── theme-toggle/
│   │       ├── theme-toggle.jsx       # Botão de alternância de tema
│   │       └── theme-toggle.test.jsx  # Testes do botão
│   ├── App.css                        # Estilos base da aplicação
│   ├── App.jsx                        # Componente raiz
│   └── main.jsx                       # Ponto de entrada React
├── index.html                         # HTML base
├── package.json                       # Dependências e scripts
├── eslint.config.js                   # Configuração ESLint
└── vite.config.js                     # Configuração Vite (não fornecido)
```

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/alanborgesdev/pokedex-react.git

# Acesse a pasta do projeto
cd pokedex-react

# Instale as dependências
npm install
```

### Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

### Pré-visualizar Build

```bash
npm run preview
```

### Executar Testes

```bash
npm test
```

### Linter

```bash
npm run lint
```

---

## 🧪 Testes

O projeto inclui testes unitários para os principais componentes:

- **PokemonCard**: Verifica renderização de nome, imagem e links
- **API**: Testa requisições, cache e tratamento de erros
- **ThemeToggle**: Valida alternância de temas

**Cobertura de Testes:**
- Componentes: PokemonCard, ThemeToggle
- Serviços: API (getPokemons, getPokemonDetails)
- Mocks: Axios Mock Adapter para simular respostas da API

---

## 🎨 Sistema de Temas

O projeto implementa um sistema robusto de temas com:

- **Detecção Automática**: Respeita a preferência do sistema operacional
- **Persistência**: Estado mantido durante a sessão (sem localStorage)
- **Transições Suaves**: Animações CSS na troca de temas
- **Theme Provider**: Context API + Styled Components Theme Provider

### Cores do Tema Claro
- Background: `#ffffff`
- Texto: `#000000`
- Cards: `#f5f5f5`
- Primária: `#3b82f6`

### Cores do Tema Escuro
- Background: `#000000`
- Texto: `#ffffff`
- Cards: `#121212`
- Primária: `#3b82f6`

---

## 🌐 API Utilizada

- **PokéAPI**: https://pokeapi.co/api/v2/
- **Endpoints**:
  - `GET /pokemon?offset={offset}&limit={limit}` - Listagem paginada
  - `GET /pokemon/{name}` - Detalhes do Pokémon

---

## 🚧 Melhorias Futuras

- [ ] Adicionar busca por nome do Pokémon
- [ ] Implementar favoritos com Context API
- [ ] Adicionar gráfico de estatísticas (Recharts)
- [ ] Criar página de comparação entre Pokémons
- [ ] Adicionar animações com Framer Motion
- [ ] Implementar Infinite Scroll
- [ ] Adicionar PWA (Service Workers)
- [ ] Criar sistema de batalha simulada

---

## 📸 Demonstração

### Tela Principal
![Home](https://via.placeholder.com/800x400?text=Home+Screenshot)

### Página de Detalhes
![Details](https://via.placeholder.com/800x400?text=Details+Screenshot)

### Tema Escuro
![Dark Mode](https://via.placeholder.com/800x400?text=Dark+Mode+Screenshot)

> **Nota**: Substitua os placeholders acima por screenshots reais do seu projeto.

---

## 🛠️ Boas Práticas Implementadas

- ✅ Componentização e reutilização
- ✅ Hooks customizados (useTheme)
- ✅ Tratamento de erros robusto
- ✅ Loading states e feedback visual
- ✅ PropTypes para validação
- ✅ Código comentado em português
- ✅ Performance otimizada (useMemo, Promise.all)
- ✅ Acessibilidade (ARIA labels)
- ✅ Testes unitários

---

## 📬 Contato

**Desenvolvedor**: Alan Borges

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/alanborgesdev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/alanborgesdev)

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- [PokéAPI](https://pokeapi.co/) - API gratuita e completa de Pokémons
- [Vite](https://vitejs.dev/) - Build tool incrível
- [Styled Components](https://styled-components.com/) - CSS-in-JS poderoso

---

<div align="center">
  Feito com ❤️ e ☕ por Alan Borges
</div>
