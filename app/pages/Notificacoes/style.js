import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  aviso: {
    marginBottom: espacamento.md,
  },
  // Fica no cabeçalho verde, por isso o texto é branco.
  marcarTudo: {
    ...tipografia.apoioForte,
    fontWeight: '800',
    color: cores.branco,
    paddingVertical: espacamento.sm,
    paddingHorizontal: espacamento.xs,
  },

  // ----- Lista vazia -----
  cartaoVazio: {
    alignItems: 'center',
    paddingVertical: espacamento.xxl,
  },
  circuloVazio: {
    width: 64,
    height: 64,
    borderRadius: raios.pilula,
    backgroundColor: cores.verdeSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamento.md,
  },
  tituloVazio: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
  },
  textoVazio: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: espacamento.md,
  },

  // ----- Um item da lista -----
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: espacamento.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  // O que ainda não foi lido fica destacado; o resto some no fundo.
  itemNaoLido: {
    borderColor: cores.bordaVerde,
    backgroundColor: cores.verdeSuave,
  },
  circuloIcone: {
    width: 40,
    height: 40,
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
    marginLeft: espacamento.md,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titulo: {
    ...tipografia.corpo,
    flex: 1,
    fontWeight: '600',
    color: cores.textoPrincipal,
  },
  tituloNaoLido: {
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  pontoNaoLido: {
    width: 9,
    height: 9,
    borderRadius: raios.pilula,
    backgroundColor: cores.verdeBotao,
    marginLeft: espacamento.sm,
  },
  mensagem: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: 3,
  },
  quando: {
    ...tipografia.miudo,
    color: cores.textoDesabilitado,
    marginTop: 6,
  },
});
