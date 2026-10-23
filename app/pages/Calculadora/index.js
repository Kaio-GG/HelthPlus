// Calculadora OMS: com a faixa de referência já escolhida na tela anterior,
// escolhe o paciente (ou faz um cálculo avulso), recebe as medidas e segue
// para a tela de resultados.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoBusca from '../../componentes/CampoBusca';
import CampoTexto from '../../componentes/CampoTexto';
import CampoData from '../../componentes/CampoData';
import Alternador from '../../componentes/Alternador';
import CaixaAviso from '../../componentes/CaixaAviso';
import Avatar from '../../componentes/Avatar';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';
import { useDados } from '../../contexto/DadosContexto';
import { cores } from '../../tema';
import { calcularImc } from '../../utilitarios/oms/avaliacaoOms';
import { FAIXAS, faixaDaIdade, obterFaixa } from '../../utilitarios/oms/faixasOms';
import { aplicarMascaraDecimal, decimalParaNumero } from '../../utilitarios/mascaras';
import {
  converterDataBR,
  formatarDataBR,
  calcularIdadeEmDias,
  calcularIdadeEmMeses,
  formatarIdade,
} from '../../utilitarios/datas';
import { formatarNumero, normalizarTexto } from '../../utilitarios/formatos';
import { estilos } from './style';

// Perímetro braquial e dobras cutâneas só têm tabela a partir dos 3 meses.
const IDADE_MINIMA_BRACO_PREGAS_MESES = 3;

// Até 731 dias (2 anos) a OMS espera a criança medida deitada.
const DIAS_LIMITE_DEITADO = 731;

const Calculadora = ({ navigation, route }) => {
  const { pacientes } = useDados();

  // A faixa vem da tela anterior. Se alguém chegar aqui sem ela (um link
  // antigo, por exemplo), a primeira infância é o padrão mais seguro: é a
  // faixa com mais indicadores, e nenhum campo fica escondido.
  const faixa = obterFaixa(route.params?.faixa) ?? FAIXAS.primeira_infancia;

  // ----- Paciente -----
  const [busca, setBusca] = useState('');
  const [pacienteId, setPacienteId] = useState(route.params?.pacienteId || null);
  const [modoAvulso, setModoAvulso] = useState(false);
  const [sexoAvulso, setSexoAvulso] = useState('F');
  const [nascimentoAvulso, setNascimentoAvulso] = useState('');

  // ----- Avaliação -----
  const [dataVisita, setDataVisita] = useState(formatarDataBR(new Date()));

  // ----- Medidas -----
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [posicaoEscolhida, setPosicaoEscolhida] = useState(null); // null = automático pela idade
  const [perimetroCefalico, setPerimetroCefalico] = useState('');
  const [perimetroBraco, setPerimetroBraco] = useState('');
  const [pregaTricipital, setPregaTricipital] = useState('');
  const [pregaSubescapular, setPregaSubescapular] = useState('');

  const [erros, setErros] = useState({});

  const paciente = pacientes.find((item) => item.id === pacienteId) || null;
  const sexo = modoAvulso ? sexoAvulso : paciente ? paciente.sexo : null;
  const nascimento = modoAvulso
    ? converterDataBR(nascimentoAvulso)
    : paciente
      ? paciente.nascimento
      : null;
  const dataDaVisita = converterDataBR(dataVisita);

  const temIdade = Boolean(nascimento && dataDaVisita && dataDaVisita >= nascimento);
  const idadeEmDias = temIdade ? calcularIdadeEmDias(nascimento, dataDaVisita) : null;
  const idadeEmMeses = temIdade ? calcularIdadeEmMeses(nascimento, dataDaVisita) : null;

  // Posição padrão pela idade. A regra da OMS é em dias (731), não em meses.
  const posicaoPadrao =
    idadeEmDias !== null && idadeEmDias < DIAS_LIMITE_DEITADO ? 'deitado' : 'de_pe';
  const posicao = posicaoEscolhida || posicaoPadrao;

  // A faixa escolhida define quais campos aparecem...
  const mostraCampo = (nome) => faixa.campos.includes(nome);

  // ...e a idade informada define quais deles ainda fazem sentido. O campo
  // continua visível, bloqueado, com o motivo no lugar do texto de exemplo.
  const bracoEPregasValem =
    idadeEmMeses === null || idadeEmMeses >= IDADE_MINIMA_BRACO_PREGAS_MESES;
  const motivoBracoEPregas = bracoEPregasValem ? null : 'A partir de 3 meses';

  // A idade informada caiu em outra faixa? Avisa e oferece a troca, em vez de
  // deixar a tela mostrando os campos da referência errada.
  const faixaDaIdadeInformada = faixaDaIdade(idadeEmMeses);
  const faixaDivergente =
    faixaDaIdadeInformada && faixaDaIdadeInformada.chave !== faixa.chave
      ? faixaDaIdadeInformada
      : null;

  const pesoNumero = decimalParaNumero(peso);
  const alturaNumero = decimalParaNumero(altura);
  const imc = calcularImc(pesoNumero, alturaNumero);

  const resultadosDaBusca = busca.trim()
    ? pacientes
        .filter((item) => normalizarTexto(item.nome).includes(normalizarTexto(busca)))
        .slice(0, 4)
    : [];

  const selecionarPaciente = (id) => {
    setPacienteId(id);
    setModoAvulso(false);
    setBusca('');
    setPosicaoEscolhida(null);
  };

  // O alternador no topo do cartão já é a única forma de ir e voltar entre
  // "paciente cadastrado" e "cálculo avulso".
  const trocarModo = (escolha) => {
    const avulso = escolha === 'avulso';
    setModoAvulso(avulso);
    setBusca('');
    setPosicaoEscolhida(null);
    if (avulso) setPacienteId(null);
    else setNascimentoAvulso('');
  };

  // Troca a faixa mantendo tudo o que já foi digitado.
  const usarFaixa = (chave) => navigation.setParams({ faixa: chave });

  const calcular = () => {
    const novosErros = {};
    if (!modoAvulso && !paciente) {
      novosErros.paciente = 'Selecione um paciente ou use o cálculo avulso.';
    }
    if (modoAvulso && !nascimento) novosErros.nascimento = 'Informe a data de nascimento.';
    if (!dataDaVisita) novosErros.dataVisita = 'Informe uma data válida.';
    else if (nascimento && dataDaVisita < nascimento) {
      novosErros.dataVisita = 'A visita não pode ser antes do nascimento.';
    }
    if (!pesoNumero && !alturaNumero) novosErros.peso = 'Informe ao menos o peso ou a altura.';
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    navigation.navigate('ResultadoCalculadora', {
      pacienteId: paciente ? paciente.id : null,
      nomePaciente: paciente ? paciente.nome : 'Cálculo avulso',
      nascimentoMs: nascimento.getTime(),
      dataVisitaMs: dataDaVisita.getTime(),
      sexo,
      posicao,
      medidas: {
        pesoKg: pesoNumero,
        alturaCm: alturaNumero,
        // O que a faixa não mostra não entra no cálculo, mesmo que tenha
        // ficado preenchido de uma troca de faixa.
        perimetroCefalicoCm: mostraCampo('perimetroCefalico')
          ? decimalParaNumero(perimetroCefalico)
          : null,
        perimetroBracoCm: mostraCampo('perimetroBraco') ? decimalParaNumero(perimetroBraco) : null,
        pregaTricipitalMm: mostraCampo('pregaTricipital')
          ? decimalParaNumero(pregaTricipital)
          : null,
        pregaSubescapularMm: mostraCampo('pregaSubescapular')
          ? decimalParaNumero(pregaSubescapular)
          : null,
      },
    });
  };

  return (
    <Tela
      titulo="Calculadora OMS"
      subtitulo={`${faixa.rotulo} · ${faixa.fonte}`}
      rodape={<Botao titulo="Calcular resultados" aoPressionar={calcular} />}
    >
      {/* ---------- Faixa de referência ---------- */}
      <Cartao estilo={estilos.cartaoFaixa}>
        <View style={estilos.textosFaixa}>
          <Text style={estilos.rotuloFaixa}>Faixa de referência</Text>
          <Text style={estilos.valorFaixa}>{faixa.titulo}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Trocar a faixa de referência"
        >
          <Text style={estilos.trocarFaixa}>Trocar</Text>
        </TouchableOpacity>
      </Cartao>

      {/* ---------- Paciente ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Paciente</Text>

        <Alternador
          opcoes={[
            { valor: 'cadastrado', rotulo: 'Paciente cadastrado' },
            { valor: 'avulso', rotulo: 'Cálculo avulso' },
          ]}
          valor={modoAvulso ? 'avulso' : 'cadastrado'}
          aoMudar={trocarModo}
          estilo={estilos.alternadorModo}
        />

        {!modoAvulso ? (
          <View>
            <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Nome ou CPF" />

            {resultadosDaBusca.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={estilos.itemBusca}
                onPress={() => selecionarPaciente(item.id)}
              >
                <Avatar nome={item.nome} tamanho={34} />
                <Text style={estilos.nomeBusca}>{item.nome}</Text>
              </TouchableOpacity>
            ))}

            {paciente ? (
              <View style={estilos.pacienteSelecionado}>
                <Avatar nome={paciente.nome} tamanho={42} />
                <View style={estilos.dadosSelecionado}>
                  <Text style={estilos.nomeSelecionado}>{paciente.nome}</Text>
                  <Text style={estilos.detalheSelecionado}>
                    {paciente.sexo === 'F' ? 'Feminino' : 'Masculino'} ·{' '}
                    {formatarIdade(calcularIdadeEmMeses(paciente.nascimento))}
                  </Text>
                </View>
                <Icone nome="check" tamanho={20} cor={cores.verdeBotao} espessura={3} />
              </View>
            ) : null}
            {erros.paciente ? <Text style={estilos.erro}>{erros.paciente}</Text> : null}
          </View>
        ) : (
          <View>
            <Text style={estilos.rotuloCampo}>Sexo (usado nos cálculos da OMS)</Text>
            <Alternador
              opcoes={[
                { valor: 'F', rotulo: 'Feminino' },
                { valor: 'M', rotulo: 'Masculino' },
              ]}
              valor={sexoAvulso}
              aoMudar={setSexoAvulso}
            />
            <CampoData
              rotulo="Data de nascimento"
              valor={nascimentoAvulso}
              aoMudar={setNascimentoAvulso}
              // Ninguém nasce depois de hoje.
              dataMaxima={new Date()}
              erro={erros.nascimento}
            />
          </View>
        )}
      </Cartao>

      {/* ---------- Avaliação ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Avaliação</Text>
        <View style={estilos.linhaCampos}>
          <CampoData
            rotulo="Data da visita"
            valor={dataVisita}
            aoMudar={setDataVisita}
            erro={erros.dataVisita}
            estilo={estilos.campoMetade}
          />
          <CampoTexto
            rotulo="Idade na visita"
            valor={idadeEmMeses === null ? '—' : formatarIdade(idadeEmMeses)}
            somenteLeitura
            // Sem o cadeado: "10 anos e 5 meses" não cabia ao lado dele.
            mostrarCadeado={false}
            estilo={estilos.campoMetade}
          />
        </View>

        {faixaDivergente ? (
          <CaixaAviso tom="alerta" icone="alerta" estilo={estilos.avisoIdade}>
            <Text style={estilos.textoAviso}>
              Essa idade pertence à faixa de {faixaDivergente.rotulo}, não à que você escolheu. O
              resultado sempre segue a idade real — mas a tela está mostrando os campos da outra
              faixa.
            </Text>
            <TouchableOpacity
              onPress={() => usarFaixa(faixaDivergente.chave)}
              accessibilityRole="button"
            >
              <Text style={estilos.acaoAviso}>Usar a faixa de {faixaDivergente.rotulo}</Text>
            </TouchableOpacity>
          </CaixaAviso>
        ) : null}

        {faixa.chave === 'adulto' ? (
          <CaixaAviso
            tom="info"
            texto="Acima de 19 anos a OMS não tem curva de crescimento. O resultado traz o IMC classificado pelas faixas da OMS para adultos, sem escore-z."
            estilo={estilos.avisoIdade}
          />
        ) : null}
      </Cartao>

      {/* ---------- Medidas ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Medidas</Text>
        <Text style={estilos.dicaCartao}>{faixa.resumo}</Text>

        <View style={estilos.linhaCampos}>
          <CampoTexto
            rotulo="Peso (kg)"
            valor={peso}
            aoMudar={(texto) => setPeso(aplicarMascaraDecimal(texto))}
            placeholder="0,0"
            teclado="decimal-pad"
            erro={erros.peso}
            estilo={estilos.campoMetade}
          />
          <CampoTexto
            rotulo={posicao === 'deitado' ? 'Comprimento (cm)' : 'Estatura (cm)'}
            valor={altura}
            aoMudar={(texto) => setAltura(aplicarMascaraDecimal(texto))}
            placeholder="0,0"
            teclado="decimal-pad"
            estilo={estilos.campoMetade}
          />
        </View>

        {faixa.pedePosicao ? (
          <View>
            <Text style={estilos.rotuloCampo}>Medida feita deitado ou de pé</Text>
            <Alternador
              opcoes={[
                { valor: 'deitado', rotulo: 'Deitado' },
                { valor: 'de_pe', rotulo: 'De pé' },
              ]}
              valor={posicao}
              aoMudar={setPosicaoEscolhida}
            />
            <Text style={estilos.notaPosicao}>
              Até 2 anos a OMS espera a criança deitada; daí em diante, de pé. Se foi na outra
              posição, o cálculo converte 0,7 cm antes de comparar com a curva.
            </Text>
          </View>
        ) : null}

        {mostraCampo('perimetroCefalico') || mostraCampo('perimetroBraco') ? (
          <View style={estilos.linhaCampos}>
            {mostraCampo('perimetroCefalico') ? (
              <CampoTexto
                rotulo="Perímetro cefálico (cm)"
                valor={perimetroCefalico}
                aoMudar={(texto) => setPerimetroCefalico(aplicarMascaraDecimal(texto))}
                placeholder="0,0"
                teclado="decimal-pad"
                estilo={estilos.campoMetade}
              />
            ) : null}
            {mostraCampo('perimetroBraco') ? (
              <CampoTexto
                rotulo="Perímetro braquial (cm)"
                valor={bracoEPregasValem ? perimetroBraco : ''}
                aoMudar={(texto) => setPerimetroBraco(aplicarMascaraDecimal(texto))}
                placeholder={motivoBracoEPregas ?? '0,0'}
                somenteLeitura={!bracoEPregasValem}
                teclado="decimal-pad"
                estilo={estilos.campoMetade}
              />
            ) : null}
          </View>
        ) : null}

        {mostraCampo('pregaTricipital') ? (
          <View style={estilos.linhaCampos}>
            <CampoTexto
              rotulo="Prega tricipital (mm)"
              linhasDoRotulo={2}
              valor={bracoEPregasValem ? pregaTricipital : ''}
              aoMudar={(texto) => setPregaTricipital(aplicarMascaraDecimal(texto))}
              placeholder={motivoBracoEPregas ?? '0,0'}
              somenteLeitura={!bracoEPregasValem}
              teclado="decimal-pad"
              estilo={estilos.campoMetade}
            />
            <CampoTexto
              rotulo="Prega subescapular (mm)"
              linhasDoRotulo={2}
              valor={bracoEPregasValem ? pregaSubescapular : ''}
              aoMudar={(texto) => setPregaSubescapular(aplicarMascaraDecimal(texto))}
              placeholder={motivoBracoEPregas ?? '0,0'}
              somenteLeitura={!bracoEPregasValem}
              teclado="decimal-pad"
              estilo={estilos.campoMetade}
            />
          </View>
        ) : null}

        <View style={estilos.caixaImc}>
          <Text style={estilos.rotuloImc}>IMC calculado</Text>
          <Text style={estilos.valorImc}>{imc ? `${formatarNumero(imc)} kg/m²` : '—'}</Text>
        </View>
        {/* Pergunta que aparece sempre: "por que o IMC não muda com o sexo?" */}
        <Text style={estilos.notaImc}>
          O IMC é só peso ÷ altura², igual para qualquer pessoa. O que muda entre meninos e meninas
          é a leitura dele: o escore-z e a classificação saem de curvas separadas por sexo, na tela
          de resultados.
        </Text>
      </Cartao>
    </Tela>
  );
};

export default Calculadora;
