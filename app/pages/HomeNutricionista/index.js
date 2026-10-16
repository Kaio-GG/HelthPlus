// Tela inicial do nutricionista: atalhos, próximas consultas e resumo do plano.
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import Medico from "../../assets/Medico.svg";
import Tela from "../../componentes/Tela";
import Cartao from "../../componentes/Cartao";
import Icone from "../../componentes/Icone";
import Selo from "../../componentes/Selo";
import Botao from "../../componentes/Botao";
import BarraProgresso from "../../componentes/BarraProgresso";
import { useDados } from "../../contexto/DadosContexto";
import { cores, espacamento } from "../../tema";
import {
  nomesDiasSemana,
  somarDias,
  mesmoDia,
  formatarHora,
} from "../../utilitarios/datas";
import { estilos, larguraCartaoConsulta } from "./style";

const slidesDoBanner = [
  {
    titulo: "Health Plus",
    texto:
      "Avalie indicadores nutricionais de forma rápida utilizando referências da OMS.",
  },
  {
    titulo: "Planos alimentares",
    texto: "Monte, duplique e acompanhe os planos dos seus pacientes.",
  },
  {
    titulo: "Agenda",
    texto: "Organize suas consultas e avise o paciente pelo aplicativo.",
  },
];

const atalhos = [
  {
    chave: "cadastrar",
    rotulo: "Cadastrar Paciente",
    icone: "usuario-mais",
    rota: "CadastroPaciente",
  },
  {
    chave: "consultar",
    rotulo: "Consultar Pacientes",
    icone: "usuarios",
    rota: "Pacientes",
  },
  {
    chave: "plano",
    rotulo: "Criar Plano Alimentar",
    icone: "prancheta",
    rota: "CriarPlanoAlimentar",
  },
  {
    chave: "calculadora",
    rotulo: "Calculadora OMS",
    icone: "calculadora",
    rota: "Calculadora",
  },
];

const HomeNutricionista = ({ navigation }) => {
  const { nutricionista, pacientes, consultas, planoAtual, limitePacientes } =
    useDados();
  const { width: larguraTela } = useWindowDimensions();

  const [slideAtual, setSlideAtual] = useState(0);
  const [deslocamentoDia, setDeslocamentoDia] = useState(0);

  // Referência do carrossel do banner
  const bannerRef = useRef(null);

  // Controle das setas « » ao lado da lista de consultas
  const listaConsultasRef = useRef(null);
  const posicaoLista = useRef(0);

  // Largura do banner = largura da tela menos as margens laterais.
  const larguraBanner = larguraTela - espacamento.lg * 2;

  // Carrossel infinito: copia o último slide antes do primeiro e o primeiro
  // depois do último. Ao chegar numa cópia, salta (sem animação) para o slide real.
  const total = slidesDoBanner.length;
  const slidesInfinitos = [
    slidesDoBanner[total - 1],
    ...slidesDoBanner,
    slidesDoBanner[0],
  ];

  const aoTerminarRolagem = (evento) => {
    const indice = Math.round(
      evento.nativeEvent.contentOffset.x / larguraBanner,
    );

    if (indice === 0) {
      // passou do primeiro para trás -> vai para o último
      bannerRef.current?.scrollTo({
        x: total * larguraBanner,
        animated: false,
      });
      setSlideAtual(total - 1);
    } else if (indice === total + 1) {
      // passou do último para frente -> vai para o primeiro
      bannerRef.current?.scrollTo({ x: larguraBanner, animated: false });
      setSlideAtual(0);
    } else {
      setSlideAtual(indice - 1);
    }
  };

  // Dia selecionado em "Próximas Consultas" (hoje + deslocamento, de 0 a 6).
  const diaSelecionado = somarDias(new Date(), deslocamentoDia);
  const consultasDoDia = consultas
    .filter(
      (consulta) =>
        mesmoDia(consulta.inicio, diaSelecionado) &&
        consulta.status !== "cancelada",
    )
    .sort((a, b) => a.inicio - b.inicio);

  const mudarDia = (passo) => {
    const novo = deslocamentoDia + passo;
    if (novo >= 0 && novo <= 6) setDeslocamentoDia(novo);
  };

  // Ao trocar de dia, a lista de consultas volta para o início
  useEffect(() => {
    posicaoLista.current = 0;
  }, [deslocamentoDia]);

  const rolarConsultas = (passo) => {
    const novo = Math.max(
      0,
      posicaoLista.current + passo * (larguraCartaoConsulta + 10),
    );
    posicaoLista.current = novo;
    listaConsultasRef.current?.scrollTo({ x: novo, animated: true });
  };

  const usoDoPlano = limitePacientes ? pacientes.length / limitePacientes : 0;
  const mostrarSetasLista = consultasDoDia.length > 2;

  return (
    <Tela
      titulo={`Olá, ${nutricionista?.nome?.replace(" ", "") ?? "Nutricionista"}`}
      subtitulo="Ferramentas e informações essenciais para apoiar suas avaliações nutricionais."
      mostrarVoltar={false}
      cabecalhoRolavel
      direita={
        <View style={estilos.emblema}>
          <Medico width={44} height={44} />
        </View>
      }
      abaAtiva="inicio"
    >
      {/* Banner com rolagem horizontal */}
      <View style={estilos.bannerContainer}>
        <ScrollView
          ref={bannerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onLayout={() =>
            // começa no primeiro slide real (o índice 0 é uma cópia do último)
            bannerRef.current?.scrollTo({ x: larguraBanner, animated: false })
          }
          onMomentumScrollEnd={aoTerminarRolagem}
        >
          {slidesInfinitos.map((slide, indice) => (
            <View
              key={`${slide.titulo}-${indice}`}
              style={[estilos.banner, { width: larguraBanner }]}
            >
              <View style={estilos.decoracaoGrande} />
              <View style={estilos.decoracaoPequena} />

              <View style={estilos.textosBanner}>
                <Text style={estilos.tituloBanner}>{slide.titulo}</Text>
                <Text style={estilos.textoBanner}>{slide.texto}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={estilos.pontos}>
          {slidesDoBanner.map((slide, indice) => (
            <View
              key={slide.titulo}
              style={[
                estilos.ponto,
                indice === slideAtual && estilos.pontoAtivo,
              ]}
            />
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
                <Icone
                  nome={atalho.icone}
                  tamanho={28}
                  cor={cores.verdeEscuro}
                />
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
          <TouchableOpacity
            onPress={() => mudarDia(-1)}
            style={estilos.setaDia}
            hitSlop={8}
          >
            <Icone
              nome="chevron-esquerda"
              tamanho={18}
              cor={cores.verdeEscuro}
            />
          </TouchableOpacity>
          <Text style={estilos.textoDia}>
            {deslocamentoDia === 0
              ? "Hoje"
              : nomesDiasSemana[diaSelecionado.getDay()]}
          </Text>
          <TouchableOpacity
            onPress={() => mudarDia(1)}
            style={estilos.setaDia}
            hitSlop={8}
          >
            <Icone
              nome="chevron-direita"
              tamanho={18}
              cor={cores.verdeEscuro}
            />
          </TouchableOpacity>
        </View>

        {consultasDoDia.length === 0 ? (
          <Text style={estilos.vazio}>Nenhuma consulta neste dia.</Text>
        ) : (
          <View style={estilos.linhaConsultas}>
            {mostrarSetasLista && (
              <TouchableOpacity
                onPress={() => rolarConsultas(-1)}
                style={estilos.setaLista}
                hitSlop={8}
              >
                <Icone
                  nome="chevron-esquerda"
                  tamanho={14}
                  cor={cores.verdeEscuro}
                />
              </TouchableOpacity>
            )}

            <ScrollView
              key={deslocamentoDia}
              ref={listaConsultasRef}
              style={estilos.listaConsultas}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={(evento) => {
                posicaoLista.current = evento.nativeEvent.contentOffset.x;
              }}
            >
              {consultasDoDia.map((consulta) => {
                const fim = new Date(
                  consulta.inicio.getTime() + consulta.duracao * 60000,
                );
                return (
                  <View key={consulta.id} style={estilos.cartaoConsulta}>
                    <View style={estilos.topoConsulta}>
                      <View style={estilos.avatarConsulta}>
                        <Icone
                          nome="usuario"
                          tamanho={26}
                          cor={cores.verdeEscuro}
                        />
                      </View>
                    </View>
                    <View style={estilos.baseConsulta}>
                      <Text style={estilos.nomeConsulta} numberOfLines={1}>
                        {consulta.nome}
                      </Text>
                      <Text style={estilos.horaConsulta}>
                        {formatarHora(consulta.inicio)} - {formatarHora(fim)}
                      </Text>
                      <Text style={estilos.acessoConsulta}>
                        Acesso: {consulta.avulso ? "Sem app" : "App"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {mostrarSetasLista && (
              <TouchableOpacity
                onPress={() => rolarConsultas(1)}
                style={estilos.setaLista}
                hitSlop={8}
              >
                <Icone
                  nome="chevron-direita"
                  tamanho={14}
                  cor={cores.verdeEscuro}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </Cartao>

      {/* Meu plano */}
      <Cartao>
        <View style={estilos.linhaPlano}>
          <Text style={estilos.tituloCartao}>Meu Plano</Text>
          <Selo texto="Pagamento em Dia" tom="sucesso" />
        </View>
        <Text style={estilos.textoPlano}>
          {planoAtual ? `Plano ${planoAtual.nome} · ` : ""}Próxima cobrança em
          20 dias
        </Text>

        <View style={estilos.linhaProgresso}>
          <Text style={estilos.rotuloProgresso}>Pacientes Cadastrados</Text>
          <Text style={estilos.valorProgresso}>
            {pacientes.length}/{limitePacientes || 0}
          </Text>
        </View>
        <BarraProgresso valor={limitePacientes ? usoDoPlano : 0} />

        <Botao
          titulo="Ver plano e pagamentos"
          aoPressionar={() => navigation.navigate("Pacotes")}
          estilo={estilos.botaoPlano}
        />
      </Cartao>
    </Tela>
  );
};

export default HomeNutricionista;
