import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  linhaBotoes: {
    flexDirection: 'row',
  },
  botaoVoltar: {
    flex: 1,
    marginRight: 12,
  },
  botaoContinuar: {
    flex: 2,
  },
  rotuloAlternador: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.verdeEscuro,
    marginBottom: 6,
  },
  tituloSecao: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginTop: 4,
  },
  dicaSecao: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginBottom: 10,
  },
  linhaCampos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  campoMetade: {
    width: '48%',
  },
  avisoNascimento: {
    marginTop: -4,
    marginBottom: 16,
  },

  // A senha do primeiro acesso em destaque: é o dado que o nutricionista
  // precisa passar ao paciente, e ele sai desta tela sem anotar nada.
  caixaSenha: {
    backgroundColor: cores.verdeSuave,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.bordaVerde,
    padding: 14,
    marginBottom: 16,
  },
  tituloSenha: {
    fontSize: 12,
    fontWeight: '700',
    color: cores.verdeLink,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  valorSenha: {
    fontSize: 22,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginTop: 2,
    marginBottom: 6,
  },
  dicaSenha: {
    fontSize: 12,
    lineHeight: 17,
    color: cores.textoSecundario,
  },

  linhaConvite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  textoConvite: {
    flex: 1,
    paddingRight: 10,
  },
  tituloConvite: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.verdeEscuro,
  },
  dicaConvite: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  seloStatus: {
    marginBottom: 14,
  },
});
