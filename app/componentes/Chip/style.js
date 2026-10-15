import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: raios.pilula,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    backgroundColor: cores.branco,
    marginRight: 8,
    marginBottom: 8,
  },
  ativo: {
    backgroundColor: cores.verdeClaro,
    borderColor: cores.verdeBotao,
  },
  texto: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoSecundario,
  },
  textoAtivo: {
    color: cores.verdeEscuro,
  },
  textoComCheck: {
    marginLeft: 4,
  },
});
