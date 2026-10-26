
 // Estado compartilhado do aplicativo.
 // A sessão do nutricionista vem do AuthContext.
 // A sessão do paciente é mantida separadamente.

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useAuth } from './AuthContext';
import {
  planosIndividuais,
  planosClinica,
} from '../dados/planosAssinatura';
import { META_AGUA_PADRAO_LITROS } from '../dados/registros';
import { nomesDasRefeicoes } from '../dados/alimentosTaco';
import { chaveDoDia, formatarHora } from '../utilitarios/datas';

const DadosContexto = createContext(null);

const todosOsPlanos = [
  ...planosIndividuais,
  ...planosClinica,
];

export const DadosProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [planosAlimentares, setPlanosAlimentares] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [planoAssinaturaId, setPlanoAssinaturaId] = useState(null);
  const [cobrancas, setCobrancas] = useState([]);

  // Registros em memória: "<idPaciente>|<dia>".
  const [registros, setRegistros] = useState({});

  // Sessão do paciente, separada da sessão do nutricionista.
  const [pacienteAtualId, setPacienteAtualId] = useState(null);
  const [dadosPacienteAtual, setDadosPacienteAtual] = useState(null);
  const [tokenPaciente, setTokenPaciente] = useState(null);

  const { profissional: nutricionista } = useAuth();

  const planoAtual =
    todosOsPlanos.find(
      (plano) => plano.id === planoAssinaturaId
    ) ?? null;

  // ---------- Pacientes ----------

  const adicionarPaciente = (dados) => {
    const novo = {
      ...dados,
      id: String(Date.now()),
      historicoPeso: [],
      ultimaConsulta: null,
    };

    setPacientes((atuais) => [...atuais, novo]);

    return novo;
  };

  // ---------- Consultas ----------

  const adicionarConsulta = (dados) => {
    const nova = {
      ...dados,
      id: `c${Date.now()}`,
    };

    setConsultas((atuais) => [...atuais, nova]);

    return nova;
  };

  const atualizarStatusConsulta = (id, status) => {
    setConsultas((atuais) =>
      atuais.map((consulta) =>
        consulta.id === id
          ? { ...consulta, status }
          : consulta
      )
    );
  };

  // ---------- Planos alimentares ----------

  const salvarPlanoAlimentar = (plano) => {
    const existe = planosAlimentares.some(
      (atual) => atual.id === plano.id
    );

    if (existe) {
      setPlanosAlimentares((atuais) =>
        atuais.map((atual) =>
          atual.id === plano.id ? plano : atual
        )
      );

      return plano;
    }

    const novo = {
      ...plano,
      id: `pl${Date.now()}`,
    };

    setPlanosAlimentares((atuais) => [
      novo,
      ...atuais,
    ]);

    return novo;
  };

  const duplicarPlanoAlimentar = (id) => {
    const original = planosAlimentares.find(
      (plano) => plano.id === id
    );

    if (!original) return;

    const copia = {
      ...original,
      id: `pl${Date.now()}`,
      nome: `${original.nome} (cópia)`,
      status: 'ativo',
    };

    setPlanosAlimentares((atuais) => [
      copia,
      ...atuais,
    ]);
  };

  const alternarArquivamentoPlano = (id) => {
    setPlanosAlimentares((atuais) =>
      atuais.map((plano) =>
        plano.id === id
          ? {
              ...plano,
              status:
                plano.status === 'ativo'
                  ? 'arquivado'
                  : 'ativo',
            }
          : plano
      )
    );
  };

  // ---------- Avaliações ----------

  const salvarAvaliacao = (avaliacao) => {
    const nova = {
      ...avaliacao,
      id: `av${Date.now()}`,
    };

    setAvaliacoes((atuais) => [
      nova,
      ...atuais,
    ]);

    return nova;
  };

  // ---------- Registros de água e refeições ----------

  const chaveDoRegistro = (pacienteId, dia) =>
    `${pacienteId}|${chaveDoDia(dia)}`;

  const montarRegistrosDoDia = (pacienteId, dia) => {
    const registro =
      registros[chaveDoRegistro(pacienteId, dia)] ?? {
        aguaLitros: 0,
        refeicoes: {},
      };

    const plano = planosAlimentares.find(
      (item) =>
        String(item.pacienteId) === String(pacienteId) &&
        item.status === 'ativo'
    );

    const nomesEsperados = plano?.refeicoes?.length
      ? plano.refeicoes.map((item) => item.nome)
      : nomesDasRefeicoes;

    const nomes = [
      ...nomesEsperados,
      ...Object.keys(registro.refeicoes).filter(
        (nome) => !nomesEsperados.includes(nome)
      ),
    ];

    return {
      aguaLitros: registro.aguaLitros,
      metaAguaLitros:
        plano?.metaAguaLitros ||
        META_AGUA_PADRAO_LITROS,
      refeicoes: nomes.map((nome) => ({
        nome,
        horario:
          registro.refeicoes[nome]?.horario ?? null,
        descricao:
          registro.refeicoes[nome]?.descricao ?? null,
      })),
    };
  };

  const obterRegistrosDoDia = (pacienteId, dia) =>
    registros[chaveDoRegistro(pacienteId, dia)]
      ? montarRegistrosDoDia(pacienteId, dia)
      : null;

  const registrarAgua = (pacienteId, mililitros) => {
    const chave = chaveDoRegistro(
      pacienteId,
      new Date()
    );

    setRegistros((atuais) => {
      const anterior = atuais[chave] ?? {
        aguaLitros: 0,
        refeicoes: {},
      };

      const total =
        Math.max(
          0,
          Math.round(
            anterior.aguaLitros * 1000 + mililitros
          )
        ) / 1000;

      return {
        ...atuais,
        [chave]: {
          ...anterior,
          aguaLitros: total,
        },
      };
    });
  };

  const registrarRefeicao = (
    pacienteId,
    nomeDaRefeicao,
    descricao
  ) => {
    const chave = chaveDoRegistro(
      pacienteId,
      new Date()
    );

    setRegistros((atuais) => {
      const anterior = atuais[chave] ?? {
        aguaLitros: 0,
        refeicoes: {},
      };

      const horario =
        anterior.refeicoes[nomeDaRefeicao]?.horario ??
        formatarHora(new Date());

      return {
        ...atuais,
        [chave]: {
          ...anterior,
          refeicoes: {
            ...anterior.refeicoes,
            [nomeDaRefeicao]: {
              horario,
              descricao: String(
                descricao ?? ''
              ).trim(),
            },
          },
        },
      };
    });
  };

  // ---------- Sessão do paciente ----------

  // Recebe os dados do paciente e o token JWT.
  // O token do paciente não substitui o do nutricionista.
  const entrarComoPaciente = (
    pacienteOuId,
    token = null
  ) => {
    if (
      pacienteOuId === null ||
      pacienteOuId === undefined
    ) {
      setPacienteAtualId(null);
      setDadosPacienteAtual(null);
      setTokenPaciente(null);
      return;
    }

    const recebido =
      typeof pacienteOuId === 'object'
        ? pacienteOuId
        : null;

    const id = String(
      recebido ? recebido.id : pacienteOuId
    );

    if (
      !id ||
      id === 'undefined' ||
      id === 'null'
    ) {
      setPacienteAtualId(null);
      setDadosPacienteAtual(null);
      setTokenPaciente(null);
      return;
    }

    setPacienteAtualId(id);

    if (token) {
      setTokenPaciente(token);
    }

    if (!recebido) {
      setDadosPacienteAtual((atual) =>
        atual && String(atual.id) === id
          ? atual
          : null
      );

      return;
    }

    const normalizado = {
      ...recebido,
      id,
    };

    setDadosPacienteAtual(normalizado);

    // Atualiza somente o paciente recebido.
    setPacientes((atuais) => {
      const existe = atuais.some(
        (item) => String(item.id) === id
      );

      if (!existe) {
        return [...atuais, normalizado];
      }

      return atuais.map((item) =>
        String(item.id) === id
          ? { ...item, ...normalizado }
          : item
      );
    });
  };

  const sairComoPaciente = () => {
    setPacienteAtualId(null);
    setDadosPacienteAtual(null);
    setTokenPaciente(null);
  };

  const pacienteAtual =
    dadosPacienteAtual &&
    String(dadosPacienteAtual.id) ===
      String(pacienteAtualId)
      ? dadosPacienteAtual
      : pacientes.find(
          (paciente) =>
            String(paciente.id) ===
            String(pacienteAtualId)
        ) ?? null;

  // ---------- Assinatura ----------

  const alterarPlanoAssinatura = (idPlano) => {
    const plano = todosOsPlanos.find(
      (item) => item.id === idPlano
    );

    if (!plano) return;

    setPlanoAssinaturaId(idPlano);
  };

  const cancelarPlanoAssinatura = () => {
    setPlanoAssinaturaId(null);
  };

  // ---------- Cobranças ----------

  const registrarCobranca = ({
    referencia,
    valor,
  }) => {
    const hoje = new Date();

    const nova = {
      id: `cb${Date.now()}`,
      referencia,
      valor,
      data: `${String(hoje.getDate()).padStart(2, '0')}/${String(
        hoje.getMonth() + 1
      ).padStart(2, '0')}/${hoje.getFullYear()}`,
    };

    setCobrancas((atuais) => [
      nova,
      ...atuais,
    ]);

    return nova;
  };

  // ---------- Contexto compartilhado ----------

  const valor = useMemo(
    () => ({
      nutricionista,
      pacientes,
      consultas,
      planosAlimentares,
      avaliacoes,
      cobrancas,

      pacienteAtual,
      pacienteAtualId,
      tokenPaciente,

      planoAtual,
      limitePacientes: planoAtual
        ? planoAtual.limitePacientes
        : null,

      adicionarPaciente,
      adicionarConsulta,
      atualizarStatusConsulta,

      salvarPlanoAlimentar,
      duplicarPlanoAlimentar,
      alternarArquivamentoPlano,

      salvarAvaliacao,

      montarRegistrosDoDia,
      obterRegistrosDoDia,
      registrarAgua,
      registrarRefeicao,

      entrarComoPaciente,
      sairComoPaciente,

      alterarPlanoAssinatura,
      cancelarPlanoAssinatura,
      registrarCobranca,
    }),
    [
      nutricionista,
      pacientes,
      consultas,
      planosAlimentares,
      avaliacoes,
      cobrancas,
      planoAssinaturaId,
      registros,
      pacienteAtualId,
      dadosPacienteAtual,
      tokenPaciente,
    ]
  );

  return (
    <DadosContexto.Provider value={valor}>
      {children}
    </DadosContexto.Provider>
  );
};

export const useDados = () => {
  const contexto = useContext(DadosContexto);

  if (!contexto) {
    throw new Error(
      'useDados deve ser usado dentro de <DadosProvider>.'
    );
  }

  return contexto;
};
