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
  // Acima de 19 anos o resultado nao e escore-z, e o texto da tela muda.
  const temAdulto = avaliacao.indicadores.some((item) => item.chave === 'imc_adulto');
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
        <Text style={estilos.subtitulo}>
          {temAdulto
            ? 'Classificação do IMC pelas faixas da OMS para adultos'
            : 'Z-score segundo as referências da OMS'}
        </Text>

        {avaliacao.indicadores.length === 0 ? (
          <Text style={estilos.vazio}>Nenhuma medida informada.</Text>
        ) : null}

        {avaliacao.indicadores.map((item) => (
          <View key={item.chave} style={estilos.linha}>
            <View style={estilos.textos}>
              <Text style={estilos.nomeIndicador}>{item.rotulo}</Text>
              <Text style={estilos.medida}>Medida: {formatarMedida(item)}</Text>
              {item.situacao === 'indisponivel' ? <Text style={estilos.motivo}>{item.motivo}</Text> : null}
              {item.referencia ? <Text style={estilos.motivo}>{item.referencia}</Text> : null}
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
                  {item.classificacao ?? formatarZScore(item.zScore)}
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
          Referência: WHO Child Growth Standards 2006 (0 a 5 anos) e WHO Growth
          Reference 2007 (5 a 19 anos), tabelas oficiais. PB e pregas cutâneas
          ainda não têm tabela de referência no aplicativo.
        </Text>
      </Cartao>
    </Tela>
  );
};

export default ResultadoCalculadora;
