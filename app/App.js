// Navegação principal do aplicativo Health Plus.
// Todas as telas ficam em ./pages/<NomeDaTela>/ (index.js = código, style.js = estilo).
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import { AuthProvider } from './contexto/AuthContext';
import { DadosProvider } from './contexto/DadosContexto';
import { NotificacoesProvider } from './contexto/NotificacoesContexto';
import { DialogoProvider } from './contexto/DialogoContexto';

// Entrada e acesso
import Inicio from './pages/inicialHome';
import Nutricionista from './pages/Nutricionista';
import Paciente from './pages/Paciente';
import EsqueciSenha from './pages/EsqueciSenha';
import VerificacaoEmail from './pages/VerificacaoEmail';
import RedefinirSenha from './pages/RedefinirSenha';
import PrimeiroAcesso from './pages/PrimeiroAcesso';

// Área do nutricionista
import HomeNutricionista from './pages/HomeNutricionista';
import CadastroPaciente from './pages/CadastroPaciente';
import Pacientes from './pages/Pacientes';
import FichaPaciente from './pages/FichaPaciente';
import FaixaCalculadora from './pages/FaixaCalculadora';
import Calculadora from './pages/Calculadora';
import ResultadoCalculadora from './pages/ResultadoCalculadora';
import PlanosAlimentares from './pages/PlanosAlimentares';
import CriarPlanoAlimentar from './pages/CriarPlanoAlimentar';
import Pacotes from './pages/Pacotes';
import Agenda from './pages/Agenda';
import NovaConsulta from './pages/NovaConsulta';
import Perfil from './pages/Perfil';
import AlterarSenha from './pages/AlterarSenha';
import Notificacoes from './pages/Notificacoes';
import PreferenciasNotificacao from './pages/PreferenciasNotificacao';
import Termos from './pages/Termos';

// Área do paciente
import HomePaciente from './pages/HomePaciente';
import RegistrosPaciente from './pages/RegistrosPaciente';
import MeuPlano from './pages/MeuPlano';
import EvolucaoPaciente from './pages/EvolucaoPaciente';
import AgendaPaciente from './pages/AgendaPaciente';
import PerfilPaciente from './pages/PerfilPaciente';

const Pilha = createNativeStackNavigator();

// Telas das abas inferiores (Início, Agenda, Perfil e as do paciente): trocam sem animação.
const semAnimacao = { animation: 'none' };

// Links que abrem o aplicativo direto numa tela.
//
// O e-mail de redefinição manda "healthplus://redefinir-senha?token=XXXXXXXX".
// O prefixo do Linking.createURL cobre o Expo Go, que usa um endereço
// "exp://..." em vez do esquema do aplicativo. Se mesmo assim o link não
// abrir, a tela "Verifique seu e-mail" aceita o código digitado.
const ligacoes = {
  prefixes: [Linking.createURL('/'), 'healthplus://'],
  config: {
    screens: {
      RedefinirSenha: 'redefinir-senha',
    },
  },
};

export default function App() {
  return (
    // AuthProvider por fora: os outros precisam dele para saber quem está logado.
    <AuthProvider>
      <DadosProvider>
        <NotificacoesProvider>
          {/* O DialogoProvider envolve a navegação, então o diálogo é
              desenhado por cima de qualquer tela. */}
          <DialogoProvider>
            <NavigationContainer linking={ligacoes}>
              <Pilha.Navigator
                initialRouteName="Inicio"
                screenOptions={{
                  // Cada tela desenha o próprio cabeçalho verde (componente Cabecalho).
                  headerShown: false,
                  contentStyle: { backgroundColor: '#FFF8C9' },
                }}
              >
                {/* Entrada e acesso */}
                <Pilha.Screen name="Inicio" component={Inicio} />
                <Pilha.Screen name="Nutricionista" component={Nutricionista} />
                <Pilha.Screen name="Paciente" component={Paciente} />
                <Pilha.Screen name="EsqueciSenha" component={EsqueciSenha} />
                <Pilha.Screen name="VerificacaoEmail" component={VerificacaoEmail} />
                <Pilha.Screen name="RedefinirSenha" component={RedefinirSenha} />
                <Pilha.Screen name="PrimeiroAcesso" component={PrimeiroAcesso} />

                {/* Abas do nutricionista */}
                <Pilha.Screen name="HomeNutricionista" component={HomeNutricionista} options={semAnimacao} />
                <Pilha.Screen name="Agenda" component={Agenda} options={semAnimacao} />
                <Pilha.Screen name="Perfil" component={Perfil} options={semAnimacao} />

                {/* Pacientes */}
                <Pilha.Screen name="CadastroPaciente" component={CadastroPaciente} />
                <Pilha.Screen name="Pacientes" component={Pacientes} />
                <Pilha.Screen name="FichaPaciente" component={FichaPaciente} />

                {/* Calculadora OMS */}
                <Pilha.Screen name="FaixaCalculadora" component={FaixaCalculadora} />
                <Pilha.Screen name="Calculadora" component={Calculadora} />
                <Pilha.Screen name="ResultadoCalculadora" component={ResultadoCalculadora} />

                {/* Planos alimentares */}
                <Pilha.Screen name="PlanosAlimentares" component={PlanosAlimentares} />
                <Pilha.Screen name="CriarPlanoAlimentar" component={CriarPlanoAlimentar} />

            {/* Assinatura, agenda e termos */}
            <Pilha.Screen name="Pacotes" component={Pacotes} />
            <Pilha.Screen name="NovaConsulta" component={NovaConsulta} />
            <Pilha.Screen name="Termos" component={Termos} />

            {/* Área do paciente: abas (Início, Registros, Consultas, Perfil) e telas de consulta */}
            <Pilha.Screen name="HomePaciente" component={HomePaciente} options={semAnimacao} />
            <Pilha.Screen name="RegistrosPaciente" component={RegistrosPaciente} options={semAnimacao} />
            <Pilha.Screen name="AgendaPaciente" component={AgendaPaciente} options={semAnimacao} />
            <Pilha.Screen name="PerfilPaciente" component={PerfilPaciente} options={semAnimacao} />
            <Pilha.Screen name="MeuPlano" component={MeuPlano} />
            <Pilha.Screen name="EvolucaoPaciente" component={EvolucaoPaciente} />
          </Pilha.Navigator>
        </NavigationContainer>
                {/* Conta, notificações, assinatura, agenda e termos */}
                <Pilha.Screen name="AlterarSenha" component={AlterarSenha} />
                <Pilha.Screen name="Notificacoes" component={Notificacoes} />
                <Pilha.Screen name="PreferenciasNotificacao" component={PreferenciasNotificacao} />
                <Pilha.Screen name="Pacotes" component={Pacotes} />
                <Pilha.Screen name="NovaConsulta" component={NovaConsulta} />
                <Pilha.Screen name="Termos" component={Termos} />
              </Pilha.Navigator>
            </NavigationContainer>
          </DialogoProvider>
        </NotificacoesProvider>
      </DadosProvider>
    </AuthProvider>
  );
}
