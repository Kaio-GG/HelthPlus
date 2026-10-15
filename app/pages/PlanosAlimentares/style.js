import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  linhaFiltros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vazio: {
    textAlign: 'center',
    fontSize: 14,
    color: cores.textoSecundario,
    marginVertical: 24,
  },
  linhaModelos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.verdeClaro,
    borderRadius: raios.medio,
    padding: 14,
    marginBottom: 16,
  },
  textosModelos: {
    flex: 1,
  },
  tituloModelos: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  descricaoModelos: {
    fontSize: 12.5,
    color: cores.verdeEscuro,
    marginTop: 2,
  },
});
