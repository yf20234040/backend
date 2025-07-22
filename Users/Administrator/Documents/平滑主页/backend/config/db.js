// config/db.js

// MySQL 数据库配置
const mysqlConfig = {
  host: 'localhost',       // 数据库主机地址
  port: 3306,              // 数据库端口号
  user: 'root',            // 数据库用户名
  password: '123456',      // 数据库密码
  database: 'lxb',         // 数据库名称
  connectionLimit: 10,     // 连接池最大连接数
  waitForConnections: true, // 无可用连接时等待
  queueLimit: 0,           // 等待队列的最大数量（0表示无限制）
  timezone: 'local',       // 使用本地时区
  charset: 'utf8mb4',      // 字符集（支持emoji）
  multipleStatements: true // 允许多条SQL语句
};

module.exports = {
  database: mysqlConfig // 修正导出格式，匹配 app.js 的引用方式
};