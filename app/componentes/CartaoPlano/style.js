import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  cartao: {
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titulo: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginRight: 8,
  },
  detalhe: {
    fontSize: 12.5,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  linhaAcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  textoAcao: {
    marginLeft: 4,
    fontSize: 12.5,
    fontWeight: '700',
    color: cores.verdeLink,
  },
});
