// Gráfico de linha simples (ex.: evolução do peso), desenhado com SVG.
// Props:
//   pontos   lista de { rotulo, valor }
//   altura   altura do gráfico em pixels (padrão: 130)
//   cor      cor da linha

import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as TextoSvg } from 'react-native-svg';
import { cores } from '../../tema';
import { estilos } from './style';

const MARGEM_HORIZONTAL = 18;
const MARGEM_SUPERIOR = 14;
const MARGEM_INFERIOR = 24;

const GraficoLinha = ({ pontos, altura = 130, cor = cores.verdeBotao }) => {
  const [largura, setLargura] = useState(0);

  if (!pontos || pontos.length === 0) {
    return <Text style={estilos.vazio}>Sem medições para exibir.</Text>;
  }

  const valores = pontos.map((ponto) => ponto.valor);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const intervalo = maximo - minimo || 1;

  const areaLargura = Math.max(largura - MARGEM_HORIZONTAL * 2, 1);
  const areaAltura = altura - MARGEM_SUPERIOR - MARGEM_INFERIOR;

  // Converte o índice/valor de cada ponto para coordenadas na tela.
  const coordenadas = pontos.map((ponto, indice) => ({
    x:
      pontos.length === 1
        ? largura / 2
        : MARGEM_HORIZONTAL + (indice / (pontos.length - 1)) * areaLargura,
    y: MARGEM_SUPERIOR + (1 - (ponto.valor - minimo) / intervalo) * areaAltura,
    rotulo: ponto.rotulo,
  }));

  return (
    <View onLayout={(evento) => setLargura(evento.nativeEvent.layout.width)}>
      {largura > 0 && (
        <Svg width={largura} height={altura}>
          <Line
            x1={MARGEM_HORIZONTAL}
            x2={largura - MARGEM_HORIZONTAL}
            y1={altura - MARGEM_INFERIOR}
            y2={altura - MARGEM_INFERIOR}
            stroke={cores.linha}
            strokeWidth={1}
          />
          {coordenadas.length > 1 && (
            <Polyline
              points={coordenadas.map((c) => `${c.x},${c.y}`).join(' ')}
              fill="none"
              stroke={cor}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {coordenadas.map((c, indice) => (
            <React.Fragment key={indice}>
              <Circle cx={c.x} cy={c.y} r={4} fill={cor} stroke={cores.branco} strokeWidth={1.5} />
              <TextoSvg x={c.x} y={altura - 7} fontSize={11} fill={cores.textoSecundario} textAnchor="middle">
                {c.rotulo}
              </TextoSvg>
            </React.Fragment>
          ))}
        </Svg>
      )}
    </View>
  );
};

export default GraficoLinha;
