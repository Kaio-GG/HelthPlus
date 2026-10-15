// Botão de filtro/seleção em formato de pílula.
// Props: rotulo, ativo, aoPressionar, comCheck (mostra ✓ quando ativo), estilo
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const Chip = ({ rotulo, ativo = false, aoPressionar, comCheck = false, estilo }) => (
  <TouchableOpacity
    onPress={aoPressionar}
    activeOpacity={0.8}
    style={[estilos.container, ativo && estilos.ativo, estilo]}
  >
    {ativo && comCheck ? <Icone nome="check" tamanho={14} cor={cores.verdeEscuro} espessura={3} /> : null}
    <Text style={[estilos.texto, ativo && estilos.textoAtivo, ativo && comCheck && estilos.textoComCheck]}>
      {rotulo}
    </Text>
  </TouchableOpacity>
);

export default Chip;
