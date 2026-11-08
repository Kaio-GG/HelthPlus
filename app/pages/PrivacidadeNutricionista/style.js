import { StyleSheet } from 'react-native';
import { cores, espacamento, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  texto: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    marginTop: espacamento.md,
    marginBottom: espacamento.sm,
  },
  separado: {
    marginTop: espacamento.xl,
  },
  vazio: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    textAlign: 'center',
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
  itemPaciente: {
    ...tipografia.corpo,
    color: cores.textoPrincipal,
  },
  itemData: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  detalhe: {
    marginTop: espacamento.md,
  },
  mensagem: {
    ...tipografia.corpo,
    fontStyle: 'italic',
    color: cores.textoPrincipal,
    marginBottom: espacamento.md,
  },
  aviso: {
    marginBottom: espacamento.md,
  },
  botoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.sm,
  },
});
