// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authConfig = require('../config/auth.config');

exports.signup = async (req, res) => {
    try {
        // 验证请求
        const { username, email, password, fullName } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username, email and password are required"
            });
        }

        // 检查用户名是否已存在
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username is already taken"
            });
        }

        // 检查邮箱是否已存在
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is already in use"
            });
        }

        // 创建新用户
        const userId = await User.create(username, email, password, fullName);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            userId
        });
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证请求
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        // 查找用户
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 验证密码
        const isPasswordValid = await User.validatePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // 创建 JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            authConfig.secret,
            { expiresIn: authConfig.expiresIn }
        );

        // 返回用户信息和 token
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            },
            accessToken: token
        });
    } catch (error) {
        console.error("Error in signin:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};