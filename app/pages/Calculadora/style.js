import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  tituloCartao: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
    marginBottom: espacamento.md,
  },
  dicaCartao: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: -espacamento.sm,
    marginBottom: espacamento.md,
  },
  rotuloCampo: {
    ...tipografia.apoioForte,
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
    ...tipografia.apoio,
    color: cores.erro,
    marginBottom: espacamento.sm,
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
    ...tipografia.miudo,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: cores.textoSecundario,
  },
  valorFaixa: {
    ...tipografia.corpoForte,
    color: cores.verdeEscuro,
    marginTop: 3,
  },
  trocarFaixa: {
    ...tipografia.apoioForte,
    color: cores.verdeLink,
    paddingLeft: espacamento.md,
    paddingVertical: espacamento.sm,
  },

  // ----- Paciente -----
  itemBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espacamento.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  nomeBusca: {
    ...tipografia.corpoForte,
    marginLeft: espacamento.md,
    color: cores.textoPrincipal,
  },
  pacienteSelecionado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.verdeSuave,
    borderRadius: raios.medio,
    padding: espacamento.md,
    marginTop: 6,
  },
  dadosSelecionado: {
    flex: 1,
    marginLeft: espacamento.md,
  },
  nomeSelecionado: {
    ...tipografia.corpoForte,
    color: cores.verdeEscuro,
  },
  detalheSelecionado: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
  },
  alternadorModo: {
    marginBottom: espacamento.lg,
  },

  // ----- Avisos da avaliação -----
  avisoIdade: {
    marginTop: espacamento.lg,
  },
  textoAviso: {
    ...tipografia.apoio,
    color: cores.alertaTexto,
  },
  acaoAviso: {
    ...tipografia.apoioForte,
    fontWeight: '800',
    color: cores.alertaTexto,
    textDecorationLine: 'underline',
    marginTop: espacamento.sm,
  },

  // ----- Medidas -----
  notaPosicao: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
    marginBottom: espacamento.md,
  },

  // ----- IMC -----
  caixaImc: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.verdeSuave,
    borderRadius: raios.medio,
    paddingHorizontal: espacamento.lg,
    paddingVertical: espacamento.md,
    marginTop: espacamento.xs,
  },
  rotuloImc: {
    ...tipografia.apoioForte,
    color: cores.verdeEscuro,
  },
  valorImc: {
    ...tipografia.secao,
    color: cores.verdeBotao,
  },
  notaImc: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: espacamento.md,
  },
});
