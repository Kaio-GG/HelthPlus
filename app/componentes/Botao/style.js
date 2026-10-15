import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: raios.medio,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  pequeno: {
    minHeight: 38,
    paddingHorizontal: 12,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icone: {
    marginRight: 8,
  },
  texto: {
    fontSize: 16,
    fontWeight: '700',
  },
  textoPequeno: {
    fontSize: 14,
  },
  // Variantes
  primario: {
    backgroundColor: cores.verdeBotao,
    borderColor: cores.verdeBotao,
  },
  contorno: {
    backgroundColor: cores.branco,
    borderColor: cores.verdeBotao,
  },
  suave: {
    backgroundColor: cores.verdeClaro,
    borderColor: cores.verdeClaro,
  },
  perigo: {
    backgroundColor: cores.branco,
    borderColor: cores.erro,
  },
  desabilitado: {
    opacity: 0.45,
  },
});
