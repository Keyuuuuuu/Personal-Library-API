// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// 注册新用户
router.post('/signup', authController.signup);

// 用户登录
router.post('/signin', authController.signin);

module.exports = router;