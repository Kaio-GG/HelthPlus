// Área do nutricionista: login e criação de conta na mesma tela (duas abas).
import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import Medico from "../../assets/Medico.svg";
import Tela from "../../componentes/Tela";
import Cartao from "../../componentes/Cartao";
import Alternador from "../../componentes/Alternador";
import CampoTexto from "../../componentes/CampoTexto";
import CaixaSelecao from "../../componentes/CaixaSelecao";
import Botao from "../../componentes/Botao";
import { emailValido, senhaForte } from "../../utilitarios/validacoes";
import { estilos } from "./style";

const Nutricionista = ({ navigation, route }) => {
  const [aba, setAba] = useState(route.params?.abaInicial || "entrar");

  // Campos do login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Campos do cadastro
  const [nome, setNome] = useState("");
  const [crn, setCrn] = useState("");
  const [emailCadastro, setEmailCadastro] = useState("");
  const [senhaCadastro, setSenhaCadastro] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [erros, setErros] = useState({});

  const entrar = () => {
    const novosErros = {};
    if (!emailValido(email)) novosErros.email = "Informe um e-mail válido.";
    if (!senha) novosErros.senha = "Informe sua senha.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    // TODO: integrar com a API (login do nutricionista).
    // Por enquanto, entra em modo de demonstração.
    navigation.reset({ index: 0, routes: [{ name: "HomeNutricionista" }] });
  };

  const criarConta = () => {
    const novosErros = {};
    if (nome.trim().length < 3) novosErros.nome = "Informe seu nome completo.";
    if (crn.trim().length < 5)
      novosErros.crn = "Informe seu registro profissional (CRN).";
    if (!emailValido(emailCadastro))
      novosErros.email = "Informe um e-mail válido.";
    if (!senhaForte(senhaCadastro)) {
      novosErros.senha =
        "Use 8+ caracteres, com maiúscula, número e caractere especial.";
    }
    if (!aceitouTermos) novosErros.termos = "Aceite os termos para continuar.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    // TODO: integrar com a API (cadastro do nutricionista).
    Alert.alert("Conta criada!", "Agora é só entrar com seu e-mail e senha.");
    setEmail(emailCadastro);
    setSenha("");
    setAba("entrar");
  };

  const trocarAba = (novaAba) => {
    setErros({});
    setAba(novaAba);
  };

  return (
    <Tela
      titulo="Área do nutricionista"
      subtitulo="Entre ou crie sua conta"
      direita={
        <View style={estilos.emblema}>
          <Medico width={44} height={44} />
        </View>
      }
      cabecalhoRolavel
    >
      <Cartao>
        <Alternador
          opcoes={[
            { valor: "entrar", rotulo: "Entrar" },
            { valor: "criar", rotulo: "Criar conta" },
          ]}
          valor={aba}
          aoMudar={trocarAba}
        />

        {aba === "entrar" ? (
          <View>
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
                  navigation.navigate("EsqueciSenha", {
                    perfil: "nutricionista",
                  })
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

            <Text style={estilos.rodapeTexto}>
              Ainda não tem conta?{" "}
              <Text style={estilos.link} onPress={() => trocarAba("criar")}>
                Criar conta
              </Text>
            </Text>
          </View>
        ) : (
          <View>
            <CampoTexto
              rotulo="Nome completo"
              valor={nome}
              aoMudar={setNome}
              placeholder="Seu nome"
              capitalizar="words"
              erro={erros.nome}
            />
            <CampoTexto
              rotulo="Registro profissional (CRN)"
              valor={crn}
              aoMudar={setCrn}
              placeholder="Ex.: CRN-3 12345"
              capitalizar="characters"
              erro={erros.crn}
            />
            <CampoTexto
              rotulo="E-mail"
              valor={emailCadastro}
              aoMudar={setEmailCadastro}
              placeholder="nome@email.com"
              teclado="email-address"
              erro={erros.email}
            />
            <CampoTexto
              rotulo="Senha"
              valor={senhaCadastro}
              aoMudar={setSenhaCadastro}
              placeholder="••••••••"
              senha
              erro={erros.senha}
            />

            <CaixaSelecao
              marcado={aceitouTermos}
              aoAlternar={() => setAceitouTermos(!aceitouTermos)}
              erro={erros.termos}
            >
              <Text style={estilos.textoTermos}>
                Li e aceito os{" "}
                <Text
                  style={estilos.link}
                  onPress={() => navigation.navigate("Termos")}
                >
                  Termos de Uso e a Política de Privacidade.
                </Text>
              </Text>
            </CaixaSelecao>

            <Botao
              titulo="Criar conta"
              aoPressionar={criarConta}
              estilo={estilos.botaoPrincipal}
            />
          </View>
        )}
      </Cartao>
    </Tela>
  );
};

export default Nutricionista;
