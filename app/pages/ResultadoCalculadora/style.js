import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  avisoTopo: {
    marginBottom: 12,
  },

  // ----- Resumo do topo -----
  cartaoResumo: {
    paddingVertical: 14,
    marginBottom: 12,
  },
  rotuloResumo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: cores.textoSecundario,
  },
  fonteResumo: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.verdeEscuro,
    marginTop: 3,
  },
  contagem: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginTop: 8,
  },
  vazio: {
    fontSize: 13,
    color: cores.textoSecundario,
  },

  // ----- Um cartão por indicador -----
  cartaoIndicador: {
    paddingVertical: 16,
    marginBottom: 12,
  },
  nomeIndicador: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoSecundario,
  },
  // A medida é a informação principal da tela: fica grande e escura.
  linhaValor: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: 10,
  },
  valor: {
    fontSize: 28,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  unidade: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.textoSecundario,
    marginLeft: 5,
  },

  // ----- Etiqueta da classificação -----
  chip: {
    alignSelf: 'flex-start',
    borderRadius: raios.pilula,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textoChip: {
    fontSize: 12,
    fontWeight: '800',
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
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 10,
  },
  motivo: {
    fontSize: 12,
    lineHeight: 16,
    color: cores.textoSecundario,
    marginTop: 6,
  },
  implausivel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: cores.alertaTexto,
    marginTop: 6,
  },

  // Leitura extra do mesmo número (desnutrição aguda pelo PB).
  linhaExtra: {
    backgroundColor: cores.campoSomenteLeitura,
    borderRadius: raios.pequeno,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  rotuloExtra: {
    fontSize: 11,
    color: cores.textoSecundario,
  },
  valorExtra: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },

  // ----- Legenda e nota -----
  cartaoLegenda: {
    paddingVertical: 14,
  },
  legenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
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
    fontSize: 12,
    color: cores.textoSecundario,
  },
  nota: {
    fontSize: 11,
    lineHeight: 16,
    color: cores.textoSecundario,
    marginTop: 12,
  },

  botaoSalvar: {
    marginBottom: 10,
  },
});
