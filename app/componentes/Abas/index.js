// Abas de texto com sublinhado (Resumo | Avaliações | Planos | Registros).
// Props: abas [{ chave, rotulo }], ativa (chave), aoMudar
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { estilos } from './style';

const Abas = ({ abas, ativa, aoMudar }) => (
  <View style={estilos.container}>
    {abas.map((aba) => {
      const selecionada = aba.chave === ativa;
      return (
        <TouchableOpacity
          key={aba.chave}
          style={estilos.aba}
          onPress={() => aoMudar(aba.chave)}
          accessibilityRole="tab"
          accessibilityState={{ selected: selecionada }}
        >
          <Text style={[estilos.texto, selecionada && estilos.textoAtivo]}>{aba.rotulo}</Text>
          <View style={[estilos.sublinhado, selecionada && estilos.sublinhadoAtivo]} />
        </TouchableOpacity>
      );
    })}
  </View>
);

export default Abas;
