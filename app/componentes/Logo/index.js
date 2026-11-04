// Logo do HealthPlus.
//
// A arte completa (assets/logo.png) é o emblema redondo mais a palavra
// "HealthPlus" e a linha "ACOMPANHAMENTO NUTRICIONAL". No canto de um
// cabeçalho ela não cabe deitada: a tagline ficaria com dois pixels de
// altura e viraria borrão. Por isso o padrão aqui é só o emblema redondo
// (assets/logo-marca.png), que é o que ocupa bem um canto.
//
// Props:
//   tamanho    lado do emblema, ou altura quando completo (padrão: 84)
//   completo   true usa a arte deitada inteira, com o nome escrito ao lado.
//              Use onde houver largura de sobra — tela de abertura, por
//              exemplo —, nunca no canto de um cabeçalho
//   estilo
import React from 'react';
import { Image } from 'react-native';
import { estilos } from './style';

const MARCA = require('../../assets/logo-marca.png');
const COMPLETO = require('../../assets/logo.png');

// Proporção da arte deitada (1915 x 495 no arquivo), para a largura
// acompanhar a altura pedida sem deformar o desenho.
const PROPORCAO_COMPLETO = 1915 / 495;

const Logo = ({ tamanho = 84, completo = false, estilo }) => (
  <Image
    source={completo ? COMPLETO : MARCA}
    style={[
      estilos.logo,
      completo
        ? { height: tamanho, width: tamanho * PROPORCAO_COMPLETO }
        : { height: tamanho, width: tamanho },
      estilo,
    ]}
    resizeMode="contain"
    accessibilityRole="image"
    accessibilityLabel="HealthPlus"
  />
);

export default Logo;
