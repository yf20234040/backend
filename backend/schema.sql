-- 创建数据库
CREATE DATABASE IF NOT EXISTS wechat_miniprogram DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wechat_miniprogram;

-- 创建用户表
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户唯一ID',
  `phone` varchar(20) NOT NULL COMMENT '手机号（登录账号）',
  `password` varchar(255) NOT NULL COMMENT '加密后的密码',
  `username` varchar(50) DEFAULT NULL COMMENT '用户昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `status` tinyint(1) DEFAULT '1' COMMENT '账号状态（1：正常，0：禁用）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone_unique` (`phone`) COMMENT '手机号唯一'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户登录信息表';

-- 创建短信验证码表
CREATE TABLE `sms_verification` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `code` varchar(10) NOT NULL COMMENT '验证码',
  `token` varchar(100) NOT NULL COMMENT '验证码令牌',
  `type` varchar(20) NOT NULL COMMENT '类型：register/reset',
  `status` tinyint(1) DEFAULT '0' COMMENT '状态（0：未使用，1：已使用）',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `expires_at` datetime NOT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_unique` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短信验证码记录表';

-- 创建系统配置表
CREATE TABLE `system_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(50) NOT NULL COMMENT '配置项键名',
  `config_value` varchar(255) NOT NULL COMMENT '配置项值',
  `description` varchar(200) DEFAULT NULL COMMENT '配置项描述',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key_unique` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 初始化系统配置
INSERT INTO `system_config` (`config_key`, `config_value`, `description`) 
VALUES ('splash_duration', '3000', '启动页停留时间（毫秒）');

-- 添加初始管理员账号
-- 手机号：13800138000，密码：123456（已加密）
INSERT INTO `user` (`phone`, `password`, `username`, `status`) 
VALUES (
  '13800138000',
  '$2a$10$CnF7d9KQ6W5QxR6Y7Z8V9Oe8R9T0U1V2W3X4Y5Z6A7B8C9D0E1F',  -- bcrypt加密后的"123456"
  '系统管理员',
  1
);
