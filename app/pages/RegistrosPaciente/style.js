import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  tituloCartao: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 12,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: {
    fontSize: 12.5,
    fontWeight: '700',
    color: cores.verdeLink,
    marginTop: 8,
  },

  // ----- Água -----
  linhaAgua: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tituloAgua: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  valorAgua: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeEscuro,
    marginBottom: 10,
  },
  percentualAgua: {
    marginTop: 6,
    fontSize: 12,
    color: cores.textoSecundario,
  },
  linhaBotoesAgua: {
    flexDirection: 'row',
    marginTop: 14,
  },
  botaoAgua: {
    flex: 1,
    marginHorizontal: 4,
  },

  // ----- Refeições -----
  linhaRefeicao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  marcadorRefeicao: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  marcadorRegistrada: {
    backgroundColor: cores.verdeBotao,
    borderColor: cores.verdeBotao,
  },
  dadosRefeicao: {
    flex: 1,
  },
  nomeRefeicao: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  horarioRefeicao: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  descricaoRefeicao: {
    fontSize: 13,
    color: cores.textoPrincipal,
    marginTop: 2,
  },
  previstoRefeicao: {
    fontSize: 12.5,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  formulario: {
    marginTop: 8,
  },
  linhaBotoes: {
    flexDirection: 'row',
    marginTop: 10,
  },
  botaoMetade: {
    flex: 1,
    marginHorizontal: 4,
  },
});
