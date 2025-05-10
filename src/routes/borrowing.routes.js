// src/routes/borrowing.routes.js
const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowing.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// 所有借阅记录路由都需要认证
router.use(verifyToken);

// 获取所有借阅记录
router.get('/', borrowingController.getAllBorrowings);

// 获取当前借出的书籍
router.get('/current', borrowingController.getCurrentBorrowings);

// 获取逾期借阅
router.get('/overdue', borrowingController.getOverdueBorrowings);

// 通过ID获取借阅记录
router.get('/:id', borrowingController.getBorrowingById);

// 创建新借阅记录
router.post('/', borrowingController.createBorrowing);

// 更新借阅记录
router.put('/:id', borrowingController.updateBorrowing);

// 归还书籍
router.post('/:id/return', borrowingController.returnBook);

// 删除借阅记录
router.delete('/:id', borrowingController.deleteBorrowing);

module.exports = router;