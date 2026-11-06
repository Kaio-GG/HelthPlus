// Estrutura padrão das telas: fundo creme, cabeçalho verde, área rolável que
// sobe um pouco sobre a curva do cabeçalho, rodapé fixo opcional (botões) e
// barra inferior opcional.
// Props:
//   titulo, subtitulo, aoVoltar, mostrarVoltar, esquerda, direita, cabecalhoFilhos
//   esquerda          canto esquerdo do cabeçalho nas telas sem botão de
//                     voltar (ex.: o sino de notificações da Home)
//   rodape            elemento fixo no fim da tela (ex.: botões Voltar/Continuar)
//   abaAtiva          se informado, mostra a BarraInferior com essa aba marcada
//   perfilBarra       'nutricionista' (padrão) ou 'paciente': define quais abas a barra mostra
//   rolavel           false para telas sem rolagem (padrão: true)
//   centralizar       centraliza o conteúdo na altura da tela quando ele cabe
//                     inteiro. Serve para telas de escolha, com poucos cartões.
//                     NÃO use em tela de lista: a lista cresce e o bloco
//                     centralizado fica pulando de lugar a cada item novo.
//   cabecalhoAlto     dá mais altura à faixa verde. Combina com centralizar:
//                     sem isso o título fica sozinho lá em cima, longe do
//                     conteúdo que desceu para o meio.
//   aoAtualizar       função do "puxar para atualizar" (só em telas roláveis)
//   atualizando       true enquanto essa função está buscando os dados
//   flutuante         elemento flutuante no canto inferior direito (ex.: botão +)
//   cabecalhoRolavel  true: o cabeçalho verde entra na rolagem e o conteúdo vira uma
//                     folha creme com cantos arredondados só em cima (padrão: false)

import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Cabecalho from "../Cabecalho";
import BarraInferior from "../BarraInferior";
import { cores } from "../../tema";
import { estilos } from "./style";

const Tela = ({
  titulo,
  subtitulo,
  aoVoltar,
  mostrarVoltar = true,
  esquerda,
  direita,
  cabecalhoFilhos,
  rodape,
  abaAtiva,
  perfilBarra,
  rolavel = true,
  centralizar = false,
  cabecalhoAlto = false,
  aoAtualizar,
  atualizando = false,
  flutuante,
  cabecalhoRolavel = false,
  children,
}) => {
  const margens = useSafeAreaInsets();
  const comBarraInferior = Boolean(abaAtiva);

  // Quanto respiro sobra depois do último elemento da tela.
  //
  // A barra inferior é "position: absolute", então ela fica POR CIMA do
  // conteúdo: a rolagem precisa reservar a altura dela, senão o último
  // cartão some atrás da barra.
  //
  // E, com barra ou sem, entra a margem de segurança do sistema
  // (margens.bottom): é a faixa do gesto de voltar do celular, onde nada
  // deve ficar. Ela só era somada no caso COM barra — era por isso que o
  // último botão de uma tela sem barra (o "Apagar paciente" da ficha, por
  // exemplo) encostava na beirada e parecia cortado.
  //
  // O rodapé fixo não entra na conta: ele é irmão da rolagem na coluna, e
  // já cuida da própria margem de segurança.
  const ALTURA_DA_BARRA_INFERIOR = 110;
  const RESPIRO_FINAL = 40;

  const espacoFinal =
    (comBarraInferior ? ALTURA_DA_BARRA_INFERIOR : RESPIRO_FINAL) + margens.bottom;

  // Só funciona em telas roláveis
  const cabecalhoNaRolagem = cabecalhoRolavel && rolavel;

  const cabecalho = (
    <Cabecalho
      titulo={titulo}
      subtitulo={subtitulo}
      aoVoltar={aoVoltar}
      mostrarVoltar={mostrarVoltar}
      esquerda={esquerda}
      direita={direita}
      filhos={cabecalhoFilhos}
      grande={cabecalhoNaRolagem || cabecalhoAlto}
      alto={cabecalhoAlto}
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
                : [
                    estilos.conteudo,
                    centralizar && estilos.conteudoCentralizado,
                    { paddingBottom: espacoFinal },
                  ]
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              aoAtualizar ? (
                <RefreshControl
                  refreshing={atualizando}
                  onRefresh={aoAtualizar}
                  tintColor={cores.verdeBotao}
                  colors={[cores.verdeBotao]}
                />
              ) : undefined
            }
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
