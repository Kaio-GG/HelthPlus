# Health Plus

Aplicativo de acompanhamento nutricional. O nutricionista cadastra pacientes,
monta planos alimentares, registra avaliações antropométricas (padrão OMS) e
acompanha a agenda de consultas. O paciente acessa o próprio plano e registra
água e refeições.

- `app/` — aplicativo (React Native + Expo)
- `Api/` — API (Node + Express + MySQL)

## Antes de começar

Você precisa de:

- **Node.js 18 ou superior**
- **MySQL** rodando na sua máquina
- O aplicativo **Expo Go** no celular, ou um emulador Android/iOS

O celular e o computador precisam estar **na mesma rede Wi-Fi**.

## 1. Banco de dados

Crie as tabelas rodando o script. Ele pode ser executado mais de uma vez
sem dar erro:

```bash
mysql -u root -p < Api/database/schema.sql
```

Isso cria o banco `healthplus` com as tabelas `profissional`, `paciente` e
`usuario_paciente`.

> **No Windows o comando `mysql` normalmente não está no PATH.** Use o
> caminho completo (ajuste a versão se a sua for diferente):
>
> ```bash
> "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < Api/database/schema.sql
> ```
>
> Ou abra o `schema.sql` no MySQL Workbench e execute com o raio ⚡.

> `Api/database/schema.sql` é a fonte da verdade do banco. Se uma query nova
> precisar de uma coluna ou tabela, acrescente no arquivo **no mesmo commit** —
> senão o banco de quem baixar o código não vai bater com o código.

### Usuário do banco (recomendado)

Em vez de usar o `root` no `.env`, crie um usuário só para o projeto. Rode
isto conectado ao MySQL, trocando a senha:

```sql
CREATE USER 'healthplus'@'localhost' IDENTIFIED BY 'escolha_uma_senha';
GRANT ALL PRIVILEGES ON healthplus.* TO 'healthplus'@'localhost';
FLUSH PRIVILEGES;
```

Assim o `Api/.env` não carrega a senha do `root`, e se ela vazar o estrago
fica limitado a este banco.
## 2. API

```bash
cd Api
npm install
cp .env.example .env
```

Abra o `.env` e preencha o usuário e a senha do seu MySQL. Depois:

```bash
npm run dev
```

A API sobe em `http://localhost:3000`. Para conferir, abra esse endereço no
navegador: deve aparecer `{"mensagem":"API HelthPlus funcionando!"}`.

## 3. Aplicativo

Descubra o IP da sua máquina na rede Wi-Fi. No Windows:

```bash
ipconfig
```

Procure o **Endereço IPv4** do adaptador Wi-Fi (algo como `192.168.0.15`).

```bash
cd app
npm install
cp .env.example .env
```

Abra o `.env` e troque o IP pelo seu:

```
EXPO_PUBLIC_API_URL=http://SEU_IP_AQUI:3000
```

> Não use `localhost` aqui. Para o celular, `localhost` é o próprio celular —
> ele não acha o seu computador.

Depois:

```bash
npx expo start
```

Leia o QR Code com o Expo Go.

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/` | Teste de conexão |
| `POST` | `/api/profissional/cadastro` | Cadastra nutricionista |
| `POST` | `/api/profissional/login` | Login do nutricionista |
| `POST` | `/api/paciente/cadastro` | Cadastra paciente (do nutricionista logado) |

## Como o projeto é organizado

Telas em `app/pages/<NomeDaTela>/`, componentes em `app/componentes/<Nome>/`,
cada um com `index.js` (código) e `style.js` (estilo, exportando `estilos`).
Nomes de variáveis, funções, textos e comentários **em português**.

Detalhes das telas: [app/TELAS.md](app/TELAS.md).
Regras para quem usa assistente de código: [app/AGENTS.md](app/AGENTS.md).

## Problemas comuns

**"Network Error" ao fazer login no celular**
A API precisa estar rodando (`npm run dev` dentro de `Api/`), o IP do
`app/.env` precisa ser o da sua máquina, e os dois aparelhos precisam estar
na mesma rede. O Firewall do Windows costuma bloquear a porta 3000 na
primeira vez — libere quando ele perguntar.

**Mudei o `.env` e nada mudou**
Recarregue o aplicativo no celular (sacuda o aparelho e toque em *Reload*).
A CLI do Expo não precisa reiniciar.

**Erro 500 ao abrir no celular, ou `Cannot read properties of undefined (reading 'exists')`**
O mapa de arquivos do Metro ficou corrompido. Pare o servidor (Ctrl+C) e
suba limpando o cache:

```bash
npx expo start -c
```

Isso acontece com mais frequência quando o projeto está dentro de uma pasta
sincronizada (OneDrive, Google Drive, Dropbox): o sincronizador tranca
arquivos de `node_modules` enquanto o Metro os lê. Se repetir muito, mova o
projeto para fora da pasta sincronizada, por exemplo `C:\dev\HelthPlus`.

**`ConfigError: The expected package.json path ... does not exist`**
Você rodou o `npx expo start` na pasta errada. Ele precisa rodar dentro de
`app/`, não na raiz do repositório:

```bash
cd app
npx expo start
```

**`ER_ACCESS_DENIED_ERROR` ao subir a API**
Usuário ou senha do MySQL errados no `Api/.env`.

**`ER_NO_SUCH_TABLE`**
Você ainda não rodou o `schema.sql` do passo 1.

## Estado atual

Funcionando de ponta a ponta: cadastro e login do nutricionista, sessão que
sobrevive a fechar o app, cadastro de paciente.

Ainda em dados de exemplo ou pendente: agenda, planos alimentares,
avaliações, área do paciente, assinatura e notificações. As telas existem e
navegam, mas ainda não gravam no banco — procure por `TODO: integrar com a API`.

> ⚠️ As tabelas da OMS em `app/utilitarios/oms/dados/` são de **demonstração**
> (poucos pontos) e a tabela de alimentos tem só 14 itens aproximados. Troque
> pelas oficiais antes de usar com pacientes de verdade.
