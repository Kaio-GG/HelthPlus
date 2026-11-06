import { StyleSheet } from 'react-native';
import { cores, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  vazio: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
