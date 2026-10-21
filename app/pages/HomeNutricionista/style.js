import { StyleSheet } from "react-native";
import { cores, espacamento, raios } from "../../tema";

// Cores tiradas diretamente do SVG (Tela_Inicial). Se preferir, mova para o tema.
const paleta = {
  verdeBanner: "#59AC77",
  verdeBotao: "#2E8B57",
  verdePontoAtivo: "#31824E",
  verdePontoInativo: "#8EC4A2",
  verdeSeta: "#8EC4A2",
  creme: "#FFEBD8",
  cremeCartao: "#FFF6F6",
  cinzaAvatar: "#D9D9D9",
  textoEscuro: "#0F2A1B",
};

// Largura do cartão de consulta (usada também no index.js para as setas « »)
export const larguraCartaoConsulta = 124;

export const estilos = StyleSheet.create({
  // ----- Cabeçalho (lado direito: emblema com anel amarelo como no design) -----
  emblema: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: "#FFF59D",
    alignItems: "center",
    justifyContent: "center",
  },

  // ----- Banner -----
  bannerContainer: {
    marginTop: 28,
    marginBottom: espacamento.lg,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: paleta.verdeBanner,
    borderRadius: 30,
    paddingVertical: 24,
    paddingLeft: 24,
    paddingRight: 24,
    minHeight: 158,
    overflow: "hidden",
  },
  // Círculos decorativos no lugar da foto do design
  decoracaoGrande: {
    position: "absolute",
    right: -50,
    top: -40,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  decoracaoPequena: {
    position: "absolute",
    right: 70,
    bottom: -60,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  textosBanner: {
    flex: 1,
  },
  tituloBanner: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: paleta.textoEscuro,
    marginBottom: 6,
  },
  textoBanner: {
    fontSize: 15,
    lineHeight: 22,
    color: paleta.textoEscuro,
  },
  pontos: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  ponto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: paleta.verdePontoInativo,
    marginHorizontal: 4.5,
  },
  pontoAtivo: {
    backgroundColor: paleta.verdePontoAtivo,
  },

  // ----- Cartões -----
  tituloCartao: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: cores.verdeEscuro,
    marginBottom: 16,
  },

  // ----- Atalhos -----
  linhaAtalhos: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  atalho: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  circuloAtalho: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: cores.verdeClaro,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  // Rótulo solto sob o círculo: sem caixa, o texto ganha a largura toda da
  // coluna e cabe em duas linhas sem partir palavra no meio.
  rotuloAtalho: {
    alignSelf: "stretch",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
    color: cores.verdeEscuro,
    textAlign: "center",
  },

  // ----- Próximas consultas -----
  seletorDia: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  setaDia: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: cores.verdeClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  textoDia: {
    minWidth: 150,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: cores.verdeEscuro,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    borderRadius: raios.pilula,
    paddingVertical: 6,
    marginHorizontal: 10,
  },
  // Estado vazio: ícone claro + texto, para a área não ficar só um
  // espaço morto quando o dia não tem consulta.
  caixaVazia: {
    alignItems: "center",
    paddingVertical: espacamento.lg,
  },
  circuloVazio: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: cores.verdeSuave,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espacamento.md,
  },
  vazio: {
    textAlign: "center",
    fontSize: 14,
    color: cores.textoSecundario,
  },
  vazioAcao: {
    marginTop: espacamento.sm,
    fontSize: 14,
    fontWeight: "700",
    color: cores.verdeLink,
  },
  // Linha com as setas « » nas laterais da lista de consultas
  linhaConsultas: {
    flexDirection: "row",
    alignItems: "center",
  },
  listaConsultas: {
    flex: 1,
  },
  setaLista: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: paleta.verdeSeta,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  // Cartão: topo branco com avatar + base verde com os dados
  cartaoConsulta: {
    width: larguraCartaoConsulta,
    backgroundColor: paleta.verdeBanner,
    borderRadius: 18,
    marginRight: 10,
    overflow: "hidden",
  },
  topoConsulta: {
    height: 70,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarConsulta: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: paleta.cinzaAvatar,
    alignItems: "center",
    justifyContent: "center",
  },
  baseConsulta: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  nomeConsulta: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  horaConsulta: {
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 4,
  },
  acessoConsulta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
  },

  // ----- Meu plano -----
  linhaPlano: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  textoPlano: {
    fontSize: 14,
    color: cores.textoSecundario,
    marginTop: -6,
    marginBottom: 18,
  },
  linhaProgresso: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rotuloProgresso: {
    fontSize: 14,
    fontWeight: "700",
    color: cores.verdeEscuro,
  },
  valorProgresso: {
    fontSize: 14,
    fontWeight: "800",
    color: cores.verdeEscuro,
  },
  semPlano: {
    fontSize: 14,
    lineHeight: 20,
    color: cores.textoSecundario,
    marginTop: espacamento.xs,
  },
  // Botão largo em pílula, verde #2E8B57 como no design
  botaoPlano: {
    marginTop: 20,
    backgroundColor: paleta.verdeBotao,
    borderRadius: 24,
    minHeight: 46,
  },
});
