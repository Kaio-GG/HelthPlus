// Caixa de aviso com ícone de informação.
// Props: texto (ou children), tom = 'sucesso' | 'info' | 'alerta', icone, estilo
import React from 'react';
import { View, Text } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const corDoIcone = {
  sucesso: cores.verdeBotao,
  info: cores.infoTexto,
  alerta: cores.alertaTexto,
};

// Aviso de alerta é lido pelo leitor de tela assim que aparece; os outros
// são lidos na ordem normal da tela. O conjunto (ícone + texto) é um item
// só, para o TalkBack não parar no desenho.
const CaixaAviso = ({ texto, tom = 'sucesso', icone = 'info', estilo, children }) => (
  <View
    style={[estilos.container, estilos[`fundo_${tom}`], estilo]}
    accessible
    accessibilityRole={tom === 'alerta' ? 'alert' : 'text'}
    accessibilityLiveRegion={tom === 'alerta' ? 'polite' : 'none'}
  >
    <View style={estilos.icone}>
      <Icone nome={icone} tamanho={18} cor={corDoIcone[tom]} />
    </View>
    <View style={estilos.conteudo}>
      {texto ? <Text style={[estilos.texto, estilos[`texto_${tom}`]]}>{texto}</Text> : children}
    </View>
  </View>
);

export default CaixaAviso;
