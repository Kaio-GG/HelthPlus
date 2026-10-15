// Caixa de marcar (checkbox) com texto ao lado.
// Props: marcado, aoAlternar, rotulo (texto) OU children (texto com links), erro
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const CaixaSelecao = ({ marcado, aoAlternar, rotulo, erro, children }) => (
  <View style={estilos.container}>
    <TouchableOpacity
      style={estilos.linha}
      activeOpacity={0.8}
      onPress={aoAlternar}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcado }}
    >
      <View style={[estilos.caixa, marcado && estilos.caixaMarcada, erro ? estilos.caixaComErro : null]}>
        {marcado ? <Icone nome="check" tamanho={14} cor={cores.branco} espessura={3} /> : null}
      </View>
      <View style={estilos.texto}>
        {rotulo ? <Text style={estilos.rotulo}>{rotulo}</Text> : children}
      </View>
    </TouchableOpacity>
    {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
  </View>
);

export default CaixaSelecao;
