// Resultados da calculadora: para cada indicador, o escore-z, o percentil e a
// classificação da OMS correspondente à faixa de idade do paciente.
//
// A tela é lida de cima para baixo em três níveis: a MEDIDA em destaque, a
// CLASSIFICAÇÃO como etiqueta colorida e, só então, os números técnicos.
// Antes estava tudo no mesmo peso e o valor se perdia no meio.
import React from 'react';
import { View, Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Botao from '../../componentes/Botao';
import CaixaAviso from '../../componentes/CaixaAviso';
import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { avaliarMedidas } from '../../utilitarios/oms/avaliacaoOms';
import { formatarIdade, formatarDataBR } from '../../utilitarios/datas';
import { formatarNumero, formatarZScore } from '../../utilitarios/formatos';
import { estilos } from './style';

// Cada "tom" vindo da classificação tem um par de estilos: fundo e texto.
const estiloDoTom = {
  adequado: [estilos.chipAdequado, estilos.textoChipAdequado],
  atencao: [estilos.chipAtencao, estilos.textoChipAtencao],
  risco: [estilos.chipRisco, estilos.textoChipRisco],
};

const SEM_CLASSIFICACAO = [estilos.chipIndisponivel, estilos.textoChipIndisponivel];

const ResultadoCalculadora = ({ navigation, route }) => {
  const { salvarAvaliacao } = useDados();
  const { avisar } = useDialogo();
  const { pacienteId, nomePaciente, nascimentoMs, dataVisitaMs, sexo, posicao, medidas } =
    route.params;

  const dataDaVisita = new Date(dataVisitaMs);

  const avaliacao = avaliarMedidas({
    nascimento: new Date(nascimentoMs),
    sexo,
    dataVisita: dataDaVisita,
    posicao,
    ...medidas,
  });

  const { faixa, indicadores } = avaliacao;
  const idadeTexto = formatarIdade(Math.floor(avaliacao.idadeEmMeses));
  const calculados = indicadores.filter((item) => item.situacao === 'calculado');
  const adequados = calculados.filter((item) => item.classificacao?.tom === 'adequado').length;
  const temImplausivel = calculados.some((item) => item.implausivel);
  const adulto = faixa.chave === 'adulto';

  const salvarNaFicha = async () => {
    // TODO: integrar com a API (salvar a avaliação na ficha do paciente).
    salvarAvaliacao({
      pacienteId,
      data: formatarDataBR(dataDaVisita),
      idade: idadeTexto,
      pesoKg: medidas.pesoKg || 0,
      alturaCm: medidas.alturaCm || 0,
      imc: avaliacao.imc || 0,
      naFaixa: adequados,
      total: calculados.length,
    });
    await avisar({
      titulo: 'Avaliação salva',
      mensagem: 'A avaliação foi adicionada à ficha do paciente.',
      tom: 'sucesso',
    });
    navigation.popTo('FichaPaciente', { pacienteId, aba: 'avaliacoes' });
  };

  return (
    <Tela
      titulo="Resultados"
      subtitulo={nomePaciente + ' · ' + idadeTexto}
      rodape={
        <View>
          {pacienteId ? (
            <Botao
              titulo="Salvar na ficha do paciente"
              aoPressionar={salvarNaFicha}
              estilo={estilos.botaoSalvar}
            />
          ) : null}
          <Botao
            titulo="Nova avaliação"
            variante="contorno"
            aoPressionar={() => navigation.goBack()}
          />
        </View>
      }
    >
      {temImplausivel ? (
        <CaixaAviso
          tom="alerta"
          icone="alerta"
          texto="Um ou mais resultados estão muito fora do esperado. Na prática isso quase sempre é erro de anotação: peso em gramas, altura em metros, data de nascimento trocada. Confira as medidas antes de usar."
          estilo={estilos.avisoTopo}
        />
      ) : null}

      {/* Resumo: a referência usada e quantos indicadores estão adequados. */}
      <Cartao estilo={estilos.cartaoResumo}>
        <Text style={estilos.rotuloResumo}>Referência</Text>
        <Text style={estilos.fonteResumo}>{faixa.fonte}</Text>

        {!adulto && calculados.length > 0 ? (
          <Text style={estilos.contagem}>
            {adequados} de {calculados.length}{' '}
            {calculados.length === 1 ? 'indicador adequado' : 'indicadores adequados'}
          </Text>
        ) : null}
      </Cartao>

      {indicadores.length === 0 ? (
        <Cartao>
          <Text style={estilos.vazio}>Nenhuma medida informada.</Text>
        </Cartao>
      ) : null}

      {/* Um cartão por indicador. A linha de cima diz O QUE é e COMO está;
          embaixo vem a medida e, por último, os números técnicos. */}
      {indicadores.map((item) => {
        const indisponivel = item.situacao === 'indisponivel';
        const [fundoChip, textoChip] = indisponivel
          ? SEM_CLASSIFICACAO
          : (estiloDoTom[item.classificacao?.tom] ?? SEM_CLASSIFICACAO);

        return (
          <Cartao key={item.chave} estilo={estilos.cartaoIndicador}>
            <View style={estilos.linhaTopo}>
              <Text style={estilos.nomeIndicador}>{item.rotulo}</Text>

              <View style={[estilos.chip, fundoChip]}>
                <Text style={[estilos.textoChip, textoChip]}>
                  {indisponivel ? 'Sem tabela' : (item.classificacao?.nome ?? '—')}
                </Text>
              </View>
            </View>

            <View style={estilos.linhaValor}>
              <Text style={estilos.valor}>{formatarNumero(item.medida, 1)}</Text>
              <Text style={estilos.unidade}>{item.unidade}</Text>
            </View>

            {item.zScore !== null ? (
              <Text style={estilos.escores}>
                z-score {formatarZScore(item.zScore)} · percentil{' '}
                {formatarNumero(item.percentil, 1)}
              </Text>
            ) : null}

            {indisponivel ? <Text style={estilos.motivo}>{item.motivo}</Text> : null}

            {/* Quando a posição da medida não combina com a idade, a OMS manda
                converter antes de comparar com a curva. A tela mostra o valor
                que realmente entrou na conta. */}
            {item.referencia ? <Text style={estilos.conversao}>{item.referencia}</Text> : null}

            {item.implausivel ? (
              <Text style={estilos.implausivel}>Valor improvável para a OMS. Confira a medida.</Text>
            ) : null}

            {/* Leitura extra do mesmo número. Hoje: desnutrição aguda pelo PB. */}
            {item.extra ? (
              <View style={estilos.linhaExtra}>
                <Text style={estilos.rotuloExtra}>{item.extra.rotulo}</Text>
                <Text style={[estilos.valorExtra, estiloDoTom[item.extra.tom][1]]}>
                  {item.extra.nome}
                </Text>
              </View>
            ) : null}
          </Cartao>
        );
      })}

      <Cartao estilo={estilos.cartaoLegenda}>
        <View style={estilos.legenda}>
          <View style={estilos.itemLegenda}>
            <View style={[estilos.bolinha, estilos.bolinhaAdequado]} />
            <Text style={estilos.textoLegenda}>Adequado</Text>
          </View>
          <View style={estilos.itemLegenda}>
            <View style={[estilos.bolinha, estilos.bolinhaAtencao]} />
            <Text style={estilos.textoLegenda}>Acompanhar</Text>
          </View>
          <View style={estilos.itemLegenda}>
            <View style={[estilos.bolinha, estilos.bolinhaRisco]} />
            <Text style={estilos.textoLegenda}>Avaliar</Text>
          </View>
        </View>

        <Text style={estilos.nota}>
          O escore-z compara o paciente com crianças do mesmo sexo e da mesma idade; o percentil
          diz quantas delas ficam abaixo dele.
        </Text>
      </Cartao>
    </Tela>
  );
};

export default ResultadoCalculadora;
