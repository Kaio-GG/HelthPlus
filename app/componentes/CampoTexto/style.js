import { StyleSheet } from 'react-native';
import { cores, raios, tipografia, ALVO_DE_TOQUE } from '../../tema';

export const estilos = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  rotulo: {
    ...tipografia.apoio,
    lineHeight: 17,
    fontWeight: '600',
    color: cores.verdeEscuro,
    marginBottom: 6,
  },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderWidth: 1.5,
    borderColor: cores.bordaVerde,
    borderRadius: raios.medio,
    paddingHorizontal: 14,
    minHeight: ALVO_DE_TOQUE + 4,
  },
  caixaMultilinha: {
    alignItems: 'flex-start',
    minHeight: 84,
    paddingVertical: 8,
  },
  caixaSomenteLeitura: {
    backgroundColor: cores.campoSomenteLeitura,
  },
  caixaComErro: {
    borderColor: cores.erro,
  },
  entrada: {
    ...tipografia.corpo,
    flex: 1,
    color: cores.textoPrincipal,
    paddingVertical: 10,
  },
  entradaMultilinha: {
    minHeight: 64,
  },
  // Linha de baixo do campo: mensagem de erro de um lado, contador do outro.
  rodape: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  // Segura o canto esquerdo quando só há contador, para ele não escorregar
  // para o meio da linha.
  espacador: {
    flex: 1,
  },
  erro: {
    flexShrink: 1,
    marginTop: 4,
    fontSize: 12,
    color: cores.erro,
  },
  contador: {
    marginTop: 4,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    color: cores.textoSecundario,
  },
  contadorValido: {
    fontWeight: '700',
    color: cores.verdeBotao,
  },
});
