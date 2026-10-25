import { StyleSheet } from 'react-native';
import { cores, espacamento } from '../../tema';

export const estilos = StyleSheet.create({
  // Emblema do cabeçalho (igual ao da Home do nutricionista): anel amarelo
  emblema: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#FFF59D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloCartao: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: cores.verdeEscuro,
    marginBottom: 16,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  // ----- Hoje -----
  linhaAgua: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rotuloAgua: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tituloAgua: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  valorAgua: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.verdeEscuro,
  },
  botaoRegistrar: {
    marginTop: 16,
  },

  // ----- Próxima consulta -----
  linhaConsulta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circuloConsulta: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dadosConsulta: {
    flex: 1,
    paddingRight: 8,
  },
  dataConsulta: {
    fontSize: 14,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  detalheConsulta: {
    fontSize: 12.5,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  caixaVazia: {
    alignItems: 'center',
    paddingVertical: espacamento.sm,
  },
  circuloVazio: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: cores.verdeSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamento.md,
  },
  vazio: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: cores.verdeEscuro,
  },
  vazioDetalhe: {
    textAlign: 'center',
    fontSize: 13,
    color: cores.textoSecundario,
    marginTop: 4,
  },

  // ----- Atalhos -----
  linhaAtalhos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  atalho: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  circuloAtalho: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: cores.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rotuloAtalho: {
    alignSelf: 'stretch',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: cores.verdeEscuro,
    textAlign: 'center',
  },
});
