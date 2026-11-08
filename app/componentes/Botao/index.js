// Botão do aplicativo.
// Props:
//   titulo, aoPressionar
//   variante     'primario' (padrão) | 'contorno' | 'suave' | 'perigo'
//   icone        nome de um ícone (opcional)
//   pequeno      versão compacta
//   desabilitado, estilo
//   carregando   mostra um indicador e avisa o leitor de tela que está ocupado
//   dica         frase que o leitor de tela fala depois do título, dizendo o
//                que acontece ao tocar ("Abre o calendário")
//   rotuloAcessivel  troca o que o leitor de tela fala, quando o título
//                sozinho não basta ("Excluir" -> "Excluir paciente Ana")
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
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
  carregando = false,
  dica,
  rotuloAcessivel,
  estilo,
}) => {
  const cor = corDoTexto[variante] ?? corDoTexto.primario;
  const bloqueado = desabilitado || carregando;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={aoPressionar}
      disabled={bloqueado}
      // Botão pequeno ganha área de toque extra, sem mudar o desenho.
      hitSlop={pequeno ? 8 : undefined}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel || titulo}
      accessibilityHint={dica}
      accessibilityState={{ disabled: bloqueado, busy: carregando }}
      style={[
        estilos.base,
        pequeno && estilos.pequeno,
        estilos[variante],
        desabilitado && estilos.desabilitado,
        estilo,
      ]}
    >
      <View style={estilos.conteudo}>
        {carregando ? (
          <View style={estilos.icone}>
            <ActivityIndicator size="small" color={cor} />
          </View>
        ) : icone ? (
          <View style={estilos.icone}>
            <Icone nome={icone} tamanho={pequeno ? 16 : 18} cor={cor} />
          </View>
        ) : null}
        <Text style={[estilos.texto, pequeno && estilos.textoPequeno, { color: cor }]}>{titulo}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default Botao;
