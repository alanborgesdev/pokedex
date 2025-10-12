import React from 'react';
import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { renderToString } from 'react-dom/server'; // Vamos usar isso pra renderizar
import ThemeToggle from './theme-toggle';
import { ThemeProvider } from './theme-context';

// Guarda o tema atual (simulando o contexto)
let temaAtual = 'light';

// Mock das funções que nosso componente usa
jest.mock('./theme-context', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    theme: temaAtual,
    toggleTheme: jest.fn(() => {
      temaAtual = temaAtual === 'light' ? 'dark' : 'light';
    })
  })
}));

// Limpeza depois dos testes
afterEach(() => {
  temaAtual = 'light'; // Reseta o tema
  localStorage.clear();
});

describe('Testes do botão de tema', () => {
  it('deve mostrar o tema claro inicial', () => {
    // Renderiza o componente como string
    const resultado = renderToString(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    // Verifica se contém o ícone e texto do tema claro
    expect(resultado).toContain('🌙');
    expect(resultado).toContain('Dark');
  });

  it('deve trocar pro tema escuro quando chamado', () => {
    // Simula a troca de tema
    temaAtual = 'dark';

    const resultado = renderToString(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    // Verifica se contém o ícone e texto do tema escuro
    expect(resultado).toContain('☀️');
    expect(resultado).toContain('Light');
  });
});
