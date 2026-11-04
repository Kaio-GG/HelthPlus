import { StyleSheet } from 'react-native';

export const estilos = StyleSheet.create({
  // O PNG já vem com o fundo transparente e o recorte redondo do emblema,
  // então aqui não entra anel nem borderRadius: o que se vê é o desenho.
  logo: {
    alignSelf: 'center',
  },
});
