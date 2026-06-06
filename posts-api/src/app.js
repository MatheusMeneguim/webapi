const express = require("express");
const compression = require("compression");
const postRoutes = require("./routes/postRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// ─── Middlewares globais ──────────────────────────────────────────────────────

/**
 * compression()
 * Comprime respostas HTTP com gzip/deflate automaticamente.
 * Por padrão só comprime respostas com mais de 1kb (threshold).
 * Em APIs com payloads grandes (listas de posts), isso reduz significativamente
 * o tráfego — ex.: 100kb de JSON pode virar ~15kb após compressão.
 */
app.use(compression());

/**
 * express.json()
 * Faz o parse do body de requisições com Content-Type: application/json.
 * Sem isso, req.body seria undefined nos controllers.
 */
app.use(express.json());

// ─── Rotas ───────────────────────────────────────────────────────────────────

app.use("/posts", postRoutes);

/**
 * Rota de health check — útil para monitoramento e para verificar se a API está no ar.
 * Retorna 200 OK com uptime do processo.
 */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Catch-all para rotas não mapeadas — retorna 404 em vez de HTML padrão do Express.
 */
app.use((_req, res) => {
  res.status(404).json({ success: false, errors: ["Rota não encontrada."] });
});

// ─── Middleware de erro (deve ser o ÚLTIMO middleware registrado) ──────────────
app.use(errorHandler);

module.exports = app;
