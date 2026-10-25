import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  tituloCartao: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 12,
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
  aviso: {
    marginTop: 4,
    marginBottom: 0,
  },
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
  },
});
