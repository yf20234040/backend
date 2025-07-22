const Core = require('@alicloud/pop-core');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

// 初始化阿里云客户端
const client = new Core({
  accessKeyId: config.aliyunSms.accessKeyId,
  accessKeySecret: config.aliyunSms.accessKeySecret,
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
});

/**
 * 生成指定长度的随机验证码
 */
function generateVerificationCode(length) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

/**
 * 发送验证码短信
 */
exports.sendVerificationCode = async (req, res) => {
  try {
    const { phone, type } = req.body;
    
    // 验证参数
    if (!phone || !type) {
      return res.status(400).json({
        code: 400,
        message: '参数不完整'
      });
    }
    
    // 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: '请输入正确的手机号'
      });
    }
    
    // 检查验证码发送频率
    const [recentRecords] = await global.dbPool.query(
      'SELECT * FROM sms_verification WHERE phone = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)',
      [phone, config.verificationCode.interval]
    );
    
    if (recentRecords.length > 0) {
      return res.status(400).json({
        code: 400,
        message: `请${config.verificationCode.interval}秒后再试`
      });
    }
    
    // 生成验证码
    const code = generateVerificationCode(config.verificationCode.length);
    
    // 选择短信模板
    let templateCode;
    if (type === 'register') {
      templateCode = config.aliyunSms.templates.register;
    } else if (type === 'reset') {
      templateCode = config.aliyunSms.templates.resetPassword;
    } else {
      return res.status(400).json({
        code: 400,
        message: '验证码类型不正确'
      });
    }
    
    // 发送短信
    const params = {
      "PhoneNumbers": phone,
      "SignName": config.aliyunSms.signName,
      "TemplateCode": templateCode,
      "TemplateParam": JSON.stringify({ code })
    };
    
    const requestOption = {
      method: 'POST'
    };
    
    // 调用阿里云API发送短信
    const result = await client.request('SendSms', params, requestOption);
    
    if (result.Code !== 'OK') {
      console.error('短信发送失败:', result);
      return res.status(500).json({
        code: 500,
        message: '短信发送失败，请稍后重试'
      });
    }
    
    // 生成令牌
    const token = uuidv4();
    
    // 计算过期时间
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + config.verificationCode.expiresIn);
    
    // 保存验证码记录
    await global.dbPool.query(
      'INSERT INTO sms_verification (phone, code, token, type, status, created_at, expires_at) VALUES (?, ?, ?, ?, 0, NOW(), ?)',
      [phone, code, token, type, expiresAt]
    );
    
    res.json({
      code: 200,
      message: '验证码发送成功',
      data: {
        token // 返回令牌，用于后续验证
      }
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      code: 500,
      message: '发送验证码失败，请稍后重试'
    });
  }
};