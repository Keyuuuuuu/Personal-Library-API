// src/models/user.model.js
const { executeQuery } = require('../config/db.config');
const bcrypt = require('bcryptjs');

class User {
    // 注册新用户
    static async create(username, email, password, fullName = null) {
        try {
            // 哈希密码
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await executeQuery(async (session) => {
                const res = await session.sql(
                    'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)'
                )
                    .bind(username, email, hashedPassword, fullName)
                    .execute();

                return res;
            });

            return result.getAutoIncrementValue();
        } catch (error) {
            throw error;
        }
    }

    // 通过ID查找用户
    static async findById(id) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'SELECT id, username, email, password, full_name, created_at, updated_at FROM users WHERE id = ?'
                )
                    .bind(id)
                    .execute();

                const rows = result.fetchAll();
                return rows.length > 0 ? {
                    id: rows[0][0],
                    username: rows[0][1],
                    email: rows[0][2],
                    password: rows[0][3],  // 添加密码字段
                    full_name: rows[0][4],
                    created_at: rows[0][5],
                    updated_at: rows[0][6]
                } : null;
            });
        } catch (error) {
            throw error;
        }
    }

    // 通过用户名查找用户
    static async findByUsername(username) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'SELECT * FROM users WHERE username = ?'
                )
                    .bind(username)
                    .execute();

                const rows = result.fetchAll();
                if (rows.length === 0) return null;

                // 获取列名
                const columns = result.getColumns();
                const columnNames = columns.map(col => col.getColumnName());

                // 构建用户对象
                const user = {};
                rows[0].forEach((value, index) => {
                    user[columnNames[index]] = value;
                });

                return user;
            });
        } catch (error) {
            throw error;
        }
    }

    // 通过电子邮件查找用户
    static async findByEmail(email) {
        try {
            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'SELECT * FROM users WHERE email = ?'
                )
                    .bind(email)
                    .execute();

                const rows = result.fetchAll();
                if (rows.length === 0) return null;

                // 获取列名
                const columns = result.getColumns();
                const columnNames = columns.map(col => col.getColumnName());

                // 构建用户对象
                const user = {};
                rows[0].forEach((value, index) => {
                    user[columnNames[index]] = value;
                });

                return user;
            });
        } catch (error) {
            throw error;
        }
    }

    // 更新用户信息
    static async update(id, data) {
        try {
            const { username, email, fullName } = data;

            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'UPDATE users SET username = ?, email = ?, full_name = ? WHERE id = ?'
                )
                    .bind(username, email, fullName, id)
                    .execute();

                return result.getAffectedItemsCount() > 0;
            });
        } catch (error) {
            throw error;
        }
    }

    // 更新用户密码
    static async updatePassword(id, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            return await executeQuery(async (session) => {
                const result = await session.sql(
                    'UPDATE users SET password = ? WHERE id = ?'
                )
                    .bind(hashedPassword, id)
                    .execute();

                return result.getAffectedItemsCount() > 0;
            });
        } catch (error) {
            throw error;
        }
    }

    // 验证密码
    // 验证密码
    static async validatePassword(plainPassword, hashedPassword) {
        // 添加检查以避免传递 undefined
        if (!plainPassword || !hashedPassword) {
            console.log("Invalid password comparison arguments:", {
                plainPassword: typeof plainPassword,
                hashedPassword: typeof hashedPassword
            });
            return false;
        }
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;