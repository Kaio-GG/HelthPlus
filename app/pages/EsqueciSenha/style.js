import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  explicacao: {
    fontSize: 13.5,
    lineHeight: 20,
    color: cores.textoSecundario,
    marginBottom: 16,
  },
  linkCentral: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: cores.verdeLink,
  },
});
