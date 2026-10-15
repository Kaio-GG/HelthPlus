import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  linhaFiltros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vazio: {
    textAlign: 'center',
    fontSize: 14,
    color: cores.textoSecundario,
    marginTop: 24,
  },
  itemPaciente: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  dadosPaciente: {
    flex: 1,
    marginLeft: 12,
  },
  nomePaciente: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  detalhePaciente: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  ladoDireito: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 40,
  },
});
