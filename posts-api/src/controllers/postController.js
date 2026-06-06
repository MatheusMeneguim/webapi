const postService = require("../services/postService");
const { validatePostInput } = require("../validators/postValidator");

/**
 * POST /posts
 * Cria uma nova postagem. Retorna 201 com o post criado ou 400 com erros de validação.
 */
async function create(req, res, next) {
  try {
    const errors = validatePostInput(req.body);

    if (errors.length > 0) {
      // 400 Bad Request: cliente enviou dados inválidos
      return res.status(400).json({ success: false, errors });
    }

    const post = postService.createPost(req.body);

    // 201 Created: recurso novo gerado com sucesso
    return res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err); // passa para o middleware de erro centralizado
  }
}

/**
 * GET /posts
 * Lista todos os posts. Retorna 200 com array (pode ser vazio).
 */
async function listAll(req, res, next) {
  try {
    const posts = postService.getAllPosts();
    return res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /posts/:id
 * Busca post por ID. Retorna 404 se não encontrar.
 */
async function getById(req, res, next) {
  try {
    const post = postService.getPostById(req.params.id);

    if (!post) {
      // 404 Not Found: ID não existe no sistema
      return res.status(404).json({
        success: false,
        errors: [`Nenhum post encontrado com o ID: ${req.params.id}`],
      });
    }

    return res.status(200).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /posts/search?q=termo
 * Busca posts por título ou autor. Retorna 400 se o parâmetro q estiver ausente.
 */
async function search(req, res, next) {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        errors: ["O parâmetro de busca 'q' é obrigatório. Ex: /posts/search?q=Node"],
      });
    }

    const results = postService.searchPosts(q);
    return res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listAll, getById, search };
