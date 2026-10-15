// Estado compartilhado do aplicativo (em memória, modo demonstração).
//
// Guarda pacientes, consultas, planos alimentares, avaliações e o plano de
// assinatura do nutricionista, para que todas as telas enxerguem os mesmos
// dados. Quando a API estiver pronta, cada função abaixo passa a chamar o
// servidor (ex.: POST /pacientes) antes de atualizar o estado.

import React, { createContext, useContext, useMemo, useState } from 'react';
import { pacientesIniciais } from '../dados/pacientes';
import { consultasIniciais } from '../dados/consultas';
import { planosAlimentaresIniciais } from '../dados/planosAlimentares';
import { avaliacoesIniciais } from '../dados/avaliacoes';
import { planosIndividuais, planosClinica, cobrancasIniciais } from '../dados/planosAssinatura';

const DadosContexto = createContext(null);

const todosOsPlanos = [...planosIndividuais, ...planosClinica];

export const DadosProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);
const [consultas, setConsultas] = useState([]);
const [planosAlimentares, setPlanosAlimentares] = useState([]);
const [avaliacoes, setAvaliacoes] = useState([]);
const [planoAssinaturaId, setPlanoAssinaturaId] = useState(null);
const [cobrancas, setCobrancas] = useState([]);

  // Dados do nutricionista autenticado.
// Será preenchido quando a integração com o login estiver pronta.

const [nutricionista, setNutricionista] = useState(null);
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

  // ---------- Assinatura ----------
  const alterarPlanoAssinatura = (idPlano) => {
  const plano = todosOsPlanos.find((item) => item.id === idPlano);

  if (!plano) return;

  setPlanoAssinaturaId(idPlano);
};

  const valor = useMemo(
    () => ({
      nutricionista,
      pacientes,
      consultas,
      planosAlimentares,
      avaliacoes,
      cobrancas,
      planoAtual,
      limitePacientes: planoAtual ? planoAtual.limitePacientes : null,
      adicionarPaciente,
      adicionarConsulta,
      atualizarStatusConsulta,
      salvarPlanoAlimentar,
      duplicarPlanoAlimentar,
      alternarArquivamentoPlano,
      salvarAvaliacao,
      alterarPlanoAssinatura,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pacientes, consultas, planosAlimentares, avaliacoes, cobrancas, planoAssinaturaId]
  );

  return <DadosContexto.Provider value={valor}>{children}</DadosContexto.Provider>;
};

// Uso nas telas:  const { pacientes } = useDados();
export const useDados = () => {
  const contexto = useContext(DadosContexto);
  if (!contexto) throw new Error('useDados deve ser usado dentro de <DadosProvider>.');
  return contexto;
};
