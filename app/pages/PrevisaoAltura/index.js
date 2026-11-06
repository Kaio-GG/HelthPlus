// Previsão de altura adulta — a ferramenta que o nutricionista usa no
// acompanhamento infantil.
//
// Mostra duas leituras lado a lado:
//   a altura-alvo da família (altura do pai e da mãe, método de Tanner) e
//   a projeção pela curva da OMS (o escore-z de estatura que a criança tem
//   hoje, mantido até os 19 anos).
//
// Comparar as duas é o ponto da tela: criança indo para bem abaixo do que
// a família aponta é o achado que leva a investigar.
//
// Entra pela Calculadora OMS. Quando chamada da ficha de um paciente, a
// idade e o sexo já vêm preenchidos pela rota; a altura dos pais é sempre
// digitada, porque o cadastro não guarda esse dado.
//
// Parâmetros da rota (todos opcionais):
//   pacienteId, nomePaciente, nascimentoMs, sexo, alturaCm
import React, { useState } from 'react';
import { View, Text } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoTexto from '../../componentes/CampoTexto';
import CampoData from '../../componentes/CampoData';
import Alternador from '../../componentes/Alternador';
import CaixaAviso from '../../componentes/CaixaAviso';
import Selo from '../../componentes/Selo';
import GraficoBarra from '../../componentes/GraficoBarra';

import { cores } from '../../tema';
import { aplicarMascaraDecimal, decimalParaNumero } from '../../utilitarios/mascaras';
import { formatarNumero, formatarZScore } from '../../utilitarios/formatos';
import {
  converterDataBR,
  formatarDataBR,
  normalizarData,
  calcularIdadeEmMeses,
  formatarIdade,
} from '../../utilitarios/datas';
import {
  preverAltura,
  alturaDePaiMaeValida,
  MARGEM_DO_ALVO_CM,
  DIFERENCA_ENTRE_SEXOS_CM,
  IDADE_FINAL_MESES,
} from '../../utilitarios/oms/previsaoAltura';
import { estilos } from './style';

// A previsão vale para quem ainda está crescendo. Acima de 19 anos a
// curva da OMS acaba, e não há mais o que projetar.
const IDADE_MAXIMA_MESES = IDADE_FINAL_MESES;

const textoDaComparacao = {
  dentro:
    'A projeção está dentro da faixa da altura-alvo da família. É o cenário esperado.',
  acima:
    'A projeção está acima da faixa da altura-alvo da família. Vale conferir as medidas e acompanhar; crescimento acelerado também tem causas que se investigam.',
  abaixo:
    'A projeção está abaixo da faixa da altura-alvo da família. É o achado que costuma levar a investigar: confira as medidas e, se se confirmar, encaminhe para avaliação.',
};

const PrevisaoAltura = ({ route }) => {
  // O que veio da ficha do paciente, quando veio.
  const nomePaciente = route.params?.nomePaciente ?? null;
  const nascimentoDaRota = route.params?.nascimentoMs
    ? new Date(route.params.nascimentoMs)
    : normalizarData(route.params?.nascimento);

  const [sexo, setSexo] = useState(
    String(route.params?.sexo || '').toUpperCase().charAt(0) === 'M' ? 'M' : 'F'
  );

  const [nascimento, setNascimento] = useState(
    nascimentoDaRota ? formatarDataBR(nascimentoDaRota) : ''
  );

  const [altura, setAltura] = useState(
    route.params?.alturaCm ? String(route.params.alturaCm).replace('.', ',') : ''
  );

  const [alturaPai, setAlturaPai] = useState('');
  const [alturaMae, setAlturaMae] = useState('');

  const dataDeNascimento = converterDataBR(nascimento);
  const idadeEmMeses = dataDeNascimento ? calcularIdadeEmMeses(dataDeNascimento) : null;

  const alturaNumero = decimalParaNumero(altura);
  const paiNumero = decimalParaNumero(alturaPai);
  const maeNumero = decimalParaNumero(alturaMae);

  const foraDaFaixaDeIdade = idadeEmMeses !== null && idadeEmMeses > IDADE_MAXIMA_MESES;

  const { alvo, projecao, comparacao } = preverAltura({
    alturaCm: alturaNumero,
    idadeEmMeses,
    sexo,
    alturaPaiCm: paiNumero,
    alturaMaeCm: maeNumero,
  });

  // Avisos de valor digitado fora do razoável. Não travam a tela: o campo
  // continua aceitando, e o aviso explica por que a conta não saiu.
  const paiSuspeito = Boolean(paiNumero) && !alturaDePaiMaeValida(paiNumero);
  const maeSuspeita = Boolean(maeNumero) && !alturaDePaiMaeValida(maeNumero);

  // As duas leituras no mesmo gráfico de barras, para a comparação ser
  // visual e não aritmética.
  const barras = [];

  if (projecao) {
    barras.push({
      rotulo: 'Projeção',
      valor: projecao.projecao,
      cor: cores.verdeBotao,
    });
  }

  if (alvo) {
    barras.push({
      rotulo: 'Alvo da família',
      valor: alvo.alvo,
      cor: cores.verdeLink,
    });
  }

  if (projecao) {
    barras.push({
      rotulo: 'Média aos 19',
      valor: projecao.mediaAos19,
      cor: cores.bordaVerde,
    });
  }

  return (
    <Tela
      titulo="Previsão de altura"
      subtitulo={nomePaciente || 'Altura adulta estimada da criança'}
    >
      {/* ---------- Dados da criança ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>A criança</Text>

        <Text style={estilos.rotuloCampo}>Sexo (muda a conta nas duas leituras)</Text>
        <Alternador
          opcoes={[
            { valor: 'F', rotulo: 'Feminino' },
            { valor: 'M', rotulo: 'Masculino' },
          ]}
          valor={sexo}
          aoMudar={setSexo}
        />

        <View style={estilos.linhaCampos}>
          <CampoData
            rotulo="Data de nascimento"
            valor={nascimento}
            aoMudar={setNascimento}
            dataMaxima={new Date()}
            estilo={estilos.campoMetade}
          />
          <CampoTexto
            rotulo="Idade"
            valor={idadeEmMeses === null ? '—' : formatarIdade(idadeEmMeses)}
            somenteLeitura
            mostrarCadeado={false}
            estilo={estilos.campoMetade}
          />
        </View>

        <CampoTexto
          rotulo="Estatura atual (cm)"
          valor={altura}
          aoMudar={(texto) => setAltura(aplicarMascaraDecimal(texto))}
          placeholder="0,0"
          teclado="decimal-pad"
        />

        {foraDaFaixaDeIdade ? (
          <CaixaAviso
            tom="alerta"
            icone="alerta"
            estilo={estilos.aviso}
            texto="Acima de 19 anos a curva da OMS termina: não há mais altura adulta a projetar, porque ela já foi atingida. A altura-alvo da família continua valendo como comparação."
          />
        ) : null}
      </Cartao>

      {/* ---------- Altura dos pais ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>A altura dos pais</Text>
        <Text style={estilos.subtituloCartao}>
          A altura de quem é pai e mãe biológicos. O cadastro do paciente não
          guarda esse dado — ele é digitado aqui, a cada uso.
        </Text>

        <View style={estilos.linhaCampos}>
          <CampoTexto
            rotulo="Mãe (cm)"
            valor={alturaMae}
            aoMudar={(texto) => setAlturaMae(aplicarMascaraDecimal(texto))}
            placeholder="0,0"
            teclado="decimal-pad"
            erro={maeSuspeita ? 'Confira: valor em centímetros.' : null}
            estilo={estilos.campoMetade}
          />
          <CampoTexto
            rotulo="Pai (cm)"
            valor={alturaPai}
            aoMudar={(texto) => setAlturaPai(aplicarMascaraDecimal(texto))}
            placeholder="0,0"
            teclado="decimal-pad"
            erro={paiSuspeito ? 'Confira: valor em centímetros.' : null}
            estilo={estilos.campoMetade}
          />
        </View>
      </Cartao>

      {/* ---------- Resultado: projeção pela curva ---------- */}
      <Cartao>
        <View style={estilos.linhaTitulo}>
          <Text style={estilos.tituloCartao}>Projeção pela curva da OMS</Text>
          {projecao ? (
            <Selo texto={`percentil ${formatarNumero(projecao.percentil, 1)}`} tom="neutro" />
          ) : null}
        </View>

        {projecao ? (
          <>
            <View style={estilos.linhaResultado}>
              <Text style={estilos.valorResultado}>
                {formatarNumero(projecao.projecao, 1)}
              </Text>
              <Text style={estilos.unidadeResultado}>cm</Text>
            </View>

            <Text style={estilos.faixaResultado}>
              faixa de {formatarNumero(projecao.minimo, 1)} a{' '}
              {formatarNumero(projecao.maximo, 1)} cm
            </Text>

            <Text style={estilos.explicacao}>
              A criança está hoje no escore-z {formatarZScore(projecao.zScore)} de
              estatura por idade. Mantendo esse mesmo canal de crescimento até os 19
              anos, é essa a estatura que a curva da OMS aponta. A média aos 19 anos,
              para o mesmo sexo, é {formatarNumero(projecao.mediaAos19, 1)} cm.
            </Text>
          </>
        ) : (
          <Text style={estilos.semResultado}>
            Informe a data de nascimento e a estatura atual para a projeção sair.
          </Text>
        )}
      </Cartao>

      {/* ---------- Resultado: altura-alvo da família ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Altura-alvo da família</Text>

        {alvo ? (
          <>
            <View style={estilos.linhaResultado}>
              <Text style={estilos.valorResultado}>{formatarNumero(alvo.alvo, 1)}</Text>
              <Text style={estilos.unidadeResultado}>cm</Text>
            </View>

            <Text style={estilos.faixaResultado}>
              faixa de {formatarNumero(alvo.minimo, 1)} a{' '}
              {formatarNumero(alvo.maximo, 1)} cm
            </Text>

            <Text style={estilos.explicacao}>
              Método de Tanner: a média da altura do pai e da mãe (
              {formatarNumero(alvo.mediaDosPais, 1)} cm){' '}
              {sexo === 'M' ? 'mais' : 'menos'} {DIFERENCA_ENTRE_SEXOS_CM / 2} cm, que
              é metade da diferença média de estatura entre homens e mulheres. A faixa
              de ±{MARGEM_DO_ALVO_CM} cm são dois desvios: a altura dos pais explica
              boa parte da altura do filho, não toda ela.
            </Text>
          </>
        ) : (
          <Text style={estilos.semResultado}>
            Informe a altura da mãe e do pai para a altura-alvo sair.
          </Text>
        )}
      </Cartao>

      {/* ---------- As duas lado a lado ---------- */}
      {barras.length >= 2 ? (
        <Cartao>
          <Text style={estilos.tituloCartao}>As duas leituras, lado a lado</Text>

          <GraficoBarra
            pontos={barras}
            altura={180}
            sufixo=""
            casas={1}
            zeroNaBase={false}
          />

          {comparacao ? (
            <View
              style={[
                estilos.caixaComparacao,
                comparacao.situacao === 'dentro'
                  ? estilos.comparacaoDentro
                  : comparacao.situacao === 'abaixo'
                    ? estilos.comparacaoAbaixo
                    : estilos.comparacaoAcima,
              ]}
            >
              <Text style={estilos.tituloComparacao}>
                Diferença: {comparacao.diferenca > 0 ? '+' : ''}
                {formatarNumero(comparacao.diferenca, 1)} cm
              </Text>
              <Text style={estilos.textoComparacao}>
                {textoDaComparacao[comparacao.situacao]}
              </Text>
            </View>
          ) : null}

          <Text style={estilos.notaGrafico}>
            As barras não começam no zero: a escala foi aproximada para a diferença
            entre as leituras aparecer.
          </Text>
        </Cartao>
      ) : null}

      {/* ---------- O que esta tela não faz ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Como usar isto</Text>

        <Text style={estilos.explicacao}>
          As duas leituras são ESTIMATIVAS, com margem de erro grande, e nenhuma
          delas é diagnóstico nem promessa. Elas servem para orientar o
          acompanhamento e para a conversa com a família — nunca para prometer uma
          altura a ninguém.
        </Text>

        <Text style={estilos.explicacao}>
          A projeção pressupõe que a criança siga o mesmo canal de crescimento.
          Puberdade adiantada ou atrasada muda isso, e é por aí que a previsão mais
          erra. Métodos mais precisos (Bayley-Pinneau, Khamis-Roche,
          Tanner-Whitehouse) pedem radiografia de idade óssea ou tabelas que este
          aplicativo não tem.
        </Text>

        <Text style={estilos.fonte}>
          Fontes: Tanner, Goldstein e Whitehouse, Archives of Disease in Childhood,
          1970 (altura-alvo); Luo, Albertsson-Wikland e Karlberg, Pediatric
          Research, 1998; WHO Growth Reference 2007, estatura por idade de 5 a 19
          anos (projeção pela curva).
        </Text>
      </Cartao>
    </Tela>
  );
};

export default PrevisaoAltura;
