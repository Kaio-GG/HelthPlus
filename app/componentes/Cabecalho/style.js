import { StyleSheet } from "react-native";
import {
  cores,
  espacamento,
  raios,
  tipografia,
  ALVO_DE_TOQUE,
  SOBREPOSICAO_CABECALHO,
} from "../../tema";

export const estilos = StyleSheet.create({
  container: {
    backgroundColor: cores.verdeCabecalho,
    paddingHorizontal: espacamento.xl,
    paddingBottom: SOBREPOSICAO_CABECALHO + 18,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  // Faixa verde mais alta, para telas em que o conteúdo foi centralizado e o
  // título ficaria sozinho no topo.
  containerAlto: {
    paddingBottom: SOBREPOSICAO_CABECALHO + espacamento.xxl + espacamento.md,
  },
  linhaSuperior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: ALVO_DE_TOQUE,
    marginBottom: espacamento.sm,
    // O botão de voltar é redondo e encosta na margem; o -10 alinha o
    // DESENHO da seta com o título, e não a caixa de toque dele.
    marginLeft: -10,
    marginRight: -10,
  },
  // Alvo de toque cheio, com um fundo claro que diz "isto é um botão".
  botaoVoltar: {
    width: ALVO_DE_TOQUE,
    height: ALVO_DE_TOQUE,
    borderRadius: raios.pilula,
    backgroundColor: cores.verdeClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    ...tipografia.titulo,
    color: cores.verdeEscuro,
  },
  subtitulo: {
    ...tipografia.apoio,
    marginTop: 2,
    color: cores.verdeEscuro,
  },
  // Versão com fontes maiores (usada na Home do nutricionista)
  tituloGrande: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtituloGrande: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 23,
  },
  filhos: {
    marginTop: espacamento.md,
  },
});
