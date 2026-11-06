import { StyleSheet } from 'react-native';
import { cores, espacamento, raios, tipografia } from '../../tema';

export const estilos = StyleSheet.create({
  // ----- Paciente que veio da ficha -----
  cartaoPaciente: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dadosPaciente: {
    flex: 1,
    marginLeft: espacamento.md,
  },
  nomePaciente: {
    ...tipografia.corpoForte,
    color: cores.verdeEscuro,
  },
  idadePaciente: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: 2,
  },

  // ----- Cartão de cada faixa -----
  //
  // São três escolhas e nada mais na tela, então cada cartão pode ser
  // generoso: alvo grande, ícone grande e espaço para respirar.
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espacamento.xl,
    marginBottom: espacamento.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  // A faixa que combina com a idade do paciente ganha destaque, mas as
  // outras continuam escolhíveis: quem decide é o nutricionista.
  cartaoSugerido: {
    borderColor: cores.verdeBotao,
    backgroundColor: cores.verdeSuave,
  },
  circulo: {
    width: 52,
    height: 52,
    borderRadius: raios.pilula,
    backgroundColor: cores.verdeSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloSugerido: {
    backgroundColor: cores.verdeClaro,
  },
  textos: {
    flex: 1,
    marginLeft: espacamento.lg,
    marginRight: espacamento.sm,
  },
  rotulo: {
    ...tipografia.secao,
    color: cores.verdeEscuro,
  },
  resumo: {
    ...tipografia.apoio,
    color: cores.textoSecundario,
    marginTop: 4,
  },
  selo: {
    alignSelf: 'flex-start',
    marginTop: espacamento.md,
  },

  // Separa as "outras ferramentas" das três faixas de referência: sem o
  // título, o cartão da previsão de altura parecia uma quarta faixa.
  tituloOutras: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: cores.textoSecundario,
    alignSelf: 'stretch',
    marginTop: 8,
    marginBottom: 10,
  },
  nota: {
    ...tipografia.miudo,
    color: cores.textoSecundario,
    textAlign: 'center',
    paddingHorizontal: espacamento.sm,
    marginTop: espacamento.sm,
  },
});
