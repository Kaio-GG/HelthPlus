// Círculo com as iniciais do nome. Props: nome, tamanho, cor, corTexto
import React from 'react';
import { View, Text } from 'react-native';
import { obterIniciais } from '../../utilitarios/formatos';
import { cores } from '../../tema';
import { estilos } from './style';

const Avatar = ({ nome, tamanho = 44, cor = cores.verdeBotao, corTexto = cores.branco }) => (
  <View
    style={[
      estilos.container,
      { width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: cor },
    ]}
  >
    <Text style={[estilos.texto, { fontSize: tamanho * 0.38, color: corTexto }]}>{obterIniciais(nome)}</Text>
  </View>
);

export default Avatar;
