// app/utilitarios/armazenamentoSeguro.js
// Onde a sessão (o token de login) fica guardada no celular.
//
// O AsyncStorage guarda em texto claro: num aparelho com root, ou num
// backup, o token sai de lá e abre a conta por 8 horas. O lugar certo é o
// cofre do sistema — Keychain no iOS, Keystore no Android —, que é o que o
// expo-secure-store usa.
//
// Para ligar o cofre, rode UMA vez dentro de app/:
//
//     npx expo install expo-secure-store
//
// Enquanto o pacote não estiver instalado, este arquivo cai no
// AsyncStorage e avisa no terminal do Expo. O require fica dentro de um
// try: o Metro aceita dependência opcional assim, e o app não quebra para
// quem ainda não instalou.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let SecureStore = null;

try {
  SecureStore = require('expo-secure-store');
} catch {
  SecureStore = null;
}

// No navegador (Expo Web) não existe cofre do sistema.
const usaCofre = Boolean(SecureStore?.setItemAsync) && Platform.OS !== 'web';

if (!usaCofre && Platform.OS !== 'web') {
  console.warn(
    '[segurança] expo-secure-store não está instalado: a sessão fica no ' +
      'AsyncStorage, sem criptografia. Rode "npx expo install expo-secure-store" dentro de app/.'
  );
}

// O SecureStore só aceita chaves com letras, números, ".", "-" e "_".
const chaveDoCofre = (chave) => chave.replace(/[^A-Za-z0-9._-]/g, '_');

export async function guardar(chave, valor) {
  if (usaCofre) {
    await SecureStore.setItemAsync(chaveDoCofre(chave), valor);
    // Apaga a cópia antiga em texto claro, de quem usava a versão anterior.
    await AsyncStorage.removeItem(chave).catch(() => {});
    return;
  }
  await AsyncStorage.setItem(chave, valor);
}

export async function ler(chave) {
  if (usaCofre) {
    const valor = await SecureStore.getItemAsync(chaveDoCofre(chave));
    if (valor !== null) return valor;

    // Migração: sessão salva pela versão anterior, no AsyncStorage. Passa
    // para o cofre e apaga de lá.
    const antigo = await AsyncStorage.getItem(chave);
    if (antigo !== null) {
      await guardar(chave, antigo);
      return antigo;
    }
    return null;
  }
  return AsyncStorage.getItem(chave);
}

export async function apagar(chave) {
  if (usaCofre) {
    await SecureStore.deleteItemAsync(chaveDoCofre(chave)).catch(() => {});
  }
  await AsyncStorage.removeItem(chave).catch(() => {});
}

export const cofreAtivo = usaCofre;
