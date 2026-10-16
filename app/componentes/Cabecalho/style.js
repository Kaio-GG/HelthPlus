import { StyleSheet } from "react-native";
import { cores, espacamento, SOBREPOSICAO_CABECALHO } from "../../tema";

export const estilos = StyleSheet.create({
  container: {
    backgroundColor: cores.verdeCabecalho,
    paddingHorizontal: espacamento.xl,
    paddingBottom: SOBREPOSICAO_CABECALHO + 18,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  linhaSuperior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 32,
    marginBottom: espacamento.xs,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
    color: cores.verdeEscuro,
  },
  subtitulo: {
    marginTop: 2,
    fontSize: 13,
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
