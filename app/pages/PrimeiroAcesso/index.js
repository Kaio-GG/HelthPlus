
import React, { useState } from 'react';
import { Text, Alert } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CaixaAviso from '../../componentes/CaixaAviso';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaSelecao from '../../componentes/CaixaSelecao';
import Botao from '../../componentes/Botao';

import { ativarPrimeiroAcesso } from '../../Api/Pacientes';
import { estilos } from './style';

const PrimeiroAcesso = ({ navigation, route }) => {
  const { token, paciente } = route.params || {};

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [autorizouDados, setAutorizouDados] = useState(false);
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  const ativarConta = async () => {
    const novosErros = {};

    if (!token || !paciente?.id) {
      Alert.alert(
        'Sessão inválida',
        'Volte à tela de login e entre novamente para iniciar seu primeiro acesso.'
      );
      return;
    }

    if (senha.length < 8) {
      novosErros.senha = 'A senha precisa ter no mínimo 8 caracteres.';
    }

    if (confirmacao !== senha) {
      novosErros.confirmacao = 'As senhas não conferem.';
    }

    if (!aceitouTermos) {
      novosErros.termos =
        'Aceite os Termos de Uso e a Política de Privacidade.';
    }

    if (!autorizouDados) {
      novosErros.dados =
        'Confirme a autorização para o tratamento dos dados de saúde.';
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0 || carregando) {
      return;
    }

    try {
      setCarregando(true);

      const resultado = await ativarPrimeiroAcesso({
        token,
        senha,
        confirmarSenha: confirmacao,
        aceitouTermos,
        autorizouDados,
      });

      if (!resultado?.token) {
        throw new Error(
          'A conta foi processada, mas o servidor não retornou a sessão. Tente entrar com sua nova senha.'
        );
      }

      Alert.alert(
        'Conta ativada!',
        'Sua senha foi criada e sua conta está pronta para uso.',
        [
          {
            text: 'Ir para o login',
            onPress: () => {
              navigation.popTo('Paciente');
            },
          },
        ]
      );
    } catch (erro) {
      Alert.alert(
        'Não foi possível ativar a conta',
        erro.message || 'Tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Tela
      titulo="Primeiro acesso"
      subtitulo="Crie sua senha para ativar sua conta"
      rodape={
        <Botao
          titulo={carregando ? 'Ativando...' : 'Ativar minha conta'}
          aoPressionar={ativarConta}
          estilo={estilos.botaoPrincipal}
        />
      }
    >
      <Cartao>
        <CaixaAviso
          texto={`Olá${paciente?.nome ? `, ${paciente.nome}` : ''}! Use seu acesso fornecido pelo nutricionista para concluir a ativação.`}
        />

        <CampoTexto
          rotulo="E-mail de acesso"
          valor={paciente?.email || ''}
          somenteLeitura
        />

        <CampoTexto
          rotulo="Criar senha"
          valor={senha}
          aoMudar={setSenha}
          placeholder="Mínimo de 8 caracteres"
          senha
          erro={erros.senha}
        />

        <CampoTexto
          rotulo="Confirmar senha"
          valor={confirmacao}
          aoMudar={setConfirmacao}
          placeholder="Repita a senha"
          senha
          erro={erros.confirmacao}
        />

        <Text style={estilos.tituloSecao}>Consentimento</Text>

        <CaixaSelecao
          marcado={aceitouTermos}
          aoAlternar={() => setAceitouTermos(!aceitouTermos)}
          erro={erros.termos}
        >
          <Text style={estilos.textoCheck}>
            Li e aceito os{' '}
            <Text
              style={estilos.link}
              onPress={() => navigation.navigate('Termos')}
            >
              Termos de Uso e a Política de Privacidade.
            </Text>
          </Text>
        </CaixaSelecao>

        <CaixaSelecao
          marcado={autorizouDados}
          aoAlternar={() => setAutorizouDados(!autorizouDados)}
          rotulo="Autorizo o tratamento dos meus dados de saúde para o acompanhamento nutricional."
          erro={erros.dados}
        />

        <CaixaAviso
          texto="A autorização e o aceite serão registrados no sistema. Consulte a Política de Privacidade para entender como seus dados são utilizados."
        />
      </Cartao>
    </Tela>
  );
};

export default PrimeiroAcesso;
