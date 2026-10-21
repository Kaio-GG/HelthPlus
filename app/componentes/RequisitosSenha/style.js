import { StyleSheet } from 'react-native';
import { cores, espacamento } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    marginTop: espacamento.xs,
    marginBottom: espacamento.md,
  },
  titulo: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeEscuro,
    marginBottom: espacamento.sm,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  // Regra cumprida: some de vista sem desaparecer, para o usuário
  // continuar enxergando que aquela exigência existe.
  linhaAtendida: {
    opacity: 0.45,
  },
  marcador: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  marcadorAtendido: {
    backgroundColor: cores.verdeBotao,
    borderColor: cores.verdeBotao,
  },
  texto: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  textoAtendido: {
    color: cores.verdeEscuro,
    textDecorationLine: 'line-through',
  },
});
