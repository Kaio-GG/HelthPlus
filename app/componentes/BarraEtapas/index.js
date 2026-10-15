// Barra de progresso dividida em etapas (usada no cabeçalho dos assistentes).
// Props: total (nº de etapas), atual (etapa atual, começando em 1)
import React from 'react';
import { View } from 'react-native';
import { estilos } from './style';

const BarraEtapas = ({ total, atual }) => (
  <View style={estilos.container}>
    {Array.from({ length: total }).map((_, indice) => (
      <View key={indice} style={[estilos.segmento, indice < atual && estilos.segmentoPreenchido]} />
    ))}
  </View>
);

export default BarraEtapas;
