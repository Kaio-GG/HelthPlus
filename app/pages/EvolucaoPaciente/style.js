import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

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
  linhaTitulo: {
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
  rotuloDado: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginBottom: 2,
  },
  valorMedida: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
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
