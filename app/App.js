// Navegação principal do aplicativo Health Plus.
// Todas as telas ficam em ./pages/<NomeDaTela>/ (index.js = código, style.js = estilo).
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider } from './contexto/AuthContext';
import { DadosProvider } from './contexto/DadosContexto';

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
import Calculadora from './pages/Calculadora';
import ResultadoCalculadora from './pages/ResultadoCalculadora';
import PlanosAlimentares from './pages/PlanosAlimentares';
import CriarPlanoAlimentar from './pages/CriarPlanoAlimentar';
import Pacotes from './pages/Pacotes';
import Agenda from './pages/Agenda';
import NovaConsulta from './pages/NovaConsulta';
import Perfil from './pages/Perfil';
import Termos from './pages/Termos';

const Pilha = createNativeStackNavigator();

// Telas das abas inferiores (Início, Agenda, Perfil): trocam sem animação.
const semAnimacao = { animation: 'none' };

export default function App() {
  return (
    // AuthProvider por fora: o DadosProvider precisa dele para ler o nutricionista logado.
    <AuthProvider>
      <DadosProvider>
        <NavigationContainer>
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
            <Pilha.Screen name="Calculadora" component={Calculadora} />
            <Pilha.Screen name="ResultadoCalculadora" component={ResultadoCalculadora} />

            {/* Planos alimentares */}
            <Pilha.Screen name="PlanosAlimentares" component={PlanosAlimentares} />
            <Pilha.Screen name="CriarPlanoAlimentar" component={CriarPlanoAlimentar} />

            {/* Assinatura, agenda e termos */}
            <Pilha.Screen name="Pacotes" component={Pacotes} />
            <Pilha.Screen name="NovaConsulta" component={NovaConsulta} />
            <Pilha.Screen name="Termos" component={Termos} />
          </Pilha.Navigator>
        </NavigationContainer>
      </DadosProvider>
    </AuthProvider>
  );
}