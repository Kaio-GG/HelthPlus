// Gráfico de rosca (pizza com o meio vazado), desenhado com SVG.
//
// Serve para a composição de um todo: "das 12 leituras feitas nas suas
// avaliações, 8 estão adequadas, 3 em acompanhamento e 1 para avaliar".
//
// É rosca e não pizza cheia porque o buraco do meio ganha o número que
// importa — o total, ou o percentual da primeira fatia. Pizza cheia
// obrigaria a ler a legenda para saber a grandeza.
//
// As fatias são desenhadas com um círculo de contorno grosso e
// strokeDasharray: um arco por fatia, sem ter de montar caminho "A" de
// SVG à mão. O percentual de cada fatia vira um pedaço do perímetro.
//
// Props:
//   fatias     lista de { rotulo, valor, cor, descricao? }
//   tamanho    lado do quadrado do desenho (padrão: 150)
//   espessura  largura do anel (padrão: 26)
//   centro     { valor, rotulo } escrito no buraco do meio
//
// Quando a fatia traz "descricao", o item da legenda vira tocável e abre um
// balão com esse texto. É o que explica o que cada cor QUER DIZER: a
// legenda sozinha diz "Acompanhar 3", e "acompanhar" não significa nada
// para quem não é da área. Tocar de novo (ou tocar em outra) fecha.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Icone from '../Icone';
import { cores } from '../../tema';
import { estilos } from './style';

const GraficoPizza = ({ fatias, tamanho = 150, espessura = 26, centro }) => {
  const [fatiaAberta, setFatiaAberta] = useState(null);
  const comValor = (fatias || []).filter((fatia) => Number(fatia.valor) > 0);
  const total = comValor.reduce((soma, fatia) => soma + Number(fatia.valor), 0);

  if (total === 0) {
    return <Text style={estilos.vazio}>Sem dados para exibir.</Text>;
  }

  const raio = (tamanho - espessura) / 2;
  const perimetro = 2 * Math.PI * raio;

  // Cada fatia começa onde a anterior terminou, então cada uma precisa
  // saber quanto do círculo já foi usado antes dela.
  //
  // Esse acumulado é calculado AQUI, antes do JSX, e não dentro do
  // map() — uma variável somada durante a renderização dá resultado
  // diferente a cada passada, e o eslint do React barra justamente isso
  // (react-hooks/immutability).
  //
  // O -90 no grupo gira o desenho para a primeira fatia nascer no topo, e
  // não às 3 horas.
  const arcos = [];
  let percorrido = 0;

  for (const fatia of comValor) {
    const parte = Number(fatia.valor) / total;

    arcos.push({
      fatia,
      comprimento: parte * perimetro,
      deslocamento: -percorrido * perimetro,
    });

    percorrido += parte;
  }

  const aberta = comValor.find(
    (fatia, indice) => `${fatia.rotulo}-${indice}` === fatiaAberta
  );

  return (
    <View>
    <View style={estilos.container}>
      <View style={{ width: tamanho, height: tamanho }}>
        <Svg width={tamanho} height={tamanho}>
          <G rotation={-90} origin={`${tamanho / 2}, ${tamanho / 2}`}>
            {/* Trilha de fundo: fecha o anel quando as fatias não somam
                o círculo inteiro por arredondamento. */}
            <Circle
              cx={tamanho / 2}
              cy={tamanho / 2}
              r={raio}
              stroke={cores.linha}
              strokeWidth={espessura}
              fill="none"
            />

            {arcos.map((arco, indice) => (
              <Circle
                key={`${arco.fatia.rotulo}-${indice}`}
                cx={tamanho / 2}
                cy={tamanho / 2}
                r={raio}
                stroke={arco.fatia.cor}
                strokeWidth={espessura}
                fill="none"
                strokeDasharray={`${arco.comprimento} ${perimetro - arco.comprimento}`}
                strokeDashoffset={arco.deslocamento}
                strokeLinecap="butt"
              />
            ))}
          </G>
        </Svg>

        {centro ? (
          <View style={[estilos.centro, { width: tamanho, height: tamanho }]}>
            <Text style={estilos.valorCentro}>{centro.valor}</Text>
            {centro.rotulo ? (
              <Text style={estilos.rotuloCentro}>{centro.rotulo}</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={estilos.legenda}>
        {comValor.map((fatia, indice) => {
          const chave = `${fatia.rotulo}-${indice}`;
          const estaAberta = fatiaAberta === chave;
          const explicavel = Boolean(fatia.descricao);

          return (
            <TouchableOpacity
              key={`legenda-${chave}`}
              style={estilos.itemLegenda}
              activeOpacity={explicavel ? 0.6 : 1}
              disabled={!explicavel}
              onPress={() => setFatiaAberta(estaAberta ? null : chave)}
              accessibilityRole={explicavel ? 'button' : undefined}
              accessibilityState={explicavel ? { expanded: estaAberta } : undefined}
              accessibilityLabel={
                explicavel ? `O que significa ${fatia.rotulo}` : undefined
              }
            >
              <View style={[estilos.bolinha, { backgroundColor: fatia.cor }]} />
              <Text style={estilos.textoLegenda}>
                {fatia.rotulo}
                <Text style={estilos.numeroLegenda}>
                  {'  '}
                  {fatia.valor} ({Math.round((Number(fatia.valor) / total) * 100)}%)
                </Text>
              </Text>

              {explicavel ? (
                <Icone
                  nome="info"
                  tamanho={14}
                  cor={estaAberta ? fatia.cor : cores.textoDesabilitado}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>

    {/* O balão fica FORA da linha do desenho, e não embaixo do item da
        legenda: ali ele herdava a largura da coluna da legenda (uns 150 px
        no celular) e o texto saía em tiras de três palavras. Aqui ele tem
        a largura inteira do cartão. */}
    {aberta ? (
      <View style={[estilos.balao, { borderLeftColor: aberta.cor }]}>
        <Text style={estilos.tituloBalao}>{aberta.rotulo}</Text>
        <Text style={estilos.textoBalao}>{aberta.descricao}</Text>
      </View>
    ) : null}
    </View>
  );
};

export default GraficoPizza;
