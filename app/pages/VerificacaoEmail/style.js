import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  cartao: {
    alignItems: 'center',
  },
  circulo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: cores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  texto: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: cores.textoPrincipal,
    marginTop: 10,
  },
  aviso: {
    marginTop: 8,
    fontSize: 12,
    color: cores.textoSecundario,
  },
  botao: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  link: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '700',
    color: cores.verdeLink,
    alignSelf: 'center',
  },

  // ----- Aviso de que a API está sem SMTP -----
  avisoDev: {
    marginBottom: 4,
  },

  // ----- Código digitado à mão -----
  tituloCodigo: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  textoCodigo: {
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoSecundario,
    marginTop: 4,
    marginBottom: 12,
  },
});
