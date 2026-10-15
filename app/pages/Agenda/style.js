import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  linhaTituloDia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tituloDia: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  vazio: {
    textAlign: 'center',
    fontSize: 14,
    color: cores.textoSecundario,
    marginVertical: 20,
  },
  itemConsulta: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
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
  nomeConsulta: {
    fontSize: 14.5,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  tipoConsulta: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 1,
  },
});
