// Estado compartilhado do aplicativo.
//
// A sessão do nutricionista vem do AuthContext; a do paciente é mantida
// aqui, separada, porque as duas podem existir ao mesmo tempo no mesmo
// celular (o nutricionista testando o aplicativo do paciente, por exemplo).
//
// O que mora aqui são os dados que mais de uma tela usa: a lista de
// pacientes, a agenda de consultas e a assinatura. Todos vêm do banco, pela
// API — nada mais é montado em memória.
//
// Os planos alimentares e os registros de água e refeições saíram daqui:
// as duas funções foram removidas do produto.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from './AuthContext';
import { listarPacientes } from '../Api/Pacientes';
import {
  listarConsultas,
  listarMinhasConsultas,
  alterarStatusConsulta as alterarStatusNaApi,
  confirmarConsulta as confirmarConsultaNaApi,
} from '../Api/consultas';
import {
  buscarAssinatura,
  assinarPlano,
  cancelarAssinatura as cancelarAssinaturaNaApi,
} from '../Api/assinatura';
import { planosIndividuais, planosClinica } from '../dados/planosAssinatura';
import { formatarDataBR } from '../utilitarios/datas';

const DadosContexto = createContext(null);

const todosOsPlanos = [...planosIndividuais, ...planosClinica];

// "12/03/2001" -> "2001-03-12". O banco devolve a data no formato ISO,
// mas um cadastro recém-feito na tela pode chegar no formato brasileiro.
const normalizarNascimento = (data) => {
  if (!data || typeof data !== 'string') return data;

  const partes = data.split('/');

  if (partes.length === 3 && partes[2].length === 4) {
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }

  return data;
};

// O banco guarda o acesso do paciente como 'pendente', 'ativo' ou
// 'sem_acesso'; as telas falam 'convite_pendente' e 'sem_convite'. A
// tradução fica aqui para os dois nomes não se espalharem pelas telas.
const normalizarStatusAcesso = (status) => {
  if (status === 'pendente') return 'convite_pendente';
  if (status === 'sem_acesso' || !status) return 'sem_convite';

  return status;
};

// Deixa o paciente vindo da API no formato que as telas esperam.
const normalizarPaciente = (paciente) => ({
  ...paciente,
  id: String(paciente.id ?? paciente.idBanco ?? ''),
  nascimento: normalizarNascimento(paciente.nascimento),
  statusAcesso: normalizarStatusAcesso(paciente.statusAcesso),
});

export const DadosProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [planoAssinaturaId, setPlanoAssinaturaId] = useState(null);
  const [cobrancas, setCobrancas] = useState([]);

  // Enquanto a API não responde, o aplicativo não sabe se existe plano:
  // as telas mostram "carregando" em vez de "você não tem plano".
  const [carregandoAssinatura, setCarregandoAssinatura] = useState(false);
  const [erroAssinatura, setErroAssinatura] = useState('');

  const [carregandoPacientes, setCarregandoPacientes] = useState(false);
  const [erroPacientes, setErroPacientes] = useState('');

  const [carregandoConsultas, setCarregandoConsultas] = useState(false);
  const [erroConsultas, setErroConsultas] = useState('');

  // Sessão do paciente, separada da sessão do nutricionista.
  const [pacienteAtualId, setPacienteAtualId] = useState(null);
  const [dadosPacienteAtual, setDadosPacienteAtual] = useState(null);
  const [tokenPaciente, setTokenPaciente] = useState(null);
  const [senhaProvisoria, setSenhaProvisoria] = useState(false);

  // O token é o que dá acesso às rotas do nutricionista na API.
  const { profissional: nutricionista, token } = useAuth();

  const planoAtual =
    todosOsPlanos.find((plano) => plano.id === planoAssinaturaId) ?? null;

  // ---------- Pacientes ----------

  // A lista vem do banco, não de uma lista montada na tela. É ela que
  // diz quanto do plano já foi usado ("2 de 10 pacientes"): enquanto
  // vivia só na memória, o contador voltava a zero a cada abertura do
  // aplicativo, mesmo com pacientes cadastrados.
  const recarregarPacientes = useCallback(async () => {
    if (!token) {
      setPacientes([]);
      setErroPacientes('');
      return [];
    }

    setCarregandoPacientes(true);
    setErroPacientes('');

    try {
      const lista = await listarPacientes(token);
      const normalizados = (lista || []).map(normalizarPaciente);

      setPacientes(normalizados);

      return normalizados;
    } catch (erro) {
      setErroPacientes(erro.message || 'Não foi possível carregar os pacientes.');

      return [];
    } finally {
      setCarregandoPacientes(false);
    }
  }, [token]);

  // Recarrega ao entrar e ao sair da conta (o token muda nos dois).
  //
  // O eslint reclama de setState dentro de efeito; aqui é o caso que a
  // regra permite: sincronizar com um sistema externo (a API). O
  // "carregando" acende antes da busca, de propósito.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregarPacientes();
  }, [recarregarPacientes]);

  // ---------- Consultas ----------

  // A agenda também vem do banco (tabela "consulta").
  //
  // Antes a consulta era gravada na API E numa lista em memória, e só a
  // lista alimentava as telas: ao fechar o aplicativo, a agenda sumia e a
  // consulta marcada não aparecia na ficha do paciente. Agora há uma fonte
  // só, e o marcar-consulta termina com um recarregarConsultas().
  //
  // Serve aos dois perfis: com token de nutricionista, traz a agenda dele;
  // com token de paciente, as consultas do paciente. Nunca os dois ao mesmo
  // tempo — o perfil que estiver na tela é o que manda.
  const recarregarConsultas = useCallback(async () => {
    if (!token && !tokenPaciente) {
      setConsultas([]);
      setErroConsultas('');
      return [];
    }

    setCarregandoConsultas(true);
    setErroConsultas('');

    try {
      const lista = token
        ? await listarConsultas(token)
        : await listarMinhasConsultas(tokenPaciente);

      setConsultas(lista || []);

      return lista || [];
    } catch (erro) {
      setErroConsultas(erro.message || 'Não foi possível carregar as consultas.');

      return [];
    } finally {
      setCarregandoConsultas(false);
    }
  }, [token, tokenPaciente]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregarConsultas();
  }, [recarregarConsultas]);

  // As consultas de um paciente, da mais próxima para a mais distante.
  // É o que a ficha do paciente mostra.
  const consultasDoPaciente = useCallback(
    (pacienteId) =>
      consultas
        .filter((consulta) => String(consulta.pacienteId) === String(pacienteId))
        .sort((a, b) => a.inicio - b.inicio),
    [consultas]
  );

  // Nutricionista muda o status (confirmada, cancelada, realizada).
  // Grava no banco e relê: assim a tela não fica mostrando um status que
  // a API recusou.
  const atualizarStatusConsulta = useCallback(
    async (idConsulta, status) => {
      if (!token) {
        throw new Error('Sua sessão expirou. Entre novamente na sua conta.');
      }

      await alterarStatusNaApi(idConsulta, status, token);
      await recarregarConsultas();
    },
    [token, recarregarConsultas]
  );

  // Paciente confirma a presença.
  const confirmarMinhaConsulta = useCallback(
    async (idConsulta) => {
      if (!tokenPaciente) {
        throw new Error('Sua sessão expirou. Entre novamente na sua conta.');
      }

      await confirmarConsultaNaApi(idConsulta, tokenPaciente);
      await recarregarConsultas();
    },
    [tokenPaciente, recarregarConsultas]
  );

  // ---------- Sessão do paciente ----------

  // Recebe os dados do paciente, o token JWT e o que a API avisou sobre a
  // senha ({ senhaProvisoria: true } quando ele entrou com a data de
  // nascimento). O token do paciente não substitui o do nutricionista.
  const entrarComoPaciente = (pacienteOuId, tokenRecebido = null, aviso = {}) => {
    if (pacienteOuId === null || pacienteOuId === undefined) {
      setPacienteAtualId(null);
      setDadosPacienteAtual(null);
      setTokenPaciente(null);
      setSenhaProvisoria(false);
      return;
    }

    const recebido = typeof pacienteOuId === 'object' ? pacienteOuId : null;
    const id = String(recebido ? recebido.id : pacienteOuId);

    if (!id || id === 'undefined' || id === 'null') {
      setPacienteAtualId(null);
      setDadosPacienteAtual(null);
      setTokenPaciente(null);
      setSenhaProvisoria(false);
      return;
    }

    setPacienteAtualId(id);
    setSenhaProvisoria(Boolean(aviso.senhaProvisoria));

    if (tokenRecebido) {
      setTokenPaciente(tokenRecebido);
    }

    if (!recebido) {
      setDadosPacienteAtual((atual) =>
        atual && String(atual.id) === id ? atual : null
      );

      return;
    }

    setDadosPacienteAtual({
      ...recebido,
      id,
      nascimento: normalizarNascimento(recebido.nascimento),
    });
  };

  const sairComoPaciente = () => {
    setPacienteAtualId(null);
    setDadosPacienteAtual(null);
    setTokenPaciente(null);
    setSenhaProvisoria(false);
    setConsultas([]);
  };

  // Depois de trocar a senha, o aviso de "senha provisória" não vale mais.
  const marcarSenhaTrocada = () => setSenhaProvisoria(false);

  const pacienteAtual =
    dadosPacienteAtual && String(dadosPacienteAtual.id) === String(pacienteAtualId)
      ? dadosPacienteAtual
      : pacientes.find(
          (paciente) => String(paciente.id) === String(pacienteAtualId)
        ) ?? null;

  // ---------- Assinatura ----------

  // Guarda o que a API devolveu sobre a assinatura. As datas das
  // cobranças chegam em ISO e a tela mostra DD/MM/AAAA.
  const aplicarAssinatura = useCallback((dados) => {
    setPlanoAssinaturaId(dados?.assinatura?.planoId ?? null);
    setCobrancas(
      (dados?.cobrancas || []).map((cobranca) => ({
        ...cobranca,
        data: formatarDataBR(cobranca.data),
      }))
    );
    setErroAssinatura('');
  }, []);

  const recarregarAssinatura = useCallback(async () => {
    if (!token) {
      setPlanoAssinaturaId(null);
      setCobrancas([]);
      setErroAssinatura('');
      return;
    }

    setCarregandoAssinatura(true);

    try {
      aplicarAssinatura(await buscarAssinatura(token));
    } catch (erro) {
      // Sem resposta da API não há como saber se existe plano. Dizer
      // "sem plano" seria chute; a tela mostra o erro e oferece
      // tentar de novo.
      setPlanoAssinaturaId(null);
      setCobrancas([]);
      setErroAssinatura(erro.message || 'Não foi possível carregar o seu plano.');
    } finally {
      setCarregandoAssinatura(false);
    }
  }, [token, aplicarAssinatura]);

  // Mesmo caso do efeito dos pacientes: a busca é o que sincroniza o
  // aplicativo com o banco ao abrir e ao trocar de conta.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregarAssinatura();
  }, [recarregarAssinatura]);

  // Grava no banco e só então muda a tela: é por isso que o plano
  // continua ativo quando a pessoa sai da conta e entra de novo.
  //
  // Lança quando a API recusa (limite de pacientes, plano sob
  // consulta, sessão expirada) para a tela poder avisar o motivo.
  const alterarPlanoAssinatura = useCallback(
    async (idPlano) => {
      if (!token) {
        throw new Error('Sua sessão expirou. Entre novamente na sua conta.');
      }

      const plano = todosOsPlanos.find((item) => item.id === idPlano);

      if (!plano) throw new Error('Plano desconhecido.');

      const dados = await assinarPlano(token, idPlano);

      aplicarAssinatura(dados);

      return dados;
    },
    [token, aplicarAssinatura]
  );

  const cancelarPlanoAssinatura = useCallback(async () => {
    if (!token) {
      throw new Error('Sua sessão expirou. Entre novamente na sua conta.');
    }

    await cancelarAssinaturaNaApi(token);

    // As cobranças de antes continuam: são histórico, não assinatura.
    setPlanoAssinaturaId(null);
  }, [token]);

  // As cobranças não são criadas aqui: quem grava é a API, no mesmo
  // pedido que assina o plano (PUT /api/assinatura). O aplicativo só
  // mostra a lista que veio de lá.

  // ---------- Contexto compartilhado ----------

  const valor = useMemo(
    () => ({
      nutricionista,
      pacientes,
      consultas,
      cobrancas,

      carregandoPacientes,
      erroPacientes,
      carregandoConsultas,
      erroConsultas,
      carregandoAssinatura,
      erroAssinatura,

      pacienteAtual,
      pacienteAtualId,
      tokenPaciente,
      senhaProvisoria,

      planoAtual,
      limitePacientes: planoAtual ? planoAtual.limitePacientes : null,

      recarregarPacientes,
      recarregarConsultas,
      consultasDoPaciente,
      atualizarStatusConsulta,
      confirmarMinhaConsulta,

      entrarComoPaciente,
      sairComoPaciente,
      marcarSenhaTrocada,

      alterarPlanoAssinatura,
      cancelarPlanoAssinatura,
      recarregarAssinatura,
    }),
    [
      nutricionista,
      pacientes,
      consultas,
      cobrancas,
      carregandoPacientes,
      erroPacientes,
      carregandoConsultas,
      erroConsultas,
      carregandoAssinatura,
      erroAssinatura,
      recarregarPacientes,
      recarregarConsultas,
      consultasDoPaciente,
      atualizarStatusConsulta,
      confirmarMinhaConsulta,
      recarregarAssinatura,
      alterarPlanoAssinatura,
      cancelarPlanoAssinatura,
      pacienteAtual,
      pacienteAtualId,
      tokenPaciente,
      senhaProvisoria,
      planoAtual,
    ]
  );

  return (
    <DadosContexto.Provider value={valor}>{children}</DadosContexto.Provider>
  );
};

export const useDados = () => {
  const contexto = useContext(DadosContexto);

  if (!contexto) {
    throw new Error('useDados deve ser usado dentro de <DadosProvider>.');
  }

  return contexto;
};
