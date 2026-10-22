import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  aviso: {
    marginBottom: 12,
  },

  // Fica no cabeçalho verde, por isso o texto é branco.
  marcarTudo: {
    fontSize: 13,
    fontWeight: '800',
    color: cores.branco,
  },

  // ----- Lista vazia -----
  cartaoVazio: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  circuloVazio: {
    width: 56,
    height: 56,
    borderRadius: raios.pilula,
    backgroundColor: cores.verdeSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tituloVazio: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  textoVazio: {
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },

  // ----- Um item da lista -----
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  // O que ainda não foi lido fica destacado; o resto some no fundo.
  itemNaoLido: {
    borderColor: cores.bordaVerde,
    backgroundColor: cores.verdeSuave,
  },
  circuloIcone: {
    width: 34,
    height: 34,
    borderRadius: raios.pilula,
    backgroundColor: cores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloLido: {
    backgroundColor: cores.campoSomenteLeitura,
  },
  textos: {
    flex: 1,
    marginLeft: 12,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titulo: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: cores.textoPrincipal,
  },
  tituloNaoLido: {
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  pontoNaoLido: {
    width: 8,
    height: 8,
    borderRadius: raios.pilula,
    backgroundColor: cores.verdeBotao,
    marginLeft: 8,
  },
  mensagem: {
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoSecundario,
    marginTop: 3,
  },
  quando: {
    fontSize: 11,
    color: cores.textoDesabilitado,
    marginTop: 6,
  },
});
