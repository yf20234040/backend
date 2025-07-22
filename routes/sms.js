const express = require('express');
const router = express.Router();
const smsController = require('../controllers/sms');

// 发送短信验证码
router.post('/send', smsController.sendVerificationCode);

module.exports = router;