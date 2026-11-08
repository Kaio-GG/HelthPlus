// Gráfico de barras verticais, desenhado com SVG.
//
// Serve para comparar um mesmo indicador entre as avaliações ("o peso de
// cada consulta"), onde a barra lê melhor que a linha: cada avaliação é um
// evento separado, não um valor contínuo no tempo.
//
// Props:
//   pontos      lista de { rotulo, valor, cor? }
//   altura      altura total em pixels (padrão: 160)
//   cor         cor padrão das barras
//   sufixo      unidade escrita em cima de cada barra (ex.: ' kg')
//   casas       casas decimais do valor escrito (padrão: 1)
//   zeroNaBase  true (padrão) começa o eixo no zero. false aproxima a
//               escala dos valores, para diferenças pequenas aparecerem —
//               use com cuidado: barra cortada exagera a diferença.
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Line, Text as TextoSvg } from 'react-native-svg';
import { cores } from '../../tema';
import { descreverSerie } from '../../utilitarios/acessibilidade';
import { estilos } from './style';

const MARGEM_LATERAL = 6;
const MARGEM_SUPERIOR = 20;
const MARGEM_INFERIOR = 24;
const ESPACO_ENTRE_BARRAS = 8;
const LARGURA_MAXIMA_BARRA = 44;

const umaCasa = (valor, casas) =>
  Number(valor).toFixed(casas).replace('.', ',');

const GraficoBarra = ({
  pontos,
  altura = 160,
  cor = cores.verdeBotao,
  sufixo = '',
  casas = 1,
  zeroNaBase = true,
  rotuloAcessivel,
}) => {
  const [largura, setLargura] = useState(0);

  if (!pontos || pontos.length === 0) {
    return <Text style={estilos.vazio}>Sem dados para exibir.</Text>;
  }

  const valores = pontos.map((ponto) => Number(ponto.valor));
  const maiorValor = Math.max(...valores);
  const menorValor = Math.min(...valores);

  // Com o eixo no zero, a base é 0. Sem ele, a base desce um pouco abaixo
  // do menor valor, para a menor barra não virar um fio.
  const base = zeroNaBase ? 0 : menorValor - (maiorValor - menorValor || 1) * 0.35;
  const topo = maiorValor + (maiorValor - base || 1) * 0.08;
  const intervalo = topo - base || 1;

  const areaAltura = altura - MARGEM_SUPERIOR - MARGEM_INFERIOR;
  const areaLargura = Math.max(largura - MARGEM_LATERAL * 2, 1);

  const larguraFatia = areaLargura / pontos.length;
  const larguraBarra = Math.min(
    LARGURA_MAXIMA_BARRA,
    Math.max(larguraFatia - ESPACO_ENTRE_BARRAS, 6)
  );

  return (
    <View
      onLayout={(evento) => setLargura(evento.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={rotuloAcessivel || descreverSerie(pontos, { sufixo, casas })}
    >
      {largura > 0 && (
        <Svg width={largura} height={altura}>
          {/* Linha de base */}
          <Line
            x1={MARGEM_LATERAL}
            x2={largura - MARGEM_LATERAL}
            y1={altura - MARGEM_INFERIOR}
            y2={altura - MARGEM_INFERIOR}
            stroke={cores.linha}
            strokeWidth={1}
          />

          {pontos.map((ponto, indice) => {
            const valor = Number(ponto.valor);
            const proporcao = (valor - base) / intervalo;
            const alturaBarra = Math.max(proporcao * areaAltura, 2);
            const centro = MARGEM_LATERAL + larguraFatia * (indice + 0.5);
            const x = centro - larguraBarra / 2;
            const y = altura - MARGEM_INFERIOR - alturaBarra;

            return (
              <React.Fragment key={`${ponto.rotulo}-${indice}`}>
                <Rect
                  x={x}
                  y={y}
                  width={larguraBarra}
                  height={alturaBarra}
                  rx={6}
                  fill={ponto.cor || cor}
                />
                <TextoSvg
                  x={centro}
                  y={y - 6}
                  fontSize={11}
                  fontWeight="600"
                  fill={cores.verdeEscuro}
                  textAnchor="middle"
                >
                  {umaCasa(valor, casas) + sufixo}
                </TextoSvg>
                <TextoSvg
                  x={centro}
                  y={altura - 7}
                  fontSize={11}
                  fill={cores.textoSecundario}
                  textAnchor="middle"
                >
                  {ponto.rotulo}
                </TextoSvg>
              </React.Fragment>
            );
          })}
        </Svg>
      )}
    </View>
  );
};

export default GraficoBarra;
