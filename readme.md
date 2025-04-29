# Chatbot com Gemini API e Histórico Persistente

Este projeto implementa um chatbot interativo que utiliza a API do Gemini (anteriormente Google AI) para gerar respostas às mensagens do usuário. Ele também possui a funcionalidade de persistir o histórico das conversas, permitindo que as interações sejam retomadas.

**Importante:** Para executar este projeto corretamente, você precisará **descompactar a pasta `node_modules.zip`** que acompanha este projeto na raiz do diretório. Esta pasta contém todas as dependências necessárias para o funcionamento do servidor backend.

## Visão Geral

O frontend, construído com HTML e JavaScript, oferece uma interface de chat simples onde os usuários podem enviar mensagens e receber respostas do bot. O backend, desenvolvido com Node.js e Express, lida com as requisições do frontend, interage com a API do Gemini e gerencia a persistência do histórico das conversas utilizando o Sequelize com um banco de dados MySQL.

## Funcionalidades

-   **Interface de Chat:** Interface de usuário intuitiva para enviar e receber mensagens.
-   **Integração com Gemini API:** Utiliza a API do Gemini para gerar respostas contextuais às mensagens do usuário.
-   **Histórico de Conversas:** Persiste o histórico das conversas para cada sessão do usuário, permitindo que as interações sejam retomadas.
-   **Gerenciamento de Sessão:** Utiliza `express-session` para manter o estado da sessão de cada usuário.
-   **Persistência de Dados:** Emprega o Sequelize ORM para interagir com um banco de dados MySQL, armazenando o histórico das conversas.
-   **Configuração via `.env`:** Permite configurar a chave da API do Gemini e o segredo da sessão através de um arquivo `.env`.
-   **Proteção de Conteúdo:** Configurações de segurança para bloquear conteúdo potencialmente prejudicial nas respostas do Gemini.

## Estrutura de Arquivos

.├── node_modules.zip      <-- IMPORTANTE: Descompacte esta pasta!├── public/│   ├── index.html        <-- Frontend do chatbot│   ├── main.js           <-- Lógica do frontend│   └── style.css         <-- Estilos do frontend├── database.js         <-- Configuração da conexão com o banco de dados Sequelize├── index.js            <-- Ponto de entrada do servidor backend (Node.js/Express)├── models/│   └── conversation.js   <-- Modelo Sequelize para a tabela de conversas├── package.json        <-- Arquivo de manifesto do Node.js├── package-lock.json   <-- Lockfile das dependências do Node.js└── .env.example        <-- Arquivo de exemplo para as variáveis de ambiente
## Tecnologias Utilizadas

-   **Frontend:**
    -   HTML5
    -   CSS3
    -   JavaScript
-   **Backend:**
    -   Node.js
    -   Express.js
    -   `@google/generative-ai` (para interagir com a Gemini API)
    -   `cors` (para habilitar CORS)
    -   `dotenv` (para carregar variáveis de ambiente)
    -   `express-session` (para gerenciamento de sessões)
    -   `mysql2` (driver MySQL para Node.js)
    -   `sequelize` (ORM para MySQL)

## Pré-requisitos

-   **Node.js e npm (ou yarn):** Certifique-se de ter o Node.js e o npm (ou yarn) instalados em sua máquina.
-   **Banco de Dados MySQL:** Você precisará de uma instância do servidor MySQL em execução.
-   **Chave da API do Gemini:** Obtenha uma chave da API do Gemini (anteriormente Google AI) em [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey).
-   **Descompactar `node_modules.zip`:** Antes de executar o projeto, **descompacte a pasta `node_modules.zip`** para instalar as dependências do backend.

## Configuração

1.  **Descompactar Dependências:** Descompacte a pasta `node_modules.zip` na raiz do projeto.
2.  **Configurar Variáveis de Ambiente:**
    -   Crie um arquivo `.env` na raiz do projeto com base no `.env.example`.
    -   Preencha as seguintes variáveis:
        ```env
        GEMINI_API_KEY=SUA_CHAVE_API_GEMINI
        SESSION_SECRET=UM_SEGREDO_FORTE_PARA_SUA_SESSAO
        DB_HOST=localhost        # Ou o host do seu banco de dados MySQL
        DB_USER=seu_usuario_mysql
        DB_PASSWORD=sua_senha_mysql
        DB_NAME=nome_do_banco_de_dados
        DB_PORT=3306             # Porta padrão do MySQL
        ```
3.  **Configurar Banco de Dados:**
    -   Certifique-se de que o banco de dados MySQL especificado em `.env` exista. O Sequelize criará as tabelas automaticamente.

## Como Executar

1.  **Navegar para o Diretório do Projeto:** Abra seu terminal e navegue até a pasta raiz do projeto.
2.  **Instalar Dependências (Caso não tenha descompactado):** Se você não descompactou a pasta `node_modules.zip`, execute o seguinte comando para instalar as dependências do backend:
    ```bash
    npm install
    # ou
    yarn install
    ```
3.  **Iniciar o Servidor Backend:** Execute o seguinte comando para iniciar o servidor Node.js:
    ```bash
    npm start
    # ou
    node index.js
    ```
4.  **Abrir o Frontend:** Abra o arquivo `public/index.html` no seu navegador web.

Agora você poderá interagir com o chatbot através da interface web. As mensagens enviadas serão processadas pelo backend, enviadas para a API do Gemini e a resposta será exibida na tela. O histórico da conversa será persistido no banco de dados MySQL para sua sessão.

## Explicação do Código

-   **`public/index.html`:** Contém a estrutura HTML da interface do chat, incluindo a área de exibição das mensagens e o formulário de entrada.
-   **`public/main.js`:** Lida com a lógica do frontend, como capturar a entrada do usuário, enviar mensagens para o servidor via requisição POST (`/chat`), e exibir as mensagens na tela. Também carrega o histórico de conversas ao carregar a página (`/history`).
-   **`public/style.css`:** Define os estilos visuais da interface do chat.
-   **`index.js`:** É o ponto de entrada do servidor backend. Configura o Express, middleware (CORS, JSON, session), inicializa a API do Gemini com configurações de segurança e define as rotas `/chat` (para enviar mensagens) e `/history` (para obter o histórico). Também configura a conexão com o banco de dados MySQL usando Sequelize e sincroniza os modelos.
-   **`models/conversation.js`:** Define o modelo Sequelize para a tabela `conversations` no banco de dados MySQL, que armazena o histórico de mensagens e o ID da sessão do usuário.
-   **`database.js`:** Contém a configuração da conexão com o banco de dados MySQL usando Sequelize, lendo as informações de conexão do arquivo `.env`.
-   **`package.json`:** Arquivo de manifesto do Node.js, listando as dependências do projeto e os scripts de execução.
