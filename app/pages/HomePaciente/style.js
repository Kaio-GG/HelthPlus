import { StyleSheet } from 'react-native';
import { cores, espacamento } from '../../tema';

export const estilos = StyleSheet.create({
  tituloCartao: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 16,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  // ----- Aviso da senha provisória -----
  cartaoSenha: {
    backgroundColor: cores.alertaFundo,
  },
  linhaSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
  },
  tituloSenha: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: cores.alertaTexto,
  },
  textoSenha: {
    fontSize: 13,
    lineHeight: 19,
    color: cores.textoPrincipal,
    marginTop: espacamento.sm,
  },
  botaoSenha: {
    marginTop: espacamento.md,
  },

  // ----- Última avaliação -----
  linhaMedidas: {
    flexDirection: 'row',
    marginBottom: espacamento.md,
  },
  medida: {
    flex: 1,
  },
  rotuloMedida: {
    fontSize: 11.5,
    color: cores.textoSecundario,
  },
  valorMedida: {
    fontSize: 17,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginTop: 2,
  },
  variacao: {
    fontSize: 12.5,
    lineHeight: 18,
    color: cores.textoSecundario,
    marginBottom: espacamento.md,
  },
  variacaoForte: {
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  botaoCartao: {
    marginTop: espacamento.md,
  },

  // ----- Dica do dia -----
  cartaoDica: {
    backgroundColor: cores.verdeClaro,
  },
  linhaDica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
  },
  circuloDica: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotuloDica: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: cores.verdeLink,
  },
  textoDica: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: cores.verdeEscuro,
    marginTop: espacamento.md,
  },

  // ----- Próxima consulta -----
  linhaConsulta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circuloConsulta: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dadosConsulta: {
    flex: 1,
    paddingRight: 8,
  },
  dataConsulta: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  detalheConsulta: {
    fontSize: 12.5,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  caixaVazia: {
    alignItems: 'center',
    paddingVertical: espacamento.sm,
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

  // ----- Atalhos -----
  linhaAtalhos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  atalho: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  circuloAtalho: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: cores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rotuloAtalho: {
    alignSelf: 'stretch',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: cores.verdeEscuro,
    textAlign: 'center',
  },
});
