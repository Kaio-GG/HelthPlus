import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tituloMes: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  linha: {
    flexDirection: 'row',
  },
  letraDia: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: cores.textoSecundario,
    marginBottom: 6,
  },
  celula: {
    flex: 1,
    alignItems: 'center',
    height: 42,
  },
  circulo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloHoje: {
    borderWidth: 1.5,
    borderColor: cores.verdeBotao,
  },
  circuloSelecionado: {
    backgroundColor: cores.verdeBotao,
  },
  numeroDia: {
    fontSize: 13,
    color: cores.textoPrincipal,
  },
  numeroSelecionado: {
    color: cores.branco,
    fontWeight: '800',
  },
  ponto: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  pontoAtivo: {
    backgroundColor: cores.verdeCabecalho,
  },
});
