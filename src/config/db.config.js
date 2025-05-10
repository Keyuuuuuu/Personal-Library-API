// src/config/db.config.js
const mysqlx = require('@mysql/xdevapi');
require('dotenv').config();

// 构建连接 URI
const uri = `mysqlx://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// 创建客户端配置
const clientOptions = {
    pooling: {
        enabled: true,
        maxSize: 10,
        maxIdleTime: 30000,
        queueTimeout: 10000
    }
};

// 打印连接信息（不包含密码）
console.log('Database connection URI:', `mysqlx://${process.env.DB_USER}:***@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// 创建客户端
const client = mysqlx.getClient(uri, clientOptions);

// 测试数据库连接
async function testConnection() {
    let session;
    try {
        session = await client.getSession();
        console.log('Database connection successful');

        // 确保数据库存在
        try {
            await session.sql(`USE ${process.env.DB_NAME}`).execute();
            console.log(`Database '${process.env.DB_NAME}' exists`);
        } catch (err) {
            console.log(`Creating database '${process.env.DB_NAME}'...`);
            await session.sql(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`).execute();
            await session.sql(`USE ${process.env.DB_NAME}`).execute();
            console.log(`Database '${process.env.DB_NAME}' created`);
        }

        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// 执行查询
async function executeQuery(callback) {
    let session;
    try {
        session = await client.getSession();
        await session.sql(`USE ${process.env.DB_NAME}`).execute();
        return await callback(session);
    } finally {
        if (session) {
            await session.close();
        }
    }
}

// 初始化数据库表
async function initDatabase() {
    return executeQuery(async (session) => {
        // 创建用户表
        await session.sql(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `).execute();

        // 创建作者表
        await session.sql(`
      CREATE TABLE IF NOT EXISTS authors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        birth_date DATE,
        death_date DATE,
        biography TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `).execute();

        // 创建书籍表
        await session.sql(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author_id INT,
        isbn VARCHAR(20),
        publication_year INT,
        publisher VARCHAR(100),
        genre VARCHAR(50),
        description TEXT,
        page_count INT,
        language VARCHAR(50),
        available BOOLEAN DEFAULT TRUE,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).execute();

        // 创建借阅记录表
        await session.sql(`
      CREATE TABLE IF NOT EXISTS borrowings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        book_id INT NOT NULL,
        borrower_name VARCHAR(100) NOT NULL,
        borrowed_date DATE NOT NULL,
        due_date DATE NOT NULL,
        returned_date DATE,
        notes TEXT,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).execute();

        console.log('Database tables created successfully');
    });
}

module.exports = {
    client,
    executeQuery,
    testConnection,
    initDatabase
};