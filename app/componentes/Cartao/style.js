import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, sombras } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    backgroundColor: cores.branco,
    borderRadius: raios.cartao,
    padding: espacamento.lg,
    marginBottom: espacamento.lg,
    ...sombras.cartao,
  },
});
