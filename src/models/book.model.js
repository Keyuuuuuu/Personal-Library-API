// src/models/book.model.js
const { executeQuery } = require('../config/db.config');

class Book {
    // 创建新书籍
    static async create(data) {
        try {
            const {
                title,
                authorId,
                isbn,
                publicationYear,
                publisher,
                genre,
                description,
                pageCount,
                language,
                available,
                userId
            } = data;

            return await executeQuery(async (session) => {
                const result = await session.sql(
                    `INSERT INTO books (
            title, author_id, isbn, publication_year, publisher, 
            genre, description, page_count, language, available, user_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                )
                    .bind(
                        title,
                        authorId || null,
                        isbn || null,
                        publicationYear || null,
                        publisher || null,
                        genre || null,
                        description || null,
                        pageCount || null,
                        language || null,
                        available !== undefined ? available : true,
                        userId
                    )
                    .execute();

                return result.getAutoIncrementValue();
            });
        } catch (error) {
            throw error;
        }
    }

    // 获取所有书籍
    static async findAll(userId) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    `SELECT b.*, a.name as author_name 
           FROM books b 
           LEFT JOIN authors a ON b.author_id = a.id 
           WHERE b.user_id = ? 
           ORDER BY b.title`
                )
                    .bind(userId)
                    .execute();

                const rows = result.fetchAll();
                const columns = result.getColumns();
                const columnNames = columns.map(col => col.getColumnName());

                // 构建书籍对象数组
                return rows.map(row => {
                    const book = {};
                    row.forEach((value, index) => {
                        book[columnNames[index]] = value;
                    });
                    return book;
                });
            });
        } catch (error) {
            throw error;
        }
    }

    // 通过ID查找书籍
    static async findById(id, userId) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    `SELECT b.*, a.name as author_name 
           FROM books b 
           LEFT JOIN authors a ON b.author_id = a.id 
           WHERE b.id = ? AND b.user_id = ?`
                )
                    .bind(id, userId)
                    .execute();

                const rows = result.fetchAll();
                if (rows.length === 0) return null;

                const columns = result.getColumns();
                const columnNames = columns.map(col => col.getColumnName());

                // 构建书籍对象
                const book = {};
                rows[0].forEach((value, index) => {
                    book[columnNames[index]] = value;
                });

                return book;
            });
        } catch (error) {
            throw error;
        }
    }

    // 通过标题搜索书籍
    static async findByTitle(title, userId) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    `SELECT b.*, a.name as author_name 
           FROM books b 
           LEFT JOIN authors a ON b.author_id = a.id 
           WHERE b.title LIKE ? AND b.user_id = ?`
                )
                    .bind(`%${title}%`, userId)
                    .execute();

                const rows = result.fetchAll();
                const columns = result.getColumns();
                const columnNames = columns.map(col => col.getColumnName());

                // 构建书籍对象数组
                return rows.map(row => {
                    const book = {};
                    row.forEach((value, index) => {
                        book[columnNames[index]] = value;
                    });
                    return book;
                });
            });
        } catch (error) {
            throw error;
        }
    }

    // 更新书籍信息
    static async update(id, data, userId) {
        try {
            const {
                title,
                authorId,
                isbn,
                publicationYear,
                publisher,
                genre,
                description,
                pageCount,
                language,
                available
            } = data;

            return await executeQuery(async (session) => {
                const result = await session.sql(
                    `UPDATE books SET 
            title = ?, author_id = ?, isbn = ?, publication_year = ?, 
            publisher = ?, genre = ?, description = ?, page_count = ?, 
            language = ?, available = ? 
           WHERE id = ? AND user_id = ?`
                )
                    .bind(
                        title,
                        authorId || null,
                        isbn || null,
                        publicationYear || null,
                        publisher || null,
                        genre || null,
                        description || null,
                        pageCount || null,
                        language || null,
                        available !== undefined ? available : true,
                        id,
                        userId
                    )
                    .execute();

                return result.getAffectedItemsCount() > 0;
            });
        } catch (error) {
            throw error;
        }
    }

    // 删除书籍
    static async delete(id, userId) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'DELETE FROM books WHERE id = ? AND user_id = ?'
                )
                    .bind(id, userId)
                    .execute();

                return result.getAffectedItemsCount() > 0;
            });
        } catch (error) {
            throw error;
        }
    }

    // 获取书籍的借阅历史
    static async getBorrowingHistory(id, userId) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    `SELECT * FROM borrowings 
           WHERE book_id = ? AND user_id = ? 
           ORDER BY borrowed_date DESC`
                )
                    .bind(id, userId)
                    .execute();

                const rows = result.fetchAll();
                const columns = result.getColumns();
                const columnNames = columns.map(col => col.getColumnName());

                // 构建借阅记录对象数组
                return rows.map(row => {
                    const borrowing = {};
                    row.forEach((value, index) => {
                        borrowing[columnNames[index]] = value;
                    });
                    return borrowing;
                });
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Book;