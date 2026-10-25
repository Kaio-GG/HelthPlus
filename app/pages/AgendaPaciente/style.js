import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  tituloLista: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 8,
  },
  tituloAnteriores: {
    marginTop: 12,
  },
  vazio: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: cores.textoSecundario,
    marginVertical: 20,
  },
  itemConsulta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  barraLateral: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: cores.verdeCabecalho,
    marginRight: 12,
  },
  colunaHorario: {
    width: 50,
  },
  horaInicio: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  horaFim: {
    fontSize: 11.5,
    color: cores.textoSecundario,
  },
  dadosConsulta: {
    flex: 1,
    paddingRight: 8,
  },
  dataConsulta: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  tipoConsulta: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 1,
  },
});
