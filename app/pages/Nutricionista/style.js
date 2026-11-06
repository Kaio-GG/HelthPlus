import { StyleSheet } from 'react-native';
import { cores } from '../../tema';

export const estilos = StyleSheet.create({
  // Um rótulo só para os dois campos do CRN, que juntos formam um dado só.
  rotuloGrupo: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: cores.verdeEscuro,
    marginBottom: 6,
  },
  // Regional e número lado a lado. Os rótulos saíram para o grupo acima, e
  // é isso que faz as duas caixas começarem na mesma altura: sem o truque,
  // "Regional" numa linha e "Número do registro" em duas desalinhavam tudo.
  linhaCrn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  campoRegional: {
    flex: 1,
  },
  campoNumeroCrn: {
    flex: 1.3,
  },

  // Com um link só, "space-between" o jogava para a esquerda do cartão,
  // longe do campo de senha; alinhado à direita ele fica logo abaixo dele.
  linhaLinks: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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