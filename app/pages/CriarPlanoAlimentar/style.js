import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  linhaBotoes: {
    flexDirection: 'row',
  },
  botaoVoltar: {
    flex: 1,
    marginRight: 12,
  },
  botaoContinuar: {
    flex: 2,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.verdeEscuro,
    marginBottom: 6,
  },
  rotuloLista: {
    marginTop: 6,
  },
  linhaCampos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  campoMetade: {
    width: '48%',
  },
  linhaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  vazio: {
    fontSize: 13,
    color: cores.textoSecundario,
    paddingVertical: 10,
  },
  erro: {
    fontSize: 12,
    color: cores.erro,
    marginBottom: 6,
  },

  // ----- Alimentos -----
  itemBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  itemAlimento: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.verdeSuave,
    borderRadius: raios.medio,
    padding: 12,
    marginBottom: 8,
  },
  textosAlimento: {
    flex: 1,
    paddingRight: 8,
  },
  nomeAlimento: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  porcaoAlimento: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  totalRefeicao: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  linhaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rotuloTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  valorTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: cores.verdeBotao,
  },
  macros: {
    fontSize: 12.5,
    color: cores.textoPrincipal,
    marginTop: 4,
  },
  notaMacros: {
    fontSize: 11.5,
    color: cores.textoSecundario,
    marginTop: 2,
  },

  // ----- Revisão -----
  nomeResumo: {
    fontSize: 18,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 4,
  },
  detalheResumo: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginBottom: 2,
  },
  caixaMeta: {
    backgroundColor: cores.verdeSuave,
    borderRadius: raios.medio,
    padding: 12,
    marginVertical: 12,
  },
  seloMeta: {
    marginTop: 8,
  },
  linhaResumoRefeicao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  kcalResumo: {
    fontSize: 13,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
});
