import { StyleSheet } from "react-native";
import { cores, espacamento, SOBREPOSICAO_CABECALHO } from "../../tema";

export const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  // O corpo sobe sobre a curva do cabeçalho para os cartões "flutuarem".
  corpo: {
    flex: 1,
    marginTop: -SOBREPOSICAO_CABECALHO,
  },
  rolagem: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: espacamento.lg,
  },
  semRolagem: {
    flex: 1,
  },

  // ----- Modo cabecalhoRolavel: fundo verde + folha creme que rola junto -----
  containerVerde: {
    backgroundColor: cores.verdeCabecalho,
  },
  corpoSemSobreposicao: {
    marginTop: 0,
  },
  rolagemVerde: {
    backgroundColor: cores.verdeCabecalho,
  },
  conteudoFolha: {
    flexGrow: 1,
  },
  // A folha sobe sobre o cabeçalho; atrás dos cantos arredondados fica o verde
  folha: {
    flexGrow: 1,
    backgroundColor: cores.fundo,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -SOBREPOSICAO_CABECALHO,
    paddingHorizontal: espacamento.lg,
    paddingTop: espacamento.lg,
  },
  flutuante: {
    position: "absolute",
    right: 20,
  },
  rodape: {
    paddingHorizontal: espacamento.lg,
    paddingTop: espacamento.md,
    backgroundColor: cores.fundo,
  },
});
