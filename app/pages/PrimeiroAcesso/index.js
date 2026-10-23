// Primeiro acesso do paciente: cria a senha e dá o consentimento (LGPD).
import React, { useState } from 'react';
import { Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CaixaAviso from '../../componentes/CaixaAviso';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaSelecao from '../../componentes/CaixaSelecao';
import Botao from '../../componentes/Botao';
import { estilos } from './style';
import { useDialogo } from '../../contexto/DialogoContexto';

const PrimeiroAcesso = ({ navigation }) => {
  const { avisar } = useDialogo();
  // Em produção, o e-mail e o nome do nutricionista vêm do convite recebido.
  const emailDoConvite = 'maria.silva@email.com';
  const nomeDoNutricionista = 'Dr. Ayck';

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [autorizouDados, setAutorizouDados] = useState(false);
  const [erros, setErros] = useState({});

  const ativarConta = async () => {
    const novosErros = {};
    if (senha.length < 8) novosErros.senha = 'A senha precisa ter no mínimo 8 caracteres.';
    if (confirmacao !== senha) novosErros.confirmacao = 'As senhas não conferem.';
    if (!aceitouTermos) novosErros.termos = 'Aceite os Termos de Uso e a Política de Privacidade.';
    if (!autorizouDados) novosErros.dados = 'A autorização é necessária para o acompanhamento.';
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    // TODO: integrar com a API (ativar conta e registrar o consentimento).
    await avisar({
      titulo: 'Conta ativada!',
      mensagem: 'Agora você já pode entrar com seu e-mail e senha.',
      tom: 'sucesso',
    });
    navigation.popTo('Paciente');
  };

  return (
    <Tela
      titulo="Primeiro acesso"
      subtitulo="Falta pouco para ativar sua conta"
      rodape={<Botao titulo="Ativar minha conta" aoPressionar={ativarConta} />}
    >
      <Cartao>
        <CaixaAviso texto={`Você foi convidado(a) pelo nutricionista ${nomeDoNutricionista}.`} />

        <CampoTexto rotulo="E-mail de acesso" valor={emailDoConvite} somenteLeitura />
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
            <Text style={estilos.link} onPress={() => navigation.navigate('Termos')}>
              Termos de Uso e a Política de Privacidade.
            </Text>
          </Text>
        </CaixaSelecao>

        <CaixaSelecao
          marcado={autorizouDados}
          aoAlternar={() => setAutorizouDados(!autorizouDados)}
          rotulo="Autorizo meu nutricionista a tratar meus dados de saúde para o meu acompanhamento nutricional."
          erro={erros.dados}
        />

        <CaixaAviso texto="Você pode revogar a autorização a qualquer momento no perfil." />
      </Cartao>
    </Tela>
  );
};

export default PrimeiroAcesso;
