// Calculadora OMS: escolhe o paciente (ou cálculo avulso), informa as medidas
// e segue para a tela de resultados com os z-scores.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import CampoBusca from '../../componentes/CampoBusca';
import CampoTexto from '../../componentes/CampoTexto';
import Alternador from '../../componentes/Alternador';
import CaixaAviso from '../../componentes/CaixaAviso';
import Avatar from '../../componentes/Avatar';
import Icone from '../../componentes/Icone';
import Botao from '../../componentes/Botao';
import { useDados } from '../../contexto/DadosContexto';
import { cores } from '../../tema';
import { calcularImc } from '../../utilitarios/oms/avaliacaoOms';
import { aplicarMascaraData, aplicarMascaraDecimal, decimalParaNumero } from '../../utilitarios/mascaras';
import {
  converterDataBR,
  formatarDataBR,
  calcularIdadeEmMeses,
  formatarIdade,
} from '../../utilitarios/datas';
import { formatarNumero, normalizarTexto } from '../../utilitarios/formatos';
import { estilos } from './style';

const IDADE_MAXIMA_OMS_MESES = 19 * 12;

const Calculadora = ({ navigation, route }) => {
  const { pacientes } = useDados();

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
  const nascimento = modoAvulso ? converterDataBR(nascimentoAvulso) : paciente ? paciente.nascimento : null;
  const dataDaVisita = converterDataBR(dataVisita);

  const idadeEmMeses = nascimento && dataDaVisita ? calcularIdadeEmMeses(nascimento, dataDaVisita) : null;

  // Posição padrão: menores de 2 anos são medidos deitados.
  const posicaoPadrao = idadeEmMeses !== null && idadeEmMeses < 24 ? 'deitado' : 'de_pe';
  const posicao = posicaoEscolhida || posicaoPadrao;

  // Alguns indicadores só existem em certas idades. Antes o campo sumia da
  // tela e ninguém entendia por quê; agora ele continua visível, bloqueado,
  // com o motivo no lugar do texto de exemplo.
  const perimetroCefalicoVale = idadeEmMeses === null || idadeEmMeses <= 60;
  const bracoEPregasValem = idadeEmMeses === null || (idadeEmMeses >= 3 && idadeEmMeses <= 60);

  // Acima de 19 anos entra a classificação de IMC para adultos.
  const adulto = idadeEmMeses !== null && idadeEmMeses > IDADE_MAXIMA_OMS_MESES;

  const motivoPerimetroCefalico = perimetroCefalicoVale ? null : 'Só até 5 anos';
  const motivoBracoEPregas = bracoEPregasValem
    ? null
    : idadeEmMeses !== null && idadeEmMeses < 3
      ? 'A partir de 3 meses'
      : 'Só até 5 anos';

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

  const alternarModoAvulso = () => {
    setModoAvulso(true);
    setPacienteId(null);
    setBusca('');
  };

  const voltarParaCadastrado = () => {
    setModoAvulso(false);
    setNascimentoAvulso('');
  };

  const calcular = () => {
    const novosErros = {};
    if (!modoAvulso && !paciente) novosErros.paciente = 'Selecione um paciente ou use o cálculo avulso.';
    if (modoAvulso && !nascimento) novosErros.nascimento = 'Informe a data de nascimento.';
    if (!dataDaVisita) novosErros.dataVisita = 'Informe uma data válida.';
    else if (nascimento && dataDaVisita < nascimento) novosErros.dataVisita = 'A visita não pode ser antes do nascimento.';
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
        perimetroCefalicoCm: decimalParaNumero(perimetroCefalico),
        perimetroBracoCm: decimalParaNumero(perimetroBraco),
        pregaTricipitalMm: decimalParaNumero(pregaTricipital),
        pregaSubescapularMm: decimalParaNumero(pregaSubescapular),
      },
    });
  };

  return (
    <Tela
      titulo="Calculadora OMS"
      subtitulo="Avaliação antropométrica"
      rodape={<Botao titulo="Calcular resultados" aoPressionar={calcular} />}
    >
      {/* ---------- Paciente ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Paciente</Text>

        <Alternador
          opcoes={[
            { valor: 'cadastrado', rotulo: 'Paciente cadastrado' },
            { valor: 'avulso', rotulo: 'Cálculo avulso' },
          ]}
          valor={modoAvulso ? 'avulso' : 'cadastrado'}
          aoMudar={(escolha) =>
            escolha === 'avulso' ? alternarModoAvulso() : voltarParaCadastrado()
          }
          estilo={estilos.alternadorModo}
        />

        {!modoAvulso ? (
          <View>
            <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Nome ou CPF" />

            {resultadosDaBusca.map((item) => (
              <TouchableOpacity key={item.id} style={estilos.itemBusca} onPress={() => selecionarPaciente(item.id)}>
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
            <CampoTexto
              rotulo="Data de nascimento"
              valor={nascimentoAvulso}
              aoMudar={(texto) => setNascimentoAvulso(aplicarMascaraData(texto))}
              aoLimpar={() => setNascimentoAvulso('')}
              selecionarAoFocar
              maxCaracteres={10}
              placeholder="DD/MM/AAAA"
              teclado="number-pad"
              icone="calendario"
              erro={erros.nascimento}
            />
            <Text style={estilos.linkAvulso} onPress={() => setModoAvulso(false)}>
              Escolher um paciente cadastrado
            </Text>
          </View>
        )}
      </Cartao>

      {/* ---------- Avaliação ---------- */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Avaliação</Text>
        <View style={estilos.linhaCampos}>
          <CampoTexto
            rotulo="Data da visita"
            valor={dataVisita}
            aoMudar={(texto) => setDataVisita(aplicarMascaraData(texto))}
            aoLimpar={() => setDataVisita('')}
            selecionarAoFocar
            maxCaracteres={10}
            placeholder="DD/MM/AAAA"
            teclado="number-pad"
            icone="calendario"
            erro={erros.dataVisita}
            estilo={estilos.campoMetade}
          />
          <CampoTexto
            rotulo="Idade na visita"
            valor={idadeEmMeses === null ? '—' : formatarIdade(idadeEmMeses)}
            somenteLeitura
            estilo={estilos.campoMetade}
          />
        </View>

        {adulto ? (
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
        <Text style={estilos.dicaCartao}>Alguns campos dependem da idade (OMS).</Text>

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
            rotulo="Altura/comprimento (cm)"
            valor={altura}
            aoMudar={(texto) => setAltura(aplicarMascaraDecimal(texto))}
            placeholder="0,0"
            teclado="decimal-pad"
            estilo={estilos.campoMetade}
          />
        </View>

        <Text style={estilos.rotuloCampo}>Medida(s) deitado ou de pé</Text>
        <Alternador
          opcoes={[
            { valor: 'deitado', rotulo: 'Deitado' },
            { valor: 'de_pe', rotulo: 'De pé' },
          ]}
          valor={posicao}
          aoMudar={setPosicaoEscolhida}
        />

        <View style={estilos.linhaCampos}>
          <CampoTexto
            rotulo="Perímetro cefálico (cm)"
            valor={perimetroCefalicoVale ? perimetroCefalico : ''}
            aoMudar={(texto) => setPerimetroCefalico(aplicarMascaraDecimal(texto))}
            placeholder={motivoPerimetroCefalico ?? '0,0'}
            somenteLeitura={!perimetroCefalicoVale}
            teclado="decimal-pad"
            estilo={estilos.campoMetade}
          />
          <CampoTexto
            rotulo="Circunf. braço (PB) (cm)"
            valor={bracoEPregasValem ? perimetroBraco : ''}
            aoMudar={(texto) => setPerimetroBraco(aplicarMascaraDecimal(texto))}
            placeholder={motivoBracoEPregas ?? '0,0'}
            somenteLeitura={!bracoEPregasValem}
            teclado="decimal-pad"
            estilo={estilos.campoMetade}
          />
        </View>

        <View style={estilos.linhaCampos}>
          <CampoTexto
            rotulo="Prega tricipital (mm)"
            valor={bracoEPregasValem ? pregaTricipital : ''}
            aoMudar={(texto) => setPregaTricipital(aplicarMascaraDecimal(texto))}
            placeholder={motivoBracoEPregas ?? '0,0'}
            somenteLeitura={!bracoEPregasValem}
            teclado="decimal-pad"
            estilo={estilos.campoMetade}
          />
          <CampoTexto
            rotulo="Prega subescapular (mm)"
            valor={bracoEPregasValem ? pregaSubescapular : ''}
            aoMudar={(texto) => setPregaSubescapular(aplicarMascaraDecimal(texto))}
            placeholder={motivoBracoEPregas ?? '0,0'}
            somenteLeitura={!bracoEPregasValem}
            teclado="decimal-pad"
            estilo={estilos.campoMetade}
          />
        </View>

        {/* PB e pregas ainda nao tem tabela de referencia no projeto. */}
        {bracoEPregasValem ? (
          <Text style={estilos.avisoSemTabela}>
            PB e pregas ainda não têm tabela de referência: ficam registrados,
            mas sem escore-z.
          </Text>
        ) : null}

        <View style={estilos.caixaImc}>
          <Text style={estilos.rotuloImc}>IMC calculado</Text>
          <Text style={estilos.valorImc}>{imc ? `${formatarNumero(imc)} kg/m²` : '—'}</Text>
        </View>
      </Cartao>
    </Tela>
  );
};

export default Calculadora;
