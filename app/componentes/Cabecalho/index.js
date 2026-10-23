// Faixa verde curva do topo das telas, com seta de voltar, título e subtítulo.
// Props:
//   titulo, subtitulo        textos do cabeçalho
//   aoVoltar                 função do botão de voltar (padrão: navigation.goBack)
//   mostrarVoltar            exibe a seta de voltar (padrão: true)
//   direita                  elemento exibido no canto direito (avatar, botão +)
//   filhos                   conteúdo extra embaixo do subtítulo (ex.: barra de etapas)
//   grande                   usa fontes maiores no título e no subtítulo (padrão: false)

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icone from "../Icone";
import { cores } from "../../tema";
import { estilos } from "./style";

const Cabecalho = ({
  titulo,
  subtitulo,
  aoVoltar,
  mostrarVoltar = true,
  direita,
  filhos,
  grande = false,
  alto = false,
}) => {
  const navigation = useNavigation();
  const margens = useSafeAreaInsets();

  const voltar = () => {
    if (aoVoltar) aoVoltar();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View
      style={[
        estilos.container,
        alto && estilos.containerAlto,
        { paddingTop: margens.top + 12 },
      ]}
    >
      <View style={estilos.linhaSuperior}>
        {mostrarVoltar ? (
          <TouchableOpacity
            style={estilos.botaoVoltar}
            onPress={voltar}
            hitSlop={8}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Icone nome="seta-esquerda" tamanho={24} cor={cores.verdeEscuro} />
          </TouchableOpacity>
        ) : (
          <View />
        )}
        {direita ? <View>{direita}</View> : null}
      </View>

      <Text style={[estilos.titulo, grande && estilos.tituloGrande]}>
        {titulo}
      </Text>
      {subtitulo ? (
        <Text style={[estilos.subtitulo, grande && estilos.subtituloGrande]}>
          {subtitulo}
        </Text>
      ) : null}
      {filhos ? <View style={estilos.filhos}>{filhos}</View> : null}
    </View>
  );
};

export default Cabecalho;
