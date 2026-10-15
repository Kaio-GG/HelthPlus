// Faixa verde curva do topo das telas, com seta de voltar, título e subtítulo.
// Props:
//   titulo, subtitulo        textos do cabeçalho
//   aoVoltar                 função do botão de voltar (padrão: navigation.goBack)
//   mostrarVoltar            exibe a seta de voltar (padrão: true)
//   direita                  elemento exibido no canto direito (avatar, botão +)
//   filhos                   conteúdo extra embaixo do subtítulo (ex.: barra de etapas)

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const Cabecalho = ({ titulo, subtitulo, aoVoltar, mostrarVoltar = true, direita, filhos }) => {
  const navigation = useNavigation();
  const margens = useSafeAreaInsets();

  const voltar = () => {
    if (aoVoltar) aoVoltar();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={[estilos.container, { paddingTop: margens.top + 12 }]}>
      <View style={estilos.linhaSuperior}>
        {mostrarVoltar ? (
          <TouchableOpacity onPress={voltar} hitSlop={12} accessibilityLabel="Voltar">
            <Icone nome="seta-esquerda" tamanho={24} cor={cores.verdeEscuro} />
          </TouchableOpacity>
        ) : (
          <View />
        )}
        {direita ? <View>{direita}</View> : null}
      </View>

      <Text style={estilos.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
      {filhos ? <View style={estilos.filhos}>{filhos}</View> : null}
    </View>
  );
};

export default Cabecalho;
