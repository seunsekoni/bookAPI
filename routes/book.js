const express = require('express');
const router = express.Router();
const { fetchBooks, createBook, createOneRandomBook } = require('../controllers/book');
const { authMiddleware, hasAuthorization } = require('../controllers/auth');
const { createBookValidation, validation } = require('../validators');

router.get('/books',  hasAuthorization, authMiddleware, fetchBooks);
router.post('/new/book', createBookValidation(), validation, authMiddleware, createBook);
router.post('/a-random/book', authMiddleware,  createOneRandomBook);

module.exports = router;