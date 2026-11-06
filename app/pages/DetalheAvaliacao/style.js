import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  avisoTopo: {
    marginBottom: espacamento.md,
  },

  // ----- Resumo do topo: as medidas daquele dia -----
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
  linhaMedidas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espacamento.md,
    marginBottom: espacamento.md,
  },
  medida: {
    flex: 1,
  },
  rotuloMedida: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
  },
  valorMedida: {
    ...tipografia.corpoForte,
    color: cores.verdeEscuro,
    marginTop: 2,
  },
  linhaIdade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoIdade: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
  },
  fonteResumo: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },
  contagem: {
    ...tipografia.apoioForte,
    color: cores.verdeLink,
    marginTop: espacamento.xs,
  },
  vazio: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
  },

  // ----- Um cartão por indicador -----
  cartaoIndicador: {
    marginBottom: espacamento.md,
  },
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
  // A medida é a informação principal do cartão: grande e escura.
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
  explicacao: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },

  // ----- Etiqueta do status -----
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
  chipAdequado: { backgroundColor: cores.verdeClaro },
  textoChipAdequado: { color: cores.verdeLink },
  chipAtencao: { backgroundColor: cores.alertaFundo },
  textoChipAtencao: { color: cores.alertaTexto },
  chipRisco: { backgroundColor: cores.erroFundo },
  textoChipRisco: { color: cores.erro },
  chipIndisponivel: { backgroundColor: cores.campoSomenteLeitura },
  textoChipIndisponivel: { color: cores.textoDesabilitado },

  // ----- Os números técnicos, num bloco só -----
  //
  // Agrupados num fundo próprio porque são a parte que o paciente pode
  // ignorar: ele lê a medida, a etiqueta e a frase de leitura; o escore-z
  // e o percentil ficam ali para o nutricionista.
  blocoEscores: {
    backgroundColor: cores.campoSomenteLeitura,
    borderRadius: raios.pequeno,
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.md,
    marginTop: espacamento.md,
  },
  linhaEscore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espacamento.xs,
  },
  rotuloEscore: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
  },
  valorEscore: {
    ...tipografia.apoioForte,
    color: cores.verdeEscuro,
  },
  leitura: {
    ...tipografia.apoio,
    color: cores.textoPrincipal,
    marginTop: espacamento.sm,
  },
  leituraPercentil: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: espacamento.xs,
  },

  motivo: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },
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
  bolinhaAdequado: { backgroundColor: cores.verdeBotao },
  bolinhaAtencao: { backgroundColor: cores.alertaTexto },
  bolinhaRisco: { backgroundColor: cores.erro },
  textoLegenda: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
  },
  nota: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: espacamento.md,
  },
});
