const SmsCode = require('../models/SmsCode');

// 发送验证码
exports.sendCode = async (req, res) => {
  try {
    const { phone, type } = req.body;

    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 400, message: '手机号格式不正确' });
    }

    // 验证类型
    if (!type || (type !== 1 && type !== 2)) {
      return res.status(400).json({ code: 400, message: '验证码类型不正确' });
    }

    // 生成验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存储验证码
    await SmsCode.create(phone, code, type);

    console.log(`发送短信验证码：${phone} - ${code}`);

    // 返回成功响应
    res.json({ code: 200, message: '验证码发送成功' });
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({ code: 500, message: '内部服务器错误' });
  }
};