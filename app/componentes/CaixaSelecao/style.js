import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  caixa: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  caixaMarcada: {
    backgroundColor: cores.verdeBotao,
    borderColor: cores.verdeBotao,
  },
  caixaComErro: {
    borderColor: cores.erro,
  },
  texto: {
    flex: 1,
  },
  rotulo: {
    fontSize: 13.5,
    lineHeight: 20,
    color: cores.textoPrincipal,
  },
  erro: {
    marginTop: 4,
    marginLeft: 32,
    fontSize: 12,
    color: cores.erro,
  },
});
