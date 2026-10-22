// Agendamento de consulta para paciente cadastrado ou avulso.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
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
import { duracoesDisponiveis, tiposDeConsulta, horariosDisponiveis } from '../../dados/consultas';
import { cores } from '../../tema';
import { aplicarMascaraData, aplicarMascaraTelefone } from '../../utilitarios/mascaras';
import { converterDataBR, formatarDataBR, criarData } from '../../utilitarios/datas';
import { normalizarTexto } from '../../utilitarios/formatos';
import { estilos } from './style';

const NovaConsulta = ({ navigation, route }) => {
  const { pacientes, adicionarConsulta } = useDados();

  const dataInicial = route.params?.dataMs ? new Date(route.params.dataMs) : new Date();

  const [tipoPaciente, setTipoPaciente] = useState('cadastrado');
  const [busca, setBusca] = useState('');
  const [pacienteId, setPacienteId] = useState(null);
  const [nomeAvulso, setNomeAvulso] = useState('');
  const [telefoneAvulso, setTelefoneAvulso] = useState('');
  const [data, setData] = useState(formatarDataBR(dataInicial));
  const [horario, setHorario] = useState('');
  const [duracao, setDuracao] = useState('45 min');
  const [tipoConsulta, setTipoConsulta] = useState('Retorno');
  const [observacoes, setObservacoes] = useState('');
  const [notificar, setNotificar] = useState(true);
  const [erros, setErros] = useState({});

  const pacienteEscolhido = pacientes.find((item) => item.id === pacienteId) || null;

  const resultadosDaBusca = busca.trim()
    ? pacientes.filter((item) => normalizarTexto(item.nome).includes(normalizarTexto(busca))).slice(0, 4)
    : [];

  const agendar = () => {
    const novosErros = {};
    const ehAvulso = tipoPaciente === 'avulso';

    if (!ehAvulso && !pacienteEscolhido) novosErros.paciente = 'Selecione um paciente.';
    if (ehAvulso && nomeAvulso.trim().length < 3) novosErros.nome = 'Informe o nome do paciente.';
    const dataDaConsulta = converterDataBR(data);
    if (!dataDaConsulta) novosErros.data = 'Informe uma data válida.';
    if (!horario) novosErros.horario = 'Selecione o horário.';
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const [hora, minuto] = horario.split(':').map(Number);
    const inicio = criarData(
      dataDaConsulta.getFullYear(),
      dataDaConsulta.getMonth(),
      dataDaConsulta.getDate(),
      hora,
      minuto
    );

    // TODO: integrar com a API (criar consulta e enviar notificação ao paciente).
    adicionarConsulta({
      pacienteId: ehAvulso ? null : pacienteEscolhido.id,
      nome: ehAvulso ? nomeAvulso.trim() : pacienteEscolhido.nome,
      inicio,
      duracao: parseInt(duracao, 10),
      tipo: tipoConsulta,
      observacoes,
      status: 'pendente',
      avulso: ehAvulso,
    });

    Alert.alert('Consulta agendada!', 'A consulta foi adicionada à sua agenda.', [
      { text: 'OK', onPress: () => navigation.replace('Agenda') },
    ]);
  };

  return (
    <Tela
      titulo="Nova consulta"
      subtitulo="Agende um atendimento"
      rodape={
        <View style={estilos.linhaBotoes}>
          <Botao titulo="Cancelar" variante="contorno" aoPressionar={() => navigation.goBack()} estilo={estilos.botaoCancelar} />
          <Botao titulo="Agendar consulta" aoPressionar={agendar} estilo={estilos.botaoAgendar} />
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
