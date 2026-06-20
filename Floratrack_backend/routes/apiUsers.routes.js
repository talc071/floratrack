const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/me', authController.getCurrentUser);

module.exports = router;
