
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';

import Pessoa from '../../assets/pessoa.svg';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaAviso from '../../componentes/CaixaAviso';
import Botao from '../../componentes/Botao';

import { useDados } from '../../contexto/DadosContexto';
import { emailValido } from '../../utilitarios/validacoes';
import { loginPaciente } from '../../Api/Pacientes';
import { estilos } from './style';

const Paciente = ({ navigation }) => {
  const { entrarComoPaciente } = useDados();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    const novosErros = {};

    if (!emailValido(email)) {
      novosErros.email = 'Informe um e-mail válido.';
    }

    if (!senha) {
      novosErros.senha = 'Informe sua senha.';
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    if (carregando) return;

    try {
      setCarregando(true);

      // Consulta a API, que valida as credenciais no banco MySQL.
      const resultado = await loginPaciente(email, senha);

      if (!resultado?.paciente || !resultado?.token) {
        throw new Error('A API não retornou os dados necessários para o acesso.');
      }

      const paciente = resultado.paciente;

      // Contas pendentes precisam concluir a ativação primeiro.
      if (resultado.primeiroAcesso) {
        navigation.navigate('PrimeiroAcesso', {
          token: resultado.token,
          paciente,
        });

        return;
      }

      // Registra o paciente no contexto atual do aplicativo.
      entrarComoPaciente(paciente, resultado.token);

      // Abre a área do paciente e repassa os dados da sessão.
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'HomePaciente',
            params: {
              paciente,
              token: resultado.token,
            },
          },
        ],
      });
    } catch (erro) {
      Alert.alert(
        'Não foi possível entrar',
        erro.message ||
          'Verifique seu e-mail e sua senha e tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
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
            onPress={() => navigation.navigate('PrimeiroAcesso')}
          >
            Primeiro acesso
          </Text>

          <Text
            style={estilos.link}
            onPress={() =>
              navigation.navigate('EsqueciSenha', {
                perfil: 'paciente',
              })
            }
          >
            Esqueci minha senha
          </Text>
        </View>

        <Botao
          titulo={carregando ? 'Entrando...' : 'Entrar'}
          aoPressionar={entrar}
          estilo={estilos.botaoPrincipal}
          desabilitado={carregando}
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
