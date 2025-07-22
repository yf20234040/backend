const db = require('../utils/db');

// 查询用户
exports.findByPhone = async (phone) => {
  const [users] = await db.query('SELECT * FROM user WHERE phone = ?', [phone]);
  return users[0];
};

// 创建用户
exports.create = async ({ phone, password, username }) => {
  const hashedPassword = require('bcryptjs').hashSync(password, 8);
  await db.query(
    'INSERT INTO user (phone, password, username) VALUES (?, ?, ?)',
    [phone, hashedPassword, username]
  );
};

// 更新密码
exports.updatePassword = async (phone, newPassword) => {
  const hashedPassword = require('bcryptjs').hashSync(newPassword, 8);
  const [result] = await db.query(
    'UPDATE user SET password = ? WHERE phone = ?',
    [hashedPassword, phone]
  );
  return result.affectedRows > 0;
};

// 更新最后登录时间
exports.updateLastLoginTime = async (phone) => {
  await db.query('UPDATE user SET last_login_time = NOW() WHERE phone = ?', [phone]);
};