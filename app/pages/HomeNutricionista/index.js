// Tela inicial do nutricionista: atalhos, próximas consultas e resumo do plano.
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import Medico from '../../assets/Medico.svg';
import Tela from '../../componentes/Tela';
import Cartao from '../../componentes/Cartao';
import Icone from '../../componentes/Icone';
import Selo from '../../componentes/Selo';
import Botao from '../../componentes/Botao';
import BarraProgresso from '../../componentes/BarraProgresso';
import { useDados } from '../../contexto/DadosContexto';
import { cores, espacamento } from '../../tema';
import { nomesDiasSemana, somarDias, mesmoDia, formatarHora } from '../../utilitarios/datas';
import { estilos } from './style';

const slidesDoBanner = [
  { titulo: 'Health Plus', texto: 'Avalie indicadores nutricionais de forma rápida utilizando referências da OMS.' },
  { titulo: 'Planos alimentares', texto: 'Monte, duplique e acompanhe os planos dos seus pacientes.' },
  { titulo: 'Agenda', texto: 'Organize suas consultas e avise o paciente pelo aplicativo.' },
];

const atalhos = [
  { chave: 'cadastrar', rotulo: 'Cadastrar Paciente', icone: 'usuario-mais', rota: 'CadastroPaciente' },
  { chave: 'consultar', rotulo: 'Consultar Pacientes', icone: 'usuarios', rota: 'Pacientes' },
  { chave: 'plano', rotulo: 'Criar Plano Alimentar', icone: 'prancheta', rota: 'CriarPlanoAlimentar' },
  { chave: 'calculadora', rotulo: 'Calculadora OMS', icone: 'calculadora', rota: 'Calculadora' },
];

const HomeNutricionista = ({ navigation }) => {
  const { nutricionista, pacientes, consultas, planoAtual, limitePacientes } = useDados();
  const { width: larguraTela } = useWindowDimensions();

  const [slideAtual, setSlideAtual] = useState(0);
  const [deslocamentoDia, setDeslocamentoDia] = useState(0);

  // Largura do banner = largura da tela menos as margens laterais.
  const larguraBanner = larguraTela - espacamento.lg * 2;

  const aoTerminarRolagem = (evento) => {
    setSlideAtual(Math.round(evento.nativeEvent.contentOffset.x / larguraBanner));
  };

  // Dia selecionado em "Próximas Consultas" (hoje + deslocamento, de 0 a 6).
  const diaSelecionado = somarDias(new Date(), deslocamentoDia);
  const consultasDoDia = consultas
    .filter((consulta) => mesmoDia(consulta.inicio, diaSelecionado) && consulta.status !== 'cancelada')
    .sort((a, b) => a.inicio - b.inicio);

  const mudarDia = (passo) => {
    const novo = deslocamentoDia + passo;
    if (novo >= 0 && novo <= 6) setDeslocamentoDia(novo);
  };

  const usoDoPlano = limitePacientes ? pacientes.length / limitePacientes : 0;

  return (
    <Tela
      titulo={`Olá, ${nutricionista?.nome?.replace(' ', '') ?? 'Nutricionista'}`}
      subtitulo="Ferramentas e informações rápidas para apoiar suas avaliações nutricionais."
      mostrarVoltar={false}
      direita={<Medico width={64} height={64} />}
      abaAtiva="inicio"
    >
      {/* Banner com rolagem horizontal */}
      <View style={estilos.bannerContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={aoTerminarRolagem}
        >
          {slidesDoBanner.map((slide) => (
            <View key={slide.titulo} style={[estilos.banner, { width: larguraBanner }]}>
              <Text style={estilos.tituloBanner}>{slide.titulo}</Text>
              <Text style={estilos.textoBanner}>{slide.texto}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={estilos.pontos}>
          {slidesDoBanner.map((slide, indice) => (
            <View key={slide.titulo} style={[estilos.ponto, indice === slideAtual && estilos.pontoAtivo]} />
          ))}
        </View>
      </View>

      {/* Atalhos */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Navegue entre sessões</Text>
        <View style={estilos.linhaAtalhos}>
          {atalhos.map((atalho) => (
            <TouchableOpacity
              key={atalho.chave}
              style={estilos.atalho}
              onPress={() => navigation.navigate(atalho.rota)}
              activeOpacity={0.8}
            >
              <View style={estilos.circuloAtalho}>
                <Icone nome={atalho.icone} tamanho={26} cor={cores.verdeEscuro} />
              </View>
              <Text style={estilos.rotuloAtalho}>{atalho.rotulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Cartao>

      {/* Próximas consultas */}
      <Cartao>
        <Text style={estilos.tituloCartao}>Próximas Consultas</Text>
        <View style={estilos.seletorDia}>
          <TouchableOpacity onPress={() => mudarDia(-1)} style={estilos.setaDia} hitSlop={8}>
            <Icone nome="chevron-esquerda" tamanho={18} cor={cores.verdeEscuro} />
          </TouchableOpacity>
          <Text style={estilos.textoDia}>
            {deslocamentoDia === 0 ? 'Hoje' : nomesDiasSemana[diaSelecionado.getDay()]}
          </Text>
          <TouchableOpacity onPress={() => mudarDia(1)} style={estilos.setaDia} hitSlop={8}>
            <Icone nome="chevron-direita" tamanho={18} cor={cores.verdeEscuro} />
          </TouchableOpacity>
        </View>

        {consultasDoDia.length === 0 ? (
          <Text style={estilos.vazio}>Nenhuma consulta neste dia.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {consultasDoDia.map((consulta) => {
              const fim = new Date(consulta.inicio.getTime() + consulta.duracao * 60000);
              return (
                <View key={consulta.id} style={estilos.cartaoConsulta}>
                  <View style={estilos.avatarConsulta}>
                    <Icone nome="usuario" tamanho={22} cor={cores.verdeEscuro} />
                  </View>
                  <Text style={estilos.nomeConsulta} numberOfLines={1}>
                    {consulta.nome}
                  </Text>
                  <Text style={estilos.horaConsulta}>
                    {formatarHora(consulta.inicio)} - {formatarHora(fim)}
                  </Text>
                  <Text style={estilos.acessoConsulta}>
                    Acesso: {consulta.avulso ? 'Sem app' : 'App'}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </Cartao>

      {/* Meu plano */}
      <Cartao>
        <View style={estilos.linhaPlano}>
          <Text style={estilos.tituloCartao}>Meu Plano</Text>
          <Selo texto="Pagamento em Dia" tom="sucesso" />
        </View>
        <Text style={estilos.textoPlano}>
          {planoAtual ? `Plano ${planoAtual.nome} · ` : ''}Próxima cobrança em 20 dias
        </Text>

        <View style={estilos.linhaProgresso}>
          <Text style={estilos.rotuloProgresso}>Pacientes Cadastrados</Text>
          <Text style={estilos.valorProgresso}>
            {pacientes.length}/{limitePacientes || '∞'}
          </Text>
        </View>
        <BarraProgresso valor={limitePacientes ? usoDoPlano : 1} />

        <Botao
          titulo="Ver plano e pagamentos"
          aoPressionar={() => navigation.navigate('Pacotes')}
          estilo={estilos.botaoPlano}
        />
      </Cartao>
    </Tela>
  );
};

export default HomeNutricionista;
