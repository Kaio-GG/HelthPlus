import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    borderRadius: raios.medio,
    paddingHorizontal: 14,
    minHeight: 46,
    marginBottom: 12,
  },
  entrada: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: cores.textoPrincipal,
    paddingVertical: 8,
  },
});
