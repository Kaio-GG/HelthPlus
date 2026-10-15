// Campo de busca com lupa. Props: valor, aoMudar, placeholder, estilo
import React from 'react';
import { View, TextInput } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const CampoBusca = ({ valor, aoMudar, placeholder = 'Buscar', estilo }) => (
  <View style={[estilos.container, estilo]}>
    <Icone nome="lupa" tamanho={18} cor={cores.textoSecundario} />
    <TextInput
      style={estilos.entrada}
      value={valor}
      onChangeText={aoMudar}
      placeholder={placeholder}
      placeholderTextColor={cores.textoDesabilitado}
      autoCorrect={false}
    />
  </View>
);

export default CampoBusca;
