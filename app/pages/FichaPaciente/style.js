import { StyleSheet } from 'react-native';
import { cores, espacamento } from '../../tema';

export const estilos = StyleSheet.create({
  vazio: {
    textAlign: 'center',
    fontSize: 14,
    color: cores.textoSecundario,
    marginVertical: 20,
  },
  tituloCartao: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 12,
  },
  tituloLista: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 8,
  },

  // ----- Resumo -----
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  colunaDado: {
    width: '50%',
    marginBottom: 12,
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
  linhaTituloGrafico: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pesoAtual: {
    fontSize: 18,
    fontWeight: '800',
    color: cores.verdeBotao,
    marginBottom: 12,
  },
  linhaBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoMetade: {
    width: '48.5%',
  },
  botaoTopo: {
    marginBottom: espacamento.lg,
  },

  // ----- Avaliações -----
  cartaoAvaliacao: {
    padding: 14,
    marginBottom: 12,
  },
  dataAvaliacao: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  idadeAvaliacao: {
    fontSize: 12.5,
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
  valorMedida: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },

  // ----- Registros -----
  seletorDia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  textoDia: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  linhaAgua: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tituloAgua: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  valorAgua: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeEscuro,
    marginBottom: 10,
  },
  percentualAgua: {
    marginTop: 6,
    fontSize: 12,
    color: cores.textoSecundario,
  },
  linhaRefeicao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  marcadorRefeicao: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  marcadorRegistrada: {
    backgroundColor: cores.verdeBotao,
    borderColor: cores.verdeBotao,
  },
  dadosRefeicao: {
    flex: 1,
  },
  nomeRefeicao: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  horarioRefeicao: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  descricaoRefeicao: {
    fontSize: 13,
    color: cores.textoPrincipal,
    marginTop: 2,
  },
  naoRegistrado: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.alertaTexto,
    marginTop: 2,
  },
  linkLembrete: {
    fontSize: 12.5,
    fontWeight: '700',
    color: cores.verdeLink,
  },
  rodapeSomenteLeitura: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  textoSomenteLeitura: {
    marginLeft: 6,
    fontSize: 12,
    color: cores.textoSecundario,
  },
});
