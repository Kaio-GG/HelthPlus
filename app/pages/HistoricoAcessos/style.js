import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: espacamento.md,
    paddingVertical: espacamento.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  icone: {
    width: 36,
    height: 36,
    borderRadius: raios.pilula,
    backgroundColor: cores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
  },
  quem: {
    ...tipografia.corpoForte,
    color: cores.textoPrincipal,
  },
  descricao: {
    ...tipografia.corpo,
    color: cores.textoPrincipal,
  },
  quando: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  vazio: {
    ...tipografia.corpo,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacamento.lg,
  },
  erro: {
    ...tipografia.apoioForte,
    color: cores.erro,
    marginTop: espacamento.md,
  },
});
