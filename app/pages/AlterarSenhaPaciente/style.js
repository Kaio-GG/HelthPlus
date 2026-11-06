import { StyleSheet } from 'react-native';
import { cores, espacamento, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  aviso: {
    marginTop: -4,
    marginBottom: espacamento.lg,
  },
  erro: {
    ...tipografia.apoio,
    fontWeight: '700',
    color: cores.erro,
    marginTop: espacamento.sm,
  },
});
