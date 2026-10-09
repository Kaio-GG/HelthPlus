
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

export default function CadastroNutricionista({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [crn, setCrn] = useState('');
  const [senha, setSenha] = useState('');

  function cadastrar() {
    if (!nome.trim() || !email.trim() || !crn.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    Alert.alert(
      'Demonstração',
      'A tela está funcionando, mas o cadastro ainda não salva os dados.',
      [
        {
          text: 'Voltar ao login',
          onPress: () => navigation.navigate('Nutricionista'),
        },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.titulo}>Crie sua conta</Text>
      <Text style={s.subtitulo}>
        Cadastre-se para utilizar o Health Plus.
      </Text>

      <Text style={s.label}>Nome completo</Text>
      <TextInput
        style={s.input}
        placeholder="Digite seu nome"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={s.label}>E-mail</Text>
      <TextInput
        style={s.input}
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={s.label}>Número do CRN</Text>
      <TextInput
        style={s.input}
        placeholder="Digite seu registro profissional"
        value={crn}
        onChangeText={setCrn}
      />

      <Text style={s.label}>Senha</Text>
      <TextInput
        style={s.input}
        placeholder="Crie uma senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={s.botao} onPress={cadastrar}>
        <Text style={s.botaoTexto}>Criar conta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.linkBotao}
        onPress={() => navigation.navigate('Nutricionista')}
      >
        <Text style={s.link}>Já tenho uma conta — entrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 26,
    backgroundColor: '#FFF8C9',
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#204D36',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 15,
    color: '#444',
    marginBottom: 25,
    lineHeight: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#204D36',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B8D9C3',
    borderRadius: 13,
    padding: 14,
    fontSize: 16,
    marginBottom: 17,
  },
  botao: {
    backgroundColor: '#379765',
    padding: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 5,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  linkBotao: {
    padding: 16,
    alignItems: 'center',
  },
  link: {
    color: '#26764A',
    fontWeight: '600',
    textAlign: 'center',
  },
});