// Troca de senha do paciente, de dentro do aplicativo.
//
// Pede a senha atual, como a do nutricionista: sem isso, quem pegasse o
// celular destravado trocaria a senha da conta.
//
// A senha atual pode ser a DATA DE NASCIMENTO — é com ela que o paciente
// entra pela primeira vez, e é justamente por isso que esta tela existe:
// uma data de nascimento é fácil de adivinhar, e aqui ele sai dela. Ela é
// escrita só com números (Api/servicos/senhaTemporaria.js).
//
// A tela do nutricionista é outra (AlterarSenha): a conta dele vive em
// outra tabela e tem outra rota na API.
import React, { useState } from 'react';
import { Text } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoTexto from '../../componentes/CampoTexto';
import Botao from '../../componentes/Botao';
import CaixaAviso from '../../componentes/CaixaAviso';
import RequisitosSenha from '../../componentes/RequisitosSenha';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';

import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { alterarSenhaDoPaciente } from '../../Api/Pacientes';
import { senhaForte } from '../../utilitarios/validacoes';
import { estilos } from './style';

const AlterarSenhaPaciente = ({ navigation }) => {
  const { pacienteAtual: paciente, tokenPaciente, marcarSenhaTrocada } = useDados();
  const { avisar } = useDialogo();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  if (!paciente) return <SemSessaoPaciente />;

  const salvar = async () => {
    if (salvando) return;

    if (!senhaAtual) {
      setErro('Informe a senha atual, ou a data de nascimento só com números.');
      return;
    }
    if (!senhaForte(novaSenha)) {
      setErro('A nova senha ainda não atende a todos os requisitos.');
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro('As senhas não conferem.');
      return;
    }
    if (novaSenha === senhaAtual) {
      setErro('A nova senha precisa ser diferente da atual.');
      return;
    }

    setErro('');
    setSalvando(true);

    try {
      await alterarSenhaDoPaciente(tokenPaciente, senhaAtual, novaSenha);

      // O aviso de "senha provisória" que aparece na tela inicial e no
      // perfil não vale mais.
      marcarSenhaTrocada();

      await avisar({
        titulo: 'Senha alterada',
        mensagem: 'Use a nova senha no próximo acesso.',
        tom: 'sucesso',
      });

      navigation.goBack();
    } catch (problema) {
      setErro(problema.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Tela
      titulo="Alterar senha"
      subtitulo="Escolha uma senha só sua"
      rodape={
        <Botao
          titulo={salvando ? 'Salvando...' : 'Salvar nova senha'}
          aoPressionar={salvar}
          desabilitado={salvando}
        />
      }
    >
      <Cartao>
        <CampoTexto
          rotulo="Senha atual"
          valor={senhaAtual}
          aoMudar={setSenhaAtual}
          placeholder="Senha atual ou nascimento (DDMMAAAA)"
          preenchimento="senhaAtual"
          senha
        />

        <CaixaAviso
          tom="info"
          estilo={estilos.aviso}
          texto="Nunca trocou a senha? A senha atual é a sua data de nascimento, só os números: 12032001 para quem nasceu em 12 de março de 2001."
        />

        <CampoTexto
          rotulo="Nova senha"
          valor={novaSenha}
          aoMudar={setNovaSenha}
          placeholder="••••••••"
          preenchimento="senhaNova"
          senha
        />

        <RequisitosSenha senha={novaSenha} />

        <CampoTexto
          rotulo="Repita a nova senha"
          valor={confirmacao}
          aoMudar={setConfirmacao}
          placeholder="••••••••"
          preenchimento="senhaNova"
          senha
        />

        {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
      </Cartao>
    </Tela>
  );
};

export default AlterarSenhaPaciente;
