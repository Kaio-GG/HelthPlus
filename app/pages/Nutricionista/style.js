import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  // Emblema do cabeçalho (mesmo da Home): médico dentro de um anel amarelo
  emblema: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#FFF59D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  linhaLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: -2,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.verdeLink,
  },
  rodapeTexto: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: cores.textoSecundario,
  },
  textoTermos: {
    fontSize: 14,
    lineHeight: 21,
    color: cores.textoPrincipal,
  },

  // Botão largo em pílula, verde #2E8B57, igual ao da Home
  botaoPrincipal: {
    marginTop: 4,
    backgroundColor: '#2E8B57',
    borderRadius: 24,
    minHeight: 46,
  },
});