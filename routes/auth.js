const { signUp, login } = require('../controllers/auth');
const express = require('express');
const router = express.Router();
const { validation, authRegistration, loginValidation } = require('../validators')

router.post('/signup', authRegistration(), validation, signUp);
router.post('/login', loginValidation(),  validation, login);

module.exports = router;