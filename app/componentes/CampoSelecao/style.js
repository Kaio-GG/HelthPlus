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
    justifyContent: 'space-between',
    backgroundColor: cores.branco,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    borderRadius: raios.medio,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  caixaComErro: {
    borderColor: cores.erro,
  },
  valor: {
    flex: 1,
    fontSize: 15,
    color: cores.textoPrincipal,
  },
  placeholder: {
    color: cores.textoDesabilitado,
  },
  erro: {
    marginTop: 4,
    fontSize: 12,
    color: cores.erro,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  painel: {
    backgroundColor: cores.branco,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '60%',
  },
  alca: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: cores.linha,
    marginBottom: 12,
  },
  tituloPainel: {
    fontSize: 17,
    fontWeight: '700',
    color: cores.verdeEscuro,
    marginBottom: 8,
  },
  lista: {
    flexGrow: 0,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  textoOpcao: {
    fontSize: 15,
    color: cores.textoPrincipal,
  },
  textoOpcaoAtiva: {
    fontWeight: '700',
    color: cores.verdeBotao,
  },
});
