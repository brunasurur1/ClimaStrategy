# 🌦️ ClimaStrategy

Aplicação fullstack que diz se o clima está bom para uma atividade (correr, ir à praia ou fazer um piquenique) em uma cidade escolhida. As regras de cada atividade usam o padrão **Strategy**.

![Status](https://img.shields.io/badge/Status-Em%20refatora%C3%A7%C3%A3o-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)

> **Estado do projeto:** funcional, em refatoração para clean code e arquitetura em camadas, com desenvolvimento orientado a testes. O plano está nas issues do repositório (milestones 1 a 4). Este README descreve o código **como ele é hoje**.

---

## O que o projeto faz

1. Você informa uma **cidade** e escolhe uma **atividade**.
2. O backend consulta a OpenWeather, aplica a regra da atividade e devolve o resultado.
3. O resultado fica salvo como um **card** no dashboard, que você pode atualizar, excluir ou abrir para ver a previsão dos próximos dias.

### Funcionalidades

| Funcionalidade | Situação | Observação |
|---|---|---|
| Verificação climática por atividade | ✅ | Regras usam chuva, temperatura e vento. A umidade é guardada e exibida, mas ainda não entra nas regras |
| Criar, listar, atualizar e excluir cards | ✅ | Criar com a mesma cidade e atividade substitui o card anterior |
| Histórico de operações (create/update/delete) | ⚠️ | Registrado no banco, mas ainda não há rota nem tela para consultá-lo |
| Previsão de 5 dias | ⚠️ | O modal mostra temperatura, chuva e vento por dia; o veredito de cada dia ainda não é exibido |

---

## Arquitetura

Dois programas independentes que conversam por HTTP:

```
 NAVEGADOR                              SERVIDOR (Node, porta 3000)
 ┌──────────────────┐   HTTP + JSON     ┌───────────────────────────────┐
 │ public/          │ ───────────────▶  │ src/server.ts      rotas      │
 │  index.html      │                   │ src/services/      regras de  │
 │  script.js       │ ◀───────────────  │                    fluxo + API│
 │  style.css       │                   │ src/logica/        estratégias│
 └──────────────────┘                   │ prisma/dev.db      SQLite     │
                                        └───────────────────────────────┘
```

| Parte | Onde | Responsabilidade |
|---|---|---|
| Front | `public/` | HTML, CSS e JavaScript puro. Pergunta à API e desenha a resposta |
| Rotas | `src/server.ts` | Define os endpoints REST e responde em JSON |
| Fluxo principal | `src/services/CardService.ts` | Orquestra clima, regra e banco |
| Clima externo | `src/services/WeatherService.ts` | Cliente da API OpenWeather (endpoint `forecast`) |
| Regras | `src/logica/` | Padrão Strategy (veja abaixo) |
| Dados | `prisma/` | Schema, migrations e seed (tabelas `Atividade`, `Card`, `Historico`) |

### Padrão Strategy

- **Contrato:** `IEstrategia` (`src/logica/IEstrategia.ts`), com o método `avaliar(clima)`.
- **Estratégias:** `EstrategiaCorrer`, `EstrategiaPraia` e `EstrategiaPiquenique` (`EstrategiasConcretas.ts`), uma classe por atividade.
- **Escolha da estratégia:** `TradutorClima` recebe o nome da atividade e devolve o resultado da estratégia correspondente.

---

## Como rodar

### Pré-requisitos
- Node.js 18 ou superior
- NPM
- Uma chave de API gratuita da **OpenWeather** (veja o passo 3 para registrar)

### Passo a passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/<seu-usuario>/ClimaStrategy.git
   cd ClimaStrategy
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Registre uma chave na OpenWeather e configure o `.env`**

   A aplicação consulta a API da OpenWeather e **não funciona sem uma chave própria**.

   1. Crie uma conta gratuita em **https://home.openweathermap.org/users/sign_up**
   2. Depois do login, copie a chave na página **https://home.openweathermap.org/api_keys** (aba *API keys*)
   3. Copie o arquivo de exemplo:
      ```bash
      cp .env.example .env
      ```
      No Windows (PowerShell): `copy .env.example .env`
   4. Abra o `.env` e troque `cole_sua_chave_aqui` pela chave copiada.

   > Chaves novas podem levar um tempo até serem ativadas. Se a API responder erro de chave inválida logo após o registro, aguarde e tente de novo.
   >
   > O `.env` nunca deve ser commitado.

4. **Crie o banco e as atividades iniciais**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
   O seed pode ser executado mais de uma vez sem duplicar atividades.

5. **Inicie o backend**
   ```bash
   npm run dev
   ```
   O servidor roda em `http://localhost:3000`.

6. **Abra o front**
   Abra `public/index.html` no navegador (duplo clique ou extensão Live Server). O backend precisa estar rodando.

---

## API

| Método | Rota | Descrição | Respostas |
|---|---|---|---|
| `GET` | `/atividades` | Lista as atividades (popula o select) | 200 |
| `GET` | `/cards` | Lista os cards salvos, do mais recente ao mais antigo | 200 |
| `POST` | `/cards` | Cria um card. Body: `{ "cidade": "...", "atividadeId": "..." }` | 201, 400, 500 |
| `PUT` | `/cards/:id` | Atualiza o clima de um card (sem body) | 200, 404, 500 |
| `DELETE` | `/cards/:id` | Remove um card e registra no histórico | 204, 404, 500 |
| `GET` | `/cards/:id/forecast` | Previsão de 5 dias com a frase da estratégia por dia | 200, 404, 500 |

---

## Verificações locais

O CI (GitHub Actions) roda as mesmas verificações abaixo a cada PR e a cada push na `main`.
Rode localmente antes de abrir o PR:

```bash
npm ci
npx prisma generate
npm run typecheck
npm run test:unit
npm run test:integration
```

Os testes de integração usam um SQLite de teste e simulam a OpenWeather com `nock`,
então não precisam de chave real nem de internet.

## Limitações conhecidas e próximos passos

O trabalho de melhoria está dividido em issues, em quatro fases:

1. **Fundação:** segurança da chave de API, build, testes unitários e de integração.
2. **Domínio:** correção de bugs do clima, tipo único de dados e estratégias que retornam dados em vez de texto.
3. **Arquitetura:** separação em camadas (portas e adaptadores), casos de uso e tratamento de erros.
4. **Front e documentação:** front modular e seguro, e documentação alinhada ao código.
