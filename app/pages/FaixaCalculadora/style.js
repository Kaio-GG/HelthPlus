import { StyleSheet } from 'react-native';
import { cores, raios } from '../../tema';

export const estilos = StyleSheet.create({
  // ----- Paciente que veio da ficha -----
  cartaoPaciente: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dadosPaciente: {
    flex: 1,
    marginLeft: 10,
  },
  nomePaciente: {
    fontSize: 15,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  idadePaciente: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 2,
  },

  // ----- Cartão de cada faixa -----
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  // A faixa que combina com a idade do paciente ganha destaque, mas as
  // outras continuam escolhíveis: quem decide é o nutricionista.
  cartaoSugerido: {
    borderColor: cores.bordaVerde,
    backgroundColor: cores.verdeSuave,
  },
  circulo: {
    width: 40,
    height: 40,
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
    marginLeft: 12,
    marginRight: 8,
  },
  rotulo: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.verdeEscuro,
  },
  resumo: {
    fontSize: 12,
    lineHeight: 16,
    color: cores.textoSecundario,
    marginTop: 3,
  },
  selo: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },

  nota: {
    fontSize: 12,
    lineHeight: 17,
    color: cores.textoSecundario,
    paddingHorizontal: 4,
    marginTop: 4,
  },
});
