const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { authenticateToken } = require('../middleware/auth');

// 用户登录
router.post('/login', authController.login);

// 用户注册
router.post('/register', authController.register);

// 密码重置
router.post('/reset-password', authController.resetPassword);

// 获取当前用户信息
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;