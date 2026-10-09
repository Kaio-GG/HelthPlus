import React from 'react';
import {View,Text,TouchableOpacity,StatusBar,Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { estilos } from './style';
import Medico from '../../assets/Medico.svg'
import Pessoa from '../../assets/pessoa.svg'


const Inicio = ({ navigation }) => {
return (
<View style={estilos.container}>
<StatusBar barStyle="dark-content" />

  <View style={estilos.cabecalho} />

  <SafeAreaView style={estilos.conteudo}>
    <View style={estilos.titulo}>
      <Text style={estilos.boasVindas}>Bem-Vindo ao</Text>
      <Text style={estilos.nomeApp}>Health Plus</Text>
    </View>

    <View style={estilos.cartao}>
      <Text style={estilos.pergunta}>
        Como você deseja usar o
        {'\n'}aplicativo hoje?
      </Text>

      <TouchableOpacity
        style={estilos.opcao}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Nutricionista')}
      >
        <View style={estilos.circuloIcone}>
          <Medico width={50} height={200} />
        </View>

        <View style={estilos.textos}>
          <Text style={estilos.tituloOpcao}>
            Sou Nutricionista
          </Text>

          <Text style={estilos.descricao}>
            Organize seus pacientes e use a calculadora OMS
          </Text>
        </View>

        
      </TouchableOpacity>

      <TouchableOpacity
        style={estilos.opcao}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Paciente')}
      >
        <View style={estilos.circuloIcone}>
          <Pessoa />
        </View>

        <View style={estilos.textos}>
          <Text style={estilos.tituloOpcao}>
            Sou Paciente
          </Text>

          <Text style={estilos.descricao}>
            Registre sua água e suas refeições
          </Text>
        </View>

        
      </TouchableOpacity>
    </View>

    <Text style={estilos.rodape}>
      Ao continuar, você concorda com os Termos de Uso e a
      Política de Privacidade
    </Text>
  </SafeAreaView>
</View>

);
};

export default Inicio;