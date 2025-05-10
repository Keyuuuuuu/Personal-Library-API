// src/models/borrowing.model.js
const { executeQuery } = require('../config/db.config');

class Borrowing {
    // 创建新借阅记录
    static async create(data) {
        try {
            const {
                bookId,
                borrowerName,
                borrowedDate,
                dueDate,
                returnedDate,
                notes,
                userId
            } = data;

            return await executeQuery(async (session) => {
                // 插入借阅记录
                const borrowResult = await session.sql(
                    `INSERT INTO borrowings (
            book_id, borrower_name, borrowed_date, due_date, 
            returned_date, notes, user_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
                )
                    .bind(
                        bookId,
                        borrowerName,
                        borrowedDate,
                        dueDate,
                        returnedDate || null,
                        notes || null,
                        userId
                    )
                    .execute();

                // 更新书籍可用性
                await session.sql(
                    'UPDATE books SET available = ? WHERE id = ?'
                )
                    .bind(returnedDate ? true : false, bookId)
                    .execute();

                return borrowResult.getAutoIncrementValue();
            });
        } catch (error) {
            throw error;
        }
    }

    // 获取所有借阅记录
    static async findAll(userId) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    `SELECT b.*, bk.title as book_title 
           FROM borrowings b 
           JOIN books bk ON b.book_id = bk.id 
           WHERE b.user_id = ? 
           ORDER BY b.borrowed_date DESC`
                )
                    .bind(userId)
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

    // 通过ID查找借阅记录
    static async findById(id, userId) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    `SELECT b.*, bk.title as book_title 
           FROM borrowings b 
           JOIN books bk ON b.book_id = bk.id 
           WHERE b.id = ? AND b.user_id = ?`
                )
                    .bind(id, userId)
                    .execute();

                const rows = result.fetchAll();
                if (rows.length === 0) return null;

                const columns = result.getColumns();
                const columnNames = columns.map(col => col.getColumnName());

                // 构建借阅记录对象
                const borrowing = {};
                rows[0].forEach((value, index) => {
                    borrowing[columnNames[index]] = value;
                });

                return borrowing;
            });
        } catch (error) {
            throw error;
        }
    }

    // 查找当前借出的书籍
    static async findCurrentBorrowings(userId) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    `SELECT b.*, bk.title as book_title 
           FROM borrowings b 
           JOIN books bk ON b.book_id = bk.id 
           WHERE b.returned_date IS NULL AND b.user_id = ? 
           ORDER BY b.due_date`
                )
                    .bind(userId)
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

    // 查找逾期借阅
    static async findOverdueBorrowings(userId) {
        try {
            return await executeQuery(async (session) => {
                const today = new Date().toISOString().split('T')[0];

                const result = await session.sql(
                    `SELECT b.*, bk.title as book_title 
           FROM borrowings b 
           JOIN books bk ON b.book_id = bk.id 
           WHERE b.returned_date IS NULL AND b.due_date < ? AND b.user_id = ? 
           ORDER BY b.due_date`
                )
                    .bind(today, userId)
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

    // 更新借阅记录
    static async update(id, data, userId) {
        try {
            const {
                bookId,
                borrowerName,
                borrowedDate,
                dueDate,
                returnedDate,
                notes
            } = data;

            return await executeQuery(async (session) => {
                // 获取当前借阅记录以获取当前书籍ID（如果更改了）
                const currentResult = await session.sql(
                    'SELECT book_id FROM borrowings WHERE id = ? AND user_id = ?'
                )
                    .bind(id, userId)
                    .execute();

                const currentRows = currentResult.fetchAll();
                if (currentRows.length === 0) {
                    return false;
                }

                const currentBookId = currentRows[0][0];

                // 更新借阅记录
                const updateResult = await session.sql(
                    `UPDATE borrowings SET 
            book_id = ?, borrower_name = ?, borrowed_date = ?, 
            due_date = ?, returned_date = ?, notes = ? 
           WHERE id = ? AND user_id = ?`
                )
                    .bind(
                        bookId,
                        borrowerName,
                        borrowedDate,
                        dueDate,
                        returnedDate || null,
                        notes || null,
                        id,
                        userId
                    )
                    .execute();

                // 如果书籍ID发生变化，需要更新两本书的状态
                if (bookId !== currentBookId) {
                    // 更新旧书籍状态为可用
                    await session.sql(
                        'UPDATE books SET available = TRUE WHERE id = ?'
                    )
                        .bind(currentBookId)
                        .execute();
                }

                // 更新当前书籍状态
                await session.sql(
                    'UPDATE books SET available = ? WHERE id = ?'
                )
                    .bind(returnedDate ? true : false, bookId)
                    .execute();

                return updateResult.getAffectedItemsCount() > 0;
            });
        } catch (error) {
            throw error;
        }
    }

    // 归还书籍
    static async returnBook(id, userId) {
        try {
            return await executeQuery(async (session) => {
                const today = new Date().toISOString().split('T')[0];

                // 获取借阅记录以获取书籍ID
                const borrowResult = await session.sql(
                    'SELECT book_id FROM borrowings WHERE id = ? AND user_id = ?'
                )
                    .bind(id, userId)
                    .execute();

                const borrowRows = borrowResult.fetchAll();
                if (borrowRows.length === 0) {
                    return false;
                }

                const bookId = borrowRows[0][0];

                // 更新借阅记录的归还日期
                const returnResult = await session.sql(
                    'UPDATE borrowings SET returned_date = ? WHERE id = ? AND user_id = ?'
                )
                    .bind(today, id, userId)
                    .execute();

                // 更新书籍可用性
                await session.sql(
                    'UPDATE books SET available = TRUE WHERE id = ?'
                )
                    .bind(bookId)
                    .execute();

                return returnResult.getAffectedItemsCount() > 0;
            });
        } catch (error) {
            throw error;
        }
    }

    // 删除借阅记录
    static async delete(id, userId) {
        try {
            return await executeQuery(async (session) => {
                // 获取借阅记录以获取书籍ID和归还状态
                const borrowResult = await session.sql(
                    'SELECT book_id, returned_date FROM borrowings WHERE id = ? AND user_id = ?'
                )
                    .bind(id, userId)
                    .execute();

                const borrowRows = borrowResult.fetchAll();
                if (borrowRows.length === 0) {
                    return false;
                }

                const bookId = borrowRows[0][0];
                const returnedDate = borrowRows[0][1];

                // 删除借阅记录
                const deleteResult = await session.sql(
                    'DELETE FROM borrowings WHERE id = ? AND user_id = ?'
                )
                    .bind(id, userId)
                    .execute();

                // 如果书籍尚未归还但我们删除了记录，更新书籍为可用
                if (!returnedDate) {
                    await session.sql(
                        'UPDATE books SET available = TRUE WHERE id = ?'
                    )
                        .bind(bookId)
                        .execute();
                }

                return deleteResult.getAffectedItemsCount() > 0;
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Borrowing;