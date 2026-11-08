import { StyleSheet } from 'react-native';
import { cores, espacamento, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  titulo: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
    marginBottom: espacamento.sm,
  },
  subtitulo: {
    ...tipografia.corpoForte,
    color: cores.verdeEscuro,
    marginBottom: espacamento.sm,
  },
  texto: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    marginBottom: espacamento.sm,
  },
  botao: {
    marginTop: espacamento.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.sm,
    marginVertical: espacamento.md,
  },
  lista: {
    marginTop: espacamento.lg,
  },
  item: {
    paddingVertical: espacamento.md,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  linhaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacamento.sm,
  },
  itemTitulo: {
    ...tipografia.corpoForte,
    color: cores.textoPrincipal,
    flexShrink: 1,
  },
  itemData: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginVertical: 2,
  },
  aviso: {
    marginVertical: espacamento.md,
  },
});
