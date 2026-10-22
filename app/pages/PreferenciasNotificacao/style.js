import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  carregando: {
    marginTop: 40,
  },
  aviso: {
    marginBottom: 12,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  linhaComTopo: {
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.textoPrincipal,
  },
  descricao: {
    fontSize: 12,
    lineHeight: 17,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  nota: {
    fontSize: 12,
    lineHeight: 17,
    color: cores.textoSecundario,
    paddingHorizontal: 4,
  },
});
