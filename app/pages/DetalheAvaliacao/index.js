// Uma avaliação por extenso, do jeito que a calculadora mostra o
// resultado: a medida em destaque, a classificação como etiqueta colorida
// e, por último, os números técnicos (escore-z e percentil).
//
// É a MESMA tela para os dois perfis. O nutricionista chega nela tocando
// numa avaliação da ficha do paciente; o paciente, tocando numa avaliação
// de "Minha evolução". Só o texto do rodapé muda, porque só o paciente
// precisa ler "quem mediu foi o seu nutricionista".
//
// De onde vêm os números: o banco guarda a MEDIDA (peso, altura, data) e o
// resultado que o cálculo produziu no dia. A tela usa o que está gravado
// e, quando dá, refaz a conta com as curvas da OMS que já estão no
// aplicativo (utilitarios/evolucao.js) — é isso que permite mostrar a
// leitura inteira, indicador por indicador, de uma avaliação antiga.
//
// Parâmetros da rota:
//   avaliacao   o item da lista de avaliações (obrigatório)
//   paciente    { nome, nascimento, sexo } — sem isso não há como refazer
//               a conta, e a tela mostra só o que está gravado
//   perfil      'nutricionista' (padrão) ou 'paciente'
import React from 'react';
import { View, Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Botao from '../../componentes/Botao';
import Icone from '../../componentes/Icone';
import CaixaAviso from '../../componentes/CaixaAviso';
import { detalharAvaliacao } from '../../utilitarios/evolucao';
import { formatarNumero, formatarZScore } from '../../utilitarios/formatos';
import { cores } from '../../tema';
import { estilos } from './style';

// Cada "tom" vindo da classificação tem um par de estilos: fundo e texto.
const estiloDoTom = {
  adequado: [estilos.chipAdequado, estilos.textoChipAdequado],
  atencao: [estilos.chipAtencao, estilos.textoChipAtencao],
  risco: [estilos.chipRisco, estilos.textoChipRisco],
};

const SEM_CLASSIFICACAO = [estilos.chipIndisponivel, estilos.textoChipIndisponivel];

// O que cada indicador quer dizer, em uma frase.
//
// A tela de resultados da calculadora não precisa disto: quem acabou de
// digitar as medidas sabe o que pediu. Aqui, não — principalmente do lado
// do paciente, que nunca viu a palavra "escore-z" antes.
const EXPLICACOES = {
  peso_idade: 'Compara o peso com o de crianças da mesma idade e do mesmo sexo.',
  estatura_idade:
    'Compara a altura com a de crianças da mesma idade e do mesmo sexo. É o indicador que mostra crescimento ao longo do tempo.',
  imc_idade:
    'O IMC (peso ÷ altura²) comparado com o de crianças da mesma idade e do mesmo sexo.',
  peso_comprimento:
    'Compara o peso com o esperado para aquele comprimento, independente da idade.',
  peso_estatura:
    'Compara o peso com o esperado para aquela altura, independente da idade.',
  pc_idade: 'Perímetro da cabeça comparado com o esperado para a idade.',
  pb_idade: 'Perímetro do braço comparado com o esperado para a idade.',
  pct_idade: 'Dobra de pele do tríceps comparada com o esperado para a idade.',
  pcs_idade: 'Dobra de pele abaixo da escápula comparada com o esperado para a idade.',
  imc_adulto:
    'O IMC (peso ÷ altura²) classificado pelas faixas que a OMS usa para adultos.',
};

// Em palavras, o que o escore-z significa. O número sozinho não diz nada a
// quem não trabalha com ele.
const lerEscoreZ = (zScore) => {
  if (zScore === null || zScore === undefined) return null;

  const distancia = Math.abs(zScore);

  if (distancia < 1) return 'Bem no meio do esperado para a idade.';
  if (distancia < 2) {
    return zScore > 0
      ? 'Um pouco acima da média, ainda dentro do esperado.'
      : 'Um pouco abaixo da média, ainda dentro do esperado.';
  }
  if (distancia < 3) {
    return zScore > 0
      ? 'Acima da faixa esperada (mais de 2 desvios).'
      : 'Abaixo da faixa esperada (mais de 2 desvios).';
  }

  return zScore > 0
    ? 'Muito acima da faixa esperada (mais de 3 desvios).'
    : 'Muito abaixo da faixa esperada (mais de 3 desvios).';
};

const DetalheAvaliacao = ({ navigation, route }) => {
  const avaliacao = route.params?.avaliacao ?? null;
  const paciente = route.params?.paciente ?? null;
  const ehPaciente = route.params?.perfil === 'paciente';

  if (!avaliacao) {
    return (
      <Tela titulo="Avaliação" subtitulo="Não foi possível abrir">
        <Cartao>
          <Text style={estilos.vazio}>
            A avaliação não foi informada. Volte e toque nela outra vez.
          </Text>
        </Cartao>
      </Tela>
    );
  }

  // Refaz a conta da OMS. Quando não dá (falta data de nascimento ou sexo),
  // a tela cai para o que está gravado no banco — que já traz escore-z,
  // percentil e classificação de cada indicador.
  const recalculada = detalharAvaliacao(avaliacao, paciente);

  const indicadores = recalculada
    ? recalculada.indicadores
    : (avaliacao.resultados || []).map((resultado) => ({
        chave: resultado.indicador,
        rotulo: resultado.rotulo,
        medida: resultado.medida,
        unidade: '',
        zScore: resultado.zScore,
        percentil: resultado.percentil,
        classificacao: resultado.classificacao
          ? { nome: resultado.classificacao, tom: resultado.tom }
          : null,
        situacao: 'calculado',
        implausivel: resultado.extremo,
      }));

  const calculados = indicadores.filter((item) => item.situacao === 'calculado');
  const adequados = calculados.filter(
    (item) => item.classificacao?.tom === 'adequado'
  ).length;

  const temImplausivel = calculados.some((item) => item.implausivel);
  const fonte = recalculada?.faixa?.fonte ?? 'Referências da OMS';

  return (
    <Tela
      titulo={`Avaliação de ${avaliacao.data || 'data não informada'}`}
      subtitulo={paciente?.nome || 'Leitura completa das medidas'}
      rodape={
        <Botao titulo="Voltar" variante="contorno" aoPressionar={() => navigation.goBack()} />
      }
    >
      {temImplausivel ? (
        <CaixaAviso
          tom="alerta"
          icone="alerta"
          texto="Um ou mais resultados estão muito fora do esperado. Na prática isso quase sempre é erro de anotação: peso em gramas, altura em metros, data de nascimento trocada."
          estilo={estilos.avisoTopo}
        />
      ) : null}

      {/* ---------- As medidas daquele dia ---------- */}
      <Cartao estilo={estilos.cartaoResumo}>
        <Text style={estilos.rotuloResumo}>Medidas desta avaliação</Text>

        <View style={estilos.linhaMedidas}>
          <View style={estilos.medida}>
            <Text style={estilos.rotuloMedida}>Peso</Text>
            <Text style={estilos.valorMedida}>
              {avaliacao.pesoKg != null ? `${formatarNumero(avaliacao.pesoKg)} kg` : '—'}
            </Text>
          </View>
          <View style={estilos.medida}>
            <Text style={estilos.rotuloMedida}>Altura</Text>
            <Text style={estilos.valorMedida}>
              {avaliacao.alturaCm != null ? `${formatarNumero(avaliacao.alturaCm)} cm` : '—'}
            </Text>
          </View>
          <View style={estilos.medida}>
            <Text style={estilos.rotuloMedida}>IMC</Text>
            <Text style={estilos.valorMedida}>
              {avaliacao.imc != null ? `${formatarNumero(avaliacao.imc)} kg/m²` : '—'}
            </Text>
          </View>
        </View>

        <View style={estilos.linhaIdade}>
          <Icone nome="relogio" tamanho={14} cor={cores.textoSecundario} />
          <Text style={estilos.textoIdade}>
            Idade na avaliação: {avaliacao.idade || 'não informada'}
          </Text>
        </View>

        <Text style={estilos.fonteResumo}>{fonte}</Text>

        {calculados.length > 0 ? (
          <Text style={estilos.contagem}>
            {adequados} de {calculados.length}{' '}
            {calculados.length === 1 ? 'indicador adequado' : 'indicadores adequados'}
          </Text>
        ) : null}
      </Cartao>

      {calculados.length === 0 ? (
        <Cartao>
          <Text style={estilos.vazio}>
            Esta avaliação não tem indicadores calculados. Isso acontece quando só
            uma medida foi anotada, ou quando a idade do paciente está fora das
            curvas da OMS.
          </Text>
        </Cartao>
      ) : null}

      {/* ---------- Um cartão por indicador ---------- */}
      {indicadores.map((item, indice) => {
        const indisponivel = item.situacao === 'indisponivel';
        const [fundoChip, textoChip] = indisponivel
          ? SEM_CLASSIFICACAO
          : (estiloDoTom[item.classificacao?.tom] ?? SEM_CLASSIFICACAO);

        const leitura = lerEscoreZ(item.zScore);

        return (
          <Cartao key={`${item.chave}-${indice}`} estilo={estilos.cartaoIndicador}>
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

            {/* A explicação vem antes dos números: é o que torna o resto
                legível para quem não é da área. */}
            {EXPLICACOES[item.chave] ? (
              <Text style={estilos.explicacao}>{EXPLICACOES[item.chave]}</Text>
            ) : null}

            {item.zScore !== null && item.zScore !== undefined ? (
              <View style={estilos.blocoEscores}>
                <View style={estilos.linhaEscore}>
                  <Text style={estilos.rotuloEscore}>Escore-z</Text>
                  <Text style={estilos.valorEscore}>{formatarZScore(item.zScore)}</Text>
                </View>

                {item.percentil !== null && item.percentil !== undefined ? (
                  <View style={estilos.linhaEscore}>
                    <Text style={estilos.rotuloEscore}>Percentil</Text>
                    <Text style={estilos.valorEscore}>
                      {formatarNumero(item.percentil, 1)}
                    </Text>
                  </View>
                ) : null}

                {leitura ? <Text style={estilos.leitura}>{leitura}</Text> : null}

                {item.percentil !== null && item.percentil !== undefined ? (
                  <Text style={estilos.leituraPercentil}>
                    Em cada 100 pessoas da mesma idade e do mesmo sexo, cerca de{' '}
                    {Math.round(item.percentil)} ficam abaixo deste valor.
                  </Text>
                ) : null}
              </View>
            ) : null}

            {indisponivel ? <Text style={estilos.motivo}>{item.motivo}</Text> : null}

            {item.referencia ? (
              <Text style={estilos.conversao}>{item.referencia}</Text>
            ) : null}

            {item.implausivel ? (
              <Text style={estilos.implausivel}>
                Valor improvável para a OMS. Confira a medida.
              </Text>
            ) : null}

            {/* Leitura extra do mesmo número. Hoje: desnutrição aguda pelo PB. */}
            {item.extra ? (
              <View style={estilos.linhaExtra}>
                <Text style={estilos.rotuloExtra}>{item.extra.rotulo}</Text>
                <Text
                  style={[
                    estilos.valorExtra,
                    (estiloDoTom[item.extra.tom] ?? SEM_CLASSIFICACAO)[1],
                  ]}
                >
                  {item.extra.nome}
                </Text>
              </View>
            ) : null}
          </Cartao>
        );
      })}

      {/* ---------- Legenda ---------- */}
      <Cartao>
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
          {ehPaciente
            ? 'Estas medidas foram anotadas pelo seu nutricionista na consulta. Nenhum número aqui é diagnóstico: quem interpreta o conjunto é ele.'
            : 'O escore-z compara o paciente com crianças do mesmo sexo e da mesma idade; o percentil diz quantas delas ficam abaixo dele.'}
        </Text>

        {!recalculada ? (
          <Text style={estilos.nota}>
            Os números mostrados são os que foram gravados no dia da avaliação.
            Sem a data de nascimento e o sexo do paciente não há como refazer o
            cálculo nesta tela.
          </Text>
        ) : null}
      </Cartao>
    </Tela>
  );
};

export default DetalheAvaliacao;
