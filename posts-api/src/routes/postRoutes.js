const { Router } = require("express");
const postController = require("../controllers/postController");
const { cacheMiddleware } = require("../middlewares/cacheMiddleware");

const router = Router();

/**
 * @route   POST /posts
 * @desc    Cria uma nova postagem
 * @access  Public
 * @body    { title: string, content: string, author: string }
 */
router.post("/", postController.create);

/**
 * @route   GET /posts
 * @desc    Lista todas as postagens (cache 60s)
 * @access  Public
 */
router.get("/", cacheMiddleware(60), postController.listAll);

/**
 * @route   GET /posts/search?q=termo
 * @desc    Busca posts por título ou autor (cache 30s)
 * @access  Public
 * @query   q - Termo de busca
 *
 * IMPORTANTE: esta rota deve vir ANTES de /posts/:id
 * porque o Express resolve rotas em ordem de registro.
 * Se /:id viesse primeiro, "search" seria interpretado como um ID.
 */
router.get("/search", cacheMiddleware(30), postController.search);

/**
 * @route   GET /posts/:id
 * @desc    Busca uma postagem pelo ID (cache 120s — dado estático raramente muda)
 * @access  Public
 * @param   id - UUID da postagem
 */
router.get("/:id", cacheMiddleware(120), postController.getById);

module.exports = router;
