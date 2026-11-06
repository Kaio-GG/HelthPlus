import { StyleSheet } from 'react-native';
import { cores, espacamento, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  tituloCartao: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
    marginBottom: espacamento.md,
  },
  tituloLista: {
    ...tipografia.apoioForte,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: espacamento.sm,
    marginTop: espacamento.xs,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pesoAtual: {
    fontSize: 18,
    fontWeight: '800',
    color: cores.verdeBotao,
    marginBottom: espacamento.md,
  },
  vazio: {
    ...tipografia.corpo,
    textAlign: 'center',
    color: cores.textoSecundario,
    marginTop: espacamento.md,
  },
  vazioDetalhe: {
    ...tipografia.apoio,
    textAlign: 'center',
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },
  botaoTentar: {
    marginTop: espacamento.lg,
  },
  dicaGrafico: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: espacamento.md,
  },
  avisoRodape: {
    marginTop: espacamento.lg,
  },

  // ----- "Da primeira consulta até agora" -----
  //
  // Uma linha por indicador, empilhadas: lado a lado, num celular de
  // 375 px, "+11,5 kg" quebrava no meio.
  cabecalhoCartao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacamento.sm,
    marginBottom: espacamento.lg,
  },
  linhaVariacao: {
    backgroundColor: cores.verdeSuave,
    borderRadius: 14,
    paddingHorizontal: espacamento.lg,
    paddingVertical: 12,
    marginBottom: espacamento.sm,
  },
  topoVariacao: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: espacamento.sm,
  },
  rotuloVariacao: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.textoSecundario,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valorVariacao: {
    fontSize: 19,
    fontWeight: '800',
    color: cores.verdeEscuro,
    flexShrink: 1,
    textAlign: 'right',
  },
  valorVariacaoNeutro: {
    color: cores.textoSecundario,
  },
  detalheVariacao: {
    fontSize: 12.5,
    lineHeight: 18,
    color: cores.textoSecundario,
    marginTop: 4,
  },
  avisoJanela: {
    marginBottom: espacamento.lg,
  },

  // ----- Um cartão por avaliação -----
  cartaoAvaliacao: {
    padding: 14,
    marginBottom: espacamento.md,
  },
  dataAvaliacao: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  idadeAvaliacao: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: 4,
    marginBottom: 10,
  },
  linhaMedidas: {
    flexDirection: 'row',
  },
  medida: {
    flex: 1,
  },
  rotuloDado: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginBottom: 2,
  },
  valorMedida: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  linhaVerDetalhe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 2,
  },
  verDetalhe: {
    ...tipografia.apoio,
    fontWeight: '700',
    color: cores.verdeLink,
  },
});
