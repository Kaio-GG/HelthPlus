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
mysql -u root -p -e "source Api/database/schema.sql"
```

Isso cria o banco `helthplus` (sem o "a", foi assim que ele nasceu) com as
14 tabelas do projeto.

> **No Windows**, o `mysql` normalmente não está no PATH, e o PowerShell
> não aceita o operador `<` — por isso o `-e "source ..."` acima, no lugar
> do `< arquivo.sql` que se vê por aí. Use assim, ajustando a versão:
>
> ```bash
> & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source Api/database/schema.sql"
> ```
>
> **Mais simples ainda:** abra o `schema.sql` no MySQL Workbench em
> **File → Open SQL Script** e execute no raio ⚡. Sem terminal e sem
> caminho de arquivo.

> `Api/database/schema.sql` é a fonte da verdade do banco. Se uma query nova
> precisar de uma coluna ou tabela, acrescente no arquivo **no mesmo commit** —
> senão o banco de quem baixar o código não vai bater com o código.

### Usuário do banco (recomendado)

Em vez de usar o `root` no `.env`, crie um usuário só para o projeto. Rode
isto conectado ao MySQL, trocando a senha:

```sql
CREATE USER 'helthplus'@'localhost' IDENTIFIED BY 'escolha_uma_senha';
GRANT ALL PRIVILEGES ON helthplus.* TO 'helthplus'@'localhost';
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

**`ER_NO_SUCH_TABLE`** ou **`ER_BAD_DB_ERROR`**
Você ainda não rodou o `schema.sql` do passo 1, ou o `DB_NAME` do
`Api/.env` não é `helthplus`.

## Estado atual

Funcionando de ponta a ponta: cadastro e login do nutricionista, sessão que
sobrevive a fechar o app, cadastro de paciente.

Ainda em dados de exemplo ou pendente: agenda, planos alimentares,
avaliações, área do paciente, assinatura e notificações. As telas existem e
navegam, mas ainda não gravam no banco — procure por `TODO: integrar com a API`.

### Tabelas da OMS

As curvas em `app/utilitarios/oms/dados/` são as **oficiais**, convertidas
das planilhas publicadas pela OMS:

- **0–5 anos** — WHO Child Growth Standards 2006
- **5–19 anos** — WHO Growth Reference 2007

Cada curva tem um ponto por mês (ou por centímetro, em peso/estatura).
A conversão foi conferida reconstruindo, a partir de L, M e S, os 10.234
valores de desvio-padrão que a própria OMS publica — todos dentro da
precisão com que ela os divulga.

Dois detalhes de modelagem que seguem a orientação da OMS:

- **Estatura aos 24 meses:** abaixo disso vale o comprimento deitado;
  a partir dos 24 meses, a estatura em pé (os dois diferem ~0,7 cm).
- **Peso/estatura aos 87 cm:** abaixo, comprimento deitado; acima,
  estatura em pé.

> ⚠️ Ainda pendente: **PB, PCT e PCS** (perímetro braquial e dobras
> cutâneas) não têm tabela e aparecem como "—" na tela. E a tabela de
> alimentos (`app/dados/alimentosTaco.js`) tem só 14 itens aproximados —
> troque pela TACO oficial antes de uso real.

> O banco tem a tabela `referencia_oms` para guardar essas curvas, mas ela
> está vazia: hoje a calculadora lê os JSON do aplicativo. Se a equipe
> decidir migrar para o banco, os mesmos dados servem.
