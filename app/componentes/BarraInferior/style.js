import { StyleSheet } from 'react-native';
import { cores, espacamento } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: cores.fundo,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
    paddingTop: espacamento.sm,
  },
  item: {
    alignItems: 'center',
    minWidth: 72,
  },
  pilula: {
    width: 64,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pilulaAtiva: {
    backgroundColor: cores.verdeClaro,
  },
  rotulo: {
    marginTop: 2,
    fontSize: 12,
    color: cores.textoSecundario,
  },
  rotuloAtivo: {
    color: cores.verdeEscuro,
    fontWeight: '700',
  },
});
