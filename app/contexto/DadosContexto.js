// Estado compartilhado do aplicativo (em memória, modo demonstração).
//
// Guarda pacientes, consultas, planos alimentares, avaliações, registros do
// paciente (água e refeições) e o plano de assinatura do nutricionista, para
// que todas as telas enxerguem os mesmos dados. Quando a API estiver pronta, cada função abaixo passa a chamar o
// servidor (ex.: POST /pacientes) antes de atualizar o estado.
//
// O nutricionista logado vem do AuthContext (sessão salva no celular).

import React, { createContext, useContext, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { planosIndividuais, planosClinica } from '../dados/planosAssinatura';
import { META_AGUA_PADRAO_LITROS } from '../dados/registros';
import { nomesDasRefeicoes } from '../dados/alimentosTaco';
import { chaveDoDia, formatarHora } from '../utilitarios/datas';

const DadosContexto = createContext(null);

const todosOsPlanos = [...planosIndividuais, ...planosClinica];

export const DadosProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [planosAlimentares, setPlanosAlimentares] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [planoAssinaturaId, setPlanoAssinaturaId] = useState(null);
  const [cobrancas, setCobrancas] = useState([]);
  // Registros do paciente. Chave "<idPaciente>|<dia>" ->
  // { aguaLitros, refeicoes: { [nomeDaRefeicao]: { horario, descricao } } }
  const [registros, setRegistros] = useState({});
  // Paciente que entrou pela área do paciente (null = ninguém).
  const [pacienteAtualId, setPacienteAtualId] = useState(null);

  // Nutricionista autenticado: vem do login (AuthContext).
  // Campos: id_profissional, nm_profissional, ds_email, ds_profissao, nr_registro_conselho
  const { profissional: nutricionista } = useAuth();

  const planoAtual =
    todosOsPlanos.find((plano) => plano.id === planoAssinaturaId) ?? null;

  // ---------- Pacientes ----------
  const adicionarPaciente = (dados) => {
    const novo = { ...dados, id: String(Date.now()), historicoPeso: [], ultimaConsulta: null };
    setPacientes((atuais) => [...atuais, novo]);
    return novo;
  };

  // ---------- Consultas ----------
  const adicionarConsulta = (dados) => {
    const nova = { ...dados, id: `c${Date.now()}` };
    setConsultas((atuais) => [...atuais, nova]);
    return nova;
  };

  const atualizarStatusConsulta = (id, status) => {
    setConsultas((atuais) =>
      atuais.map((consulta) => (consulta.id === id ? { ...consulta, status } : consulta))
    );
  };

  // ---------- Planos alimentares ----------
  // Se o plano já existir (mesmo id) ele é atualizado; senão é criado.
  const salvarPlanoAlimentar = (plano) => {
    const existe = planosAlimentares.some((atual) => atual.id === plano.id);
    if (existe) {
      setPlanosAlimentares((atuais) => atuais.map((atual) => (atual.id === plano.id ? plano : atual)));
      return plano;
    }
    const novo = { ...plano, id: `pl${Date.now()}` };
    setPlanosAlimentares((atuais) => [novo, ...atuais]);
    return novo;
  };

  const duplicarPlanoAlimentar = (id) => {
    const original = planosAlimentares.find((plano) => plano.id === id);
    if (!original) return;
    const copia = { ...original, id: `pl${Date.now()}`, nome: `${original.nome} (cópia)`, status: 'ativo' };
    setPlanosAlimentares((atuais) => [copia, ...atuais]);
  };

  const alternarArquivamentoPlano = (id) => {
    setPlanosAlimentares((atuais) =>
      atuais.map((plano) =>
        plano.id === id ? { ...plano, status: plano.status === 'ativo' ? 'arquivado' : 'ativo' } : plano
      )
    );
  };

  // ---------- Avaliações ----------
  const salvarAvaliacao = (avaliacao) => {
    const nova = { ...avaliacao, id: `av${Date.now()}` };
    setAvaliacoes((atuais) => [nova, ...atuais]);
    return nova;
  };

  // ---------- Registros do paciente (água e refeições) ----------
  const chaveDoRegistro = (pacienteId, dia) => `${pacienteId}|${chaveDoDia(dia)}`;

  // Monta o dia completo: todas as refeições esperadas (as do plano em vigor ou,
  // sem plano, as padrão), com horário e descrição quando já foram registradas.
  // Sempre devolve um objeto (usado pela tela de registros do paciente).
  const montarRegistrosDoDia = (pacienteId, dia) => {
    const registro = registros[chaveDoRegistro(pacienteId, dia)] ?? { aguaLitros: 0, refeicoes: {} };
    const plano = planosAlimentares.find((item) => item.pacienteId === pacienteId && item.status === 'ativo');
    const nomesEsperados = plano?.refeicoes?.length ? plano.refeicoes.map((item) => item.nome) : nomesDasRefeicoes;
    const nomes = [
      ...nomesEsperados,
      ...Object.keys(registro.refeicoes).filter((nome) => !nomesEsperados.includes(nome)),
    ];
    return {
      aguaLitros: registro.aguaLitros,
      metaAguaLitros: plano?.metaAguaLitros || META_AGUA_PADRAO_LITROS,
      refeicoes: nomes.map((nome) => ({
        nome,
        horario: registro.refeicoes[nome]?.horario ?? null,
        descricao: registro.refeicoes[nome]?.descricao ?? null,
      })),
    };
  };

  // Para a ficha do nutricionista: null quando o paciente não registrou nada naquele dia.
  const obterRegistrosDoDia = (pacienteId, dia) =>
    registros[chaveDoRegistro(pacienteId, dia)] ? montarRegistrosDoDia(pacienteId, dia) : null;

  // Soma (ou, com valor negativo, tira) água do dia de hoje. Nunca fica abaixo de zero.
  const registrarAgua = (pacienteId, mililitros) => {
    // TODO: integrar com a API (salvar o registro de água).
    const chave = chaveDoRegistro(pacienteId, new Date());
    setRegistros((atuais) => {
      const anterior = atuais[chave] ?? { aguaLitros: 0, refeicoes: {} };
      const total = Math.max(0, Math.round(anterior.aguaLitros * 1000 + mililitros)) / 1000;
      return { ...atuais, [chave]: { ...anterior, aguaLitros: total } };
    });
  };

  // Registra (ou corrige) o que o paciente comeu numa refeição de hoje.
  // Na correção o horário original é mantido.
  const registrarRefeicao = (pacienteId, nomeDaRefeicao, descricao) => {
    // TODO: integrar com a API (salvar o registro da refeição).
    const chave = chaveDoRegistro(pacienteId, new Date());
    setRegistros((atuais) => {
      const anterior = atuais[chave] ?? { aguaLitros: 0, refeicoes: {} };
      const horario = anterior.refeicoes[nomeDaRefeicao]?.horario ?? formatarHora(new Date());
      return {
        ...atuais,
        [chave]: {
          ...anterior,
          refeicoes: { ...anterior.refeicoes, [nomeDaRefeicao]: { horario, descricao: descricao.trim() } },
        },
      };
    });
  };

  // ---------- Paciente logado (área do paciente) ----------
  const entrarComoPaciente = (id) => setPacienteAtualId(id);
  const sairComoPaciente = () => setPacienteAtualId(null);
  const pacienteAtual = pacientes.find((paciente) => paciente.id === pacienteAtualId) ?? null;

  // ---------- Assinatura ----------
  const alterarPlanoAssinatura = (idPlano) => {
    const plano = todosOsPlanos.find((item) => item.id === idPlano);
    if (!plano) return;
    setPlanoAssinaturaId(idPlano);
  };

  // Volta ao estado de quem nunca assinou. Os pacientes já cadastrados
  // continuam no lugar: cancelar assinatura não é apagar o trabalho.
  const cancelarPlanoAssinatura = () => setPlanoAssinaturaId(null);

  // Registra uma cobrança no histórico que o Perfil mostra.
  //
  // TODO: integrar com a API de pagamento. Hoje a lista nasce da própria
  // contratação feita no aplicativo, em memória — antes ela era um array
  // vazio que nunca recebia nada, e o histórico abria sempre em branco.
  const registrarCobranca = ({ referencia, valor }) => {
    const hoje = new Date();
    const nova = {
      id: `cb${Date.now()}`,
      referencia,
      valor,
      data: `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`,
    };
    setCobrancas((atuais) => [nova, ...atuais]);
    return nova;
  };

  const valor = useMemo(
    () => ({
      nutricionista,
      pacientes,
      consultas,
      planosAlimentares,
      avaliacoes,
      cobrancas,
      pacienteAtual,
      planoAtual,
      limitePacientes: planoAtual ? planoAtual.limitePacientes : null,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nutricionista, pacientes, consultas, planosAlimentares, avaliacoes, cobrancas, planoAssinaturaId, registros, pacienteAtualId]
  );

  return <DadosContexto.Provider value={valor}>{children}</DadosContexto.Provider>;
};

// Uso nas telas:  const { pacientes } = useDados();
export const useDados = () => {
  const contexto = useContext(DadosContexto);
  if (!contexto) throw new Error('useDados deve ser usado dentro de <DadosProvider>.');
  return contexto;
};