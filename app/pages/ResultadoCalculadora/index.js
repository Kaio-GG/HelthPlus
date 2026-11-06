// Resultados da calculadora: para cada indicador, o escore-z, o percentil e a
// classificação da OMS correspondente à faixa de idade do paciente.
//
// A tela é lida de cima para baixo em três níveis: a MEDIDA em destaque, a
// CLASSIFICAÇÃO como etiqueta colorida e, só então, os números técnicos.
// Antes estava tudo no mesmo peso e o valor se perdia no meio.
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Botao from '../../componentes/Botao';
import CaixaAviso from '../../componentes/CaixaAviso';
import { useAuth } from '../../contexto/AuthContext';
import { useDialogo } from '../../contexto/DialogoContexto';
import { avaliarMedidas } from '../../utilitarios/oms/avaliacaoOms';
import { montarCorpoDaAvaliacao, salvarAvaliacao } from '../../Api/avaliacoes';
import { formatarIdade } from '../../utilitarios/datas';
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
  const { token } = useAuth();
  const { avisar } = useDialogo();
  const [salvando, setSalvando] = useState(false);
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

  // Grava a avaliação no banco (POST /api/avaliacao).
  //
  // Antes isto só entrava numa lista em memória: a avaliação sumia ao
  // fechar o aplicativo, e o paciente nunca a via em "Minha evolução".
  // Agora ela vai para as tabelas avaliacao, medida_antropometrica e
  // resultado_avaliacao, e é de lá que as duas telas de evolução leem.
  //
  // O cálculo continua sendo feito aqui, no aplicativo, com as curvas da
  // OMS: a API recebe o resultado pronto. O porquê está em
  // Api/repository/avaliacaoRepository.js.
  const salvarNaFicha = async () => {
    if (salvando) return;

    if (!token) {
      avisar({
        titulo: 'Sessão expirada',
        mensagem: 'Entre novamente na sua conta para salvar a avaliação.',
        tom: 'erro',
      });
      return;
    }

    try {
      setSalvando(true);

      await salvarAvaliacao(
        montarCorpoDaAvaliacao({
          pacienteId,
          dataDaVisita,
          medidas,
          avaliacao,
        }),
        token
      );

      await avisar({
        titulo: 'Avaliação salva',
        mensagem:
          'A avaliação entrou na ficha do paciente e já aparece no aplicativo dele.',
        tom: 'sucesso',
      });

      navigation.popTo('FichaPaciente', { pacienteId, aba: 'avaliacoes' });
    } catch (erro) {
      avisar({
        titulo: 'Não foi possível salvar',
        mensagem: erro.message || 'Tente de novo em instantes.',
        tom: 'erro',
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Tela
      titulo="Resultados"
      subtitulo={nomePaciente + ' · ' + idadeTexto}
      rodape={
        <View>
          {pacienteId ? (
            <Botao
              titulo={salvando ? 'Salvando...' : 'Salvar na ficha do paciente'}
              desabilitado={salvando}
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

      {/* Previsão de altura: só para quem ainda cresce, e já com a
          estatura desta avaliação preenchida. É o momento em que o
          nutricionista está com a régua na mão e com a família na frente —
          mandar procurar a ferramenta no menu seria perder a deixa. */}
      {!adulto && medidas.alturaCm ? (
        <Cartao>
          <Text style={estilos.tituloPrevisao}>Previsão de altura adulta</Text>
          <Text style={estilos.textoPrevisao}>
            Com a estatura desta avaliação e a altura do pai e da mãe, dá para
            estimar até onde esta criança deve crescer.
          </Text>
          <Botao
            titulo="Estimar a altura adulta"
            variante="contorno"
            aoPressionar={() =>
              navigation.navigate('PrevisaoAltura', {
                pacienteId,
                nomePaciente,
                nascimentoMs,
                sexo,
                alturaCm: medidas.alturaCm,
              })
            }
          />
        </Cartao>
      ) : null}

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
