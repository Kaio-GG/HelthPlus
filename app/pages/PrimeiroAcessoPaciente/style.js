import { StyleSheet } from 'react-native';
import { cores, espacamento, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  titulo: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
    marginBottom: espacamento.md,
  },
  item: {
    marginBottom: espacamento.md,
  },
  itemTitulo: {
    ...tipografia.corpoForte,
    color: cores.textoPrincipal,
  },
  itemTexto: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    marginBottom: espacamento.sm,
  },
  link: {
    ...tipografia.corpoForte,
    color: cores.verdeLink,
    textDecorationLine: 'underline',
    paddingVertical: espacamento.sm,
    marginBottom: espacamento.md,
  },
  aviso: {
    marginBottom: espacamento.lg,
  },
  nota: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: espacamento.sm,
  },
  campoSenha: {
    marginTop: espacamento.md,
  },
  rodape: {
    gap: espacamento.sm,
  },
});
