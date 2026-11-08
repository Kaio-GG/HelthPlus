// Primeiro acesso do paciente.
//
// Aparece depois de um login certo, quando falta uma destas duas coisas:
//
//   1. o ACEITE dos Termos e do tratamento dos dados de saúde, dado pela
//      própria pessoa — ou pelo pai, mãe ou responsável, se o paciente for
//      menor de idade (LGPD, Art. 11, I e Art. 14, §1º);
//   2. a TROCA da senha provisória (a data de nascimento), que qualquer
//      pessoa que conheça o paciente adivinha.
//
// Antes, o primeiro login gravava "aceito" sozinho, sem tela nenhuma. O
// texto curto abaixo é a versão em linguagem simples que a LGPD pede para
// o público infantil e adolescente (Art. 14, §6º); o texto completo fica
// em Termos.
//
// Parâmetros da rota (vindos da tela Paciente):
//   tokenPrimeiroAcesso, exigeConsentimento, exigeTrocaSenha, menorDeIdade,
//   nomeResponsavel, versaoTermos, nomePaciente
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoTexto from '../../componentes/CampoTexto';
import CaixaSelecao from '../../componentes/CaixaSelecao';
import CaixaAviso from '../../componentes/CaixaAviso';
import Botao from '../../componentes/Botao';
import RequisitosSenha from '../../componentes/RequisitosSenha';

import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { concluirPrimeiroAcesso } from '../../Api/Pacientes';
import { senhaForte } from '../../utilitarios/validacoes';
import { anunciar } from '../../utilitarios/acessibilidade';
import { estilos } from './style';

// O que o paciente precisa saber antes de aceitar, em frases curtas.
const RESUMO = [
  {
    titulo: 'O que guardamos',
    texto: 'Nome, data de nascimento, e-mail, endereço e as medidas das suas consultas (peso, altura e outras).',
  },
  {
    titulo: 'Para quê',
    texto: 'Para o seu nutricionista acompanhar o seu crescimento e a sua saúde, e para marcar consultas.',
  },
  {
    titulo: 'Quem vê',
    texto: 'Só o seu nutricionista e você. Cada acesso à sua ficha fica registrado, e você pode ver a lista no Perfil.',
  },
  {
    titulo: 'Seus direitos',
    texto: 'Pedir uma cópia, corrigir, pedir para apagar e desistir deste aceite quando quiser, pelo Perfil.',
  },
];

const PrimeiroAcessoPaciente = ({ navigation, route }) => {
  const parametros = route.params || {};
  const {
    tokenPrimeiroAcesso,
    exigeConsentimento = true,
    exigeTrocaSenha = true,
    menorDeIdade = false,
    versaoTermos,
    nomePaciente = '',
  } = parametros;

  const { entrarComoPaciente } = useDados();
  const { avisar, confirmar } = useDialogo();

  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [aceiteDadosSaude, setAceiteDadosSaude] = useState(false);
  const [declaraResponsavel, setDeclaraResponsavel] = useState(false);
  const [nomeConsentidor, setNomeConsentidor] = useState(parametros.nomeResponsavel || '');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);

  const primeiroNome = String(nomePaciente).trim().split(' ')[0] || '';

  // Chegou aqui sem token (link direto, ou a tela foi restaurada depois
  // de o app ficar em segundo plano): volta para o login.
  useEffect(() => {
    if (!tokenPrimeiroAcesso) navigation.replace('Paciente');
  }, [tokenPrimeiroAcesso, navigation]);

  if (!tokenPrimeiroAcesso) return null;

  const validar = () => {
    const novos = {};

    if (exigeConsentimento) {
      if (!aceiteTermos) novos.termos = 'Marque para continuar.';
      if (!aceiteDadosSaude) novos.dadosSaude = 'Marque para continuar.';

      if (menorDeIdade) {
        if (nomeConsentidor.trim().length < 3) novos.nome = 'Informe o nome completo do responsável.';
        if (!declaraResponsavel) novos.responsavel = 'Confirme que você é o responsável legal.';
      }
    }

    if (exigeTrocaSenha) {
      if (!senhaForte(novaSenha)) novos.senha = 'A senha ainda não atende a todos os requisitos.';
      else if (/^\d{8}$/.test(novaSenha)) novos.senha = 'A senha não pode ser uma data.';
      if (novaSenha !== confirmacao) novos.confirmacao = 'As senhas não conferem.';
    }

    setErros(novos);

    const quantidade = Object.keys(novos).length;
    if (quantidade > 0) {
      // Quem usa leitor de tela não vê os campos ficarem vermelhos.
      anunciar(`Há ${quantidade} ${quantidade === 1 ? 'item' : 'itens'} para corrigir antes de continuar.`);
    }

    return quantidade === 0;
  };

  const concluir = async () => {
    if (enviando || !validar()) return;

    setEnviando(true);

    try {
      const resposta = await concluirPrimeiroAcesso(tokenPrimeiroAcesso, {
        aceiteTermos,
        aceiteDadosSaude,
        declaraResponsavel,
        nomeConsentidor: nomeConsentidor.trim(),
        novaSenha: exigeTrocaSenha ? novaSenha : undefined,
      });

      entrarComoPaciente(resposta.paciente, resposta.token, { senhaProvisoria: false });

      navigation.reset({
        index: 0,
        routes: [{ name: 'HomePaciente', params: { paciente: resposta.paciente } }],
      });
    } catch (problema) {
      await avisar({ titulo: 'Não foi possível concluir', mensagem: problema.message, tom: 'erro' });

      if (/tempo .* acabou/i.test(problema.message)) {
        navigation.replace('Paciente');
      }
    } finally {
      setEnviando(false);
    }
  };

  const recusar = async () => {
    const sair = await confirmar({
      titulo: 'Não aceitar agora?',
      mensagem:
        'Sem o aceite você não entra no aplicativo, mas o acompanhamento com o seu nutricionista continua normalmente. ' +
        'Você pode voltar e aceitar quando quiser.',
      rotuloConfirmar: 'Sair',
      rotuloCancelar: 'Voltar',
    });

    if (sair) navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
  };

  return (
    <Tela
      titulo="Primeiro acesso"
      subtitulo={primeiroNome ? `Olá, ${primeiroNome}! Falta pouco.` : 'Falta pouco.'}
      aoVoltar={recusar}
      rodape={
        <View style={estilos.rodape}>
          <Botao
            titulo={enviando ? 'Salvando...' : 'Concluir e entrar'}
            aoPressionar={concluir}
            desabilitado={enviando}
            carregando={enviando}
          />
          <Botao titulo="Agora não" variante="suave" aoPressionar={recusar} desabilitado={enviando} />
        </View>
      }
    >
      {exigeConsentimento ? (
        <Cartao>
          <Text style={estilos.titulo} accessibilityRole="header">
            Como os seus dados são usados
          </Text>

          {RESUMO.map((item) => (
            <View key={item.titulo} style={estilos.item} accessible>
              <Text style={estilos.itemTitulo}>{item.titulo}</Text>
              <Text style={estilos.itemTexto}>{item.texto}</Text>
            </View>
          ))}

          <Text
            style={estilos.link}
            accessibilityRole="link"
            accessibilityHint="Abre o texto completo dos Termos e da Política de Privacidade"
            onPress={() => navigation.navigate('Termos', { abaInicial: 'privacidade' })}
          >
            Ler os Termos e a Política de Privacidade completos
          </Text>

          {menorDeIdade ? (
            <>
              <CaixaAviso
                tom="alerta"
                estilo={estilos.aviso}
                texto={`Como ${primeiroNome || 'o paciente'} é menor de idade, quem aceita é o pai, a mãe ou o responsável legal.`}
              />

              <CampoTexto
                rotulo="Nome completo do responsável"
                valor={nomeConsentidor}
                aoMudar={setNomeConsentidor}
                preenchimento="nome"
                capitalizar="words"
                maxCaracteres={100}
                erro={erros.nome}
              />

              <CaixaSelecao
                marcado={declaraResponsavel}
                aoAlternar={() => setDeclaraResponsavel((v) => !v)}
                rotulo={`Declaro que sou pai, mãe ou responsável legal de ${nomePaciente || 'o paciente'}.`}
                erro={erros.responsavel}
              />
            </>
          ) : null}

          <CaixaSelecao
            marcado={aceiteTermos}
            aoAlternar={() => setAceiteTermos((v) => !v)}
            rotulo={`Li e aceito os Termos de Uso e a Política de Privacidade${versaoTermos ? ` (versão ${versaoTermos})` : ''}.`}
            erro={erros.termos}
          />

          <CaixaSelecao
            marcado={aceiteDadosSaude}
            aoAlternar={() => setAceiteDadosSaude((v) => !v)}
            rotulo="Autorizo o uso dos dados de saúde (peso, altura, medidas e avaliações) para o acompanhamento nutricional."
            erro={erros.dadosSaude}
          />

          <Text style={estilos.nota}>
            Você pode desistir deste aceite a qualquer momento, em Perfil &gt; Meus dados e privacidade.
          </Text>
        </Cartao>
      ) : null}

      {exigeTrocaSenha ? (
        <Cartao>
          <Text style={estilos.titulo} accessibilityRole="header">
            Crie a sua senha
          </Text>
          <Text style={estilos.itemTexto}>
            A data de nascimento serviu só para entrar a primeira vez: ela é fácil de adivinhar. Escolha uma senha só sua.
          </Text>

          <CampoTexto
            rotulo="Nova senha"
            valor={novaSenha}
            aoMudar={setNovaSenha}
            placeholder="••••••••"
            preenchimento="senhaNova"
            senha
            erro={erros.senha}
            estilo={estilos.campoSenha}
          />

          <RequisitosSenha senha={novaSenha} />

          <CampoTexto
            rotulo="Repita a nova senha"
            valor={confirmacao}
            aoMudar={setConfirmacao}
            placeholder="••••••••"
            preenchimento="senhaNova"
            senha
            erro={erros.confirmacao}
          />
        </Cartao>
      ) : null}
    </Tela>
  );
};

export default PrimeiroAcessoPaciente;
