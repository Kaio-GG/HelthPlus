import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.verdeEscuro,
    marginBottom: 6,
  },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    borderRadius: raios.medio,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  caixaMultilinha: {
    alignItems: 'flex-start',
    minHeight: 84,
    paddingVertical: 8,
  },
  caixaSomenteLeitura: {
    backgroundColor: cores.campoSomenteLeitura,
  },
  caixaComErro: {
    borderColor: cores.erro,
  },
  entrada: {
    flex: 1,
    fontSize: 15,
    color: cores.textoPrincipal,
    paddingVertical: 10,
  },
  entradaMultilinha: {
    minHeight: 64,
  },
  erro: {
    marginTop: 4,
    fontSize: 12,
    color: cores.erro,
  },
});
