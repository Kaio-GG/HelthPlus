
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Inicio from './pages/inicialHome';
import Nutricionista from './pages/Nutricionista';
import CadastroNutricionista from './pages/CadastroNutricionista';
import Paciente from './pages/Paciente';

const Pilha = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Pilha.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          headerStyle: { backgroundColor: '#5DB582' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#FFF8C9' },
        }}
      >
        <Pilha.Screen
          name="Inicio"
          component={Inicio}
          options={{ headerShown: false }}
        />

        <Pilha.Screen
          name="Nutricionista"
          component={Nutricionista}
          options={{ title: 'Área do Nutricionista' }}
        />

        <Pilha.Screen
          name="CadastroNutricionista"
          component={CadastroNutricionista}
          options={{ title: 'Criar conta' }}
        />

        <Pilha.Screen
          name="Paciente"
          component={Paciente}
          options={{ title: 'Área do Paciente' }}
        />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}