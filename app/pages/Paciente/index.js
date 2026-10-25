// Área do paciente: login. O cadastro é feito pelo nutricionista.
import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import Pessoa from "../../assets/pessoa.svg";
import Tela from "../../componentes/Tela";
import Cartao from "../../componentes/Cartao";
import CampoTexto from "../../componentes/CampoTexto";
import CaixaAviso from "../../componentes/CaixaAviso";
import Botao from "../../componentes/Botao";
import { useDados } from "../../contexto/DadosContexto";
import { emailValido } from "../../utilitarios/validacoes";
import { estilos } from "./style";

const Paciente = ({ navigation }) => {
  const { pacientes, entrarComoPaciente } = useDados();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState({});

  const entrar = () => {
    const novosErros = {};
    if (!emailValido(email)) novosErros.email = "Informe um e-mail válido.";
    if (!senha) novosErros.senha = "Informe sua senha.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    // Modo de demonstração: procura o paciente cadastrado neste aparelho pelo e-mail.
    // TODO: integrar com a API (login do paciente). A senha ainda NÃO é conferida,
    // porque a API não tem rota de login do paciente (tabela usuario_paciente).
    const paciente = pacientes.find(
      (item) => (item.email || "").toLowerCase() === email.trim().toLowerCase(),
    );
    if (!paciente) {
      Alert.alert(
        "Paciente não encontrado",
        "Não há paciente cadastrado com este e-mail. Peça ao seu nutricionista para fazer o seu cadastro.",
      );
      return;
    }

    entrarComoPaciente(paciente.id);
    navigation.reset({ index: 0, routes: [{ name: "HomePaciente" }] });
  };

  return (
    <Tela
      titulo="Área do paciente"
      subtitulo="Entre para acompanhar seus registros"
      direita={
        <View style={estilos.emblema}>
          <Pessoa width={44} height={44} />
        </View>
      }
      cabecalhoRolavel
    >
      <Cartao>
        <CampoTexto
          rotulo="E-mail"
          valor={email}
          aoMudar={setEmail}
          placeholder="nome@email.com"
          teclado="email-address"
          erro={erros.email}
        />
        <CampoTexto
          rotulo="Senha"
          valor={senha}
          aoMudar={setSenha}
          placeholder="••••••••"
          senha
          erro={erros.senha}
        />

        <View style={estilos.linhaLinks}>
          <Text
            style={estilos.link}
            onPress={() => navigation.navigate("PrimeiroAcesso")}
          >
            Primeiro acesso
          </Text>
          <Text
            style={estilos.link}
            onPress={() =>
              navigation.navigate("EsqueciSenha", { perfil: "paciente" })
            }
          >
            Esqueci minha senha
          </Text>
        </View>

        <Botao
          titulo="Entrar"
          aoPressionar={entrar}
          estilo={estilos.botaoPrincipal}
        />

        <CaixaAviso
          estilo={estilos.aviso}
          texto="Ainda não tem acesso? Seu cadastro é feito pelo seu nutricionista. Peça a ele para cadastrar você no aplicativo."
        />
      </Cartao>
    </Tela>
  );
};

export default Paciente;
