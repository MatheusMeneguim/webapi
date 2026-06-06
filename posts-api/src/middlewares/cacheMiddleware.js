/**
 * Wrapper em torno do express-redis-cache.
 *
 * Por que um wrapper e não usar o express-redis-cache diretamente nas rotas?
 * Porque em ambiente de dev/teste o Redis pode não estar disponível.
 * Este módulo aplica o cache se o Redis estiver conectado; caso contrário,
 * retorna um middleware no-op (passa direto) sem quebrar a aplicação.
 */

let cache;

try {
  const expressRedisCache = require("express-redis-cache");

  cache = expressRedisCache({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    // TTL padrão de 60 segundos — respostas de listagem ficam em cache por 1 minuto
    expire: 60,
  });

  cache.on("error", (err) => {
    // Loga mas não derruba o processo — degradação graciosa
    console.warn(`[CACHE] Redis indisponível: ${err.message}. Operando sem cache.`);
  });

  console.log("[CACHE] express-redis-cache inicializado.");
} catch (e) {
  console.warn("[CACHE] express-redis-cache não pôde ser carregado:", e.message);
}

/**
 * Retorna o middleware de cache do Redis ou um middleware no-op.
 * @param {number} ttl - Tempo de vida em segundos (padrão: 60)
 */
function cacheMiddleware(ttl = 60) {
  if (!cache) {
    // Sem Redis: passa direto
    return (_req, _res, next) => next();
  }

  return cache.route({ expire: ttl });
}

module.exports = { cacheMiddleware };
