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
  rodapeTexto: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: cores.textoSecundario,
  },
  textoTermos: {
    fontSize: 13.5,
    lineHeight: 20,
    color: cores.textoPrincipal,
  },
});
