import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  tituloRequisitos: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeEscuro,
    marginBottom: 8,
  },
  linhaRequisito: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
  textoRequisito: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  textoAtendido: {
    color: cores.verdeEscuro,
  },
  botao: {
    marginTop: 20,
  },
});
