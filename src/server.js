// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection, initDatabase } = require('./config/db.config');

// 导入路由
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const authorRoutes = require('./routes/author.routes');
const bookRoutes = require('./routes/book.routes');        // 新增
const borrowingRoutes = require('./routes/borrowing.routes'); // 新增

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 测试路由
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Personal Library API.' });
});

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);        // 新增
app.use('/api/borrowings', borrowingRoutes); // 新增

// 设置端口并监听请求
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    // 测试数据库连接
    const connected = await testConnection();

    // 初始化数据库表
    if (connected) {
        await initDatabase();
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        success: false,
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});