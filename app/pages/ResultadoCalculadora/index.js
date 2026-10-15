// Resultados da calculadora: z-score de cada indicador segundo a OMS.
import React from 'react';
import { View, Text, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Botao from '../../componentes/Botao';
import { useDados } from '../../contexto/DadosContexto';
import { avaliarMedidas } from '../../utilitarios/oms/avaliacaoOms';
import { formatarIdade, formatarDataBR } from '../../utilitarios/datas';
import { formatarNumero, formatarZScore } from '../../utilitarios/formatos';
import { estilos } from './style';

const ResultadoCalculadora = ({ navigation, route }) => {
  const { salvarAvaliacao } = useDados();
  const { pacienteId, nomePaciente, nascimentoMs, dataVisitaMs, sexo, posicao, medidas } = route.params;

  const dataDaVisita = new Date(dataVisitaMs);

  const avaliacao = avaliarMedidas({
    nascimento: new Date(nascimentoMs),
    sexo,
    dataVisita: dataDaVisita,
    posicao,
    ...medidas,
  });

  const idadeTexto = formatarIdade(avaliacao.idadeEmMeses);
  const calculados = avaliacao.indicadores.filter((item) => item.situacao !== 'indisponivel');
  const naFaixa = calculados.filter((item) => item.situacao === 'normal').length;

  // Ex.: "14,2 kg"
  const formatarMedida = (item) => `${formatarNumero(item.medida, 1)} ${item.unidade}`;

  const salvarNaFicha = () => {
    // TODO: integrar com a API (salvar a avaliação na ficha do paciente).
    salvarAvaliacao({
      pacienteId,
      data: formatarDataBR(dataDaVisita),
      idade: idadeTexto,
      pesoKg: medidas.pesoKg || 0,
      alturaCm: medidas.alturaCm || 0,
      imc: avaliacao.imc || 0,
      naFaixa,
      total: calculados.length,
    });
    Alert.alert('Avaliação salva', 'A avaliação foi adicionada à ficha do paciente.', [
      { text: 'OK', onPress: () => navigation.popTo('FichaPaciente', { pacienteId, aba: 'avaliacoes' }) },
    ]);
  };

  return (
    <Tela
      titulo="Resultados"
      subtitulo={`${nomePaciente} · ${idadeTexto}`}
      rodape={
        <View>
          {pacienteId ? (
            <Botao titulo="Salvar na ficha do paciente" aoPressionar={salvarNaFicha} estilo={estilos.botaoSalvar} />
          ) : null}
          <Botao titulo="Nova avaliação" variante="contorno" aoPressionar={() => navigation.goBack()} />
        </View>
      }
    >
      <Cartao>
        <Text style={estilos.titulo}>Indicadores</Text>
        <Text style={estilos.subtitulo}>Z-score segundo as referências da OMS</Text>

        {avaliacao.indicadores.length === 0 ? (
          <Text style={estilos.vazio}>Nenhuma medida informada.</Text>
        ) : null}

        {avaliacao.indicadores.map((item) => (
          <View key={item.chave} style={estilos.linha}>
            <View style={estilos.textos}>
              <Text style={estilos.nomeIndicador}>{item.rotulo}</Text>
              <Text style={estilos.medida}>Medida: {formatarMedida(item)}</Text>
              {item.situacao === 'indisponivel' ? <Text style={estilos.motivo}>{item.motivo}</Text> : null}
            </View>

            {item.situacao === 'indisponivel' ? (
              <View style={[estilos.chip, estilos.chipIndisponivel]}>
                <Text style={[estilos.textoChip, estilos.textoChipIndisponivel]}>—</Text>
              </View>
            ) : (
              <View style={[estilos.chip, item.situacao === 'normal' ? estilos.chipNormal : estilos.chipForaDaFaixa]}>
                <Text
                  style={[
                    estilos.textoChip,
                    item.situacao === 'normal' ? estilos.textoChipNormal : estilos.textoChipForaDaFaixa,
                  ]}
                >
                  {formatarZScore(item.zScore)}
                </Text>
              </View>
            )}
          </View>
        ))}

        <View style={estilos.legenda}>
          <View style={estilos.itemLegenda}>
            <View style={[estilos.bolinha, estilos.bolinhaNormal]} />
            <Text style={estilos.textoLegenda}>Entre −2 e +2</Text>
          </View>
          <View style={estilos.itemLegenda}>
            <View style={[estilos.bolinha, estilos.bolinhaForaDaFaixa]} />
            <Text style={estilos.textoLegenda}>Fora da faixa: avaliar</Text>
          </View>
        </View>

        <Text style={estilos.nota}>
          Referência: Padrões de Crescimento da OMS. Cálculo feito com tabelas de demonstração incluídas
          no projeto — substitua pelas tabelas oficiais antes de usar com pacientes reais.
        </Text>
      </Cartao>
    </Tela>
  );
};

export default ResultadoCalculadora;
