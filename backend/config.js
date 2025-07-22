module.exports = {
  // 服务器端口
  port: 3000,
  
  // 数据库配置
  database: {
    host: 'localhost',
    user: 'root',
    password: 'your_mysql_password', // 替换为你的MySQL密码
    name: 'wechat_miniprogram'      // 数据库名称
  },
  
  // JWT配置
  jwt: {
    secret: 'your_jwt_secret_key',  // 替换为你的JWT密钥
    expiresIn: '7d'                 // Token有效期
  },
  
  // 阿里云短信服务配置
  aliyunSms: {
    accessKeyId: 'your_access_key_id',      // 替换为你的阿里云AccessKeyId
    accessKeySecret: 'your_access_key_secret', // 替换为你的阿里云AccessKeySecret
    signName: '你的短信签名',                // 替换为你的短信签名
    templates: {
      register: 'SMS_123456789',           // 注册验证码模板ID
      resetPassword: 'SMS_987654321'       // 密码重置验证码模板ID
    }
  },
  
  // 验证码配置
  verificationCode: {
    length: 6,           // 验证码长度
    expiresIn: 5 * 60,   // 有效期5分钟(秒)
    interval: 60         // 重发间隔(秒)
  }
};