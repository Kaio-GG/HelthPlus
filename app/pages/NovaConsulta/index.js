// Agendamento de consulta para paciente cadastrado ou avulso.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Alternador from '../../componentes/Alternador';
import CampoBusca from '../../componentes/CampoBusca';
import CampoTexto from '../../componentes/CampoTexto';
import CampoSelecao from '../../componentes/CampoSelecao';
import CaixaAviso from '../../componentes/CaixaAviso';
import Avatar from '../../componentes/Avatar';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';
import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { useAuth } from '../../contexto/AuthContext';
import { criarNotificacao } from '../../Api/notificacoes';
import { criarConsulta } from '../../Api/consultas';
import { duracoesDisponiveis, tiposDeConsulta, horariosDisponiveis } from '../../dados/consultas';
import { cores } from '../../tema';
import { aplicarMascaraData, aplicarMascaraTelefone } from '../../utilitarios/mascaras';
import { converterDataBR, formatarDataBR, criarData } from '../../utilitarios/datas';
import { normalizarTexto } from '../../utilitarios/formatos';
import { estilos } from './style';

// Date -> "2026-11-04" (formato que o banco espera, no horário local)
const dataParaISO = (data) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;

const NovaConsulta = ({ navigation, route }) => {
  const { avisar } = useDialogo();
  const { pacientes, recarregarConsultas } = useDados();
  const { profissional, token } = useAuth();

  const dataInicial = route.params?.dataMs ? new Date(route.params.dataMs) : new Date();

  const [tipoPaciente, setTipoPaciente] = useState('cadastrado');
  const [busca, setBusca] = useState('');

  // Chegando da ficha de um paciente, ele já vem escolhido: quem tocou em
  // "Marcar consulta" dentro da ficha do Fulano não deveria ter de
  // procurar o Fulano na busca da tela seguinte.
  const [pacienteId, setPacienteId] = useState(route.params?.pacienteId ?? null);
  const [nomeAvulso, setNomeAvulso] = useState('');
  const [telefoneAvulso, setTelefoneAvulso] = useState('');
  const [data, setData] = useState(formatarDataBR(dataInicial));
  const [horario, setHorario] = useState('');
  const [duracao, setDuracao] = useState('45 min');
  const [tipoConsulta, setTipoConsulta] = useState('Retorno');
  const [observacoes, setObservacoes] = useState('');
  const [notificar, setNotificar] = useState(true);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const pacienteEscolhido = pacientes.find((item) => item.id === pacienteId) || null;

  const resultadosDaBusca = busca.trim()
    ? pacientes.filter((item) => normalizarTexto(item.nome).includes(normalizarTexto(busca))).slice(0, 4)
    : [];

  const agendar = async () => {
    if (salvando) return;

    const novosErros = {};
    const ehAvulso = tipoPaciente === 'avulso';

    if (!ehAvulso && !pacienteEscolhido) novosErros.paciente = 'Selecione um paciente.';
    if (ehAvulso && nomeAvulso.trim().length < 3) novosErros.nome = 'Informe o nome do paciente.';
    const dataDaConsulta = converterDataBR(data);
    if (!dataDaConsulta) novosErros.data = 'Informe uma data válida.';
    if (!horario) novosErros.horario = 'Selecione o horário.';
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    if (!token) {
      avisar({
        titulo: 'Sessão expirada',
        mensagem: 'Entre novamente na sua conta para agendar consultas.',
      });
      return;
    }

    const [hora, minuto] = horario.split(':').map(Number);
    const inicio = criarData(
      dataDaConsulta.getFullYear(),
      dataDaConsulta.getMonth(),
      dataDaConsulta.getDate(),
      hora,
      minuto
    );
    const duracaoEmMinutos = parseInt(duracao, 10);

    try {
      setSalvando(true);

      await criarConsulta(
        {
          // idBanco existe nos pacientes que vieram do banco.
          idPaciente: ehAvulso ? null : pacienteEscolhido.idBanco ?? pacienteEscolhido.id,
          nomeAvulso: ehAvulso ? nomeAvulso.trim() : null,
          telefoneAvulso: ehAvulso ? telefoneAvulso : null,
          data: dataParaISO(dataDaConsulta),
          horario, // "09:30"
          duracao: duracaoEmMinutos,
          tipo: tipoConsulta,
          observacoes: observacoes.trim(),
          notificar: ehAvulso ? false : notificar,
        },
        token
      );

      // Relê a agenda do banco.
      //
      // Antes a consulta era gravada na API e TAMBÉM numa lista em
      // memória, e era a lista que alimentava as telas: a consulta
      // marcada desaparecia ao fechar o aplicativo e nunca aparecia na
      // ficha do paciente. Agora existe uma fonte só — a tabela
      // "consulta" —, e é dela que a agenda e a ficha leem.
      await recarregarConsultas();

      // Aviso na central de notificações. Um aviso que falha não pode
      // atrapalhar uma consulta que já foi agendada, por isso o catch vazio.
      if (profissional?.id_profissional) {
        criarNotificacao({
          tipo: 'consulta',
          titulo: 'Consulta agendada',
          mensagem:
            (ehAvulso ? nomeAvulso.trim() : pacienteEscolhido.nome) +
            ' em ' +
            formatarDataBR(inicio) +
            ' às ' +
            horario,
          rota: 'Agenda',
        }, token).catch(() => {});
      }

      await avisar({
        titulo: 'Consulta agendada!',
        mensagem: 'A consulta foi adicionada à sua agenda.',
        tom: 'sucesso',
      });
      navigation.replace('Agenda');
    } catch (erro) {
      console.log('[NovaConsulta] ERRO:', erro);
      avisar({ titulo: 'Não foi possível agendar', mensagem: erro.message });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Tela
      titulo="Nova consulta"
      subtitulo="Agende um atendimento"
      rodape={
        <View style={estilos.linhaBotoes}>
          <Botao titulo="Cancelar" variante="contorno" aoPressionar={() => navigation.goBack()} estilo={estilos.botaoCancelar} />
          <Botao
            titulo={salvando ? 'Agendando...' : 'Agendar consulta'}
            aoPressionar={agendar}
            desabilitado={salvando}
            estilo={estilos.botaoAgendar}
          />
        </View>
      }
    >
      <Cartao>
        <Text style={estilos.rotulo}>Paciente</Text>
        <Alternador
          opcoes={[
            { valor: 'cadastrado', rotulo: 'Cadastrado' },
            { valor: 'avulso', rotulo: 'Avulso' },
          ]}
          valor={tipoPaciente}
          aoMudar={(valor) => {
            setErros({});
            setTipoPaciente(valor);
          }}
        />

        {tipoPaciente === 'cadastrado' ? (
          <View>
            <Text style={estilos.rotulo}>Buscar paciente</Text>
            <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Nome do paciente" />
            {resultadosDaBusca.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={estilos.itemBusca}
                onPress={() => {
                  setPacienteId(item.id);
                  setBusca('');
                }}
              >
                <Avatar nome={item.nome} tamanho={34} />
                <Text style={estilos.nomeBusca}>{item.nome}</Text>
              </TouchableOpacity>
            ))}
            {pacienteEscolhido ? (
              <View style={estilos.pacienteSelecionado}>
                <Avatar nome={pacienteEscolhido.nome} tamanho={36} />
                <Text style={estilos.nomeSelecionado}>{pacienteEscolhido.nome}</Text>
                <Icone nome="check" tamanho={18} cor={cores.verdeBotao} espessura={3} />
              </View>
            ) : null}
            {erros.paciente ? <Text style={estilos.erro}>{erros.paciente}</Text> : null}
          </View>
        ) : (
          <View>
            <CampoTexto
              rotulo="Nome do paciente"
              valor={nomeAvulso}
              aoMudar={setNomeAvulso}
              placeholder="Nome completo"
              capitalizar="words"
              erro={erros.nome}
            />
            <CampoTexto
              rotulo="Telefone"
              valor={telefoneAvulso}
              aoMudar={(texto) => setTelefoneAvulso(aplicarMascaraTelefone(texto))}
              placeholder="(00) 00000-0000"
              teclado="phone-pad"
            />
            <CaixaAviso texto="Paciente avulso não tem acesso ao app nem recebe notificações. Você pode cadastrá-lo depois." />
          </View>
        )}

        <View style={estilos.linhaCampos}>
          <CampoTexto
            rotulo="Data"
            valor={data}
            aoMudar={(texto) => setData(aplicarMascaraData(texto))}
            aoLimpar={() => setData('')}
            selecionarAoFocar
            maxCaracteres={10}
            placeholder="DD/MM/AAAA"
            teclado="number-pad"
            icone="calendario"
            erro={erros.data}
            estilo={estilos.campoMetade}
          />
          <CampoSelecao
            rotulo="Horário"
            valor={horario}
            opcoes={horariosDisponiveis}
            aoMudar={setHorario}
            placeholder="00:00"
            erro={erros.horario}
            estilo={estilos.campoMetade}
          />
        </View>

        <View style={estilos.linhaCampos}>
          <CampoSelecao
            rotulo="Duração"
            valor={duracao}
            opcoes={duracoesDisponiveis}
            aoMudar={setDuracao}
            estilo={estilos.campoMetade}
          />
          <CampoSelecao
            rotulo="Tipo"
            valor={tipoConsulta}
            opcoes={tiposDeConsulta}
            aoMudar={setTipoConsulta}
            estilo={estilos.campoMetade}
          />
        </View>

        <CampoTexto
          rotulo="Observações (opcional)"
          valor={observacoes}
          aoMudar={setObservacoes}
          placeholder="Ex.: trazer exames recentes"
          multilinha
        />

        {tipoPaciente === 'cadastrado' ? (
          <View style={estilos.linhaNotificar}>
            <View style={estilos.textosNotificar}>
              <Text style={estilos.tituloNotificar}>Notificar o paciente</Text>
              <Text style={estilos.dicaNotificar}>Lembrete por notificação no app.</Text>
            </View>
            <Switch
              value={notificar}
              onValueChange={setNotificar}
              trackColor={{ false: cores.linha, true: cores.verdeBotao }}
              thumbColor={cores.branco}
            />
          </View>
        ) : null}
      </Cartao>
    </Tela>
  );
};

export default NovaConsulta;