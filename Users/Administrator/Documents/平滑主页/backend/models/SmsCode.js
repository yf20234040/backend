const db = require('../utils/db');

// 存储验证码
exports.create = async (phone, code, type) => {
  await db.query(
    'INSERT INTO sms_code (phone, code, type, created_at) VALUES (?, ?, ?, NOW())',
    [phone, code, type]
  );
};

// 验证验证码
exports.validateCode = async (phone, code, type) => {
  const [rows] = await db.query(
    'SELECT * FROM sms_code WHERE phone = ? AND code = ? AND type = ? AND created_at >= NOW() - INTERVAL 5 MINUTE',
    [phone, code, type]
  );
  return rows.length > 0;
};