import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  // Mostrado quando não há fatia com valor maior que zero.
  vazio: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    textAlign: 'center',
    paddingVertical: espacamento.lg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.lg,
    flexWrap: 'wrap',
  },
  // Fica em cima do SVG, no mesmo quadrado, para o número cair no buraco
  // do anel sem depender de cálculo de altura de texto.
  centro: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valorCentro: {
    ...tipografia.destaque,
    color: cores.verdeEscuro,
  },
  rotuloCentro: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
  legenda: {
    flex: 1,
    minWidth: 150,
    gap: espacamento.xs,
  },
  itemLegenda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
    // Área de toque confortável: o item da legenda abre o balão, e uma
    // linha de texto de 18px é alvo pequeno demais para o dedo.
    paddingVertical: 6,
  },
  bolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textoLegenda: {
    ...tipografia.apoio,
    color: cores.textoPrincipal,
    flex: 1,
  },
  numeroLegenda: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
  },

  // O balão que explica a cor, abaixo do desenho e com a largura inteira
  // do cartão. A barra colorida à esquerda é o que liga o texto à fatia
  // de onde ele veio.
  balao: {
    backgroundColor: cores.campoSomenteLeitura,
    borderRadius: raios.pequeno,
    borderLeftWidth: 4,
    paddingHorizontal: espacamento.lg,
    paddingVertical: espacamento.md,
    marginTop: espacamento.md,
  },
  tituloBalao: {
    ...tipografia.apoioForte,
    color: cores.verdeEscuro,
    marginBottom: 3,
  },
  textoBalao: {
    ...tipografia.apoio,
    lineHeight: 19,
    color: cores.textoPrincipal,
  },
});
