import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  linhaBotoes: {
    flexDirection: 'row',
  },
  botaoCancelar: {
    flex: 1,
    marginRight: 12,
  },
  botaoAgendar: {
    flex: 2,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.verdeEscuro,
    marginBottom: 6,
  },
  linhaCampos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  campoMetade: {
    width: '48%',
  },
  erro: {
    fontSize: 12,
    color: cores.erro,
    marginBottom: 10,
  },
  itemBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  nomeBusca: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: cores.textoPrincipal,
  },
  pacienteSelecionado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.verdeSuave,
    borderRadius: raios.medio,
    padding: 10,
    marginTop: 6,
    marginBottom: 14,
  },
  nomeSelecionado: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  linhaNotificar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textosNotificar: {
    flex: 1,
    paddingRight: 10,
  },
  tituloNotificar: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.verdeEscuro,
  },
  dicaNotificar: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
});
