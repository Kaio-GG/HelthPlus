import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  tituloCartao: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
  },
  subtituloCartao: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: 4,
    marginBottom: espacamento.lg,
  },

  // ----- Dica do dia -----
  cartaoDica: {
    backgroundColor: cores.verdeClaro,
  },
  linhaDica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
  },
  circuloDica: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotuloDica: {
    ...tipografia.miudo,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: cores.verdeLink,
  },
  textoDica: {
    ...tipografia.corpo,
    fontWeight: '600',
    color: cores.verdeEscuro,
    marginTop: espacamento.md,
  },
  notaDica: {
    ...tipografia.miudo,
    color: cores.verdeLink,
    marginTop: espacamento.sm,
  },

  // ----- O prato -----
  linhaBotoesGrupo: {
    flexDirection: 'row',
    gap: espacamento.sm,
    marginTop: espacamento.lg,
  },
  botaoGrupo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: raios.pilula,
    borderWidth: 1,
    borderColor: cores.bordaVerde,
    paddingVertical: 8,
  },
  botaoGrupoAtivo: {
    backgroundColor: cores.verdeClaro,
    borderColor: cores.verdeBotao,
  },
  bolinhaGrupo: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textoGrupo: {
    ...tipografia.apoioForte,
    color: cores.textoSecundario,
  },
  textoGrupoAtivo: {
    color: cores.verdeEscuro,
  },
  detalheGrupo: {
    marginTop: espacamento.lg,
  },
  nomeGrupo: {
    ...tipografia.corpoForte,
    color: cores.verdeEscuro,
  },
  resumoGrupo: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: 2,
    marginBottom: espacamento.md,
  },
  linhaExemplo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamento.sm,
    marginBottom: 6,
  },
  textoExemplo: {
    ...tipografia.apoio,
    color: cores.textoPrincipal,
    flex: 1,
  },
  porqueGrupo: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    backgroundColor: cores.verdeSuave,
    borderRadius: raios.pequeno,
    padding: espacamento.md,
    marginTop: espacamento.md,
  },

  // ----- Calculadora de água -----
  linhaCalculadora: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamento.md,
  },
  campoPeso: {
    flex: 1,
  },
  // Não é um Switch: é um botão que diz em palavras qual faixa está
  // valendo. Com Switch, "ligado" não dizia se era criança ou adulto.
  chaveIdade: {
    flex: 1.1,
    borderRadius: raios.medio,
    borderWidth: 1,
    borderColor: cores.bordaVerde,
    paddingHorizontal: espacamento.md,
    paddingVertical: 11,
    marginTop: 22,
  },
  chaveIdadeAtiva: {
    backgroundColor: cores.verdeClaro,
    borderColor: cores.verdeBotao,
  },
  textoChave: {
    ...tipografia.apoioForte,
    color: cores.verdeEscuro,
  },
  textoChaveAtivo: {
    color: cores.verdeLink,
  },
  dicaChave: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: 1,
  },
  resultadoAgua: {
    backgroundColor: cores.verdeSuave,
    borderRadius: raios.medio,
    padding: espacamento.lg,
    marginTop: espacamento.sm,
  },
  valorAgua: {
    ...tipografia.destaque,
    color: cores.verdeEscuro,
  },
  detalheAgua: {
    ...tipografia.apoioForte,
    color: cores.verdeLink,
  },
  notaAgua: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },
  semResultado: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },

  // Usado pelo aviso do fim do cartão de sinais de alerta. O nome vem do
  // checklist "Como foi o seu dia", que saiu da tela.
  avisoChecklist: {
    marginTop: espacamento.lg,
    marginBottom: 0,
  },

  // ----- Perguntas frequentes -----
  blocoPergunta: {
    borderTopWidth: 1,
    borderTopColor: cores.linha,
    paddingVertical: espacamento.md,
  },
  linhaPergunta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacamento.md,
  },
  textoPergunta: {
    ...tipografia.corpoForte,
    color: cores.verdeEscuro,
    flex: 1,
  },
  textoResposta: {
    ...tipografia.apoio,
    color: cores.textoPrincipal,
    marginTop: espacamento.sm,
  },

  // ----- Sinais de alerta -----
  linhaSinal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamento.sm,
    marginBottom: espacamento.sm,
  },
  textoSinal: {
    ...tipografia.apoio,
    color: cores.textoPrincipal,
    flex: 1,
  },

  fonte: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacamento.sm,
  },
});
