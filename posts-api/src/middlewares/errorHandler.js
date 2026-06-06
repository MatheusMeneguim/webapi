/**
 * Middleware de tratamento de erros centralizado.
 *
 * No Express, qualquer middleware com 4 parâmetros (err, req, res, next)
 * é automaticamente reconhecido como handler de erro.
 *
 * Chamado quando qualquer controller faz next(err).
 */
function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  console.error(err.stack);

  // Distingue erros operacionais (previstos) de bugs inesperados
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "Erro interno do servidor. Tente novamente mais tarde."
      : err.message;

  return res.status(statusCode).json({
    success: false,
    errors: [message],
  });
}

module.exports = { errorHandler };
