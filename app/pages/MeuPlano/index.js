// Plano alimentar em vigor do paciente (somente leitura): meta, refeições e alimentos.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Icone from '../../componentes/Icone';
import Selo from '../../componentes/Selo';
import CaixaAviso from '../../componentes/CaixaAviso';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';
import { useDados } from '../../contexto/DadosContexto';
import { cores } from '../../tema';
import { formatarNumero } from '../../utilitarios/formatos';
import { estilos } from './style';

const MeuPlano = () => {
  const { pacienteAtual: paciente, planosAlimentares } = useDados();
  // Refeições recolhidas pelo paciente (por padrão todas aparecem abertas).
  const [recolhidas, setRecolhidas] = useState({});

  if (!paciente) return <SemSessaoPaciente />;

  const plano = planosAlimentares.find((item) => item.pacienteId === paciente.id && item.status === 'ativo');

  const alternar = (nome) => setRecolhidas((atuais) => ({ ...atuais, [nome]: !atuais[nome] }));
  const somaDeKcal = (alimentos) => alimentos.reduce((soma, alimento) => soma + (alimento.kcal || 0), 0);

  return (
    <Tela titulo="Meu plano" subtitulo="Seu plano alimentar em vigor">
      {!plano ? (
        <Cartao>
          <View style={estilos.caixaVazia}>
            <View style={estilos.circuloVazio}>
              <Icone nome="prancheta" tamanho={24} cor={cores.verdeLink} />
            </View>
            <Text style={estilos.vazio}>Nenhum plano alimentar ainda.</Text>
            <Text style={estilos.vazioDetalhe}>Quando seu nutricionista criar o plano, ele aparece aqui.</Text>
          </View>
        </Cartao>
      ) : (
        <View>
          <Cartao>
            <View style={estilos.linhaTitulo}>
              <Text style={estilos.nomePlano} numberOfLines={2}>
                {plano.nome}
              </Text>
              <Selo texto="Ativo" tom="sucesso" />
            </View>
            <Text style={estilos.detalhe}>
              Vigência: {plano.inicio} a {plano.fim}
            </Text>

            <View style={estilos.linhaMetas}>
              <View style={estilos.meta}>
                <Text style={estilos.rotuloMeta}>Meta diária</Text>
                <Text style={estilos.valorMeta}>{formatarNumero(plano.metaKcal, 0)} kcal</Text>
              </View>
              {plano.metaAguaLitros ? (
                <View style={estilos.meta}>
                  <Text style={estilos.rotuloMeta}>Água</Text>
                  <Text style={estilos.valorMeta}>{formatarNumero(plano.metaAguaLitros)} L</Text>
                </View>
              ) : null}
            </View>

            {plano.observacoes ? (
              <View style={estilos.blocoObservacoes}>
                <Text style={estilos.rotuloMeta}>Orientações do nutricionista</Text>
                <Text style={estilos.textoObservacoes}>{plano.observacoes}</Text>
              </View>
            ) : null}
          </Cartao>

          {(plano.refeicoes || []).map((refeicao) => {
            const aberta = !recolhidas[refeicao.nome];
            return (
              <Cartao key={refeicao.nome}>
                <TouchableOpacity style={estilos.cabecaRefeicao} onPress={() => alternar(refeicao.nome)} activeOpacity={0.8}>
                  <View style={estilos.dadosCabeca}>
                    <Text style={estilos.nomeRefeicao}>{refeicao.nome}</Text>
                    <Text style={estilos.detalhe}>
                      {refeicao.alimentos.length} {refeicao.alimentos.length === 1 ? 'alimento' : 'alimentos'} ·{' '}
                      {formatarNumero(somaDeKcal(refeicao.alimentos), 0)} kcal
                    </Text>
                  </View>
                  <Icone nome={aberta ? 'chevron-baixo' : 'chevron-direita'} tamanho={20} cor={cores.verdeEscuro} />
                </TouchableOpacity>

                {aberta
                  ? refeicao.alimentos.map((alimento) => (
                      <View key={alimento.idLinha} style={estilos.linhaAlimento}>
                        <View style={estilos.dadosAlimento}>
                          <Text style={estilos.nomeAlimento}>{alimento.nome}</Text>
                          <Text style={estilos.porcaoAlimento}>{alimento.porcao}</Text>
                        </View>
                        <Text style={estilos.kcalAlimento}>{formatarNumero(alimento.kcal, 0)} kcal</Text>
                      </View>
                    ))
                  : null}
              </Cartao>
            );
          })}

          <CaixaAviso tom="info" texto="Os valores de calorias são aproximados. Em caso de dúvida, fale com o seu nutricionista." />
        </View>
      )}
    </Tela>
  );
};

export default MeuPlano;
