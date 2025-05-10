// src/routes/author.routes.js
const express = require('express');
const router = express.Router();
const authorController = require('../controllers/author.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// 获取所有作者 - 无需认证
router.get('/', authorController.getAllAuthors);

// 搜索作者 - 无需认证 (必须放在 /:id 路由之前)
router.get('/search', authorController.searchAuthors);

// 通过ID获取作者 - 无需认证
router.get('/:id', authorController.getAuthorById);

// 以下路由需要认证
router.use(verifyToken);

// 创建新作者
router.post('/', authorController.createAuthor);

// 更新作者
router.put('/:id', authorController.updateAuthor);

// 删除作者
router.delete('/:id', authorController.deleteAuthor);

module.exports = router;