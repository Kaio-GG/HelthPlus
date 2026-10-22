import { StyleSheet } from 'react-native';
import { cores, espacamento, raios } from '../../tema';

export const estilos = StyleSheet.create({
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tituloCartao: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  acaoEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: raios.pilula,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    backgroundColor: cores.verdeSuave,
  },
  acaoSalvando: {
    opacity: 0.6,
  },
  // Em modo de edição o botão fica cheio: "Salvar" é a ação principal.
  acaoSalvar: {
    backgroundColor: cores.verdeBotao,
    borderColor: cores.verdeBotao,
  },
  textoEditar: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeLink,
  },
  textoSalvar: {
    color: cores.branco,
  },
  // Mensagem de quem ainda não assinou nenhum plano.
  semPlano: {
    fontSize: 14,
    lineHeight: 20,
    color: cores.textoSecundario,
    marginTop: espacamento.xs,
    marginBottom: espacamento.sm,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colunaDado: {
    width: '50%',
    marginBottom: 12,
    paddingRight: 8,
  },
  rotuloDado: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginBottom: 2,
  },
  valorDado: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.verdeEscuro,
  },

  // ----- Plano -----
  nomePlano: {
    fontSize: 20,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  detalhePlano: {
    fontSize: 12.5,
    color: cores.textoSecundario,
    marginTop: 2,
    marginBottom: 14,
  },
  linhaProgresso: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  valorProgresso: {
    fontSize: 13,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  botaoPlano: {
    marginTop: 16,
  },
  linkCobrancas: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  textoLink: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeLink,
    marginRight: 2,
  },

  // ----- Conta e segurança -----
  itemConta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  textoItemConta: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14.5,
    fontWeight: '600',
    color: cores.textoPrincipal,
  },
  itemSair: {
    paddingBottom: 4,
  },
  textoSair: {
    color: cores.erro,
    fontWeight: '800',
  },

  // ----- Modal de cobranças -----
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  painelModal: {
    backgroundColor: cores.branco,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '70%',
  },
  alcaModal: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: cores.linha,
    marginBottom: 12,
  },
  tituloModal: {
    fontSize: 17,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 8,
  },
  listaModal: {
    flexGrow: 0,
    marginBottom: 14,
  },
  linhaCobranca: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  referenciaCobranca: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.textoPrincipal,
  },
  dataCobranca: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  ladoCobranca: {
    alignItems: 'flex-end',
  },
  valorCobranca: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 4,
  },
});
