import { StyleSheet } from 'react-native';
import { cores, sombras } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombras.cartao,
  },
});
