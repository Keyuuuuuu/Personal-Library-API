// src/models/author.model.js
const { executeQuery } = require('../config/db.config');

class Author {
    // 创建新作者
    static async create(data) {
        try {
            const { name, birthDate, deathDate, biography } = data;

            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'INSERT INTO authors (name, birth_date, death_date, biography) VALUES (?, ?, ?, ?)'
                )
                    .bind(name, birthDate || null, deathDate || null, biography || null)
                    .execute();

                return result.getAutoIncrementValue();
            });
        } catch (error) {
            throw error;
        }
    }

    // 获取所有作者
    static async findAll() {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'SELECT * FROM authors ORDER BY name'
                )
                    .execute();

                const rows = result.fetchAll();
                const columns = result.getColumns();
                const columnNames = columns.map(col => col.getColumnName());

                // 构建作者对象数组
                return rows.map(row => {
                    const author = {};
                    row.forEach((value, index) => {
                        author[columnNames[index]] = value;
                    });
                    return author;
                });
            });
        } catch (error) {
            throw error;
        }
    }

    // 通过ID查找作者
    static async findById(id) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'SELECT * FROM authors WHERE id = ?'
                )
                    .bind(id)
                    .execute();

                const rows = result.fetchAll();
                if (rows.length === 0) return null;

                const columns = result.getColumns();
                const columnNames = columns.map(col => col.getColumnName());

                // 构建作者对象
                const author = {};
                rows[0].forEach((value, index) => {
                    author[columnNames[index]] = value;
                });

                return author;
            });
        } catch (error) {
            throw error;
        }
    }

    // 通过名称搜索作者
    static async findByName(name) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'SELECT * FROM authors WHERE name LIKE ?'
                )
                    .bind(`%${name}%`)
                    .execute();

                const rows = result.fetchAll();
                const columns = result.getColumns();
                const columnNames = columns.map(col => col.getColumnName());

                // 构建作者对象数组
                return rows.map(row => {
                    const author = {};
                    row.forEach((value, index) => {
                        author[columnNames[index]] = value;
                    });
                    return author;
                });
            });
        } catch (error) {
            throw error;
        }
    }

    // 更新作者信息
    static async update(id, data) {
        try {
            const { name, birthDate, deathDate, biography } = data;

            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'UPDATE authors SET name = ?, birth_date = ?, death_date = ?, biography = ? WHERE id = ?'
                )
                    .bind(name, birthDate || null, deathDate || null, biography || null, id)
                    .execute();

                return result.getAffectedItemsCount() > 0;
            });
        } catch (error) {
            throw error;
        }
    }

    // 删除作者
    static async delete(id) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'DELETE FROM authors WHERE id = ?'
                )
                    .bind(id)
                    .execute();

                return result.getAffectedItemsCount() > 0;
            });
        } catch (error) {
            throw error;
        }
    }

    // 获取作者的所有书籍
    static async getBooks(id) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'SELECT * FROM books WHERE author_id = ?'
                )
                    .bind(id)
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
}

module.exports = Author;