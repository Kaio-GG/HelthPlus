import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  botaoCancelar: {
    marginBottom: 16,
  },

  alternador: {
    marginBottom: 12,
  },
  avisoPlano: {
    marginBottom: 0,
  },
  cartaoPlano: {
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cartaoDestaque: {
    borderColor: cores.verdeBotao,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nomePlano: {
    fontSize: 18,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  descricaoPlano: {
    fontSize: 12.5,
    color: cores.textoSecundario,
    marginTop: 2,
    marginBottom: 8,
  },
  preco: {
    fontSize: 26,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 10,
  },
  porMes: {
    fontSize: 13,
    fontWeight: '500',
    color: cores.textoSecundario,
  },
  precoSobConsulta: {
    fontSize: 22,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 10,
  },
  linhaBeneficio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  textoBeneficio: {
    marginLeft: 8,
    fontSize: 13.5,
    color: cores.textoPrincipal,
  },
  botaoPlano: {
    marginTop: 12,
  },
  rodapeNota: {
    fontSize: 11.5,
    lineHeight: 16,
    color: cores.textoSecundario,
    marginBottom: 16,
  },
});
