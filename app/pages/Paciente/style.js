import { StyleSheet } from "react-native";
import { cores } from "../../tema";

export const estilos = StyleSheet.create({
  // Com um link só, alinhado à direita ele fica logo abaixo do campo de
  // senha; "space-between" o jogava para a outra ponta do cartão.
  linhaLinks: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
    marginTop: -2,
  },
  link: {
    fontSize: 14,
    fontWeight: "700",
    color: cores.verdeLink,
  },
  // Os dois avisos do fim do cartão. O "marginBottom: 0" é para o último
  // deles não deixar um vão no pé do cartão.
  aviso: {
    marginTop: 16,
    marginBottom: 0,
  },

  // Botão largo em pílula, verde #2E8B57, igual ao da Home
  botaoPrincipal: {
    marginTop: 4,
    backgroundColor: "#2E8B57",
    borderRadius: 24,
    minHeight: 46,
  },
});
