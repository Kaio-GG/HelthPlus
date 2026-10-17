import { StyleSheet } from "react-native";

// Medidas extraídas do SVG (frame 393 x 716).
// ATENÇÃO às fontes: no SVG o texto está convertido em curvas, então estes
// nomes são palpites visuais (ABeeZee p/ títulos, Abhaya Libre p/ as opções).
// Confira no Figma o nome real e carregue as fontes no projeto.
const fontes = {
  sans: "ABeeZee-Regular",
  serif: "AbhayaLibre-SemiBold",
};

export const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8C9",
  },

  // Faixa verde: 335px de 716px (~46.8%), cantos inferiores ~51px
  cabecalho: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "46.8%",
    backgroundColor: "#5DB382",
    borderBottomLeftRadius: 51,
    borderBottomRightRadius: 51,
  },

  // Cartão começa em x = 20 no design
  conteudo: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // "Bem-Vindo ao" começa em x = 42 (20 + 22)
  titulo: {
    marginTop: 56,
    marginBottom: 16,
    paddingLeft: 22,
  },

  boasVindas: {
    fontFamily: fontes.sans,
    fontSize: 24,
    lineHeight: 28,
    color: "#000000",
  },

  // "Health Plus" começa em x = 58 (16px a mais que o texto de cima)
  nomeApp: {
    fontFamily: fontes.sans,
    fontSize: 40,
    lineHeight: 48,
    color: "#000000",
    marginLeft: 16,
  },

  // Ocupa o espaço entre o título e o rodapé e centraliza o card nele
  areaCartao: {
    flex: 1,
    justifyContent: "center",
  },

  // Largura 353, raio 24, sombra dy=6 blur=9 opacidade 16%
  cartao: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 7, // + 17 do marginBottom da última opção = 24 (igual ao topo)
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 9,
  },

  pergunta: {
    fontFamily: fontes.sans,
    fontSize: 22,
    lineHeight: 34,
    color: "#000000",
    textAlign: "center",
    marginBottom: 24,
  },

  // 305 x 92, borda 1px, raio 16, espaço de 17px entre as opções
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 100,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#5DB382",
    borderRadius: 16,
    paddingLeft: 10,
    marginBottom: 17,
  },

  // Círculo de 52px (raio 26)
  circuloIcone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#D9F2C7",
    alignItems: "center",
    justifyContent: "center",
  },

  // Texto começa em x = 144 (37px depois do círculo)
  textos: {
    flex: 1,
    marginLeft: 24,
    justifyContent: "center",
  },

  tituloOpcao: {
    fontFamily: fontes.serif,
    fontSize: 18,
    lineHeight: 22,
    color: "#000000",
    marginBottom: 4,
  },

  // maxWidth reproduz as quebras do design:
  // "Organize seus / pacientes e use a / calculadora OMS"
  descricao: {
    fontFamily: fontes.serif,
    fontSize: 15,
    lineHeight: 20,
    color: "#000000",
    maxWidth: 140,
  },

  // Seta 8 x 15 a 22px da borda direita
  seta: {
    marginLeft: 8,
    marginRight: 22,
  },

  // Texto de ~275px de largura: quebra em "...Termos de / Uso e a..."
  rodape: {
    fontFamily: fontes.sans,
    fontSize: 13,
    lineHeight: 18,
    color: "#000000",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
});
