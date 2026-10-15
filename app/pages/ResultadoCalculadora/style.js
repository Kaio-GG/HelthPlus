import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  titulo: {
    fontSize: 17,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  subtitulo: {
    fontSize: 12.5,
    color: cores.textoSecundario,
    marginBottom: 12,
  },
  vazio: {
    textAlign: 'center',
    color: cores.textoSecundario,
    paddingVertical: 16,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  textos: {
    flex: 1,
    paddingRight: 10,
  },
  nomeIndicador: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  medida: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  motivo: {
    fontSize: 11.5,
    color: cores.alertaTexto,
    marginTop: 2,
  },
  chip: {
    minWidth: 58,
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: raios.pilula,
  },
  textoChip: {
    fontSize: 14,
    fontWeight: '800',
  },
  chipNormal: { backgroundColor: cores.verdeClaro },
  textoChipNormal: { color: cores.verdeEscuro },
  chipForaDaFaixa: { backgroundColor: cores.alertaFundo },
  textoChipForaDaFaixa: { color: cores.alertaTexto },
  chipIndisponivel: { backgroundColor: cores.linha },
  textoChipIndisponivel: { color: cores.textoSecundario },

  legenda: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  itemLegenda: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  bolinha: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },
  bolinhaNormal: { backgroundColor: cores.verdeBotao },
  bolinhaForaDaFaixa: { backgroundColor: '#E0A800' },
  textoLegenda: {
    fontSize: 11.5,
    color: cores.textoSecundario,
  },
  nota: {
    fontSize: 11.5,
    lineHeight: 16,
    color: cores.textoSecundario,
  },
  botaoSalvar: {
    marginBottom: 10,
  },
});
