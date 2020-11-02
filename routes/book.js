const express = require('express');
const router = express.Router();
const { fetchBooks, createBook, createOneRandomBook, 
    getIdFromToken, fetchBookById, getBookDetail, updateBookDetail, 
    deleteBook, hasBookAuthorization, rateBook } = require('../controllers/book');
const { authMiddleware } = require('../controllers/auth');
const { createBookValidation, validation } = require('../validators');

router.get('/books', fetchBooks);
router.post('/new/book',authMiddleware, getIdFromToken, createBookValidation(), validation,  createBook);
router.post('/a-random/book',authMiddleware, getIdFromToken,   createOneRandomBook);

router.get('/book/:bookId', getBookDetail)
router.put('/book/:bookId', authMiddleware,getIdFromToken, hasBookAuthorization, updateBookDetail)
router.delete('/book/:bookId',authMiddleware, getIdFromToken, hasBookAuthorization, deleteBook)

// rate a book
router.post('/rate/book/:bookId', authMiddleware, getIdFromToken, rateBook)

router.param("bookId", fetchBookById)

module.exports = router;