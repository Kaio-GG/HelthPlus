// Cartão branco com cantos arredondados e sombra suave.
// Props: estilo (estilos extras), children
import React from 'react';
import { View } from 'react-native';
import { estilos } from './style';

const Cartao = ({ estilo, children }) => <View style={[estilos.container, estilo]}>{children}</View>;

export default Cartao;
