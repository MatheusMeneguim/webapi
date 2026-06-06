/**
 * Valida os campos obrigatórios para criação de post.
 * Retorna um array de mensagens de erro — vazio significa dados válidos.
 */
function validatePostInput({ title, content, author }) {
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("O campo 'title' é obrigatório e não pode estar vazio.");
  } else if (title.trim().length > 200) {
    errors.push("O campo 'title' deve ter no máximo 200 caracteres.");
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    errors.push("O campo 'content' é obrigatório e não pode estar vazio.");
  }

  if (!author || typeof author !== "string" || author.trim().length === 0) {
    errors.push("O campo 'author' é obrigatório e não pode estar vazio.");
  } else if (author.trim().length > 100) {
    errors.push("O campo 'author' deve ter no máximo 100 caracteres.");
  }

  return errors;
}

module.exports = { validatePostInput };
