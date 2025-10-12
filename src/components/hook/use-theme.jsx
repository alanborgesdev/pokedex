import { useContext } from 'react';
import { ThemeContext } from '../contexts/theme-context';

// Hook personalizado pra usar o tema em qualquer componente
export function useTheme() {
  // Pega o contexto do tema
  const theme = useContext(ThemeContext);

  // Se não tiver tema, deu erro - provavelmente esqueceu do Provider
  if (theme === undefined) {
    throw new Error(
      'Ops! Parece que você esqueceu de colocar o ThemeProvider\n' +
      'Envolve sua aplicação com <ThemeProvider> no arquivo principal!\n' +
      'Exemplo:\n' +
      'function App() {\n' +
      '  return (\n' +
      '    <ThemeProvider>\n' +
      '      <SeusComponentes />\n' +
      '    </ThemeProvider>\n' +
      '  );\n' +
      '}'
    );
  }

  // Retorna tudo que tem no contexto do tema
  return theme;
}
