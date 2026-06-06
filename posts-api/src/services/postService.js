const { v4: uuidv4 } = require("uuid");

// Banco em memória — simula o que seria uma collection/tabela no banco real
const posts = [];

/**
 * Cria uma nova postagem após validação básica dos campos obrigatórios.
 * @param {Object} data - { title, content, author }
 * @returns {Object} post criado
 */
function createPost({ title, content, author }) {
  const post = {
    id: uuidv4(),
    title: title.trim(),
    content: content.trim(),
    author: author.trim(),
    createdAt: new Date().toISOString(),
  };

  posts.push(post);
  return post;
}

/**
 * Retorna todas as postagens ordenadas da mais recente para a mais antiga.
 */
function getAllPosts() {
  return [...posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Busca postagem por ID exato.
 * Retorna null se não encontrar — o controller decide o status HTTP.
 */
function getPostById(id) {
  return posts.find((p) => p.id === id) || null;
}

/**
 * Busca postagens cujo título OU autor contenham o termo (case-insensitive).
 * Ex: buscar "silva" retorna posts de "João Silva" e posts com "silva" no título.
 */
function searchPosts(query) {
  const term = query.toLowerCase().trim();
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(term) ||
      p.author.toLowerCase().includes(term)
  );
}

module.exports = { createPost, getAllPosts, getPostById, searchPosts };
