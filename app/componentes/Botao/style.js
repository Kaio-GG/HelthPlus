import { StyleSheet } from 'react-native';
import { cores, raios, tipografia, ALVO_DE_TOQUE } from '../../tema';

export const estilos = StyleSheet.create({
  base: {
    // Um pouco acima do alvo mínimo: é a ação principal da tela.
    minHeight: ALVO_DE_TOQUE + 8,
    borderRadius: raios.medio,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  pequeno: {
    minHeight: ALVO_DE_TOQUE,
    paddingHorizontal: 14,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Sem o flexShrink, um rótulo comprido estourava a largura do botão e a
    // sobra era simplesmente cortada — "Ver plano e pagamentos" virava
    // "Ver plano e" na tela inicial.
    flexShrink: 1,
  },
  icone: {
    marginRight: 8,
  },
  texto: {
    ...tipografia.corpoForte,
    fontSize: 16,
    flexShrink: 1,
    textAlign: 'center',
  },
  textoPequeno: {
    ...tipografia.apoioForte,
  },
  // Variantes
  primario: {
    backgroundColor: cores.verdeBotao,
    borderColor: cores.verdeBotao,
  },
  contorno: {
    backgroundColor: cores.branco,
    borderColor: cores.verdeBotao,
  },
  suave: {
    backgroundColor: cores.verdeClaro,
    borderColor: cores.verdeClaro,
  },
  perigo: {
    backgroundColor: cores.branco,
    borderColor: cores.erro,
  },
  desabilitado: {
    opacity: 0.45,
  },
});
