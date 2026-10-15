// Cartão de um plano alimentar, com as ações Ver / Editar / Duplicar / Arquivar.
// Props:
//   plano                       objeto do plano alimentar
//   mostrarPaciente             exibe o nome do paciente na linha de detalhes
//   aoVer, aoEditar, aoDuplicar, aoAlternarArquivo   funções das ações
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Cartao from '../Cartao';
import Selo from '../Selo';
import Icone from '../Icone';
import { cores } from '../../tema';
import { formatarNumero } from '../../utilitarios/formatos';
import { estilos } from './style';

const Acao = ({ icone, rotulo, aoPressionar }) => (
  <TouchableOpacity style={estilos.acao} onPress={aoPressionar} hitSlop={6}>
    <Icone nome={icone} tamanho={15} cor={cores.verdeLink} />
    <Text style={estilos.textoAcao}>{rotulo}</Text>
  </TouchableOpacity>
);

const CartaoPlano = ({ plano, mostrarPaciente = false, aoVer, aoEditar, aoDuplicar, aoAlternarArquivo }) => {
  const arquivado = plano.status === 'arquivado';
  const quantidadeRefeicoes = plano.refeicoes ? plano.refeicoes.length : 0;
  // "01/10/2026" -> "01/10"
  const vigencia = `${plano.inicio.slice(0, 5)} a ${plano.fim.slice(0, 5)}`;

  return (
    <Cartao estilo={estilos.cartao}>
      <View style={estilos.linhaTitulo}>
        <Text style={estilos.titulo} numberOfLines={2}>
          {plano.nome}
        </Text>
        <Selo texto={arquivado ? 'Arquivado' : 'Ativo'} tom={arquivado ? 'neutro' : 'sucesso'} />
      </View>

      <Text style={estilos.detalhe}>
        {mostrarPaciente ? `${plano.pacienteNome} · ` : ''}
        {quantidadeRefeicoes} refeições
      </Text>
      <Text style={estilos.detalhe}>Vigência: {vigencia}</Text>
      {!mostrarPaciente && plano.metaKcal ? (
        <Text style={estilos.detalhe}>Meta diária: {formatarNumero(plano.metaKcal, 0)} kcal (exemplo)</Text>
      ) : null}

      <View style={estilos.linhaAcoes}>
        <Acao icone="olho" rotulo="Ver" aoPressionar={aoVer} />
        {!arquivado && aoEditar ? <Acao icone="editar" rotulo="Editar" aoPressionar={aoEditar} /> : null}
        <Acao icone="copiar" rotulo="Duplicar" aoPressionar={aoDuplicar} />
        {aoAlternarArquivo ? (
          <Acao icone="arquivar" rotulo={arquivado ? 'Reativar' : 'Arquivar'} aoPressionar={aoAlternarArquivo} />
        ) : null}
      </View>
    </Cartao>
  );
};

export default CartaoPlano;
