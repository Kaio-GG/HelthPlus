// Barra de progresso simples. Props: valor (0 a 1), cor, estilo
import React from 'react';
import { View } from 'react-native';
import { cores } from '../../tema';
import { estilos } from './style';

const BarraProgresso = ({ valor, cor = cores.verdeCabecalho, estilo }) => {
  const percentual = Math.max(0, Math.min(1, valor)) * 100;
  return (
    <View style={[estilos.trilho, estilo]}>
      <View style={[estilos.preenchimento, { width: `${percentual}%`, backgroundColor: cor }]} />
    </View>
  );
};

export default BarraProgresso;
