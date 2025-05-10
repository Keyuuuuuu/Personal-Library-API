// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// 所有用户路由都需要认证
router.use(verifyToken);

// 获取用户个人资料
router.get('/profile', userController.getProfile);

// 更新用户个人资料
router.put('/profile', userController.updateProfile);

// 修改密码
router.post('/change-password', userController.changePassword);

module.exports = router;