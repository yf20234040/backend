const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const config = require('./config');
const authRoutes = require('./routes/auth');
const smsRoutes = require('./routes/sms');

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据库连接池
global.dbPool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
async function testDbConnection() {
  try {
    const connection = await global.dbPool.getConnection();
    console.log('数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
}

testDbConnection();

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/sms', smsRoutes);

// 根路由
app.get('/', (req, res) => {
  res.send('微信小程序后端服务运行中');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});

// 启动服务器
const server = app.listen(config.port, () => {
  console.log(`服务器运行在 http://localhost:${config.port}`);
});

// 处理退出信号
process.on('SIGINT', () => {
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});