import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  segmento: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  segmentoPreenchido: {
    backgroundColor: cores.branco,
  },
});
