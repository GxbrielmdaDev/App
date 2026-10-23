# ATLAS CONTROL Mobile

<p align="center">
  <img src="./assets/atlas-logo.png" alt="ATLAS CONTROL Logo" width="180"/>
</p>

<p align="center">
  <strong>Versão mobile do sistema de gestão de estoque ATLAS CONTROL</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2058-000020?logo=expo&logoColor=white" alt="Expo SDK 58" />
  <img src="https://img.shields.io/badge/React%20Native-0.88-61DAFB" alt="React Native 0.88" />
  <img src="https://img.shields.io/badge/Platforms-Android%20%7C%20iOS%20%7C%20Web-3DDC84" alt="Platforms" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License MIT" />
</p>

Aplicativo **React Native (Expo)** que consome a mesma API REST (FastAPI) do projeto
[Atlas-Control](https://github.com/GxbrielmdaDev/Atlas-Control), cobrindo dashboard,
produtos, clientes, vendas e geração de relatórios em PDF.

O app roda em **Android, iOS e web** a partir do mesmo código, com backend
hospedado no Render e endpoints configuráveis em tempo de execução.

---

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
- [Scripts disponíveis](#scripts-disponíveis)
- [Conexão com o backend](#conexão-com-o-backend)
- [API consumida](#api-consumida)
- [Relatórios em PDF](#relatórios-em-pdf)
- [Testar no celular](#testar-no-celular)
- [Boas práticas de desenvolvimento mobile](#boas-práticas-de-desenvolvimento-mobile)
- [Qualidade e CI/CD](#qualidade-e-cicd)
- [Licença](#licença)
- [Autor](#autor)

## Sobre o projeto

O **ATLAS CONTROL Mobile** é a versão mobile do sistema de gestão de estoque Atlas
Control. Ele reutiliza a mesma API REST do frontend web original e entrega as
principais operações do sistema em um app:

- painel com indicadores e gráficos do negócio;
- cadastro e manutenção de produtos e clientes;
- registro de vendas com controle de estoque e cálculo de lucro;
- geração de relatórios em PDF.

O backend de demonstração está hospedado no **Render**. O app também aceita
qualquer API própria compatível — basta informar o endereço nas configurações.

## Funcionalidades

- **Dashboard**
  - KPIs: produtos cadastrados, quantidade em estoque, vendas realizadas e lucro total.
  - Resumo de operações: total de clientes, receita total e média de lucro por venda.
  - Gráfico de **lucro vs prejuízo** (donut) e **produtos por categoria** (barras
    horizontais), desenhados com `react-native-svg`.
- **Produtos**
  - Cadastro, edição e exclusão em modal.
  - Busca incremental por nome e destaque visual de estoque baixo.
  - Autocomplete de categorias, com opção de criar novas categorias.
- **Clientes**
  - Cadastro de pessoa física/jurídica com máscara de CPF/CNPJ.
  - Edição, exclusão e busca incremental.
- **Vendas**
  - Seleção de produto e cliente com pickers pesquisáveis.
  - Quantidade ajustável com validação do estoque disponível.
  - Cálculo automático de total e lucro com base nos valores de compra e venda.
  - Histórico com nomes de produto/cliente resolvidos no próprio app.
- **Relatórios em PDF**
  - Geração de relatórios de produtos, clientes e vendas via microserviço .NET.
  - Pré-visualização nativa ou compartilhamento do arquivo (Android/iOS).
- **Tema claro/escuro** — mesma paleta da versão web, com preferência persistida
  no dispositivo.
- **Configuração de servidor** — URLs da API e do serviço de relatórios ajustáveis
  no app, com botão para restaurar os padrões.
- **Robustez** — validação do formato das respostas da API, timeouts e tela de
  recuperação em caso de erro de renderização.

## Tecnologias

### Mobile

- **Expo SDK 58** / **React Native 0.88** / **React 19**
- **React Navigation 7** — navegação por abas inferiores
- **react-native-svg** — gráficos desenhados sob medida, sem biblioteca de charting
- **AsyncStorage** — preferência de tema e configurações de servidor
- **expo-file-system + expo-sharing** — download, cache e compartilhamento de PDFs
- **expo-font / @expo/vector-icons** — ícones vetoriais
- **react-native-safe-area-context / react-native-screens** — áreas seguras e navegação nativa
- **react-native-web + react-dom + @expo/metro-runtime** — execução no navegador
- **JavaScript** — mesma linguagem do frontend web original

### Backend

- **FastAPI** — API REST
- **SQLAlchemy** — ORM
- **SQLite** — banco de dados
- **Render** — hospedagem do backend de demonstração
  (`https://atlas-control-xzn0.onrender.com`)

### DevOps

- **GitLab CI/CD** — integração e entrega contínuas

### Relatórios (opcional)

- **.NET** — microserviço `relatorio-service`, responsável pela geração dos PDFs
  (`http://localhost:5000`)

## Arquitetura

```text
┌──────────────────────────────┐
│  ATLAS CONTROL Mobile        │
│  Expo · React Native         │
│  Android · iOS · Web         │
└───────────┬──────────┬───────┘
            │ HTTPS    │ HTTP (PDF)
            ▼          ▼
┌───────────────────┐  ┌──────────────────────────────┐
│  API REST         │  │  relatorio-service (.NET)    │
│  FastAPI          │  │  POST /api/relatorios/gerar  │
│  SQLAlchemy       │  │  localhost:5000 (opcional)   │
│  SQLite           │  └──────────────────────────────┘
│  Render           │
└───────────────────┘
```

- Os endereços da API e do serviço de relatórios são configuráveis em runtime
  (ícone de engrenagem) e persistidos no AsyncStorage.
- No Android, `localhost` é convertido automaticamente para `10.0.2.2`
  (endereço do host no emulador).

## Estrutura do projeto

```text
.
├── App.js                     # Providers (SafeArea, Theme, ErrorBoundary) + navegação
├── index.js                   # Entrada da aplicação (registerRootComponent)
├── app.json                   # Configuração Expo (nome, ícones, plugins)
├── package.json               # Dependências e scripts
├── eslint.config.js           # ESLint (eslint-config-expo)
├── .env.local                 # Porta do Metro (RCT_METRO_PORT=5173)
├── assets/
│   ├── atlas-logo.png         # Logo exibida no app
│   ├── icon.png               # Ícone do app
│   ├── favicon.png            # Favicon da versão web
│   ├── splash-icon.png        # Ícone de splash
│   └── android-icon-*.png     # Ícone adaptativo do Android
└── src/
    ├── components/
    │   ├── AppHeader.js           # Header com relatórios, tema e configurações
    │   ├── CategoryAutocomplete.js# Seleção/criação de categorias
    │   ├── Charts.js              # Gráficos SVG (donut e barras)
    │   ├── CPFCNPJInput.js        # Máscara CPF/CNPJ
    │   ├── ErrorBoundary.js       # Tela de recuperação global
    │   ├── FormComponents.js      # Painéis, botões, inputs e modal
    │   ├── PickerField.js         # Select pesquisável (produto/cliente)
    │   ├── RelatoryModal.js       # Escolha do relatório a gerar
    │   └── SettingsModal.js       # Configuração das URLs dos serviços
    ├── contexts/
    │   └── ThemeContext.js        # Tema claro/escuro persistido
    ├── navigation/
    │   └── AppNavigator.js        # Bottom tabs (Dashboard/Produtos/Clientes/Vendas)
    ├── pages/
    │   ├── Dashboard.js           # KPIs, resumo e gráficos
    │   ├── Products.js            # CRUD de produtos
    │   ├── Clients.js             # CRUD de clientes
    │   └── Sales.js               # Registro e histórico de vendas
    ├── services/
    │   ├── api.js                 # Camada REST + configurações
    │   └── reports.js             # Download/abertura dos PDFs
    ├── theme/
    │   └── colors.js              # Paletas clara/escura e cores dos gráficos
    └── utils/
        └── format.js              # Moeda, datas, CPF/CNPJ e números
```

## Pré-requisitos

1. **Node.js 20+** e npm.
2. **Expo Go** no celular ou um emulador/simulador — o navegador também funciona
   sem nada instalado.
3. **Backend:** nenhum backend local é necessário. Por padrão o app usa o backend
   de demonstração hospedado no Render. Para usar uma API própria, informe a URL
   nas configurações do app.
4. **(Opcional, para PDFs)** microserviço `relatorio-service` rodando em
   `http://localhost:5000` (ou configure outro endereço no app).

## Como rodar

```bash
npm install
npm start

// npx expo start pode ser usado no lugar do ´npm start´
```

Com o [Expo Go](https://expo.dev/go) instalado no celular, leia o QR Code exibido
no terminal. Ou pressione `a`/`i` para abrir no emulador Android/iOS.

```bash
npm run web       # navegador em http://localhost:5173
npm run android   # emulador Android
npm run ios       # simulador iOS (macOS)
npm run lint      # ESLint
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento (Metro) |
| `npm run web` | Abre o app no navegador (`http://localhost:5173`) |
| `npm run android` | Abre no emulador Android |
| `npm run ios` | Abre no simulador iOS (macOS) |
| `npm run lint` | Executa o ESLint |

Comandos auxiliares:

| Comando | Descrição |
| --- | --- |
| `npx expo-doctor` | Verifica dependências, configuração e compatibilidade com o SDK |
| `npx expo export --platform android` | Valida a geração do bundle Android |
| `npx expo export --platform web` | Gera a versão estática para web |

## Conexão com o backend

Por padrão o app aponta para o backend de demonstração hospedado no Render
(`https://atlas-control-xzn0.onrender.com`). Para trocar, abra o app, toque no
ícone de **engrenagem** e configure:

| Situação | Endereço da API |
| --- | --- |
| Backend hospedado (padrão) | `https://atlas-control-xzn0.onrender.com` |
| Emulador Android (local) | `http://localhost:8000` (convertido automaticamente para `10.0.2.2`) |
| Simulador iOS (local) | `http://localhost:8000` |
| Celular físico (local) | `http://<IP-da-sua-máquina>:8000` |

O serviço de relatórios (.NET) segue a mesma lógica e é configurado no mesmo
modal, com padrão em `http://localhost:5000`.

## API consumida

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/products/` | Lista produtos |
| POST | `/products/` | Cria produto |
| PUT | `/products/{id}` | Atualiza produto |
| DELETE | `/products/{id}` | Exclui produto |
| GET | `/products/categories/list` | Lista categorias |
| GET | `/clients/` | Lista clientes |
| POST | `/clients/` | Cria cliente |
| PUT | `/clients/{id}` | Atualiza cliente |
| DELETE | `/clients/{id}` | Exclui cliente |
| GET | `/sales/` | Lista vendas |
| POST | `/sales/` | Registra venda |
| GET | `/sales/analytics/profit-loss` | Totais de lucro e prejuízo |
| GET | `/sales/analytics/products-by-category` | Produtos agrupados por categoria |

> Os endpoints de coleção usam **barra final** para evitar redirecionamentos
> 307 do FastAPI. O app valida o formato das respostas (lista/objeto) e exibe
> mensagens de erro em português quando a API configurada não é compatível.

## Relatórios em PDF

1. Toque no ícone de **relatório** no header e escolha a seção (Produtos,
   Clientes ou Vendas).
2. O app envia `POST /api/relatorios/gerar` com `{ "secao": "<seção>" }` para o
   serviço .NET.
3. O PDF é salvo no cache do app e aberto na pré-visualização nativa; se não
   houver visualizador, o app oferece o compartilhamento.

> Disponível apenas no Android/iOS. Na versão web, os módulos nativos de
> arquivo/compartilhamento não estão disponíveis.

## Testar no celular

| Forma | O que acontece | Requisitos |
| --- | --- | --- |
| **Expo Go** (QR Code) | Instala/usa o Expo Go e baixa o bundle do projeto, rodando em modo desenvolvimento | Celular e PC na mesma Wi‑Fi (ou `--tunnel`); no iPhone, mesma conta Expo no CLI e no app |
| **Navegador do celular** | Abre a versão web em `http://<IP-do-PC>:5173`; nada é instalado (apenas cache do navegador) | Mesma Wi‑Fi; origem liberada no CORS do backend para usar a API |
| **Emulador/simulador** | Abre o app no emulador | Android Studio / Xcode |

> Na versão web não há pull-to-refresh nem geração de PDF (recursos nativos).
> No Expo Go, o app roda sem development build, pois usa apenas módulos
> incluídos no Expo Go.

## Boas práticas de desenvolvimento mobile

### Interface e usabilidade

- **Navegação por abas inferiores** com header customizado, respeitando as áreas seguras
  (`useSafeAreaInsets`) e evitando sobreposição com notch e barra de gestos.
- **Formulários em modais estilo bottom sheet** (altura máx. de 90% e padding inferior
  pela safe area), padrão mais adequado a telas pequenas do que páginas dedicadas.
- **Teclado tratado por plataforma:** `KeyboardAvoidingView` apenas no iOS (no Android o
  sistema usa `SOFT_INPUT_ADJUST_RESIZE`) e `keyboardShouldPersistTaps="handled"` para
  o primeiro toque funcionar com o teclado aberto.
- **Campos adequados ao conteúdo:** `keyboardType` (numérico, e-mail, URL), `autoCapitalize`
  desligado em endereços/buscas e máscaras de CPF/CNPJ com limite de dígitos.
- **Alvos de toque confortáveis:** botões de ícone com 40×40 e `hitSlop` nos elementos pequenos.
- **Feedback constante:** `ActivityIndicator` em carregamentos, botões com estado
  `loading`/desabilitado (evita envio duplo), estados vazios e mensagens de erro/sucesso.
- **Pull-to-refresh** com as cores do tema em todas as listas.
- **Tema claro/escuro** com paleta centralizada (`src/theme/colors.js`), preferência salva
  no AsyncStorage e status bar sincronizada com o tema.

### Desempenho

- **Listas com `FlatList` e `keyExtractor`** nos seletores; buscas, mapas de IDs e totais
  derivados com `useMemo`, e funções de carga com `useCallback`.
- **Requisições em paralelo** (`Promise.all`) em telas que dependem de várias listas.
- **Gráficos leves com `react-native-svg`**, sem biblioteca pesada de charting.
- **Bundle enxuto:** ícones vetoriais (`@expo/vector-icons`) e apenas a logo como imagem.

### Rede e robustez

- **Camada de serviço centralizada** (`src/services/api.js`) com timeout via `AbortController`,
  mensagens de erro em português e validação do formato das respostas (lista/objeto).
- **Endpoints configuráveis em runtime** (API e relatórios) salvos no AsyncStorage —
  nenhum host fixo nos componentes.
- **ErrorBoundary global** com tela de recuperação e restauração das configurações,
  evitando travas por URL de API incorreta.
- **Conversão automática `localhost` → `10.0.2.2`** no Android e **timeout de 60s** para
  cobrir o cold start do backend hospedado.

### Compatibilidade e projeto

- **Sem código nativo próprio:** apenas módulos incluídos no Expo Go, permitindo testar no
  celular sem development build; dependências instaladas com `npx expo install` para
  permanecerem compatíveis com o SDK 58.
- **CNG (Continuous Native Generation):** sem `ios/`/`android/` versionados; configurações
  nativas (HTTP local, ATS) via `app.json` e config plugins.
- **Um código para Android, iOS e web** (react-native-web), com recursos nativos isolados
  em serviços e fallback quando indisponíveis (ex.: relatórios PDF).
- **Configuração local fora do git** (`.env.local` com a porta do Metro) e verificação com
  `expo lint` + `expo-doctor`.

## Qualidade e CI/CD

- `npm run lint` — análise estática com ESLint (`eslint-config-expo`).
- `npx expo-doctor` — valida dependências, configuração e compatibilidade com o
  SDK 58.
- `npx expo export` — valida a geração dos bundles (Android/iOS/web).
- **GitLab CI/CD** — usado para integração e entrega contínuas do projeto.

## Licença

**MIT**. Veja [LICENSE](./LICENSE).

## Desenvolvedor

**Gabriel Almeida** — [@GxbrielmdaDev](https://github.com/GxbrielmdaDev)

Projeto original (web): [Atlas-Control](https://github.com/GxbrielmdaDev/Atlas-Control)
