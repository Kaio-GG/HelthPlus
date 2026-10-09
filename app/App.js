import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Inicio from './pages/InicialHome';
import Paciente from './pages/Paciente';
import Nutricionista from './pages/Nutricionista';

const Pilha = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Pilha.Navigator initialRouteName="Inicio">
        <Pilha.Screen
          name="Inicio"
          component={Inicio}
          options={{ headerShown: false }}
        />

        <Pilha.Screen
          name="Paciente"
          component={Paciente}
        />

        <Pilha.Screen
          name="Nutricionista"
          component={Nutricionista}
        />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}