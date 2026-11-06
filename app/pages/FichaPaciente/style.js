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
  // Botão de enviar o e-mail de acesso, no fim do cartão.
  botaoConvite: {
    marginTop: espacamento.md,
  },

  // Apagar paciente: separado dos outros, no fim da aba Resumo.
  botaoApagar: {
    marginTop: espacamento.xl,
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

  // ----- Consultas do paciente (aba Resumo) -----
  linhaConsulta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  circuloConsulta: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dadosConsulta: {
    flex: 1,
    paddingRight: 8,
  },
  dataConsulta: {
    fontSize: 13.5,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  detalheConsulta: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 1,
  },
  subtituloLista: {
    fontSize: 12.5,
    color: cores.textoSecundario,
    marginTop: 12,
  },
  avisoAcesso: {
    marginTop: espacamento.md,
    marginBottom: 0,
  },
  dicaGrafico: {
    fontSize: 11.5,
    lineHeight: 16,
    color: cores.textoSecundario,
    marginTop: 10,
  },

  // ----- Cartão de avaliação: a linha que diz que ele abre -----
  linhaVerDetalhe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 2,
  },
  verDetalhe: {
    fontSize: 12.5,
    fontWeight: '700',
    color: cores.verdeLink,
  },

  // ----- Aba Evolução: "do começo até agora" -----
  //
  // Uma linha por indicador, empilhadas. Eram três blocos lado a lado, e
  // no celular cada um ficava com uns 90 px: "+2,73 kg/m²" quebrava no
  // meio. Em linha, cada um tem a largura inteira do cartão.
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
  // Rótulo à esquerda, número à direita, na mesma linha de base.
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
    // Encolhe em vez de quebrar quando o número é comprido ("+12,1 cm").
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
});
