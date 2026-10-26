
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
import { useAuth } from '../../contexto/AuthContext';

import { obterPaciente } from '../../Api/Pacientes';
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
  const {
    avaliacoes,
    planosAlimentares,
    duplicarPlanoAlimentar,
    alternarArquivamentoPlano,
    obterRegistrosDoDia,
  } = useDados();

  const { avisar } = useDialogo();
  const { token } = useAuth();

  const [aba, setAba] = useState(route.params?.aba || 'resumo');
  const [diaDosRegistros, setDiaDosRegistros] = useState(new Date());

  const [paciente, setPaciente] = useState(null);
  const [carregandoPaciente, setCarregandoPaciente] = useState(true);
  const [erroPaciente, setErroPaciente] = useState('');

  // Atualiza a aba quando a tela recebe uma nova aba pela navegação.
  useEffect(() => {
    if (route.params?.aba) {
      setAba(route.params.aba);
    }
  }, [route.params?.aba]);

  // Busca os dados do paciente no banco através da API.
  useEffect(() => {
    let ativo = true;

    const carregarPaciente = async () => {
      const pacienteId = route.params?.pacienteId;

      if (!pacienteId || !token) {
        setPaciente(null);
        setErroPaciente(
          !pacienteId
            ? 'O identificador do paciente não foi informado.'
            : 'Sessão não encontrada. Entre novamente como nutricionista.'
        );
        setCarregandoPaciente(false);
        return;
      }

      setCarregandoPaciente(true);
      setErroPaciente('');

      try {
        const dadosPaciente = await obterPaciente(pacienteId, token);

        if (!ativo) return;

        if (!dadosPaciente) {
          setPaciente(null);
          setErroPaciente('Paciente não encontrado.');
          return;
        }

        // Aceita os nomes de campos usados pela API.
        const pacienteNormalizado = {
          ...dadosPaciente,
          id: String(
            dadosPaciente.id ??
            dadosPaciente.id_paciente ??
            dadosPaciente.idBanco ??
            ''
          ),
          nome:
            dadosPaciente.nome ??
            dadosPaciente.nm_paciente ??
            '',
          nascimento:
            dadosPaciente.nascimento ??
            dadosPaciente.dataNascimento ??
            dadosPaciente.dt_nascimento ??
            '',
          sexo:
            dadosPaciente.sexo ??
            dadosPaciente.sg_sexo ??
            '',
          telefone:
            dadosPaciente.telefone ??
            dadosPaciente.nr_telefone ??
            '',
          email:
            dadosPaciente.email ??
            dadosPaciente.ds_email ??
            '',
          statusAcesso:
            dadosPaciente.statusAcesso ??
            dadosPaciente.status_acesso ??
            'sem_convite',
          historicoPeso: Array.isArray(dadosPaciente.historicoPeso)
            ? dadosPaciente.historicoPeso
            : [],
        };

        if (!pacienteNormalizado.id || !pacienteNormalizado.nome) {
          setPaciente(null);
          setErroPaciente(
            'A API retornou os dados do paciente em um formato inesperado.'
          );
          return;
        }

        setPaciente(pacienteNormalizado);
      } catch (erro) {
        if (!ativo) return;

        setPaciente(null);
        setErroPaciente(
          erro.message || 'Não foi possível carregar a ficha do paciente.'
        );
      } finally {
        if (ativo) {
          setCarregandoPaciente(false);
        }
      }
    };

    carregarPaciente();

    return () => {
      ativo = false;
    };
  }, [route.params?.pacienteId, token]);

  // Mostra o carregamento enquanto a API responde.
  if (carregandoPaciente) {
    return (
      <Tela titulo="Paciente" subtitulo="Carregando ficha">
        <Text style={estilos.vazio}>
          Buscando os dados do paciente...
        </Text>
      </Tela>
    );
  }

  // Mostra o erro quando não foi possível carregar o paciente.
  if (!paciente) {
    return (
      <Tela
        titulo="Paciente"
        subtitulo="Não foi possível abrir a ficha"
      >
        <Text style={estilos.vazio}>
          {erroPaciente || 'Paciente não encontrado.'}
        </Text>
      </Tela>
    );
  }

  // Dados básicos do paciente.
  const idadeEmMeses = paciente.nascimento
    ? calcularIdadeEmMeses(paciente.nascimento)
    : 0;

  const sexoPorExtenso =
    String(paciente.sexo).toUpperCase() === 'F'
      ? 'Feminino'
      : String(paciente.sexo).toUpperCase() === 'M'
        ? 'Masculino'
        : 'Não informado';

  // Esses dados continuam vindo do contexto local.
  const avaliacoesDoPaciente = avaliacoes.filter(
    (item) => String(item.pacienteId) === paciente.id
  );

  const planosDoPaciente = planosAlimentares.filter(
    (item) => String(item.pacienteId) === paciente.id
  );

  const planosEmVigor = planosDoPaciente.filter(
    (plano) => plano.status === 'ativo'
  );

  const planosAnteriores = planosDoPaciente.filter(
    (plano) => plano.status === 'arquivado'
  );

  // Evita erro quando o histórico de peso não foi retornado pela API.
  const historicoPeso = paciente.historicoPeso || [];

  const ultimoPeso = historicoPeso.length
    ? historicoPeso[historicoPeso.length - 1].valor
    : null;

  const novaAvaliacao = () =>
    navigation.navigate('FaixaCalculadora', {
      pacienteId: paciente.id,
    });

  const criarPlano = () =>
    navigation.navigate('CriarPlanoAlimentar', {
      pacienteId: paciente.id,
    });

  // Mostra um resumo do plano alimentar.
  const verPlano = (plano) => {
    const refeicoes = (plano.refeicoes || [])
      .map((refeicao) => `• ${refeicao.nome}`)
      .join('\n');

    avisar({
      titulo: plano.nome,
      mensagem:
        `Vigência: ${plano.inicio} a ${plano.fim}\n` +
        `Meta diária: ${formatarNumero(plano.metaKcal, 0)} kcal\n\n` +
        `Refeições:\n${refeicoes}`,
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

  // Navegação entre os dias dos registros.
  const hoje = new Date();
  const ehHoje = mesmoDia(diaDosRegistros, hoje);

  const mudarDiaDosRegistros = (passo) => {
    const novoDia = somarDias(diaDosRegistros, passo);

    if (novoDia <= hoje) {
      setDiaDosRegistros(novoDia);
    }
  };

  const rotuloDoDia = ehHoje
    ? `Hoje, ${formatarDiaMes(diaDosRegistros)}`
    : `${nomesDiasSemana[diaDosRegistros.getDay()].slice(0, 3)}, ${formatarDiaMes(diaDosRegistros)}`;

  const registros = obterRegistrosDoDia
    ? obterRegistrosDoDia(paciente.id, diaDosRegistros)
    : null;

  const lembrarRefeicao = (nomeDaRefeicao) => {
    // TODO: integrar com a API de notificações.
    avisar({
      titulo: 'Lembrete',
      mensagem:
        `O lembrete sobre "${nomeDaRefeicao}" ainda não está integrado ` +
        'ao envio de notificações para o paciente.',
      tom: 'sucesso',
    });
  };

  // Aba Resumo.
  const renderizarResumo = () => (
    <View>
      <Cartao>
        <Text style={estilos.tituloCartao}>
          Dados do paciente
        </Text>

        <View style={estilos.grade}>
          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Nascimento</Text>
            <Text style={estilos.valorDado}>
              {paciente.nascimento
                ? formatarDataBR(paciente.nascimento)
                : '—'}
            </Text>
          </View>

          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Sexo</Text>
            <Text style={estilos.valorDado}>
              {sexoPorExtenso}
            </Text>
          </View>

          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Telefone</Text>
            <Text style={estilos.valorDado}>
              {paciente.telefone || '—'}
            </Text>
          </View>

          <View style={estilos.colunaDado}>
            <Text style={estilos.rotuloDado}>Acesso ao app</Text>
            <Selo
              texto={
                paciente.statusAcesso === 'ativo'
                  ? 'Ativo'
                  : paciente.statusAcesso === 'convite_pendente' ||
                      paciente.statusAcesso === 'pendente'
                    ? 'Convite pendente'
                    : 'Sem convite'
              }
              tom={
                paciente.statusAcesso === 'ativo'
                  ? 'sucesso'
                  : 'alerta'
              }
            />
          </View>
        </View>

        <Text style={estilos.rotuloDado}>E-mail</Text>
        <Text style={estilos.valorDado}>
          {paciente.email || '—'}
        </Text>
      </Cartao>

      <Cartao>
        <View style={estilos.linhaTituloGrafico}>
          <Text style={estilos.tituloCartao}>
            Evolução do peso
          </Text>

          {ultimoPeso != null ? (
            <Text style={estilos.pesoAtual}>
              {formatarNumero(ultimoPeso)} kg
            </Text>
          ) : null}
        </View>

        {historicoPeso.length > 0 ? (
          <GraficoLinha pontos={historicoPeso} />
        ) : (
          <Text style={estilos.vazio}>
            Nenhum registro de peso disponível ainda.
          </Text>
        )}
      </Cartao>

      <View style={estilos.linhaBotoes}>
        <Botao
          titulo="Nova avaliação"
          variante="contorno"
          aoPressionar={novaAvaliacao}
          estilo={estilos.botaoMetade}
        />

        <Botao
          titulo="Criar plano"
          aoPressionar={criarPlano}
          estilo={estilos.botaoMetade}
        />
      </View>
    </View>
  );

  // Aba Avaliações.
  const renderizarAvaliacoes = () => (
    <View>
      <Botao
        titulo="Nova avaliação"
        aoPressionar={novaAvaliacao}
        estilo={estilos.botaoTopo}
      />

      {avaliacoesDoPaciente.length === 0 ? (
        <Text style={estilos.vazio}>
          Nenhuma avaliação registrada ainda.
        </Text>
      ) : (
        avaliacoesDoPaciente.map((avaliacao) => (
          <Cartao
            key={avaliacao.id}
            estilo={estilos.cartaoAvaliacao}
          >
            <View style={estilos.linhaTituloGrafico}>
              <Text style={estilos.dataAvaliacao}>
                {avaliacao.data}
              </Text>

              <Selo
                texto={`${avaliacao.naFaixa} de ${avaliacao.total} na faixa`}
                tom={
                  avaliacao.naFaixa === avaliacao.total
                    ? 'sucesso'
                    : 'alerta'
                }
              />
            </View>

            <Text style={estilos.idadeAvaliacao}>
              Idade: {avaliacao.idade}
            </Text>

            <View style={estilos.linhaMedidas}>
              <View style={estilos.medida}>
                <Text style={estilos.rotuloDado}>Peso</Text>
                <Text style={estilos.valorMedida}>
                  {formatarNumero(avaliacao.pesoKg)} kg
                </Text>
              </View>

              <View style={estilos.medida}>
                <Text style={estilos.rotuloDado}>Altura</Text>
                <Text style={estilos.valorMedida}>
                  {formatarNumero(avaliacao.alturaCm)} cm
                </Text>
              </View>

              <View style={estilos.medida}>
                <Text style={estilos.rotuloDado}>IMC</Text>
                <Text style={estilos.valorMedida}>
                  {formatarNumero(avaliacao.imc)} kg/m²
                </Text>
              </View>
            </View>
          </Cartao>
        ))
      )}
    </View>
  );

  // Aba Planos.
  const renderizarPlanos = () => (
    <View>
      <Botao
        titulo="Criar plano para este paciente"
        aoPressionar={criarPlano}
        estilo={estilos.botaoTopo}
      />

      {planosDoPaciente.length === 0 ? (
        <Text style={estilos.vazio}>
          Nenhum plano alimentar para este paciente.
        </Text>
      ) : null}

      {planosEmVigor.length > 0 ? (
        <Text style={estilos.tituloLista}>
          Plano em vigor
        </Text>
      ) : null}

      {planosEmVigor.map((plano) => (
        <CartaoPlano
          key={plano.id}
          plano={plano}
          aoVer={() => verPlano(plano)}
          aoEditar={() =>
            navigation.navigate('CriarPlanoAlimentar', {
              planoId: plano.id,
            })
          }
          aoDuplicar={() => duplicarPlano(plano)}
          aoAlternarArquivo={() =>
            alternarArquivamentoPlano(plano.id)
          }
        />
      ))}

      {planosAnteriores.length > 0 ? (
        <Text style={estilos.tituloLista}>
          Anteriores
        </Text>
      ) : null}

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

  // Aba Registros.
  const renderizarRegistros = () => (
    <View>
      <Cartao estilo={estilos.seletorDia}>
        <TouchableOpacity
          onPress={() => mudarDiaDosRegistros(-1)}
          hitSlop={10}
        >
          <Icone
            nome="chevron-esquerda"
            tamanho={20}
            cor={cores.verdeBotao}
          />
        </TouchableOpacity>

        <Text style={estilos.textoDia}>
          {rotuloDoDia}
        </Text>

        <TouchableOpacity
          onPress={() => mudarDiaDosRegistros(1)}
          hitSlop={10}
          disabled={ehHoje}
        >
          <Icone
            nome="chevron-direita"
            tamanho={20}
            cor={ehHoje ? cores.linha : cores.verdeBotao}
          />
        </TouchableOpacity>
      </Cartao>

      {!registros ? (
        <Text style={estilos.vazio}>
          Nenhum registro neste dia.
        </Text>
      ) : (
        <View>
          <Cartao>
            <View style={estilos.linhaTituloGrafico}>
              <View style={estilos.linhaAgua}>
                <Icone
                  nome="gota"
                  tamanho={18}
                  cor={cores.verdeBotao}
                />
                <Text style={estilos.tituloAgua}>
                  Água
                </Text>
              </View>

              <Text style={estilos.valorAgua}>
                {formatarNumero(registros.aguaLitros)} L de{' '}
                {formatarNumero(registros.metaAguaLitros)} L
              </Text>
            </View>

            <BarraProgresso
              valor={
                registros.metaAguaLitros > 0
                  ? registros.aguaLitros / registros.metaAguaLitros
                  : 0
              }
            />

            <Text style={estilos.percentualAgua}>
              {registros.metaAguaLitros > 0
                ? Math.round(
                    (registros.aguaLitros /
                      registros.metaAguaLitros) *
                      100
                  )
                : 0}
              % da meta diária
            </Text>
          </Cartao>

          <Cartao>
            <View style={estilos.linhaTituloGrafico}>
              <Text style={estilos.tituloCartao}>
                Refeições
              </Text>

              <Selo
                texto={`${registros.refeicoes.filter((r) => r.horario).length} de ${registros.refeicoes.length} registrados`}
                tom="sucesso"
              />
            </View>

            {registros.refeicoes.map((refeicao) => {
              const registrada = Boolean(refeicao.horario);

              return (
                <View
                  key={refeicao.nome}
                  style={estilos.linhaRefeicao}
                >
                  <View
                    style={[
                      estilos.marcadorRefeicao,
                      registrada && estilos.marcadorRegistrada,
                    ]}
                  >
                    {registrada ? (
                      <Icone
                        nome="check"
                        tamanho={14}
                        cor={cores.branco}
                        espessura={3}
                      />
                    ) : null}
                  </View>

                  <View style={estilos.dadosRefeicao}>
                    <View style={estilos.linhaTituloGrafico}>
                      <Text style={estilos.nomeRefeicao}>
                        {refeicao.nome}
                      </Text>

                      <Text style={estilos.horarioRefeicao}>
                        {refeicao.horario || '—'}
                      </Text>
                    </View>

                    {registrada ? (
                      <Text style={estilos.descricaoRefeicao}>
                        {refeicao.descricao}
                      </Text>
                    ) : (
                      <View style={estilos.linhaTituloGrafico}>
                        <Text style={estilos.naoRegistrado}>
                          Não registrado
                        </Text>

                        <Text
                          style={estilos.linkLembrete}
                          onPress={() =>
                            lembrarRefeicao(refeicao.nome)
                          }
                        >
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
        <Icone
          nome="cadeado"
          tamanho={14}
          cor={cores.textoSecundario}
        />

        <Text style={estilos.textoSomenteLeitura}>
          Somente leitura: registros feitos pelo paciente.
        </Text>
      </View>
    </View>
  );

  // Renderização da ficha.
  return (
    <Tela
      titulo={paciente.nome}
      subtitulo={`${sexoPorExtenso} · ${formatarIdade(idadeEmMeses)}`}
      direita={
        <Avatar
          nome={paciente.nome}
          tamanho={52}
          cor={cores.branco}
          corTexto={cores.verdeEscuro}
        />
      }
    >
      <Abas
        abas={abasDaFicha}
        ativa={aba}
        aoMudar={setAba}
      />

      {aba === 'resumo' && renderizarResumo()}
      {aba === 'avaliacoes' && renderizarAvaliacoes()}
      {aba === 'planos' && renderizarPlanos()}
      {aba === 'registros' && renderizarRegistros()}
    </Tela>
  );
};

export default FichaPaciente;
