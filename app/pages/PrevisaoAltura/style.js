import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  tituloCartao: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
  },
  subtituloCartao: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: 4,
    marginBottom: espacamento.md,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacamento.sm,
  },
  rotuloCampo: {
    ...tipografia.apoioForte,
    color: cores.verdeEscuro,
    marginTop: espacamento.md,
    marginBottom: 6,
  },
  linhaCampos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espacamento.md,
  },
  campoMetade: {
    width: '48%',
  },
  aviso: {
    marginTop: espacamento.md,
    marginBottom: 0,
  },

  // ----- O número do resultado -----
  linhaResultado: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: espacamento.md,
  },
  valorResultado: {
    ...tipografia.destaque,
    color: cores.verdeEscuro,
  },
  unidadeResultado: {
    ...tipografia.corpoForte,
    color: cores.textoSecundario,
    marginLeft: 5,
  },
  faixaResultado: {
    ...tipografia.apoioForte,
    color: cores.verdeLink,
  },
  explicacao: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.md,
  },
  semResultado: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },
  notaGrafico: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: espacamento.md,
  },
  fonte: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: espacamento.md,
  },

  // ----- A comparação entre as duas leituras -----
  caixaComparacao: {
    borderRadius: raios.medio,
    padding: espacamento.lg,
    marginTop: espacamento.lg,
  },
  comparacaoDentro: {
    backgroundColor: cores.verdeSuave,
  },
  comparacaoAcima: {
    backgroundColor: cores.infoFundo,
  },
  comparacaoAbaixo: {
    backgroundColor: cores.alertaFundo,
  },
  tituloComparacao: {
    ...tipografia.corpoForte,
    color: cores.verdeEscuro,
  },
  textoComparacao: {
    ...tipografia.apoio,
    color: cores.textoPrincipal,
    marginTop: 4,
  },
});
