// Alternador de duas ou mais opções (ex.: Entrar | Criar conta).
// Props: opcoes [{ valor, rotulo }], valor, aoMudar, estilo
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { estilos } from './style';

const Alternador = ({ opcoes, valor, aoMudar, estilo }) => (
  <View style={[estilos.container, estilo]}>
    {opcoes.map((opcao) => {
      const ativa = opcao.valor === valor;
      return (
        <TouchableOpacity
          key={opcao.valor}
          style={[estilos.opcao, ativa && estilos.opcaoAtiva]}
          onPress={() => aoMudar(opcao.valor)}
          accessibilityRole="tab"
          accessibilityState={{ selected: ativa }}
        >
          <Text style={[estilos.texto, ativa && estilos.textoAtivo]}>{opcao.rotulo}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default Alternador;
