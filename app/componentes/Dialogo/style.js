import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, sombras, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(31, 42, 36, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacamento.xl,
  },
  cartao: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: cores.branco,
    borderRadius: raios.cartao,
    padding: espacamento.xl,
    alignItems: 'center',
    ...sombras.cartao,
  },
  circulo: {
    width: 56,
    height: 56,
    borderRadius: raios.pilula,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamento.md,
  },
  circulo_sucesso: { backgroundColor: cores.verdeClaro },
  circulo_info: { backgroundColor: cores.infoFundo },
  circulo_alerta: { backgroundColor: cores.alertaFundo },
  circulo_erro: { backgroundColor: cores.erroFundo },

  titulo: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
    textAlign: 'center',
  },
  mensagem: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacamento.sm,
  },
  botoes: {
    alignSelf: 'stretch',
    marginTop: espacamento.xl,
  },
  botao: {
    marginBottom: espacamento.sm,
  },
});
