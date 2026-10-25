// Tela inicial do paciente: resumo de hoje, próxima consulta e atalhos.
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Pessoa from '../../assets/pessoa.svg';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Icone from '../../componentes/Icone';
import Selo from '../../componentes/Selo';
import Botao from '../../componentes/Botao';
import BarraProgresso from '../../componentes/BarraProgresso';
import SemSessaoPaciente from '../../componentes/SemSessaoPaciente';
import { useDados } from '../../contexto/DadosContexto';
import { cores } from '../../tema';
import { formatarDataExtensa, formatarHora } from '../../utilitarios/datas';
import { formatarNumero } from '../../utilitarios/formatos';
import { estilos } from './style';

// "aba: true" = destino é uma aba da barra inferior (troca de tela em vez de empilhar).
const atalhos = [
  { chave: 'plano', rotulo: 'Meu plano', icone: 'prancheta', rota: 'MeuPlano' },
  { chave: 'evolucao', rotulo: 'Minha evolução', icone: 'grafico', rota: 'EvolucaoPaciente' },
  { chave: 'agua', rotulo: 'Registrar água', icone: 'gota', rota: 'RegistrosPaciente', aba: true },
];

const statusDaConsulta = {
  confirmada: { texto: 'Confirmada', tom: 'sucesso' },
  pendente: { texto: 'Aguardando confirmação', tom: 'alerta' },
};

const HomePaciente = ({ navigation }) => {
  const { pacienteAtual: paciente, consultas, montarRegistrosDoDia } = useDados();

  if (!paciente) return <SemSessaoPaciente />;

  const agora = new Date();
  const registros = montarRegistrosDoDia(paciente.id, agora);
  const refeicoesRegistradas = registros.refeicoes.filter((refeicao) => refeicao.horario).length;
  const totalDeRefeicoes = registros.refeicoes.length;
  const progressoDaAgua = registros.metaAguaLitros ? registros.aguaLitros / registros.metaAguaLitros : 0;

  const proximaConsulta = consultas
    .filter(
      (consulta) =>
        consulta.pacienteId === paciente.id &&
        consulta.inicio >= agora &&
        (consulta.status === 'pendente' || consulta.status === 'confirmada')
    )
    .sort((a, b) => a.inicio - b.inicio)[0];

  const abrir = (atalho) =>
    atalho.aba ? navigation.replace(atalho.rota) : navigation.navigate(atalho.rota);

  return (
    <Tela
      titulo={`Olá, ${paciente.nome.split(' ')[0]}`}
      subtitulo="Acompanhe o seu plano e os seus registros de hoje."
      mostrarVoltar={false}
      cabecalhoRolavel
      direita={
        <View style={estilos.emblema}>
          <Pessoa width={44} height={44} />
        </View>
      }
      abaAtiva="inicio"
      perfilBarra="paciente"
    >
      {/* Resumo de hoje */}
      <Cartao>
        <View style={estilos.linhaTitulo}>
          <Text style={estilos.tituloCartao}>Hoje</Text>
          <Selo
            texto={`${refeicoesRegistradas} de ${totalDeRefeicoes} refeições`}
            tom={refeicoesRegistradas === totalDeRefeicoes ? 'sucesso' : 'alerta'}
          />
        </View>

        <View style={estilos.linhaAgua}>
          <View style={estilos.rotuloAgua}>
            <Icone nome="gota" tamanho={18} cor={cores.verdeBotao} />
            <Text style={estilos.tituloAgua}>Água</Text>
          </View>
          <Text style={estilos.valorAgua}>
            {formatarNumero(registros.aguaLitros)} L de {formatarNumero(registros.metaAguaLitros)} L
          </Text>
        </View>
        <BarraProgresso valor={progressoDaAgua} />

        <Botao
          titulo="Registrar agora"
          aoPressionar={() => navigation.replace('RegistrosPaciente')}
          estilo={estilos.botaoRegistrar}
        />
      </Cartao>

      {/* Próxima consulta */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Próxima consulta</Text>
        {proximaConsulta ? (
          <View style={estilos.linhaConsulta}>
            <View style={estilos.circuloConsulta}>
              <Icone nome="calendario" tamanho={22} cor={cores.verdeEscuro} />
            </View>
            <View style={estilos.dadosConsulta}>
              <Text style={estilos.dataConsulta}>{formatarDataExtensa(proximaConsulta.inicio)}</Text>
              <Text style={estilos.detalheConsulta}>
                {formatarHora(proximaConsulta.inicio)} · {proximaConsulta.tipo}
              </Text>
            </View>
            <Selo
              texto={statusDaConsulta[proximaConsulta.status].texto}
              tom={statusDaConsulta[proximaConsulta.status].tom}
            />
          </View>
        ) : (
          <View style={estilos.caixaVazia}>
            <View style={estilos.circuloVazio}>
              <Icone nome="calendario" tamanho={24} cor={cores.verdeLink} />
            </View>
            <Text style={estilos.vazio}>Nenhuma consulta marcada.</Text>
            <Text style={estilos.vazioDetalhe}>Seu nutricionista marca as consultas e avisa você por aqui.</Text>
          </View>
        )}
      </Cartao>

      {/* Atalhos */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Acesso rápido</Text>
        <View style={estilos.linhaAtalhos}>
          {atalhos.map((atalho) => (
            <TouchableOpacity
              key={atalho.chave}
              style={estilos.atalho}
              onPress={() => abrir(atalho)}
              activeOpacity={0.8}
            >
              <View style={estilos.circuloAtalho}>
                <Icone nome={atalho.icone} tamanho={28} cor={cores.verdeEscuro} />
              </View>
              <Text style={estilos.rotuloAtalho}>{atalho.rotulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Cartao>
    </Tela>
  );
};

export default HomePaciente;
