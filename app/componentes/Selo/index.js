// Etiqueta pequena de status (ex.: "Ativo", "Pendente").
// Props: texto, tom = 'sucesso' | 'alerta' | 'neutro' | 'info' | 'erro', estilo
import React from 'react';
import { View, Text } from 'react-native';
import { estilos } from './style';

const Selo = ({ texto, tom = 'sucesso', estilo }) => (
  <View style={[estilos.container, estilos[`fundo_${tom}`], estilo]}>
    <Text style={[estilos.texto, estilos[`texto_${tom}`]]}>{texto}</Text>
  </View>
);

export default Selo;
