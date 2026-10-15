import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: cores.verdeSuave,
    borderRadius: raios.medio,
    padding: 4,
    marginBottom: 16,
  },
  opcao: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: raios.pequeno,
  },
  opcaoAtiva: {
    backgroundColor: cores.branco,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  texto: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.textoSecundario,
  },
  textoAtivo: {
    color: cores.verdeEscuro,
    fontWeight: '800',
  },
});
