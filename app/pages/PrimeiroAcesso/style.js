import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  tituloSecao: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginTop: 4,
    marginBottom: 10,
  },
  textoCheck: {
    fontSize: 13.5,
    lineHeight: 20,
    color: cores.textoPrincipal,
  },
  link: {
    fontWeight: '700',
    color: cores.verdeLink,
  },
});
