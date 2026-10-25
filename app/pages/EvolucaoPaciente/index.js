// Evolução do paciente (somente leitura): gráfico de peso e avaliações feitas pelo nutricionista.
import React from 'react';
import { View, Text } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Selo from '../../componentes/Selo';
import Icone from '../../componentes/Icone';
import GraficoLinha from '../../componentes/GraficoLinha';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';
import { useDados } from '../../contexto/DadosContexto';
import { cores } from '../../tema';
import { formatarNumero } from '../../utilitarios/formatos';
import { estilos } from './style';

const EvolucaoPaciente = () => {
  const { pacienteAtual: paciente, avaliacoes } = useDados();

  if (!paciente) return <SemSessaoPaciente />;

  const minhasAvaliacoes = avaliacoes.filter((avaliacao) => avaliacao.pacienteId === paciente.id);
  const pesoAtual = paciente.historicoPeso.length
    ? paciente.historicoPeso[paciente.historicoPeso.length - 1].valor
    : null;

  return (
    <Tela titulo="Minha evolução" subtitulo="Peso e avaliações">
      <Cartao>
        <View style={estilos.linhaTitulo}>
          <Text style={estilos.tituloCartao}>Evolução do peso</Text>
          {pesoAtual ? <Text style={estilos.pesoAtual}>{formatarNumero(pesoAtual)} kg</Text> : null}
        </View>
        <GraficoLinha pontos={paciente.historicoPeso} />
      </Cartao>

      <Text style={estilos.tituloLista}>Avaliações</Text>
      {minhasAvaliacoes.length === 0 ? (
        <Text style={estilos.vazio}>Nenhuma avaliação registrada ainda.</Text>
      ) : (
        minhasAvaliacoes.map((avaliacao) => (
          <Cartao key={avaliacao.id}>
            <View style={estilos.linhaTitulo}>
              <Text style={estilos.dataAvaliacao}>{avaliacao.data}</Text>
              <Selo
                texto={`${avaliacao.naFaixa} de ${avaliacao.total} na faixa`}
                tom={avaliacao.naFaixa === avaliacao.total ? 'sucesso' : 'alerta'}
              />
            </View>
            <Text style={estilos.idadeAvaliacao}>Idade: {avaliacao.idade}</Text>
            <View style={estilos.linhaMedidas}>
              <View style={estilos.medida}>
                <Text style={estilos.rotuloDado}>Peso</Text>
                <Text style={estilos.valorMedida}>{formatarNumero(avaliacao.pesoKg)} kg</Text>
              </View>
              <View style={estilos.medida}>
                <Text style={estilos.rotuloDado}>Altura</Text>
                <Text style={estilos.valorMedida}>{formatarNumero(avaliacao.alturaCm)} cm</Text>
              </View>
              <View style={estilos.medida}>
                <Text style={estilos.rotuloDado}>IMC</Text>
                <Text style={estilos.valorMedida}>{formatarNumero(avaliacao.imc)} kg/m²</Text>
              </View>
            </View>
          </Cartao>
        ))
      )}

      <View style={estilos.rodapeSomenteLeitura}>
        <Icone nome="cadeado" tamanho={14} cor={cores.textoSecundario} />
        <Text style={estilos.textoSomenteLeitura}>Somente leitura: avaliações feitas pelo seu nutricionista.</Text>
      </View>
    </Tela>
  );
};

export default EvolucaoPaciente;
