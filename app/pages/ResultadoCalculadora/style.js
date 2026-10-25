import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  avisoTopo: {
    marginBottom: espacamento.md,
  },

  // ----- Resumo do topo -----
  cartaoResumo: {
    marginBottom: espacamento.md,
  },
  rotuloResumo: {
    ...tipografia.miudo,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: cores.textoSecundario,
  },
  fonteResumo: {
    ...tipografia.corpoForte,
    color: cores.verdeEscuro,
    marginTop: 3,
  },
  contagem: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },
  vazio: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
  },

  // ----- Um cartão por indicador -----
  cartaoIndicador: {
    marginBottom: espacamento.md,
  },
  // O nome do indicador e o status dele dividem a primeira linha.
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: espacamento.sm,
  },
  nomeIndicador: {
    ...tipografia.apoioForte,
    flexShrink: 1,
    color: cores.textoSecundario,
    paddingTop: 4,
  },
  // A medida é a informação principal da tela: grande e escura.
  linhaValor: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: espacamento.sm,
  },
  valor: {
    ...tipografia.destaque,
    color: cores.verdeEscuro,
  },
  unidade: {
    ...tipografia.corpoForte,
    color: cores.textoSecundario,
    marginLeft: 5,
  },

  // ----- Etiqueta do status -----
  // O limite de largura deixa o nome do indicador caber numa linha só;
  // o texto do status quebra em duas, que é onde há espaço de sobra.
  chip: {
    maxWidth: '56%',
    borderRadius: raios.pilula,
    paddingHorizontal: espacamento.sm,
    paddingVertical: 6,
  },
  textoChip: {
    ...tipografia.miudo,
    fontWeight: '800',
    textAlign: 'center',
  },
  chipAdequado: {
    backgroundColor: cores.verdeClaro,
  },
  textoChipAdequado: {
    color: cores.verdeLink,
  },
  chipAtencao: {
    backgroundColor: cores.alertaFundo,
  },
  textoChipAtencao: {
    color: cores.alertaTexto,
  },
  chipRisco: {
    backgroundColor: cores.erroFundo,
  },
  textoChipRisco: {
    color: cores.erro,
  },
  chipIndisponivel: {
    backgroundColor: cores.campoSomenteLeitura,
  },
  textoChipIndisponivel: {
    color: cores.textoDesabilitado,
  },

  // ----- Números técnicos e observações -----
  escores: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },
  motivo: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },
  // A conversão de posição muda o número comparado com a curva, então ela
  // aparece destacada, e não como nota solta.
  conversao: {
    ...tipografia.miudo,
    color: cores.infoTexto,
    backgroundColor: cores.infoFundo,
    borderRadius: raios.pequeno,
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.sm,
    marginTop: espacamento.md,
  },
  implausivel: {
    ...tipografia.apoio,
    fontWeight: '700',
    color: cores.alertaTexto,
    marginTop: espacamento.sm,
  },

  // Leitura extra do mesmo número (desnutrição aguda pelo PB).
  linhaExtra: {
    backgroundColor: cores.campoSomenteLeitura,
    borderRadius: raios.pequeno,
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.md,
    marginTop: espacamento.md,
  },
  rotuloExtra: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
  },
  valorExtra: {
    ...tipografia.apoioForte,
    fontWeight: '800',
    marginTop: 2,
  },

  // ----- Legenda e nota -----
  cartaoLegenda: {},
  legenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.lg,
  },
  itemLegenda: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bolinha: {
    width: 9,
    height: 9,
    borderRadius: raios.pilula,
    marginRight: 6,
  },
  bolinhaAdequado: {
    backgroundColor: cores.verdeBotao,
  },
  bolinhaAtencao: {
    backgroundColor: cores.alertaTexto,
  },
  bolinhaRisco: {
    backgroundColor: cores.erro,
  },
  textoLegenda: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
  },
  nota: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: espacamento.md,
  },

  botaoSalvar: {
    marginBottom: espacamento.md,
  },
});
