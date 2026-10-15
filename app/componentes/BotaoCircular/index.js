// Botão redondo branco com ícone (ex.: "+" no topo das telas).
// Props: icone, aoPressionar, tamanho, cor (do ícone), fundo (do círculo), acessibilidade
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const BotaoCircular = ({
  icone = 'mais',
  aoPressionar,
  tamanho = 44,
  cor = cores.verdeBotao,
  fundo = cores.branco,
  acessibilidade,
}) => (
  <TouchableOpacity
    onPress={aoPressionar}
    activeOpacity={0.8}
    accessibilityLabel={acessibilidade}
    style={[estilos.container, { width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: fundo }]}
  >
    <Icone nome={icone} tamanho={tamanho * 0.5} cor={cor} espessura={2.5} />
  </TouchableOpacity>
);

export default BotaoCircular;
