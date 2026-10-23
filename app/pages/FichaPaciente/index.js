// Ficha do paciente com 4 abas: Resumo, Avaliações, Planos e Registros.
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Abas from '../../componentes/Abas';
import Avatar from '../../componentes/Avatar';
import Selo from '../../componentes/Selo';
import Botao from '../../componentes/Botao';
import Icone from '../../componentes/Icone';
import GraficoLinha from '../../componentes/GraficoLinha';
import CartaoPlano from '../../componentes/CartaoPlano';
import BarraProgresso from '../../componentes/BarraProgresso';
import { useDados } from '../../contexto/DadosContexto';
import { useDialogo } from '../../contexto/DialogoContexto';
import { obterRegistrosDoDia } from '../../dados/registros';
import { cores } from '../../tema';
import {
  calcularIdadeEmMeses,
  formatarIdade,
  formatarDataBR,
  formatarDiaMes,
  nomesDiasSemana,
  mesmoDia,
  somarDias,
} from '../../utilitarios/datas';
import { formatarNumero } from '../../utilitarios/formatos';
import { estilos } from './style';

const abasDaFicha = [
  { chave: 'resumo', rotulo: 'Resumo' },
  { chave: 'avaliacoes', rotulo: 'Avaliações' },
  { chave: 'planos', rotulo: 'Planos' },
  { chave: 'registros', rotulo: 'Registros' },
];

const FichaPaciente = ({ navigation, route }) => {
  const { avisar } = useDialogo();
  const { pacientes, avaliacoes, planosAlimentares, duplicarPlanoAlimentar, alternarArquivamentoPlano } = useDados();
  const [aba, setAba] = useState(route.params?.aba || 'resumo');
  const [diaDosRegistros, setDiaDosRegistros] = useState(new Date());

  const paciente = pacientes.find((item) => item.id === route.params?.pacienteId);

  // Se a tela for reaberta com outra aba (ex.: depois de salvar uma avaliação), troca a aba.
  useEffect(() => {
    if (route.params?.aba) setAba(route.params.aba);
  }, [route.params?.aba]);

  if (!paciente) {
    return (
      <Tela titulo="Paciente" subtitulo="Paciente não encontrado">
        <Text style={estilos.vazio}>Não foi possível encontrar este paciente.</Text>
      </Tela>
    );
  }

  const idadeEmMeses = calcularIdadeEmMeses(paciente.nascimento);
  const sexoPorExtenso = paciente.sexo === 'F' ? 'Feminino' : 'Masculino';
  const avaliacoesDoPaciente = avaliacoes.filter((item) => item.pacienteId === paciente.id);
  const planosDoPaciente = planosAlimentares.filter((item) => item.pacienteId === paciente.id);
  const planosEmVigor = planosDoPaciente.filter((plano) => plano.status === 'ativo');
  const planosAnteriores = planosDoPaciente.filter((plano) => plano.status === 'arquivado');
  const ultimoPeso = paciente.historicoPeso.length
    ? paciente.historicoPeso[paciente.historicoPeso.length - 1].valor
    : null;

  const novaAvaliacao = () => navigation.navigate('FaixaCalculadora', { pacienteId: paciente.id });
  const criarPlano = () => navigation.navigate('CriarPlanoAlimentar', { pacienteId: paciente.id });

  // Mostra um resumo do plano em uma janela de alerta.
  const verPlano = (plano) => {
    const refeicoes = (plano.refeicoes || []).map((refeicao) => `• ${refeicao.nome}`).join('\n');
    avisar({
      titulo: plano.nome,
      mensagem: `Vigência: ${plano.inicio} a ${plano.fim}\nMeta diária: ${formatarNumero(plano.metaKcal, 0)} kcal\n\nRefeições:\n${refeicoes}`,
      rotuloBotao: 'Fechar',
    });
  };

  const duplicarPlano = (plano) => {
    duplicarPlanoAlimentar(plano.id);
    avisar({
      titulo: 'Plano duplicado',
      mensagem: 'Uma cópia foi criada na lista de planos.',
      tom: 'sucesso',
    });
  };

  // ----- Registros: navegação entre os dias -----
  const hoje = new Date();
  const ehHoje = mesmoDia(diaDosRegistros, hoje);
  const mudarDiaDosRegistros = (passo) => {
    const novoDia = somarDias(diaDosRegistros, passo);
    if (novoDia <= hoje) setDiaDosRegistros(novoDia);
  };
  const rotuloDoDia = ehHoje
    ? `Hoje, ${formatarDiaMes(diaDosRegistros)}`
    : `${nomesDiasSemana[diaDosRegistros.getDay()].slice(0, 3)}, ${formatarDiaMes(diaDosRegistros)}`;
  const registros = obterRegistrosDoDia(paciente.id, diaDosRegistros);

  const lembrarRefeicao = (nomeDaRefeicao) => {
    // TODO: integrar com a API (notificação push para o paciente).
    avisar({
      titulo: 'Lembrete enviado',
      mensagem: `${paciente.nome.split(' ')[0]} receberá um aviso sobre: ${nomeDaRefeicao}.`,
      tom: 'sucesso',
    });
  };

  // ======================== ABAS ========================
  const renderizarResumo = () => (
    <View>
      <Cartao>
        <Text style={estilos.tituloCartao}>Dados do paciente</Text>
        <View style={estilos.grade}>
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Nascimento</Text>
            <Text style={estilos.valorDado}>{formatarDataBR(paciente.nascimento)}</Text>
          </View>
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Sexo</Text>
            <Text style={estilos.valorDado}>{sexoPorExtenso}</Text>
          </View>
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Telefone</Text>
            <Text style={estilos.valorDado}>{paciente.telefone || '—'}</Text>
          </View>
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Acesso ao app</Text>
            <Selo
              texto={paciente.statusAcesso === 'ativo' ? 'Ativo' : 'Convite pendente'}
              tom={paciente.statusAcesso === 'ativo' ? 'sucesso' : 'alerta'}
            />
          </View>
        </View>
        <Text style={estilos.rotuloDado}>E-mail</Text>
        <Text style={estilos.valorDado}>{paciente.email}</Text>
      </Cartao>

      <Cartao>
        <View style={estilos.linhaTituloGrafico}>
          <Text style={estilos.tituloCartao}>Evolução do peso</Text>
          {ultimoPeso ? <Text style={estilos.pesoAtual}>{formatarNumero(ultimoPeso)} kg</Text> : null}
        </View>
        <GraficoLinha pontos={paciente.historicoPeso} />
      </Cartao>

      <View style={estilos.linhaBotoes}>
        <Botao titulo="Nova avaliação" variante="contorno" aoPressionar={novaAvaliacao} estilo={estilos.botaoMetade} />
        <Botao titulo="Criar plano" aoPressionar={criarPlano} estilo={estilos.botaoMetade} />
      </View>
    </View>
  );

  const renderizarAvaliacoes = () => (
    <View>
      <Botao titulo="Nova avaliação" aoPressionar={novaAvaliacao} estilo={estilos.botaoTopo} />
      {avaliacoesDoPaciente.length === 0 ? (
        <Text style={estilos.vazio}>Nenhuma avaliação registrada ainda.</Text>
      ) : (
        avaliacoesDoPaciente.map((avaliacao) => (
          <Cartao key={avaliacao.id} estilo={estilos.cartaoAvaliacao}>
            <View style={estilos.linhaTituloGrafico}>
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
    </View>
  );

  const renderizarPlanos = () => (
    <View>
      <Botao titulo="Criar plano para este paciente" aoPressionar={criarPlano} estilo={estilos.botaoTopo} />

      {planosDoPaciente.length === 0 ? (
        <Text style={estilos.vazio}>Nenhum plano alimentar para este paciente.</Text>
      ) : null}

      {planosEmVigor.length > 0 ? <Text style={estilos.tituloLista}>Plano em vigor</Text> : null}
      {planosEmVigor.map((plano) => (
        <CartaoPlano
          key={plano.id}
          plano={plano}
          aoVer={() => verPlano(plano)}
          aoEditar={() => navigation.navigate('CriarPlanoAlimentar', { planoId: plano.id })}
          aoDuplicar={() => duplicarPlano(plano)}
          aoAlternarArquivo={() => alternarArquivamentoPlano(plano.id)}
        />
      ))}

      {planosAnteriores.length > 0 ? <Text style={estilos.tituloLista}>Anteriores</Text> : null}
      {planosAnteriores.map((plano) => (
        <CartaoPlano
          key={plano.id}
          plano={plano}
          aoVer={() => verPlano(plano)}
          aoDuplicar={() => duplicarPlano(plano)}
        />
      ))}
    </View>
  );

  const renderizarRegistros = () => (
    <View>
      <Cartao estilo={estilos.seletorDia}>
        <TouchableOpacity onPress={() => mudarDiaDosRegistros(-1)} hitSlop={10}>
          <Icone nome="chevron-esquerda" tamanho={20} cor={cores.verdeBotao} />
        </TouchableOpacity>
        <Text style={estilos.textoDia}>{rotuloDoDia}</Text>
        <TouchableOpacity onPress={() => mudarDiaDosRegistros(1)} hitSlop={10} disabled={ehHoje}>
          <Icone nome="chevron-direita" tamanho={20} cor={ehHoje ? cores.linha : cores.verdeBotao} />
        </TouchableOpacity>
      </Cartao>

      {!registros ? (
        <Text style={estilos.vazio}>Nenhum registro neste dia.</Text>
      ) : (
        <View>
          <Cartao>
            <View style={estilos.linhaTituloGrafico}>
              <View style={estilos.linhaAgua}>
                <Icone nome="gota" tamanho={18} cor={cores.verdeBotao} />
                <Text style={estilos.tituloAgua}>Água</Text>
              </View>
              <Text style={estilos.valorAgua}>
                {formatarNumero(registros.aguaLitros)} L de {formatarNumero(registros.metaAguaLitros)} L
              </Text>
            </View>
            <BarraProgresso valor={registros.aguaLitros / registros.metaAguaLitros} />
            <Text style={estilos.percentualAgua}>
              {Math.round((registros.aguaLitros / registros.metaAguaLitros) * 100)}% da meta diária
            </Text>
          </Cartao>

          <Cartao>
            <View style={estilos.linhaTituloGrafico}>
              <Text style={estilos.tituloCartao}>Refeições</Text>
              <Selo
                texto={`${registros.refeicoes.filter((r) => r.horario).length} de ${registros.refeicoes.length} registrados`}
                tom="sucesso"
              />
            </View>

            {registros.refeicoes.map((refeicao) => {
              const registrada = Boolean(refeicao.horario);
              return (
                <View key={refeicao.nome} style={estilos.linhaRefeicao}>
                  <View style={[estilos.marcadorRefeicao, registrada && estilos.marcadorRegistrada]}>
                    {registrada ? <Icone nome="check" tamanho={14} cor={cores.branco} espessura={3} /> : null}
                  </View>
                  <View style={estilos.dadosRefeicao}>
                    <View style={estilos.linhaTituloGrafico}>
                      <Text style={estilos.nomeRefeicao}>{refeicao.nome}</Text>
                      <Text style={estilos.horarioRefeicao}>{refeicao.horario || '—'}</Text>
                    </View>
                    {registrada ? (
                      <Text style={estilos.descricaoRefeicao}>{refeicao.descricao}</Text>
                    ) : (
                      <View style={estilos.linhaTituloGrafico}>
                        <Text style={estilos.naoRegistrado}>Não registrado</Text>
                        <Text style={estilos.linkLembrete} onPress={() => lembrarRefeicao(refeicao.nome)}>
                          Enviar lembrete
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </Cartao>
        </View>
      )}

      <View style={estilos.rodapeSomenteLeitura}>
        <Icone nome="cadeado" tamanho={14} cor={cores.textoSecundario} />
        <Text style={estilos.textoSomenteLeitura}>Somente leitura: registros feitos pelo paciente.</Text>
      </View>
    </View>
  );

  return (
    <Tela
      titulo={paciente.nome}
      subtitulo={`${sexoPorExtenso} · ${formatarIdade(idadeEmMeses)}`}
      direita={<Avatar nome={paciente.nome} tamanho={52} cor={cores.branco} corTexto={cores.verdeEscuro} />}
    >
      <Abas abas={abasDaFicha} ativa={aba} aoMudar={setAba} />

      {aba === 'resumo' && renderizarResumo()}
      {aba === 'avaliacoes' && renderizarAvaliacoes()}
      {aba === 'planos' && renderizarPlanos()}
      {aba === 'registros' && renderizarRegistros()}
    </Tela>
  );
};

export default FichaPaciente;
