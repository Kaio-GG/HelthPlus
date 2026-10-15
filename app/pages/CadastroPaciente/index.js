// Cadastro de paciente em 4 etapas:
// 1) dados pessoais  2) contato e endereço  3) dados de saúde  4) acesso ao app
import React, { useState } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import BarraEtapas from '../../componentes/BarraEtapas';
import CampoTexto from '../../componentes/CampoTexto';
import CampoSelecao from '../../componentes/CampoSelecao';
import Alternador from '../../componentes/Alternador';
import Chip from '../../componentes/Chip';
import CaixaAviso from '../../componentes/CaixaAviso';
import CaixaSelecao from '../../componentes/CaixaSelecao';
import Selo from '../../componentes/Selo';
import Botao from '../../componentes/Botao';
import { useDados } from '../../contexto/DadosContexto';
import { cores } from '../../tema';
import { emailValido } from '../../utilitarios/validacoes';
import {
  aplicarMascaraData,
  aplicarMascaraTelefone,
  aplicarMascaraCep,
  apenasDigitos,
} from '../../utilitarios/mascaras';
import { converterDataBR, calcularIdadeEmMeses } from '../../utilitarios/datas';
import { estilos } from './style';

const TOTAL_ETAPAS = 4;
const titulosDasEtapas = ['Dados pessoais', 'Contato e endereço', 'Dados de saúde', 'Acesso ao aplicativo'];

const objetivosDaConsulta = [
  'Emagrecimento',
  'Ganho de massa muscular',
  'Reeducação alimentar',
  'Controle de doenças crônicas',
  'Acompanhamento infantil',
  'Outro',
];
const opcoesDeRestricao = ['Vegetariano', 'Vegano', 'Sem lactose', 'Sem glúten', 'Low carb'];

const dadosIniciais = {
  nome: '',
  nascimento: '',
  sexo: 'F',
  responsavel: '',
  telefoneResponsavel: '',
  telefone: '',
  email: '',
  cep: '',
  numero: '',
  logradouro: '',
  cidade: '',
  objetivo: '',
  restricoes: [],
  alergias: '',
  doencas: '',
  medicamentos: '',
  enviarConvite: true,
  informouPaciente: false,
};

const CadastroPaciente = ({ navigation }) => {
  const { pacientes, limitePacientes, adicionarPaciente } = useDados();
  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState(dadosIniciais);
  const [erros, setErros] = useState({});

  const limiteAtingido = limitePacientes !== null && pacientes.length >= limitePacientes;

  const atualizar = (campo, valor) => setDados((atuais) => ({ ...atuais, [campo]: valor }));

  const alternarRestricao = (restricao) => {
    const jaMarcada = dados.restricoes.includes(restricao);
    atualizar(
      'restricoes',
      jaMarcada ? dados.restricoes.filter((item) => item !== restricao) : [...dados.restricoes, restricao]
    );
  };

  // Retorna os erros da etapa informada (objeto vazio = tudo certo).
  const validarEtapa = (numeroDaEtapa) => {
    const novosErros = {};

    if (numeroDaEtapa === 1) {
      if (dados.nome.trim().length < 3) novosErros.nome = 'Informe o nome completo.';

      const nascimento = converterDataBR(dados.nascimento);
      if (!nascimento || nascimento > new Date()) {
        novosErros.nascimento = 'Informe uma data de nascimento válida.';
      } else if (calcularIdadeEmMeses(nascimento) < 18 * 12 && dados.responsavel.trim().length < 3) {
        novosErros.responsavel = 'Obrigatório para menores de 18 anos.';
      }
    }

    if (numeroDaEtapa === 2) {
      if (!emailValido(dados.email)) novosErros.email = 'Informe um e-mail válido.';
      if (dados.cep && apenasDigitos(dados.cep).length !== 8) novosErros.cep = 'CEP incompleto.';
    }

    if (numeroDaEtapa === 3) {
      if (!dados.objetivo) novosErros.objetivo = 'Selecione o objetivo da consulta.';
    }

    if (numeroDaEtapa === 4) {
      if (!dados.informouPaciente) {
        novosErros.informou = 'Confirme que o paciente foi informado.';
      }
    }

    return novosErros;
  };

  const concluirCadastro = () => {
    // TODO: integrar com a API (POST de paciente e envio do convite por e-mail).
    adicionarPaciente({
      nome: dados.nome.trim(),
      nascimento: converterDataBR(dados.nascimento),
      sexo: dados.sexo,
      telefone: dados.telefone,
      email: dados.email.trim(),
      responsavel: dados.responsavel.trim(),
      statusAcesso: dados.enviarConvite ? 'convite_pendente' : 'sem_convite',
    });

    Alert.alert(
      'Paciente cadastrado!',
      dados.enviarConvite
        ? 'O convite foi enviado. O paciente cria a própria senha no primeiro acesso.'
        : 'Você pode enviar o convite depois, pela ficha do paciente.',
      [{ text: 'OK', onPress: () => navigation.replace('Pacientes') }]
    );
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
            <Botao titulo="Voltar" variante="contorno" aoPressionar={voltarEtapa} estilo={estilos.botaoVoltar} />
          ) : null}
          <Botao
            titulo={etapa === TOTAL_ETAPAS ? 'Concluir cadastro' : 'Continuar'}
            aoPressionar={continuar}
            desabilitado={limiteAtingido}
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
              placeholder="DD/MM/AAAA"
              teclado="number-pad"
              icone="calendario"
              erro={erros.nascimento}
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
              {menorDeIdade ? 'Obrigatório: paciente menor de 18 anos.' : 'Obrigatório para menores de 18 anos.'}
            </Text>
            <CampoTexto
              rotulo="Nome do responsável"
              valor={dados.responsavel}
              aoMudar={(texto) => atualizar('responsavel', texto)}
              placeholder="Nome completo"
              capitalizar="words"
              erro={erros.responsavel}
            />
            <CampoTexto
              rotulo="Telefone"
              valor={dados.telefoneResponsavel}
              aoMudar={(texto) => atualizar('telefoneResponsavel', aplicarMascaraTelefone(texto))}
              placeholder="(00) 00000-0000"
              teclado="phone-pad"
            />
          </View>
        )}

        {/* ---------- Etapa 2: contato e endereço ---------- */}
        {etapa === 2 && (
          <View>
            <CampoTexto
              rotulo="Telefone / WhatsApp"
              valor={dados.telefone}
              aoMudar={(texto) => atualizar('telefone', aplicarMascaraTelefone(texto))}
              placeholder="(00) 00000-0000"
              teclado="phone-pad"
            />
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

        {/* ---------- Etapa 3: dados de saúde ---------- */}
        {etapa === 3 && (
          <View>
            <CampoSelecao
              rotulo="Objetivo da consulta"
              valor={dados.objetivo}
              opcoes={objetivosDaConsulta}
              aoMudar={(valor) => atualizar('objetivo', valor)}
              placeholder="Selecione"
              erro={erros.objetivo}
            />

            <Text style={estilos.rotuloAlternador}>Restrições e preferências</Text>
            <View style={estilos.linhaChips}>
              {opcoesDeRestricao.map((restricao) => (
                <Chip
                  key={restricao}
                  rotulo={restricao}
                  comCheck
                  ativo={dados.restricoes.includes(restricao)}
                  aoPressionar={() => alternarRestricao(restricao)}
                />
              ))}
            </View>

            <CampoTexto
              rotulo="Alergias alimentares (opcional)"
              valor={dados.alergias}
              aoMudar={(texto) => atualizar('alergias', texto)}
              placeholder="Ex.: amendoim, frutos do mar"
              multilinha
            />
            <CampoTexto
              rotulo="Doenças e condições (opcional)"
              valor={dados.doencas}
              aoMudar={(texto) => atualizar('doencas', texto)}
              placeholder="Ex.: diabetes, hipertensão"
              multilinha
            />
            <CampoTexto
              rotulo="Medicamentos em uso (opcional)"
              valor={dados.medicamentos}
              aoMudar={(texto) => atualizar('medicamentos', texto)}
              placeholder="Nome e dose, se houver"
              multilinha
            />
          </View>
        )}

        {/* ---------- Etapa 4: acesso ao aplicativo ---------- */}
        {etapa === 4 && (
          <View>
            <CaixaAviso texto="O paciente entra no app com o e-mail abaixo. Para menores de 18 anos, o convite vai ao e-mail do responsável." />

            <CampoTexto rotulo="E-mail de acesso" valor={dados.email} somenteLeitura />

            <View style={estilos.linhaConvite}>
              <View style={estilos.textoConvite}>
                <Text style={estilos.tituloConvite}>Enviar convite agora</Text>
                <Text style={estilos.dicaConvite}>O paciente cria a própria senha.</Text>
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
              texto={dados.enviarConvite ? 'Convite pendente' : 'Sem convite'}
              tom={dados.enviarConvite ? 'alerta' : 'neutro'}
              estilo={estilos.seloStatus}
            />

            <CaixaSelecao
              marcado={dados.informouPaciente}
              aoAlternar={() => atualizar('informouPaciente', !dados.informouPaciente)}
              rotulo="Informei ao paciente (ou ao responsável) como os dados de saúde serão usados."
              erro={erros.informou}
            />

            <CaixaAviso texto="No primeiro acesso, o próprio paciente aceita os Termos de Uso e a Política de Privacidade (LGPD)." />
          </View>
        )}
      </Cartao>
    </Tela>
  );
};

export default CadastroPaciente;
