import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  secao: {
    marginBottom: 14,
  },
  tituloSecao: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 3,
  },
  textoSecao: {
    fontSize: 13,
    lineHeight: 19,
    color: cores.textoPrincipal,
  },
  nota: {
    marginTop: 4,
    fontSize: 11.5,
    color: cores.textoSecundario,
  },
});
