const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

/**
 * 用户登录
 */
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // 验证参数
    if (!phone || !password) {
      return res.status(400).json({
        code: 400,
        message: '手机号和密码不能为空'
      });
    }
    
    // 查询用户
    const [users] = await global.dbPool.query(
      'SELECT * FROM user WHERE phone = ?',
      [phone]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '手机号或密码不正确'
      });
    }
    
    const user = users[0];
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '手机号或密码不正确'
      });
    }
    
    // 检查账号状态
    if (user.status !== 1) {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用，请联系管理员'
      });
    }
    
    // 更新最后登录时间
    await global.dbPool.query(
      'UPDATE user SET last_login_time = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );
    
    // 生成JWT
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    // 返回用户信息和token
    const userInfo = {
      id: user.id,
      phone: user.phone,
      username: user.username || '',
      avatar: user.avatar || ''
    };
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        user: userInfo,
        token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败，请稍后重试'
    });
  }
};

/**
 * 用户注册
 */
exports.register = async (req, res) => {
  try {
    const { phone, password, confirmPassword, verifyCode, smsToken } = req.body;
    
    // 验证参数
    if (!phone || !password || !confirmPassword || !verifyCode || !smsToken) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整信息'
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        code: 400,
        message: '两次密码输入不一致'
      });
    }
    
    if (password.length < 6 || password.length > 20) {
      return res.status(400).json({
        code: 400,
        message: '密码长度必须为6-20位'
      });
    }
    
    // 验证验证码
    const [verifyRecords] = await global.dbPool.query(
      'SELECT * FROM sms_verification WHERE token = ? AND phone = ? AND code = ? AND status = 0 AND expires_at > NOW()',
      [smsToken, phone, verifyCode]
    );
    
    if (verifyRecords.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '验证码不正确或已过期'
      });
    }
    
    // 检查手机号是否已注册
    const [existingUsers] = await global.dbPool.query(
      'SELECT id FROM user WHERE phone = ?',
      [phone]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '该手机号已注册'
      });
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const [result] = await global.dbPool.query(
      'INSERT INTO user (phone, password, username, status, create_time) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)',
      [phone, hashedPassword, `用户${phone.slice(-4)}`] // 默认用户名使用手机号后四位
    );
    
    // 标记验证码为已使用
    await global.dbPool.query(
      'UPDATE sms_verification SET status = 1 WHERE id = ?',
      [verifyRecords[0].id]
    );
    
    res.json({
      code: 200,
      message: '注册成功'
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      code: 500,
      message: '注册失败，请稍后重试'
    });
  }
};

/**
 * 密码重置
 */
exports.resetPassword = async (req, res) => {
  try {
    const { phone, newPassword, confirmPassword, verifyCode, smsToken } = req.body;
    
    // 验证参数
    if (!phone || !newPassword || !confirmPassword || !verifyCode || !smsToken) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整信息'
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        code: 400,
        message: '两次密码输入不一致'
      });
    }
    
    if (newPassword.length < 6 || newPassword.length > 20) {
      return res.status(400).json({
        code: 400,
        message: '密码长度必须为6-20位'
      });
    }
    
    // 验证验证码
    const [verifyRecords] = await global.dbPool.query(
      'SELECT * FROM sms_verification WHERE token = ? AND phone = ? AND code = ? AND status = 0 AND expires_at > NOW()',
      [smsToken, phone, verifyCode]
    );
    
    if (verifyRecords.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '验证码不正确或已过期'
      });
    }
    
    // 检查用户是否存在
    const [existingUsers] = await global.dbPool.query(
      'SELECT id FROM user WHERE phone = ?',
      [phone]
    );
    
    if (existingUsers.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '该手机号未注册'
      });
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await global.dbPool.query(
      'UPDATE user SET password = ? WHERE phone = ?',
      [hashedPassword, phone]
    );
    
    // 标记验证码为已使用
    await global.dbPool.query(
      'UPDATE sms_verification SET status = 1 WHERE id = ?',
      [verifyRecords[0].id]
    );
    
    res.json({
      code: 200,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('密码重置失败:', error);
    res.status(500).json({
      code: 500,
      message: '密码重置失败，请稍后重试'
    });
  }
};

/**
 * 获取当前用户信息
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const [users] = await global.dbPool.query(
      'SELECT id, phone, username, avatar, create_time, last_login_time FROM user WHERE id = ?',
      [req.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    res.json({
      code: 200,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败'
    });
  }
};