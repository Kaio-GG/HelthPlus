import { StyleSheet } from 'react-native';
import { cores, espacamento } from '../../tema';

export const estilos = StyleSheet.create({
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  nomePlano: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: cores.verdeEscuro,
    paddingRight: 8,
  },
  detalhe: {
    fontSize: 12.5,
    color: cores.textoSecundario,
    marginTop: 4,
  },
  linhaMetas: {
    flexDirection: 'row',
    marginTop: 14,
  },
  meta: {
    flex: 1,
  },
  rotuloMeta: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginBottom: 2,
  },
  valorMeta: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeBotao,
  },
  blocoObservacoes: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  textoObservacoes: {
    fontSize: 13.5,
    lineHeight: 19,
    color: cores.textoPrincipal,
  },

  // ----- Refeições -----
  cabecaRefeicao: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dadosCabeca: {
    flex: 1,
  },
  nomeRefeicao: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  linhaAlimento: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  dadosAlimento: {
    flex: 1,
    paddingRight: 8,
  },
  nomeAlimento: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.textoPrincipal,
  },
  porcaoAlimento: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 1,
  },
  kcalAlimento: {
    fontSize: 12.5,
    fontWeight: '700',
    color: cores.verdeEscuro,
  },

  // ----- Sem plano -----
  caixaVazia: {
    alignItems: 'center',
    paddingVertical: espacamento.lg,
  },
  circuloVazio: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: cores.verdeSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamento.md,
  },
  vazio: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: cores.verdeEscuro,
  },
  vazioDetalhe: {
    textAlign: 'center',
    fontSize: 13,
    color: cores.textoSecundario,
    marginTop: 4,
  },
});
