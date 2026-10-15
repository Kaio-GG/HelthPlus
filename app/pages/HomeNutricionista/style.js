import { StyleSheet } from 'react-native';
import { cores, espacamento, raios } from '../../tema';

export const estilos = StyleSheet.create({
  // ----- Banner -----
  bannerContainer: {
    marginBottom: espacamento.lg,
  },
  banner: {
    backgroundColor: cores.verdeCabecalho,
    borderRadius: raios.grande,
    padding: espacamento.xl,
    minHeight: 130,
    justifyContent: 'center',
  },
  tituloBanner: {
    fontSize: 20,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 6,
  },
  textoBanner: {
    fontSize: 14,
    lineHeight: 20,
    color: cores.verdeEscuro,
    maxWidth: '85%',
  },
  pontos: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  ponto: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: cores.bordaVerde,
    marginHorizontal: 3,
  },
  pontoAtivo: {
    backgroundColor: cores.verdeBotao,
  },

  // ----- Cartões -----
  tituloCartao: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 12,
  },

  // ----- Atalhos -----
  linhaAtalhos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  atalho: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 3,
    paddingVertical: 10,
    paddingHorizontal: 2,
    backgroundColor: cores.fundo,
    borderRadius: raios.medio,
  },
  circuloAtalho: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: cores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  rotuloAtalho: {
    fontSize: 11,
    fontWeight: '700',
    color: cores.verdeEscuro,
    textAlign: 'center',
  },

  // ----- Próximas consultas -----
  seletorDia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  setaDia: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: cores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoDia: {
    minWidth: 150,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: cores.verdeEscuro,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    borderRadius: raios.pilula,
    paddingVertical: 6,
    marginHorizontal: 10,
  },
  vazio: {
    textAlign: 'center',
    fontSize: 13,
    color: cores.textoSecundario,
    paddingVertical: 12,
  },
  cartaoConsulta: {
    width: 130,
    backgroundColor: cores.verdeCabecalho,
    borderRadius: raios.medio,
    padding: 12,
    marginRight: 10,
  },
  avatarConsulta: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  nomeConsulta: {
    fontSize: 13,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  horaConsulta: {
    fontSize: 12,
    color: cores.verdeEscuro,
    marginTop: 2,
  },
  acessoConsulta: {
    fontSize: 11,
    color: cores.verdeEscuro,
    marginTop: 2,
  },

  // ----- Meu plano -----
  linhaPlano: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textoPlano: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginTop: -6,
    marginBottom: 14,
  },
  linhaProgresso: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rotuloProgresso: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeEscuro,
  },
  valorProgresso: {
    fontSize: 13,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  botaoPlano: {
    marginTop: 16,
  },
});
