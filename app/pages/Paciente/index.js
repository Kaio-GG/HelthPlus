// Área do paciente: login.
//
// Não há cadastro aqui, e não há mais "primeiro acesso": quem cria a conta
// do paciente é o nutricionista, e a senha com que ele entra pela primeira
// vez é a própria DATA DE NASCIMENTO. Já dentro do aplicativo, em
// Perfil > Alterar senha, ele troca por uma senha só dele se quiser.
import React, { useState } from 'react';
import { View, Text } from 'react-native';

import Logo from '../../componentes/Logo';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaAviso from '../../componentes/CaixaAviso';
import Botao from '../../componentes/Botao';

import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { emailValido } from '../../utilitarios/validacoes';
import { loginPaciente } from '../../Api/Pacientes';
import { estilos } from './style';

const Paciente = ({ navigation }) => {
  const { entrarComoPaciente } = useDados();
  const { avisar } = useDialogo();

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
      novosErros.senha = 'Informe sua senha, ou a data de nascimento só com números.';
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) return;
    if (carregando) return;

    try {
      setCarregando(true);

      // Consulta a API, que valida as credenciais no banco MySQL.
      const resultado = await loginPaciente(email, senha);

      if (!resultado?.paciente || !resultado?.token) {
        throw new Error('A API não retornou os dados necessários para o acesso.');
      }

      const paciente = resultado.paciente;

      // Registra o paciente no contexto atual do aplicativo. O
      // "senhaProvisoria" vem true quando ele entrou com a data de
      // nascimento: é o que faz o aplicativo oferecer a troca de senha.
      entrarComoPaciente(paciente, resultado.token, {
        senhaProvisoria: resultado.senhaProvisoria,
      });

      // Abre a área do paciente e repassa os dados da sessão.
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'HomePaciente',
            params: { paciente, token: resultado.token },
          },
        ],
      });
    } catch (erro) {
      avisar({
        titulo: 'Não foi possível entrar',
        mensagem:
          erro.message ||
          'Confira o e-mail e a senha. Se ainda não trocou a senha, ela é a sua data de nascimento só com números (DDMMAAAA).',
        tom: 'erro',
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Tela
      titulo="Área do paciente"
      subtitulo="Entre para acompanhar a sua evolução"
      // A marca do HealthPlus no canto, como nas outras telas. Antes era um
      // ícone genérico de pessoa dentro de um anel, que não dizia em qual
      // aplicativo a pessoa estava.
      direita={<Logo />}
      cabecalhoRolavel
    >
      <Cartao>
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
          placeholder="Senha ou nascimento (DDMMAAAA)"
          preenchimento="senhaAtual"
          senha
          erro={erros.senha}
        />

        <View style={estilos.linhaLinks}>
          <Text
            style={estilos.link}
            onPress={() => navigation.navigate('EsqueciSenha', { perfil: 'paciente' })}
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

        {/* É a primeira coisa que o paciente precisa saber nesta tela: ele
            não escolheu senha nenhuma, e sem este aviso tentaria adivinhar. */}
        <CaixaAviso
          tom="info"
          estilo={estilos.aviso}
          texto="Primeiro acesso? A senha é a sua data de nascimento, só os números: quem nasceu em 12 de março de 2001 digita 12032001. Depois dá para trocá-la no Perfil."
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
