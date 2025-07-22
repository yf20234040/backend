const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 验证JWT令牌中间件
 */
exports.authenticateToken = (req, res, next) => {
  // 从请求头获取token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未授权访问，请先登录'
    });
  }
  
  // 验证token
  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      return res.status(403).json({
        code: 403,
        message: '令牌无效或已过期'
      });
    }
    
    // 将用户信息添加到请求对象
    req.userId = user.userId;
    req.phone = user.phone;
    next();
  });
};