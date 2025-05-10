// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');

/**
 * 验证JWT令牌
 */
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
        return res.status(403).send({
            message: 'No token provided!'
        });
    }

    // 如果令牌以"Bearer "开头，移除它
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    jwt.verify(tokenValue, authConfig.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: 'Unauthorized!'
            });
        }
        req.userId = decoded.id;
        next();
    });
};

module.exports = {
    verifyToken
};