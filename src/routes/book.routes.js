// src/routes/book.routes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// 所有书籍路由都需要认证
router.use(verifyToken);

// 获取所有书籍
router.get('/', bookController.getAllBooks);

// 搜索书籍 (必须放在 /:id 路由之前)
router.get('/search', bookController.searchBooks);

// 获取书籍的借阅历史
router.get('/:id/history', bookController.getBorrowingHistory);

// 通过ID获取书籍
router.get('/:id', bookController.getBookById);

// 创建新书籍
router.post('/', bookController.createBook);

// 更新书籍
router.put('/:id', bookController.updateBook);

// 删除书籍
router.delete('/:id', bookController.deleteBook);

module.exports = router;