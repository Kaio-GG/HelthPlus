import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, sombras, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(31, 42, 36, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacamento.lg,
  },
  painel: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: cores.branco,
    borderRadius: raios.cartao,
    padding: espacamento.lg,
    ...sombras.cartao,
  },
  titulo: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
    marginBottom: espacamento.md,
  },
});
