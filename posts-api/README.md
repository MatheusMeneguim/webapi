# Posts API

API REST para gerenciamento de postagens, desenvolvida com Node.js e Express.  
Inclui cache em memória com Redis, compressão de respostas HTTP e arquitetura em camadas.

---

## Tecnologias

- **Node.js** + **Express** — servidor HTTP e roteamento
- **express-redis-cache** — cache em memória via Redis
- **compression** — compressão gzip/deflate das respostas
- **uuid** — geração de IDs únicos para cada postagem
- **nodemon** — hot-reload em desenvolvimento

---

## Estrutura do projeto

```
posts-api/
├── server.js                  # Entry point — sobe o servidor
├── src/
│   ├── app.js                 # Configuração do Express (middlewares globais e rotas)
│   ├── routes/
│   │   └── postRoutes.js      # Definição das rotas + aplicação do cache por endpoint
│   ├── controllers/
│   │   └── postController.js  # Recebe req/res, valida entrada, chama serviço
│   ├── services/
│   │   └── postService.js     # Regras de negócio e armazenamento em memória
│   ├── validators/
│   │   └── postValidator.js   # Validação dos campos de entrada
│   └── middlewares/
│       ├── errorHandler.js    # Tratamento centralizado de erros
│       └── cacheMiddleware.js # Wrapper do Redis com fallback gracioso
└── README.md
```

---

## Pré-requisitos

- Node.js >= 18
- npm >= 9
- Redis (opcional — a API funciona sem ele, mas o cache ficará desativado)

### Instalar Redis (Ubuntu/Debian)

```bash
sudo apt update && sudo apt install redis-server -y
sudo systemctl start redis
redis-cli ping  # deve retornar PONG
```

### Instalar Redis (macOS com Homebrew)

```bash
brew install redis
brew services start redis
```

### Redis com Docker (qualquer SO)

```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

---

## Como executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar em desenvolvimento (hot-reload)

```bash
npm run dev
```

### 3. Iniciar em produção

```bash
npm start
```

A API estará disponível em `http://localhost:3000`.

---

## Variáveis de ambiente

| Variável     | Padrão      | Descrição                     |
|--------------|-------------|-------------------------------|
| `PORT`       | `3000`      | Porta do servidor HTTP        |
| `REDIS_HOST` | `127.0.0.1` | Host do servidor Redis        |
| `REDIS_PORT` | `6379`      | Porta do servidor Redis       |

Exemplo:

```bash
PORT=4000 REDIS_HOST=192.168.1.10 npm start
```

---

## Endpoints

### `GET /health`

Verifica se a API está no ar.

**Resposta:**
```json
{
  "status": "ok",
  "uptime": "42s",
  "timestamp": "2026-06-06T14:00:00.000Z"
}
```

---

### `POST /posts`

Cria uma nova postagem.

**Body (JSON):**
```json
{
  "title": "Introdução ao Node.js",
  "content": "Node.js é um runtime JavaScript baseado no V8...",
  "author": "Matheus Meneguim"
}
```

**Resposta 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "849ea175-7ea1-41a9-8637-9046a0881326",
    "title": "Introdução ao Node.js",
    "content": "Node.js é um runtime JavaScript baseado no V8...",
    "author": "Matheus Meneguim",
    "createdAt": "2026-06-06T14:00:00.000Z"
  }
}
```

**Resposta 400 Bad Request (validação):**
```json
{
  "success": false,
  "errors": [
    "O campo 'title' é obrigatório e não pode estar vazio.",
    "O campo 'content' é obrigatório e não pode estar vazio."
  ]
}
```

---

### `GET /posts`

Lista todas as postagens ordenadas da mais recente para a mais antiga.  
Cache Redis: **60 segundos**.

**Resposta 200:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "...",
      "title": "Express na prática",
      "content": "...",
      "author": "João Guidorizi",
      "createdAt": "2026-06-06T14:01:00.000Z"
    }
  ]
}
```

---

### `GET /posts/:id`

Busca uma postagem pelo ID.  
Cache Redis: **120 segundos**.

**Parâmetro:**
- `id` — UUID da postagem (ex: `849ea175-7ea1-41a9-8637-9046a0881326`)

**Resposta 200:** Post encontrado (mesmo formato acima).

**Resposta 404:**
```json
{
  "success": false,
  "errors": ["Nenhum post encontrado com o ID: 849ea175-..."]
}
```

---

### `GET /posts/search?q=termo`

Busca postagens cujo **título ou autor** contenham o termo informado (case-insensitive).  
Cache Redis: **30 segundos**.

**Query param:**
- `q` — Termo de busca (obrigatório)

**Exemplo:** `GET /posts/search?q=node`

**Resposta 200:**
```json
{
  "success": true,
  "count": 1,
  "data": [{ ... }]
}
```

**Resposta 400 (sem parâmetro):**
```json
{
  "success": false,
  "errors": ["O parâmetro de busca 'q' é obrigatório. Ex: /posts/search?q=Node"]
}
```

---

## Detalhes de implementação

### Cache com Redis

O middleware de cache é aplicado por rota com TTLs diferentes conforme a frequência esperada de mudança:

| Rota              | TTL    | Justificativa                                   |
|-------------------|--------|-------------------------------------------------|
| `GET /posts`      | 60s    | Lista muda a cada novo post criado              |
| `GET /posts/:id`  | 120s   | Post específico raramente muda após criação     |
| `GET /posts/search` | 30s  | Buscas são mais dinâmicas, TTL menor            |

Se o Redis estiver offline, a aplicação opera normalmente sem cache (degradação graciosa).

### Compressão HTTP

O middleware `compression` comprime automaticamente respostas maiores que 1kb com gzip.  
Em APIs com payloads grandes, isso pode reduzir o tráfego em até 70%.

### Arquitetura em camadas

```
Requisição HTTP
    ↓
  Router        → define qual endpoint responde
    ↓
  Controller    → valida entrada, orquestra resposta
    ↓
  Service       → regras de negócio, acesso aos dados
    ↓
  Validator     → validação isolada e reutilizável
```

---

## Exemplos com curl

```bash
# Criar post
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Meu primeiro post","content":"Conteúdo aqui","author":"Seu Nome"}'

# Listar todos
curl http://localhost:3000/posts

# Buscar por ID
curl http://localhost:3000/posts/SEU-UUID-AQUI

# Buscar por autor ou título
curl "http://localhost:3000/posts/search?q=node"
```
