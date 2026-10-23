import { useDialogo } from '../../contexto/DialogoContexto';
// Área do paciente: login. O cadastro é feito pelo nutricionista.
import React, { useState } from "react";
import { View, Text } from "react-native";
import Pessoa from "../../assets/pessoa.svg";
import Tela from "../../componentes/Tela";
import Cartao from "../../componentes/Cartao";
import CampoTexto from "../../componentes/CampoTexto";
import CaixaAviso from "../../componentes/CaixaAviso";
import Botao from "../../componentes/Botao";
import { emailValido } from "../../utilitarios/validacoes";
import { estilos } from "./style";

const Paciente = ({ navigation }) => {
  const { avisar } = useDialogo();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState({});

  const entrar = () => {
    const novosErros = {};
    if (!emailValido(email)) novosErros.email = "Informe um e-mail válido.";
    if (!senha) novosErros.senha = "Informe sua senha.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    // TODO: integrar com a API (login do paciente) e abrir a tela inicial do paciente.
    avisar({
      titulo: "Modo de demonstração",
      mensagem: "A área do paciente será conectada ao sistema em breve.",
    });
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
