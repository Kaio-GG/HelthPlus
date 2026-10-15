import { StyleSheet } from 'react-native';
import { cores, raios, sombras } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: cores.branco,
    borderRadius: raios.grande,
    marginBottom: 16,
    ...sombras.cartao,
  },
  aba: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 14,
  },
  texto: {
    fontSize: 13.5,
    fontWeight: '600',
    color: cores.textoSecundario,
    paddingBottom: 10,
  },
  textoAtivo: {
    color: cores.verdeEscuro,
    fontWeight: '800',
  },
  sublinhado: {
    height: 3,
    alignSelf: 'stretch',
    marginHorizontal: 10,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  sublinhadoAtivo: {
    backgroundColor: cores.verdeBotao,
  },
});
