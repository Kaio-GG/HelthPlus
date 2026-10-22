import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  tituloCartao: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 12,
  },
  dicaCartao: {
    fontSize: 12,
    lineHeight: 16,
    color: cores.textoSecundario,
    marginTop: -8,
    marginBottom: 12,
  },
  rotuloCampo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.verdeEscuro,
    marginBottom: 6,
  },
  linhaCampos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  campoMetade: {
    width: '48%',
  },
  erro: {
    fontSize: 12,
    color: cores.erro,
    marginBottom: 8,
  },

  // ----- Faixa de referência escolhida -----
  cartaoFaixa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textosFaixa: {
    flex: 1,
  },
  rotuloFaixa: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  valorFaixa: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginTop: 2,
  },
  trocarFaixa: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeLink,
    paddingLeft: 12,
  },

  // ----- Paciente -----
  itemBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  nomeBusca: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: cores.textoPrincipal,
  },
  pacienteSelecionado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.verdeSuave,
    borderRadius: raios.medio,
    padding: 10,
    marginTop: 6,
  },
  dadosSelecionado: {
    flex: 1,
    marginLeft: 10,
  },
  nomeSelecionado: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  detalheSelecionado: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  alternadorModo: {
    marginBottom: 16,
  },

  // ----- Avisos da avaliação -----
  avisoIdade: {
    marginTop: 14,
  },
  textoAviso: {
    fontSize: 13,
    lineHeight: 18,
    color: cores.alertaTexto,
  },
  acaoAviso: {
    fontSize: 13,
    fontWeight: '800',
    color: cores.alertaTexto,
    textDecorationLine: 'underline',
    marginTop: 8,
  },

  // ----- Medidas -----
  notaPosicao: {
    fontSize: 12,
    lineHeight: 16,
    color: cores.textoSecundario,
    marginTop: 8,
    marginBottom: 8,
  },

  // ----- IMC -----
  caixaImc: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.verdeSuave,
    borderRadius: raios.medio,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  rotuloImc: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeEscuro,
  },
  valorImc: {
    fontSize: 17,
    fontWeight: '800',
    color: cores.verdeBotao,
  },
  notaImc: {
    fontSize: 12,
    lineHeight: 16,
    color: cores.textoSecundario,
    marginTop: 10,
  },
});
