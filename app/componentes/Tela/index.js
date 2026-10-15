// Estrutura padrão das telas: fundo creme, cabeçalho verde, área rolável que
// sobe um pouco sobre a curva do cabeçalho, rodapé fixo opcional (botões) e
// barra inferior opcional.
// Props:
//   titulo, subtitulo, aoVoltar, mostrarVoltar, direita, cabecalhoFilhos
//   rodape            elemento fixo no fim da tela (ex.: botões Voltar/Continuar)
//   abaAtiva          se informado, mostra a BarraInferior com essa aba marcada
//   rolavel           false para telas sem rolagem (padrão: true)
//   flutuante         elemento flutuante no canto inferior direito (ex.: botão +)

import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Cabecalho from '../Cabecalho';
import BarraInferior from '../BarraInferior';
import { estilos } from './style';

const Tela = ({
  titulo,
  subtitulo,
  aoVoltar,
  mostrarVoltar = true,
  direita,
  cabecalhoFilhos,
  rodape,
  abaAtiva,
  rolavel = true,
  flutuante,
  children,
}) => {
  const margens = useSafeAreaInsets();
  const comBarraInferior = Boolean(abaAtiva);

  const espacoFinal = comBarraInferior ? 110 + margens.bottom : 32;

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="dark-content" />
      <Cabecalho
        titulo={titulo}
        subtitulo={subtitulo}
        aoVoltar={aoVoltar}
        mostrarVoltar={mostrarVoltar}
        direita={direita}
        filhos={cabecalhoFilhos}
      />

      <KeyboardAvoidingView style={estilos.corpo} behavior="padding">
        {rolavel ? (
          <ScrollView
            style={estilos.rolagem}
            contentContainerStyle={[estilos.conteudo, { paddingBottom: espacoFinal }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[estilos.conteudo, estilos.semRolagem]}>{children}</View>
        )}

        {rodape ? (
          <View style={[estilos.rodape, { paddingBottom: margens.bottom + 12 }]}>{rodape}</View>
        ) : null}
      </KeyboardAvoidingView>

      {flutuante ? (
        <View style={[estilos.flutuante, { bottom: margens.bottom + 24 }]}>{flutuante}</View>
      ) : null}

      {comBarraInferior ? <BarraInferior abaAtiva={abaAtiva} /> : null}
    </View>
  );
};

export default Tela;
