// Primeiro passo da calculadora: escolher a faixa de referência da OMS.
//
// A OMS não tem uma referência só. São padrões diferentes, com indicadores e
// pontos de corte diferentes — tanto que as ferramentas dela são dois
// programas separados (Anthro, de 0 a 5 anos, e AnthroPlus, de 5 a 19). Pedir
// a faixa antes evita a tela única em que não dá para saber qual referência
// está valendo.
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Icone from '../../componentes/Icone';
import Selo from '../../componentes/Selo';
import Avatar from '../../componentes/Avatar';
import { useDados } from '../../contexto/DadosContexto';
import { cores } from '../../tema';
import { LISTA_DE_FAIXAS, faixaDaIdade } from '../../utilitarios/oms/faixasOms';
import { calcularIdadeEmMeses, formatarIdade } from '../../utilitarios/datas';
import { estilos } from './style';

const FaixaCalculadora = ({ navigation, route }) => {
  const { pacientes } = useDados();

  // Quando a tela vem da ficha de um paciente, já dá para dizer qual é a
  // faixa dele — vira uma sugestão, não uma imposição.
  const pacienteId = route.params?.pacienteId ?? null;
  const paciente = pacientes.find((item) => item.id === pacienteId) ?? null;
  const idadeDoPaciente = paciente ? calcularIdadeEmMeses(paciente.nascimento) : null;
  const faixaSugerida = faixaDaIdade(idadeDoPaciente);

  const escolher = (faixa) =>
    navigation.navigate('Calculadora', { faixa: faixa.chave, pacienteId });

  return (
    <Tela titulo="Calculadora OMS" subtitulo="Escolha a faixa de referência">
      {paciente ? (
        <Cartao estilo={estilos.cartaoPaciente}>
          <Avatar nome={paciente.nome} tamanho={40} />
          <View style={estilos.dadosPaciente}>
            <Text style={estilos.nomePaciente}>{paciente.nome}</Text>
            <Text style={estilos.idadePaciente}>
              {paciente.sexo === 'F' ? 'Feminino' : 'Masculino'} · {formatarIdade(idadeDoPaciente)}
            </Text>
          </View>
        </Cartao>
      ) : null}

      {LISTA_DE_FAIXAS.map((faixa) => {
        const sugerida = faixaSugerida?.chave === faixa.chave;
        return (
          <TouchableOpacity
            key={faixa.chave}
            activeOpacity={0.85}
            onPress={() => escolher(faixa)}
            accessibilityRole="button"
            accessibilityLabel={`${faixa.rotulo}. ${faixa.resumo}`}
          >
            <Cartao estilo={[estilos.cartao, sugerida && estilos.cartaoSugerido]}>
              <View style={[estilos.circulo, sugerida && estilos.circuloSugerido]}>
                <Icone nome={faixa.icone} tamanho={20} cor={cores.verdeBotao} />
              </View>

              <View style={estilos.textos}>
                <Text style={estilos.rotulo}>{faixa.rotulo}</Text>
                <Text style={estilos.resumo} numberOfLines={2}>
                  {faixa.resumo}
                </Text>
                {sugerida ? (
                  <Selo texto="Idade do paciente" tom="sucesso" estilo={estilos.selo} />
                ) : null}
              </View>

              <Icone nome="chevron-direita" tamanho={18} cor={cores.textoSecundario} />
            </Cartao>
          </TouchableOpacity>
        );
      })}

      <Text style={estilos.nota}>
        Cada faixa usa uma tabela da OMS e pontos de corte próprios. Escolha pela idade que o
        paciente tem na data da avaliação.
      </Text>
    </Tela>
  );
};

export default FaixaCalculadora;
