import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // A bolinha fica meio para fora do sino, como de costume.
  emblema: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: raios.pilula,
    backgroundColor: cores.erro,
    borderWidth: 2,
    borderColor: cores.verdeCabecalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: {
    fontSize: 10,
    fontWeight: '800',
    color: cores.branco,
  },
});
