// Estrutura padrão das telas: fundo creme, cabeçalho verde, área rolável que
// sobe um pouco sobre a curva do cabeçalho, rodapé fixo opcional (botões) e
// barra inferior opcional.
// Props:
//   titulo, subtitulo, aoVoltar, mostrarVoltar, direita, cabecalhoFilhos
//   rodape            elemento fixo no fim da tela (ex.: botões Voltar/Continuar)
//   abaAtiva          se informado, mostra a BarraInferior com essa aba marcada
//   perfilBarra       'nutricionista' (padrão) ou 'paciente': define quais abas a barra mostra
//   rolavel           false para telas sem rolagem (padrão: true)
//   flutuante         elemento flutuante no canto inferior direito (ex.: botão +)
//   cabecalhoRolavel  true: o cabeçalho verde entra na rolagem e o conteúdo vira uma
//                     folha creme com cantos arredondados só em cima (padrão: false)

import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Cabecalho from "../Cabecalho";
import BarraInferior from "../BarraInferior";
import { estilos } from "./style";

const Tela = ({
  titulo,
  subtitulo,
  aoVoltar,
  mostrarVoltar = true,
  direita,
  cabecalhoFilhos,
  rodape,
  abaAtiva,
  perfilBarra,
  rolavel = true,
  flutuante,
  cabecalhoRolavel = false,
  children,
}) => {
  const margens = useSafeAreaInsets();
  const comBarraInferior = Boolean(abaAtiva);

  const espacoFinal = comBarraInferior ? 110 + margens.bottom : 32;

  // Só funciona em telas roláveis
  const cabecalhoNaRolagem = cabecalhoRolavel && rolavel;

  const cabecalho = (
    <Cabecalho
      titulo={titulo}
      subtitulo={subtitulo}
      aoVoltar={aoVoltar}
      mostrarVoltar={mostrarVoltar}
      direita={direita}
      filhos={cabecalhoFilhos}
      grande={cabecalhoNaRolagem}
    />
  );

  return (
    <View
      style={[estilos.container, cabecalhoNaRolagem && estilos.containerVerde]}
    >
      <StatusBar barStyle="dark-content" />
      {cabecalhoNaRolagem ? null : cabecalho}

      <KeyboardAvoidingView
        style={[
          estilos.corpo,
          cabecalhoNaRolagem && estilos.corpoSemSobreposicao,
        ]}
        behavior="padding"
      >
        {rolavel ? (
          <ScrollView
            style={[
              estilos.rolagem,
              cabecalhoNaRolagem && estilos.rolagemVerde,
            ]}
            contentContainerStyle={
              cabecalhoNaRolagem
                ? estilos.conteudoFolha
                : [estilos.conteudo, { paddingBottom: espacoFinal }]
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {cabecalhoNaRolagem ? (
              <>
                {cabecalho}
                <View style={[estilos.folha, { paddingBottom: espacoFinal }]}>
                  {children}
                </View>
              </>
            ) : (
              children
            )}
          </ScrollView>
        ) : (
          <View style={[estilos.conteudo, estilos.semRolagem]}>{children}</View>
        )}

        {rodape ? (
          <View
            style={[estilos.rodape, { paddingBottom: margens.bottom + 12 }]}
          >
            {rodape}
          </View>
        ) : null}
      </KeyboardAvoidingView>

      {flutuante ? (
        <View style={[estilos.flutuante, { bottom: margens.bottom + 24 }]}>
          {flutuante}
        </View>
      ) : null}

      {comBarraInferior ? <BarraInferior abaAtiva={abaAtiva} perfil={perfilBarra} /> : null}
    </View>
  );
};

export default Tela;
