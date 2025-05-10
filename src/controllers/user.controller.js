// src/controllers/user.controller.js
const User = require('../models/user.model');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId; // 来自认证中间件

        // 获取用户信息
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 返回用户信息（排除密码）
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error("Error in getProfile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId; // 来自认证中间件
        const { username, email, fullName } = req.body;

        // 验证请求
        if (!username || !email) {
            return res.status(400).json({
                success: false,
                message: "Username and email are required"
            });
        }

        // 检查用户是否存在
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 如果用户名改变，检查是否已存在
        if (username !== user.username) {
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Username is already taken"
                });
            }
        }

        // 如果邮箱改变，检查是否已存在
        if (email !== user.email) {
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email is already in use"
                });
            }
        }

        // 更新用户信息
        const updated = await User.update(userId, { username, email, fullName });
        if (!updated) {
            return res.status(500).json({
                success: false,
                message: "Failed to update profile"
            });
        }

        // 获取更新后的用户信息
        const updatedUser = await User.findById(userId);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                fullName: updatedUser.full_name,
                createdAt: updatedUser.created_at
            }
        });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.userId; // 来自认证中间件
        const { currentPassword, newPassword } = req.body;

        // 验证请求
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        // 获取用户信息
        const user = await User.findById(userId);
        console.log("User found:", { id: user?.id, hasPassword: !!user?.password });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 检查密码字段
        if (!user.password) {
            console.log("User password is missing");
            return res.status(500).json({
                success: false,
                message: "User data is incomplete"
            });
        }

        // 验证当前密码
        const isCurrentPasswordValid = await User.validatePassword(
            currentPassword,
            user.password
        );

        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // 更新密码
        const updated = await User.updatePassword(userId, newPassword);
        if (!updated) {
            return res.status(500).json({
                success: false,
                message: "Failed to update password"
            });
        }

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};