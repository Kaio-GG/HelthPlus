import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  linhaLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: -4,
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeLink,
  },
  aviso: {
    marginTop: 18,
    marginBottom: 0,
  },
});
