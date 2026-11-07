import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, tipografia, ALVO_DE_TOQUE } from '../../tema';

export const estilos = StyleSheet.create({
  tituloCartao: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
    marginBottom: espacamento.md,
  },
  opcoes: {
    flexDirection: 'row',
    gap: espacamento.sm,
  },
  opcao: {
    flex: 1,
    minHeight: ALVO_DE_TOQUE + 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espacamento.md,
    borderRadius: raios.medio,
    borderWidth: 2,
    borderColor: cores.bordaVerde,
    backgroundColor: cores.branco,
  },
  opcaoAtiva: {
    borderColor: cores.verdeBotao,
    backgroundColor: cores.verdeClaro,
  },
  textoOpcao: {
    fontWeight: '800',
    color: cores.textoPrincipal,
  },
  rotuloOpcao: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.xs,
  },
  textoOpcaoAtiva: {
    color: cores.verdeEscuro,
    fontWeight: '800',
  },
  nota: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.md,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ALVO_DE_TOQUE + 12,
    paddingVertical: espacamento.sm,
    gap: espacamento.md,
  },
  textosLinha: {
    flex: 1,
  },
  tituloLinha: {
    ...tipografia.corpoForte,
    color: cores.textoPrincipal,
  },
  descricaoLinha: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  botao: {
    marginTop: espacamento.md,
  },
});
