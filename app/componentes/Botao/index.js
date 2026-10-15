// Botão do aplicativo.
// Props:
//   titulo, aoPressionar
//   variante   'primario' (padrão) | 'contorno' | 'suave' | 'perigo'
//   icone      nome de um ícone (opcional)
//   pequeno    versão compacta
//   desabilitado, estilo
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const corDoTexto = {
  primario: cores.branco,
  contorno: cores.verdeBotao,
  suave: cores.verdeEscuro,
  perigo: cores.erro,
};

const Botao = ({
  titulo,
  aoPressionar,
  variante = 'primario',
  icone,
  pequeno = false,
  desabilitado = false,
  estilo,
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={aoPressionar}
    disabled={desabilitado}
    accessibilityRole="button"
    style={[
      estilos.base,
      pequeno && estilos.pequeno,
      estilos[variante],
      desabilitado && estilos.desabilitado,
      estilo,
    ]}
  >
    <View style={estilos.conteudo}>
      {icone ? (
        <View style={estilos.icone}>
          <Icone nome={icone} tamanho={pequeno ? 16 : 18} cor={corDoTexto[variante]} />
        </View>
      ) : null}
      <Text style={[estilos.texto, pequeno && estilos.textoPequeno, { color: corDoTexto[variante] }]}>
        {titulo}
      </Text>
    </View>
  </TouchableOpacity>
);

export default Botao;
