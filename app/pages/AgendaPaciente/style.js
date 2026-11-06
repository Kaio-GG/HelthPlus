import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  // O conteúdo da Tela sobe 28 px por cima da curva do cabeçalho, para os
  // CARTÕES parecerem flutuar. Um título solto, sem cartão atrás, fica
  // meio coberto por essa curva — daí a margem que o desce de volta.
  tituloLista: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginTop: 26,
    marginBottom: 8,
  },
  // O segundo título não precisa da margem do primeiro: ele já está longe
  // do cabeçalho.
  tituloAnteriores: {
    marginTop: 14,
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
    alignItems: 'stretch',
    paddingVertical: 12,
  },
  barraLateral: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: cores.verdeCabecalho,
    marginRight: 12,
  },
  // Duas linhas empilhadas: horário + data em cima, selo embaixo.
  corpoConsulta: {
    flex: 1,
  },
  linhaPrincipal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  colunaHorario: {
    width: 54,
  },
  horaInicio: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  horaFim: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  dadosConsulta: {
    flex: 1,
  },
  dataConsulta: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  tipoConsulta: {
    fontSize: 12.5,
    color: cores.textoSecundario,
    marginTop: 1,
  },
  // Segunda linha: o selo, e o convite para tocar quando a consulta
  // ainda espera confirmação.
  rodapeConsulta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  acaoConsulta: {
    fontSize: 12.5,
    fontWeight: '700',
    color: cores.verdeLink,
  },
  avisoRodape: {
    marginTop: 20,
  },
});
