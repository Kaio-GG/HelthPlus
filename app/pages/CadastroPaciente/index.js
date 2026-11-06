// Cadastro de paciente em 3 etapas:
// 1) dados pessoais  2) e-mail e endereço  3) acesso ao aplicativo
//
// O que saiu, e por quê:
//
//   Telefone do paciente e do responsável — não eram usados em lugar
//   nenhum do aplicativo, e dado pessoal guardado sem uso é exposição de
//   graça pela LGPD. O contato é pelo aplicativo e pelo e-mail.
//
//   A etapa "dados de saúde" inteira (objetivo da consulta, restrições e
//   preferências, alergias, doenças, medicamentos) — existia para alimentar
//   os planos alimentares, que saíram do produto. Sem eles, era um
//   formulário de dados sensíveis que ninguém lia.
import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import BarraEtapas from '../../componentes/BarraEtapas';
import CampoTexto from '../../componentes/CampoTexto';
import Alternador from '../../componentes/Alternador';
import CaixaAviso from '../../componentes/CaixaAviso';
import CaixaSelecao from '../../componentes/CaixaSelecao';
import Selo from '../../componentes/Selo';
import Botao from '../../componentes/Botao';
import { useDados } from '../../contexto/DadosContexto';
import { useAuth } from '../../contexto/AuthContext';
import { cadastrarPaciente } from '../../Api/Pacientes';
import { useDialogo } from '../../contexto/DialogoContexto';
import { criarNotificacao } from '../../Api/notificacoes';
import { cores } from '../../tema';
import { emailValido } from '../../utilitarios/validacoes';
import {
  aplicarMascaraData,
  aplicarMascaraCep,
  apenasDigitos,
} from '../../utilitarios/mascaras';
import { converterDataBR, calcularIdadeEmMeses } from '../../utilitarios/datas';
import { estilos } from './style';

const TOTAL_ETAPAS = 3;
const titulosDasEtapas = ['Dados pessoais', 'E-mail e endereço', 'Acesso ao aplicativo'];

// O que dizer ao nutricionista depois de cadastrar.
//
// O caso do meio é o que importa: o acesso do paciente foi criado, mas a
// API está sem SMTP e o aviso não saiu. Dizer "e-mail enviado" aí deixaria
// o nutricionista esperando que o paciente recebesse algo.
//
// Nos três casos a senha é a mesma — a data de nascimento —, e por isso o
// nutricionista consegue liberar o acesso na própria consulta, sem depender
// do e-mail. É isso que a mensagem precisa deixar claro.
const avisoDoConvite = (enviarConvite, conviteEnviado, email) => {
  const comoEntrar =
    'O paciente entra no aplicativo com o e-mail dele e os oito números da data de nascimento como senha.';

  if (!enviarConvite) {
    return `${comoEntrar} Você pode enviar o e-mail de acesso depois, pela ficha do paciente.`;
  }

  if (conviteEnviado) {
    return `${comoEntrar} O aviso foi enviado para ${email}.`;
  }

  return (
    `${comoEntrar} O acesso foi criado, mas a API está sem SMTP configurado: ` +
    'o e-mail não chegou a sair (ele aparece no terminal da API). Preencha as ' +
    'variáveis SMTP_ do Api/.env ou passe os dados de acesso ao paciente.'
  );
};

const dadosIniciais = {
  nome: '',
  nascimento: '',
  sexo: 'F',
  responsavel: '',
  email: '',
  cep: '',
  numero: '',
  logradouro: '',
  cidade: '',
  enviarConvite: true,
  informouPaciente: false,
};

// "12/12/2000" -> "2000-12-12" (formato que o banco espera)
const dataParaISO = (dataBR) => {
  const [dia, mes, ano] = dataBR.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
};

const CadastroPaciente = ({ navigation }) => {
  const { pacientes, limitePacientes, recarregarPacientes } = useDados();
  const { profissional } = useAuth();
  const { avisar } = useDialogo();

  // Antes isto precisava desviar para o window.alert no navegador, porque o
  // Alert.alert do React Native não aparece lá. O diálogo do aplicativo é um
  // Modal comum, que funciona nos três lugares.
  const mostrarAviso = (titulo, mensagem, tom = 'alerta') =>
    avisar({ titulo, mensagem, tom });

  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState(dadosIniciais);
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  const limiteAtingido =
    limitePacientes !== null && pacientes.length >= limitePacientes;

  const atualizar = (campo, valor) =>
    setDados((atuais) => ({ ...atuais, [campo]: valor }));

  // Retorna os erros da etapa informada (objeto vazio = tudo certo).
  const validarEtapa = (numeroDaEtapa) => {
    const novosErros = {};

    if (numeroDaEtapa === 1) {
      if (dados.nome.trim().length < 3) novosErros.nome = 'Informe o nome completo.';

      const nascimento = converterDataBR(dados.nascimento);

      // A data de nascimento deixou de ser só um dado da ficha: é com ela
      // que o paciente entra no aplicativo. Uma data errada aqui é um
      // acesso que não abre.
      if (!nascimento || nascimento > new Date()) {
        novosErros.nascimento = 'Informe uma data de nascimento válida.';
      } else if (
        calcularIdadeEmMeses(nascimento) < 18 * 12 &&
        dados.responsavel.trim().length < 3
      ) {
        novosErros.responsavel = 'Obrigatório para menores de 18 anos.';
      }
    }

    if (numeroDaEtapa === 2) {
      if (!emailValido(dados.email)) novosErros.email = 'Informe um e-mail válido.';
      if (dados.cep && apenasDigitos(dados.cep).length !== 8) {
        novosErros.cep = 'CEP incompleto.';
      }
    }

    if (numeroDaEtapa === 3) {
      if (!dados.informouPaciente) {
        novosErros.informou = 'Confirme que o paciente foi informado.';
      }
    }

    return novosErros;
  };

  const concluirCadastro = async () => {
    if (carregando) return;

    if (!profissional?.id_profissional) {
      mostrarAviso(
        'Sessão expirada',
        'Entre novamente na sua conta para cadastrar pacientes.'
      );
      return;
    }

    try {
      setCarregando(true);

      const resposta = await cadastrarPaciente({
        idProfissional: profissional.id_profissional,

        // Etapa 1
        nome: dados.nome.trim(),
        dataNascimento: dataParaISO(dados.nascimento),
        sexo: dados.sexo, // "F" ou "M"
        nomeResponsavel: dados.responsavel.trim(),

        // Etapa 2
        email: dados.email.trim(),
        cep: dados.cep,
        numero: dados.numero,
        logradouro: dados.logradouro.trim(),
        cidade: dados.cidade.trim(),

        // Etapa 3
        enviarConvite: dados.enviarConvite,
        emailAcesso: dados.email.trim(),
      });

      // Relê a lista do banco: é ela que a tela inicial usa para dizer
      // quantos pacientes do plano já foram usados. Um erro aqui não
      // desfaz o cadastro, que já está gravado.
      await recarregarPacientes();

      // Fica na central de notificações. Um aviso que falha não pode
      // atrapalhar um cadastro que já deu certo, por isso o catch vazio.
      criarNotificacao({
        idProfissional: profissional.id_profissional,
        tipo: 'paciente',
        titulo: 'Paciente cadastrado',
        mensagem: dados.nome.trim() + ' entrou na sua lista de pacientes.',
        rota: 'Pacientes',
      }).catch(() => {});

      mostrarAviso(
        'Paciente cadastrado!',
        avisoDoConvite(
          dados.enviarConvite,
          resposta.conviteEnviado,
          dados.email.trim()
        ),
        'sucesso'
      );

      // Sai da tela de cadastro e vai para a lista de pacientes
      navigation.replace('Pacientes');
    } catch (erro) {
      mostrarAviso('Erro ao cadastrar', erro.message);
    } finally {
      setCarregando(false);
    }
  };

  const continuar = () => {
    const novosErros = validarEtapa(etapa);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    if (etapa < TOTAL_ETAPAS) setEtapa(etapa + 1);
    else concluirCadastro();
  };

  const voltarEtapa = () => {
    setErros({});
    if (etapa > 1) setEtapa(etapa - 1);
    else navigation.goBack();
  };

  const menorDeIdade = (() => {
    const nascimento = converterDataBR(dados.nascimento);
    return nascimento ? calcularIdadeEmMeses(nascimento) < 18 * 12 : false;
  })();

  return (
    <Tela
      titulo="Cadastro de paciente"
      subtitulo={`Etapa ${etapa} de ${TOTAL_ETAPAS} – ${titulosDasEtapas[etapa - 1]}`}
      aoVoltar={voltarEtapa}
      cabecalhoFilhos={<BarraEtapas total={TOTAL_ETAPAS} atual={etapa} />}
      rodape={
        <View style={estilos.linhaBotoes}>
          {etapa > 1 ? (
            <Botao
              titulo="Voltar"
              variante="contorno"
              aoPressionar={voltarEtapa}
              estilo={estilos.botaoVoltar}
            />
          ) : null}
          <Botao
            titulo={
              etapa === TOTAL_ETAPAS
                ? carregando
                  ? 'Salvando...'
                  : 'Concluir cadastro'
                : 'Continuar'
            }
            aoPressionar={continuar}
            desabilitado={limiteAtingido || carregando}
            estilo={estilos.botaoContinuar}
          />
        </View>
      }
    >
      {limiteAtingido ? (
        <CaixaAviso
          tom="alerta"
          icone="alerta"
          texto={`Você atingiu o limite de ${limitePacientes} pacientes do seu plano. Faça um upgrade para cadastrar mais.`}
        />
      ) : null}

      <Cartao>
        {/* ---------- Etapa 1: dados pessoais ---------- */}
        {etapa === 1 && (
          <View>
            <CampoTexto
              rotulo="Nome completo"
              valor={dados.nome}
              aoMudar={(texto) => atualizar('nome', texto)}
              placeholder="Nome do paciente"
              capitalizar="words"
              erro={erros.nome}
            />
            <CampoTexto
              rotulo="Data de nascimento"
              valor={dados.nascimento}
              aoMudar={(texto) => atualizar('nascimento', aplicarMascaraData(texto))}
              aoLimpar={() => atualizar('nascimento', '')}
              selecionarAoFocar
              maxCaracteres={10}
              placeholder="DD/MM/AAAA"
              teclado="number-pad"
              icone="calendario"
              erro={erros.nascimento}
            />

            {/* A data virou credencial de acesso, então o nutricionista
                precisa saber que ela não é só um dado da ficha. */}
            <CaixaAviso
              tom="info"
              estilo={estilos.avisoNascimento}
              texto="Confira a data: os oito números dela são a senha com que o paciente entra no aplicativo pela primeira vez."
            />

            <Text style={estilos.rotuloAlternador}>Sexo (usado nos cálculos da OMS)</Text>
            <Alternador
              opcoes={[
                { valor: 'F', rotulo: 'Feminino' },
                { valor: 'M', rotulo: 'Masculino' },
              ]}
              valor={dados.sexo}
              aoMudar={(valor) => atualizar('sexo', valor)}
            />

            <Text style={estilos.tituloSecao}>Responsável legal</Text>
            <Text style={estilos.dicaSecao}>
              {menorDeIdade
                ? 'Obrigatório: paciente menor de 18 anos.'
                : 'Obrigatório para menores de 18 anos.'}
            </Text>
            <CampoTexto
              rotulo="Nome do responsável"
              valor={dados.responsavel}
              aoMudar={(texto) => atualizar('responsavel', texto)}
              placeholder="Nome completo"
              capitalizar="words"
              erro={erros.responsavel}
            />
          </View>
        )}

        {/* ---------- Etapa 2: e-mail e endereço ---------- */}
        {etapa === 2 && (
          <View>
            <CampoTexto
              rotulo="E-mail"
              valor={dados.email}
              aoMudar={(texto) => atualizar('email', texto)}
              placeholder="nome@email.com"
              teclado="email-address"
              erro={erros.email}
            />

            <Text style={estilos.tituloSecao}>Endereço</Text>
            <View style={estilos.linhaCampos}>
              <CampoTexto
                rotulo="CEP"
                valor={dados.cep}
                aoMudar={(texto) => atualizar('cep', aplicarMascaraCep(texto))}
                placeholder="00000-000"
                teclado="number-pad"
                erro={erros.cep}
                estilo={estilos.campoMetade}
              />
              <CampoTexto
                rotulo="Número"
                valor={dados.numero}
                aoMudar={(texto) => atualizar('numero', texto)}
                placeholder="Ex.: 123"
                teclado="number-pad"
                estilo={estilos.campoMetade}
              />
            </View>
            <CampoTexto
              rotulo="Logradouro"
              valor={dados.logradouro}
              aoMudar={(texto) => atualizar('logradouro', texto)}
              placeholder="Rua, avenida..."
              capitalizar="words"
            />
            <CampoTexto
              rotulo="Cidade"
              valor={dados.cidade}
              aoMudar={(texto) => atualizar('cidade', texto)}
              placeholder="Ex.: São Paulo"
              capitalizar="words"
            />
          </View>
        )}

        {/* ---------- Etapa 3: acesso ao aplicativo ---------- */}
        {etapa === 3 && (
          <View>
            <CaixaAviso texto="O paciente entra no app com o e-mail abaixo. Para menores de 18 anos, o aviso vai ao e-mail do responsável." />

            <CampoTexto rotulo="E-mail de acesso" valor={dados.email} somenteLeitura />

            <View style={estilos.caixaSenha}>
              <Text style={estilos.tituloSenha}>Senha do primeiro acesso</Text>
              {/* A senha é mostrada EXATAMENTE como o paciente vai digitá-la:
                  só os oito números. Mostrar "12/03/2016" aqui faria o
                  nutricionista ditar a data com as barras. */}
              <Text style={estilos.valorSenha}>
                {dados.nascimento
                  ? dados.nascimento.replace(/\D/g, '')
                  : 'a data de nascimento'}
              </Text>
              <Text style={estilos.dicaSenha}>
                São os oito números da data de nascimento, sem barras. O paciente
                pode trocar a senha depois, no próprio aplicativo.
              </Text>
            </View>

            <View style={estilos.linhaConvite}>
              <View style={estilos.textoConvite}>
                <Text style={estilos.tituloConvite}>Avisar por e-mail agora</Text>
                <Text style={estilos.dicaConvite}>
                  Manda ao paciente o e-mail de acesso.
                </Text>
              </View>
              <Switch
                value={dados.enviarConvite}
                onValueChange={(valor) => atualizar('enviarConvite', valor)}
                trackColor={{ false: cores.linha, true: cores.verdeBotao }}
                thumbColor={cores.branco}
              />
            </View>

            <Text style={estilos.rotuloAlternador}>Status do acesso</Text>
            <Selo
              texto={dados.enviarConvite ? 'Acesso liberado' : 'Acesso sem aviso'}
              tom={dados.enviarConvite ? 'sucesso' : 'neutro'}
              estilo={estilos.seloStatus}
            />

            <CaixaSelecao
              marcado={dados.informouPaciente}
              aoAlternar={() => atualizar('informouPaciente', !dados.informouPaciente)}
              rotulo="Informei ao paciente (ou ao responsável) como os dados dele serão usados, e que ele tem acesso ao aplicativo."
              erro={erros.informou}
            />

            {/* Não há mais tela de primeiro acesso para o paciente aceitar
                os termos: o consentimento é registrado no banco quando ele
                entra pela primeira vez (ver Api/repository/
                pacienteRepository.js), e quem informa é o nutricionista —
                é o que esta caixa de seleção acima declara. */}
            <CaixaAviso texto="Os Termos de Uso e a Política de Privacidade (LGPD) ficam registrados em nome do paciente no primeiro acesso dele." />
          </View>
        )}
      </Cartao>
    </Tela>
  );
};

export default CadastroPaciente;
