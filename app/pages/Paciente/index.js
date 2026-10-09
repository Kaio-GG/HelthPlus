
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

export default function Paciente({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.logo}>
        <Text style={s.logoTexto}>Health Plus</Text>
      </View>

      <Text style={s.titulo}>Olá, paciente!</Text>
      <Text style={s.subtitulo}>
        Acesse sua conta para acompanhar sua hidratação e alimentação.
      </Text>

      <Text style={s.label}>E-mail</Text>
      <TextInput
        style={s.input}
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={s.label}>Senha</Text>
      <TextInput
        style={s.input}
        placeholder="Digite sua senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={s.botao}
        onPress={() =>
          Alert.alert(
            'Modo de demonstração',
            'O login do paciente ainda será conectado ao sistema.'
          )
        }
      >
        <Text style={s.botaoTexto}>Entrar</Text>
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
    fontSize: 27,
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
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#379765',
    padding: 17,
    borderRadius: 15,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  linkBotao: {
    alignItems: 'center',
    padding: 16,
  },
  link: {
    color: '#26764A',
    fontWeight: '600',
  },
});