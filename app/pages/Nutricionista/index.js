
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

export default function Nutricionista({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.logo}>
        <Text style={s.logoTexto}>Health Plus</Text>
      </View>

      <Text style={s.titulo}>Bem-vindo, Nutricionista!</Text>
      <Text style={s.subtitulo}>
        Entre na sua conta para acompanhar seus pacientes.
      </Text>

      <Text style={s.label}>E-mail</Text>
      <TextInput
        style={s.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#777"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={s.label}>Senha</Text>
      <TextInput
        style={s.input}
        placeholder="Digite sua senha"
        placeholderTextColor="#777"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={s.botao}
        onPress={() =>
          Alert.alert(
            'Modo de demonstração',
            'A autenticação ainda será conectada ao sistema.'
          )
        }
      >
        <Text style={s.botaoTexto}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.linkBotao}
        onPress={() => navigation.navigate('CadastroNutricionista')}
      >
        <Text style={s.link}>
          Ainda não tem conta? Cadastre-se
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.linkBotao}
        onPress={() => navigation.navigate('Inicio')}
      >
        <Text style={s.link}>Voltar ao início</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#FFF8C9',
  },
  logo: {
    alignSelf: 'center',
    backgroundColor: '#5DB582',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 22,
    marginBottom: 30,
  },
  logoTexto: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#204D36',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#204D36',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B8D9C3',
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    color: '#222',
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#379765',
    padding: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  linkBotao: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  link: {
    color: '#26764A',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});