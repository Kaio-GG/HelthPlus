// Barra de progresso simples. Props: valor (0 a 1), cor, estilo
import React from 'react';
import { View } from 'react-native';
import { cores } from '../../tema';
import { estilos } from './style';

// Props: rotulo (o que a barra mede, para o leitor de tela)
const BarraProgresso = ({ valor, cor = cores.verdeCabecalho, estilo, rotulo = 'Progresso' }) => {
  const percentual = Math.max(0, Math.min(1, Number(valor) || 0)) * 100;
  return (
    <View
      style={[estilos.trilho, estilo]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={rotulo}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percentual), text: `${Math.round(percentual)}%` }}
    >
      <View style={[estilos.preenchimento, { width: `${percentual}%`, backgroundColor: cor }]} />
    </View>
  );
};

export default BarraProgresso;
