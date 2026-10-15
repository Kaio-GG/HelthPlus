import { StyleSheet } from 'react-native';
import { cores, espacamento, SOBREPOSICAO_CABECALHO } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  // O corpo sobe sobre a curva do cabeçalho para os cartões "flutuarem".
  corpo: {
    flex: 1,
    marginTop: -SOBREPOSICAO_CABECALHO,
  },
  rolagem: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: espacamento.lg,
  },
  semRolagem: {
    flex: 1,
  },
  flutuante: {
    position: 'absolute',
    right: 20,
  },
  rodape: {
    paddingHorizontal: espacamento.lg,
    paddingTop: espacamento.md,
    backgroundColor: cores.fundo,
  },
});
