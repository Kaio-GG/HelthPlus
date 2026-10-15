import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  trilho: {
    height: 8,
    borderRadius: 4,
    backgroundColor: cores.linha,
    overflow: 'hidden',
  },
  preenchimento: {
    height: '100%',
    borderRadius: 4,
  },
});
