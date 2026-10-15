// Ícone vetorial simples. Uso:  <Icone nome="casa" tamanho={24} cor="#204D36" />
// Os desenhos ficam em ./icones.js. Não precisa de arquivo de estilo.

import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { cores } from '../../tema';
import { icones } from './icones';

// Converte uma forma da lista (ex.: ['linha', 1, 2, 3, 4]) em um elemento SVG.
const desenharForma = (forma, indice) => {
  const [tipo, ...parametros] = forma;
  switch (tipo) {
    case 'caminho':
      return <Path key={indice} d={parametros[0]} />;
    case 'circulo':
      return <Circle key={indice} cx={parametros[0]} cy={parametros[1]} r={parametros[2]} />;
    case 'retangulo':
      return (
        <Rect
          key={indice}
          x={parametros[0]}
          y={parametros[1]}
          width={parametros[2]}
          height={parametros[3]}
          rx={parametros[4]}
        />
      );
    case 'linha':
      return (
        <Line key={indice} x1={parametros[0]} y1={parametros[1]} x2={parametros[2]} y2={parametros[3]} />
      );
    case 'polilinha':
      return <Polyline key={indice} points={parametros[0]} />;
    default:
      return null;
  }
};

const Icone = ({ nome, tamanho = 22, cor = cores.verdeEscuro, espessura = 2 }) => {
  const formas = icones[nome] || [];
  return (
    <Svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke={cor}
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {formas.map(desenharForma)}
    </Svg>
  );
};

export default Icone;
