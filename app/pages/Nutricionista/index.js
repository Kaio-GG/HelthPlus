// Área do nutricionista: login e criação de conta na mesma tela (duas abas).
import React, { useState } from "react";
import { View, Text } from "react-native";
import Medico from "../../assets/Medico.svg";
import Tela from "../../componentes/Tela";
import Cartao from "../../componentes/Cartao";
import Alternador from "../../componentes/Alternador";
import CampoTexto from "../../componentes/CampoTexto";
import CaixaSelecao from "../../componentes/CaixaSelecao";
import RequisitosSenha from "../../componentes/RequisitosSenha";
import Botao from "../../componentes/Botao";
import { emailValido, senhaForte } from "../../utilitarios/validacoes";
import {
  loginNutricionista,
  cadastrarNutricionista,
} from "../../Api/loginCadastro.js";
import { useAuth } from "../../contexto/AuthContext";
import { useDialogo } from '../../contexto/DialogoContexto';
import { estilos } from "./style";

const Nutricionista = ({ navigation, route }) => {
  const { avisar } = useDialogo();
  const { entrarSessao } = useAuth();

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
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    if (carregando) return;

    const novosErros = {};
    if (!emailValido(email)) novosErros.email = "Informe um e-mail válido.";
    if (!senha) novosErros.senha = "Informe sua senha.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    try {
      setCarregando(true);
      const dados = await loginNutricionista(email.trim(), senha);

      // Guarda o nutricionista logado (id_profissional, nm_profissional, ...)
      // Quando a API devolver JWT: entrarSessao({ profissional: dados.profissional, token: dados.token })
      await entrarSessao({
    profissional: dados.profissional,
    token: dados.token
});
      navigation.reset({ index: 0, routes: [{ name: "HomeNutricionista" }] });
    } catch (erro) {
      avisar({ titulo: "Erro ao entrar", mensagem: erro.message, tom: "erro" });
    } finally {
      setCarregando(false);
    }
  };

  const criarConta = async () => {
    if (carregando) return;

    const novosErros = {};
    if (nome.trim().length < 3) novosErros.nome = "Informe seu nome completo.";
    else if (nome.includes("@"))
      novosErros.nome = "Aqui vai seu nome, não o e-mail.";
    if (crn.trim().length < 5)
      novosErros.crn = "Informe seu registro profissional (CRN).";
    if (!emailValido(emailCadastro))
      novosErros.email = "Informe um e-mail válido.";
    if (!senhaForte(senhaCadastro)) {
      novosErros.senha =
        "A senha ainda não atende aos requisitos listados abaixo.";
    }
    if (!aceitouTermos) novosErros.termos = "Aceite os termos para continuar.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    try {
      setCarregando(true);
      await cadastrarNutricionista(
        nome.trim(),
        crn.trim(),
        emailCadastro.trim(),
        senhaCadastro
      );

      avisar({
        titulo: "Conta criada!",
        mensagem: "Agora é só entrar com seu e-mail e senha.",
        tom: "sucesso",
      });
      setEmail(emailCadastro.trim());
      setSenha("");
      setAba("entrar");
    } catch (erro) {
      avisar({ titulo: "Erro ao cadastrar", mensagem: erro.message, tom: "erro" });
    } finally {
      setCarregando(false);
    }
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
              preenchimento="email"
              teclado="email-address"
              erro={erros.email}
            />
            <CampoTexto
              rotulo="Senha"
              valor={senha}
              aoMudar={setSenha}
              placeholder="••••••••"
              preenchimento="senhaAtual"
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
              titulo={carregando ? "Entrando..." : "Entrar"}
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
              placeholder="Ex.: Maria Silva"
              preenchimento="nome"
              capitalizar="words"
              erro={erros.nome}
            />
            <CampoTexto
              rotulo="Registro profissional (CRN)"
              valor={crn}
              aoMudar={setCrn}
              placeholder="Ex.: CRN-3 12345"
              preenchimento="nenhum"
              capitalizar="characters"
              erro={erros.crn}
            />
            <CampoTexto
              rotulo="E-mail"
              valor={emailCadastro}
              aoMudar={setEmailCadastro}
              placeholder="nome@email.com"
              preenchimento="email"
              teclado="email-address"
              erro={erros.email}
            />
            <CampoTexto
              rotulo="Senha"
              valor={senhaCadastro}
              aoMudar={setSenhaCadastro}
              placeholder="••••••••"
              preenchimento="senhaNova"
              senha
              erro={erros.senha}
            />

            <RequisitosSenha senha={senhaCadastro} />

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
              titulo={carregando ? "Criando conta..." : "Criar conta"}
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
