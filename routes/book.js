const express = require('express');
const router = express.Router();
const { fetchBooks, createBook, createOneRandomBook, 
    getIdFromToken, fetchBookById, getBookDetail, updateBookDetail, 
    deleteBook, hasBookAuthorization, rateBook } = require('../controllers/book');
const { authMiddleware } = require('../controllers/auth');
const { createBookValidation, validation } = require('../validators');

router.get('/books', fetchBooks);
router.post('/new/book', getIdFromToken, createBookValidation(), validation, authMiddleware, createBook);
router.post('/a-random/book', getIdFromToken, authMiddleware,  createOneRandomBook);

router.get('/book/:bookId', getBookDetail)
router.put('/book/:bookId', getIdFromToken, authMiddleware, hasBookAuthorization, updateBookDetail)
router.delete('/book/:bookId', getIdFromToken, authMiddleware, hasBookAuthorization, deleteBook)

// rate a book
router.post('/rate/book/:bookId', getIdFromToken, authMiddleware, rateBook)

router.param("bookId", fetchBookById)

module.exports = router;