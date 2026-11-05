
 // Lista de pacientes com busca e filtros por status de acesso.
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoBusca from '../../componentes/CampoBusca';
import Chip from '../../componentes/Chip';
import Avatar from '../../componentes/Avatar';
import Selo from '../../componentes/Selo';
import Icone from '../../componentes/Icone';
import BotaoCircular from '../../componentes/BotaoCircular';

import { useDados } from '../../contexto/DadosContexto';

import { cores } from '../../tema';
import {
  calcularIdadeEmMeses,
  formatarIdadeCurta,
  converterDataBR,
} from '../../utilitarios/datas';
import { normalizarTexto } from '../../utilitarios/formatos';
import { estilos } from './style';

const filtros = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'ativo', rotulo: 'Ativos' },
  { chave: 'convite_pendente', rotulo: 'Convite pendente' },
];

const Pacientes = ({ navigation }) => {
  // A lista é a do contexto, a mesma que diz quantos pacientes o plano
  // já gastou. Antes esta tela buscava a sua própria cópia na API, e a
  // tela inicial continuava mostrando "0 de 10".
  const {
    pacientes,
    limitePacientes,
    carregandoPacientes: carregando,
    erroPacientes: erro,
    recarregarPacientes,
  } = useDados();

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');

  // Busca de novo quando a tela recebe foco: um paciente cadastrado
  // agora, ou um convite que virou acesso ativo, aparecem aqui.
  useFocusEffect(
    useCallback(() => {
      recarregarPacientes();
    }, [recarregarPacientes])
  );

  const lista = pacientes.filter((paciente) => {
    const combinaNome = normalizarTexto(paciente.nome || '')
      .includes(normalizarTexto(busca));

    const combinaFiltro =
      filtro === 'todos' || paciente.statusAcesso === filtro;

    return combinaNome && combinaFiltro;
  });

  // Monta o detalhe da idade e, quando disponível, da consulta.
  
const detalheDoPaciente = (paciente) => {
  const nascimento = converterDataBR(paciente.nascimento);

  const idade = nascimento
    ? formatarIdadeCurta(calcularIdadeEmMeses(nascimento))
    : 'Idade indisponível';

  if (paciente.ultimaConsulta) {
    return `${idade} · Última consulta ${paciente.ultimaConsulta}`;
  }

  if (paciente.cadastradaEm) {
    return `${idade} · Cadastro em ${paciente.cadastradaEm}`;
  }

  return idade;
};


  const seloDoStatus = (status) => {
    if (status === 'ativo') {
      return <Selo texto="Ativo" tom="sucesso" />;
    }

    if (status === 'convite_pendente') {
      return <Selo texto="Convite pendente" tom="alerta" />;
    }

    return <Selo texto="Sem convite" tom="neutro" />;
  };

  return (
    <Tela
      titulo="Pacientes"
      subtitulo={`${pacientes.length} de ${
        limitePacientes || 'ilimitados'
      } pacientes cadastrados`}
      cabecalhoAlto
      direita={
        <BotaoCircular
          icone="mais"
          acessibilidade="Cadastrar paciente"
          aoPressionar={() =>
            navigation.navigate('CadastroPaciente')
          }
        />
      }
    >
      <Cartao>
        <CampoBusca
          valor={busca}
          aoMudar={setBusca}
          placeholder="Buscar por nome"
        />

        <View style={estilos.linhaFiltros}>
          {filtros.map((item) => (
            <Chip
              key={item.chave}
              rotulo={item.rotulo}
              ativo={filtro === item.chave}
              comCheck
              aoPressionar={() => setFiltro(item.chave)}
            />
          ))}
        </View>
      </Cartao>

      {carregando ? (
        <Text style={estilos.vazio}>
          Carregando pacientes...
        </Text>
      ) : erro ? (
        <Text style={estilos.vazio}>{erro}</Text>
      ) : lista.length === 0 ? (
        <Text style={estilos.vazio}>
          Nenhum paciente encontrado.
        </Text>
      ) : (
        lista.map((paciente) => (
          <TouchableOpacity
            key={paciente.id}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('FichaPaciente', {
                pacienteId: paciente.id,
              })
            }
          >
            <Cartao estilo={estilos.itemPaciente}>
              <Avatar nome={paciente.nome} tamanho={46} />

              <View style={estilos.dadosPaciente}>
                <Text style={estilos.nomePaciente}>
                  {paciente.nome}
                </Text>

                <Text style={estilos.detalhePaciente}>
                  {detalheDoPaciente(paciente)}
                </Text>
              </View>

              <View style={estilos.ladoDireito}>
                {seloDoStatus(paciente.statusAcesso)}

                <Icone
                  nome="chevron-direita"
                  tamanho={18}
                  cor={cores.textoSecundario}
                />
              </View>
            </Cartao>
          </TouchableOpacity>
        ))
      )}
    </Tela>
  );
};

export default Pacientes;
