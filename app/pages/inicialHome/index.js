import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { estilos } from "./style";
import { useAuth } from "../../contexto/AuthContext";
import Icone from "../../componentes/Icone";
import { cores } from "../../tema";
import Medico from "../../assets/Medico.svg";
import Pessoa from "../../assets/pessoa.svg";

// Seta ">" das opções (8 x 15, cor #9BBD83 no design)
const Seta = () => (
  <Svg
    accessible={false}
    importantForAccessibility="no-hide-descendants"
    width={8}
    height={15}
    viewBox="0 0 8 15"
    fill="none"
    style={estilos.seta}
  >
    <Path
      d="M1 1L7 7.5L1 14"
      stroke="#9BBD83"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Inicio = ({ navigation }) => {
  const { profissional, token, carregandoSessao } = useAuth();

  // A sessão do nutricionista fica salva no celular, mas nada levava de
  // volta a ela: o app abria sempre aqui e pedia login de novo. Agora,
  // com sessão salva, vai direto para a área dele. Se o token tiver
  // vencido, a primeira chamada à API devolve 401 e o app volta para cá.
  useEffect(() => {
    if (!carregandoSessao && profissional && token) {
      navigation.reset({ index: 0, routes: [{ name: "HomeNutricionista" }] });
    }
  }, [carregandoSessao, profissional, token, navigation]);

  if (carregandoSessao) {
    return (
      <View style={[estilos.container, estilos.carregando]}>
        <ActivityIndicator size="large" color={cores.verdeBotao} accessibilityLabel="Carregando" />
      </View>
    );
  }

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="dark-content" />

      <View style={estilos.cabecalho} />

      <SafeAreaView style={estilos.conteudo}>
        <View style={estilos.titulo}>
          <Text style={estilos.boasVindas} accessibilityRole="header">Bem-Vindo ao</Text>
          <Text style={estilos.nomeApp}>Health Plus</Text>
        </View>

        <View style={estilos.areaCartao}>
          <View style={estilos.cartao}>
            <Text style={estilos.pergunta}>
              Como você deseja usar o{"\n"}aplicativo hoje?
            </Text>

            <TouchableOpacity
              style={estilos.opcao}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Nutricionista")}
              accessibilityRole="button"
              accessibilityLabel="Sou Nutricionista"
              accessibilityHint="Organize seus pacientes e use a calculadora OMS"
            >
              <View style={estilos.circuloIcone}>
                <Medico width={28} height={28} />
              </View>

              <View style={estilos.textos}>
                <Text style={estilos.tituloOpcao}>Sou Nutricionista</Text>
                <Text style={estilos.descricao}>
                  Organize seus pacientes e use a calculadora OMS
                </Text>
              </View>

              <Seta />
            </TouchableOpacity>

            <TouchableOpacity
              style={estilos.opcao}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Paciente")}
              accessibilityRole="button"
              accessibilityLabel="Sou Paciente"
              accessibilityHint="Acompanhe sua evolução e suas consultas"
            >
              <View style={estilos.circuloIcone}>
                <Pessoa width={28} height={28} />
              </View>

              <View style={estilos.textos}>
                <Text style={estilos.tituloOpcao}>Sou Paciente</Text>
                <Text style={estilos.descricao}>
                  Acompanhe sua evolução e suas consultas
                </Text>
              </View>

              <Seta />
            </TouchableOpacity>
          </View>
        </View>

        {/* Antes do login, porque quem precisa de letra maior precisa dela
            para conseguir entrar. */}
        <TouchableOpacity
          style={estilos.botaoAcessibilidade}
          onPress={() => navigation.navigate("Acessibilidade")}
          accessibilityRole="button"
          accessibilityLabel="Acessibilidade"
          accessibilityHint="Tamanho do texto, alto contraste e animações"
          hitSlop={8}
        >
          <Icone nome="acessibilidade" tamanho={20} cor={cores.verdeEscuro} />
          <Text style={estilos.textoAcessibilidade}>Acessibilidade</Text>
        </TouchableOpacity>

        <Text style={estilos.rodape}>
          Ao continuar, você concorda com os{" "}
          <Text
            style={estilos.linkRodape}
            accessibilityRole="link"
            onPress={() => navigation.navigate("Termos", { abaInicial: "termos" })}
          >
            Termos de Uso
          </Text>{" "}
          e a{" "}
          <Text
            style={estilos.linkRodape}
            accessibilityRole="link"
            onPress={() => navigation.navigate("Termos", { abaInicial: "privacidade" })}
          >
            Política de Privacidade
          </Text>
        </Text>
      </SafeAreaView>
    </View>
  );
};

export default Inicio;
