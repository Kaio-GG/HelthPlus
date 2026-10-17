// Área do nutricionista: login e criação de conta na mesma tela (duas abas).

import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Alternador from '../../componentes/Alternador';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaSelecao from '../../componentes/CaixaSelecao';
import Botao from '../../componentes/Botao';

import { emailValido, senhaForte } from '../../utilitarios/validacoes';
import { estilos } from './style';

// FUNÇÕES DA API
import {
  loginNutricionista,
  cadastrarNutricionista
} from '../../Api/loginCadastro.js';


const Nutricionista = ({ navigation, route }) => {

  const [aba, setAba] = useState(route.params?.abaInicial || 'entrar');

  // CAMPOS DO LOGIN
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // CAMPOS DO CADASTRO
  const [nome, setNome] = useState('');
  const [crn, setCrn] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);

  // CONTROLE DE ERROS
  const [erros, setErros] = useState({});

  // CONTROLE DE CARREGAMENTO
  const [carregando, setCarregando] = useState(false);


  // ==========================================
  // LOGIN DO NUTRICIONISTA
  // ==========================================

  const entrar = async () => {

    if (carregando) return;

    const novosErros = {};

    if (!emailValido(email.trim())) {
      novosErros.email = 'Informe um e-mail válido.';
    }

    if (!senha) {
      novosErros.senha = 'Informe sua senha.';
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) return;

    try {

      setCarregando(true);

      // CHAMANDO A FUNÇÃO DE LOGIN DA API
      const resposta = await loginNutricionista(
        email.trim(),
        senha
      );

      console.log('Login realizado com sucesso');

      // NAVEGA PARA A HOME APÓS O LOGIN
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'HomeNutricionista',
            params: {
              profissional: resposta.profissional
            }
          }
        ]
      });

    } catch (erro) {

      Alert.alert(
        'Erro ao entrar',
        erro.message || 'Não foi possível realizar o login.'
      );

    } finally {

      setCarregando(false);

    }
  };


  // ==========================================
  // CADASTRO DO NUTRICIONISTA
  // ==========================================

  const criarConta = async () => {

    if (carregando) return;

    const novosErros = {};

    if (nome.trim().length < 3) {
      novosErros.nome = 'Informe seu nome completo.';
    }

    if (crn.trim().length < 5) {
      novosErros.crn = 'Informe seu registro profissional (CRN).';
    }

    if (!emailValido(emailCadastro.trim())) {
      novosErros.email = 'Informe um e-mail válido.';
    }

    if (!senhaForte(senhaCadastro)) {
      novosErros.senha =
        'Use 8+ caracteres, com maiúscula, número e caractere especial.';
    }

    if (!aceitouTermos) {
      novosErros.termos = 'Aceite os termos para continuar.';
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) return;

    try {

      setCarregando(true);

      // CHAMANDO A FUNÇÃO DE CADASTRO DA API
      await cadastrarNutricionista(
        nome.trim(),
        crn.trim(),
        emailCadastro.trim(),
        senhaCadastro
      );

      // CADASTRO REALIZADO COM SUCESSO
      Alert.alert(
        'Conta criada!',
        'Seu cadastro foi realizado com sucesso. Agora você pode entrar.'
      );

      // PREENCHE O EMAIL NO LOGIN
      setEmail(emailCadastro.trim());

      // LIMPA A SENHA
      setSenha('');

      // LIMPA OS CAMPOS DE CADASTRO
      setNome('');
      setCrn('');
      setEmailCadastro('');
      setSenhaCadastro('');
      setAceitouTermos(false);

      // LIMPA OS ERROS
      setErros({});

      // VOLTA PARA A ABA DE LOGIN
      setAba('entrar');

    } catch (erro) {

      Alert.alert(
        'Erro no cadastro',
        erro.message || 'Não foi possível criar sua conta.'
      );

    } finally {

      setCarregando(false);

    }
  };


  // ==========================================
  // TROCAR ABA
  // ==========================================

  const trocarAba = (novaAba) => {

    if (carregando) return;

    setErros({});
    setAba(novaAba);

  };


  // ==========================================
  // INTERFACE
  // ==========================================

  return (

    <Tela
      titulo="Área do nutricionista"
      subtitulo="Entre ou crie sua conta"
    >

      <Cartao>

        <Alternador
          opcoes={[
            { valor: 'entrar', rotulo: 'Entrar' },
            { valor: 'criar', rotulo: 'Criar conta' },
          ]}
          valor={aba}
          aoMudar={trocarAba}
        />


        {aba === 'entrar' ? (

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
                onPress={() => navigation.navigate('PrimeiroAcesso')}
              >
                Primeiro acesso
              </Text>

              <Text
                style={estilos.link}
                onPress={() =>
                  navigation.navigate('EsqueciSenha', {
                    perfil: 'nutricionista'
                  })
                }
              >
                Esqueci minha senha
              </Text>

            </View>


            <Botao
              titulo={carregando ? 'Entrando...' : 'Entrar'}
              aoPressionar={entrar}
            />


            <Text style={estilos.rodapeTexto}>

              Ainda não tem conta?{' '}

              <Text
                style={estilos.link}
                onPress={() => trocarAba('criar')}
              >
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

                Li e aceito os{' '}

                <Text
                  style={estilos.link}
                  onPress={() => navigation.navigate('Termos')}
                >
                  Termos de Uso e a Política de Privacidade.
                </Text>

              </Text>

            </CaixaSelecao>


            <Botao
              titulo={carregando ? 'Cadastrando...' : 'Criar conta'}
              aoPressionar={criarConta}
            />

          </View>

        )}

      </Cartao>

    </Tela>
  );
};

export default Nutricionista;