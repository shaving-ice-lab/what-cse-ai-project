-- ============================================================================
-- 公考职位智能筛选系统 - 数据库建表脚本
-- Database: what-cse-ai
-- Charset: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- Created: 2026-01-24
-- Table Prefix: what_
-- ============================================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `what-cse-ai`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `what-cse-ai`;

-- ============================================================================
-- 用户相关表
-- ============================================================================

-- 用户表
CREATE TABLE IF NOT EXISTS `what_users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) DEFAULT NULL,
    `email` VARCHAR(100) DEFAULT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(50) DEFAULT NULL,
    `avatar` VARCHAR(500) DEFAULT NULL,
    `status` TINYINT DEFAULT 1 COMMENT '1-正常 2-禁用',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone` (`phone`),
    UNIQUE KEY `uk_email` (`email`),
    KEY `idx_what_users_status` (`status`),
    KEY `idx_what_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户档案表
CREATE TABLE IF NOT EXISTS `what_user_profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `gender` VARCHAR(10) DEFAULT NULL,
    `birth_date` DATE DEFAULT NULL,
    `hukou_province` VARCHAR(50) DEFAULT NULL,
    `hukou_city` VARCHAR(50) DEFAULT NULL,
    `political_status` VARCHAR(20) DEFAULT NULL,
    `education` VARCHAR(20) DEFAULT NULL,
    `major` VARCHAR(100) DEFAULT NULL,
    `school` VARCHAR(100) DEFAULT NULL,
    `graduation_date` DATE DEFAULT NULL,
    `is_fresh_graduate` TINYINT(1) DEFAULT 0,
    `work_years` INT DEFAULT 0,
    `grassroots_exp_years` INT DEFAULT 0,
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    KEY `idx_what_user_profiles_education` (`education`),
    KEY `idx_what_user_profiles_major` (`major`),
    KEY `idx_what_user_profiles_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户档案表';

-- 用户证书表
CREATE TABLE IF NOT EXISTS `what_user_certificates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `cert_type` VARCHAR(50) NOT NULL COMMENT '证书类型',
    `cert_name` VARCHAR(100) NOT NULL COMMENT '证书名称',
    `cert_level` VARCHAR(50) DEFAULT NULL COMMENT '证书等级',
    `obtained_date` DATE DEFAULT NULL COMMENT '获得日期',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_what_user_certificates_user_id` (`user_id`),
    KEY `idx_what_user_certificates_cert_type` (`cert_type`),
    KEY `idx_what_user_certificates_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户证书表';

-- 用户偏好表
CREATE TABLE IF NOT EXISTS `what_user_preferences` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `preferred_provinces` JSON DEFAULT NULL,
    `preferred_cities` JSON DEFAULT NULL,
    `preferred_departments` JSON DEFAULT NULL,
    `exam_types` JSON DEFAULT NULL,
    `match_strategy` VARCHAR(20) DEFAULT 'balanced' COMMENT '匹配策略: strict-严格, balanced-均衡, loose-宽松',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    KEY `idx_what_user_preferences_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户偏好表';

-- 用户收藏表
CREATE TABLE IF NOT EXISTS `what_user_favorites` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `position_id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_position` (`user_id`, `position_id`),
    KEY `idx_what_user_favorites_user_id` (`user_id`),
    KEY `idx_what_user_favorites_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- 用户浏览记录表
CREATE TABLE IF NOT EXISTS `what_user_views` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `position_id` VARCHAR(50) NOT NULL,
    `view_count` INT DEFAULT 1,
    `view_time` DATETIME(3) DEFAULT NULL,
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_position` (`user_id`, `position_id`),
    KEY `idx_what_user_views_user_id` (`user_id`),
    KEY `idx_what_user_views_view_time` (`view_time` DESC),
    KEY `idx_what_user_views_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户浏览记录表';

-- 用户通知表
CREATE TABLE IF NOT EXISTS `what_user_notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` VARCHAR(50) NOT NULL COMMENT '通知类型',
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT DEFAULT NULL,
    `is_read` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_what_user_notifications_user_id` (`user_id`),
    KEY `idx_what_user_notifications_is_read` (`is_read`),
    KEY `idx_what_user_notifications_created_at` (`created_at`),
    KEY `idx_what_user_notifications_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户通知表';

-- ============================================================================
-- 职位相关表
-- ============================================================================

-- 职位表
CREATE TABLE IF NOT EXISTS `what_positions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `position_id` VARCHAR(50) NOT NULL COMMENT '职位编号',
    `position_name` VARCHAR(100) NOT NULL COMMENT '职位名称',
    `department_code` VARCHAR(50) DEFAULT NULL COMMENT '部门代码',
    `department_name` VARCHAR(200) DEFAULT NULL COMMENT '部门名称',
    `department_level` VARCHAR(20) DEFAULT NULL COMMENT '部门级别: 中央/省级/市级/县级/乡镇',
    `work_location_province` VARCHAR(50) DEFAULT NULL COMMENT '工作地省份',
    `work_location_city` VARCHAR(50) DEFAULT NULL COMMENT '工作地城市',
    `work_location_district` VARCHAR(50) DEFAULT NULL COMMENT '工作地区县',
    `recruit_count` INT DEFAULT 1 COMMENT '招录人数',
    `exam_type` VARCHAR(20) DEFAULT NULL COMMENT '考试类型: 国考/省考/事业单位/选调生',
    `education_min` VARCHAR(20) DEFAULT NULL COMMENT '最低学历',
    `education_max` VARCHAR(20) DEFAULT NULL COMMENT '最高学历',
    `degree_required` VARCHAR(10) DEFAULT '不限' COMMENT '学位要求: 是/否/不限',
    `major_category` JSON DEFAULT NULL COMMENT '专业大类',
    `major_specific` JSON DEFAULT NULL COMMENT '具体专业',
    `major_unlimited` TINYINT(1) DEFAULT 0 COMMENT '专业不限',
    `political_status` VARCHAR(20) DEFAULT '不限' COMMENT '政治面貌',
    `work_exp_years_min` INT DEFAULT 0 COMMENT '最低工作年限',
    `age_min` INT DEFAULT 18 COMMENT '最小年龄',
    `age_max` INT DEFAULT 35 COMMENT '最大年龄',
    `gender_required` VARCHAR(10) DEFAULT '不限' COMMENT '性别要求: 男/女/不限',
    `hukou_required` TINYINT(1) DEFAULT 0 COMMENT '是否有户籍要求',
    `hukou_provinces` JSON DEFAULT NULL COMMENT '户籍省份要求',
    `registration_start` DATETIME(3) DEFAULT NULL COMMENT '报名开始时间',
    `registration_end` DATETIME(3) DEFAULT NULL COMMENT '报名截止时间',
    `exam_date_written` DATE DEFAULT NULL COMMENT '笔试日期',
    `applicant_count` INT DEFAULT 0 COMMENT '报名人数',
    `competition_ratio` DECIMAL(10,2) DEFAULT 0 COMMENT '竞争比',
    `parse_confidence` INT DEFAULT 100 COMMENT '解析置信度 0-100',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-待审核, 1-已发布, 2-已下线',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_position_id` (`position_id`),
    KEY `idx_what_positions_position_name` (`position_name`),
    KEY `idx_what_positions_department_code` (`department_code`),
    KEY `idx_what_positions_department_name` (`department_name`),
    KEY `idx_what_positions_province` (`work_location_province`),
    KEY `idx_what_positions_city` (`work_location_city`),
    KEY `idx_what_positions_exam_type` (`exam_type`),
    KEY `idx_what_positions_status` (`status`),
    KEY `idx_what_positions_created_at` (`created_at`),
    KEY `idx_what_positions_deleted_at` (`deleted_at`),
    KEY `idx_what_positions_search` (`exam_type`, `work_location_province`, `education_min`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职位表';

-- 公告表
CREATE TABLE IF NOT EXISTS `what_announcements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL COMMENT '公告标题',
    `source_url` VARCHAR(500) DEFAULT NULL COMMENT '来源链接',
    `source_name` VARCHAR(100) DEFAULT NULL COMMENT '来源名称',
    `publish_date` DATE DEFAULT NULL COMMENT '发布日期',
    `content` LONGTEXT DEFAULT NULL COMMENT '公告内容',
    `announcement_type` VARCHAR(50) DEFAULT NULL COMMENT '公告类型: 招录公告/报名统计/笔试公告/面试公告/成绩公告/拟录用公示',
    `exam_type` VARCHAR(20) DEFAULT NULL COMMENT '考试类型',
    `province` VARCHAR(50) DEFAULT NULL COMMENT '省份',
    `city` VARCHAR(50) DEFAULT NULL COMMENT '城市',
    `attachment_urls` JSON DEFAULT NULL COMMENT '附件链接',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-草稿, 1-已发布, 2-已归档',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_what_announcements_title` (`title`),
    KEY `idx_what_announcements_announcement_type` (`announcement_type`),
    KEY `idx_what_announcements_exam_type` (`exam_type`),
    KEY `idx_what_announcements_province` (`province`),
    KEY `idx_what_announcements_publish_date` (`publish_date`),
    KEY `idx_what_announcements_status` (`status`),
    KEY `idx_what_announcements_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

-- 职位公告关联表
CREATE TABLE IF NOT EXISTS `what_position_announcements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `position_id` VARCHAR(50) NOT NULL,
    `announcement_id` BIGINT UNSIGNED NOT NULL,
    `stage` VARCHAR(50) DEFAULT NULL COMMENT '阶段',
    `created_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_what_position_announcements_position_id` (`position_id`),
    KEY `idx_what_position_announcements_announcement_id` (`announcement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职位公告关联表';

-- ============================================================================
-- 爬虫相关表
-- ============================================================================

-- 列表页监控表
CREATE TABLE IF NOT EXISTS `what_list_pages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(500) NOT NULL COMMENT '列表页URL',
    `source_name` VARCHAR(100) DEFAULT NULL COMMENT '来源名称',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '分类',
    `crawl_frequency` VARCHAR(20) DEFAULT 'daily' COMMENT '爬取频率: hourly/daily/weekly',
    `last_crawl_time` DATETIME(3) DEFAULT NULL COMMENT '上次爬取时间',
    `article_count` INT DEFAULT 0 COMMENT '文章数量',
    `article_selector` VARCHAR(255) DEFAULT NULL COMMENT '文章选择器',
    `pagination_pattern` VARCHAR(255) DEFAULT NULL COMMENT '分页模式',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态: active/inactive/error',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_url` (`url`),
    KEY `idx_what_list_pages_status` (`status`),
    KEY `idx_what_list_pages_category` (`category`),
    KEY `idx_what_list_pages_crawl_frequency` (`crawl_frequency`),
    KEY `idx_what_list_pages_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='列表页监控表';

-- 爬虫任务表
CREATE TABLE IF NOT EXISTS `what_crawl_tasks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `task_id` VARCHAR(100) NOT NULL COMMENT '任务ID',
    `task_type` VARCHAR(50) DEFAULT NULL COMMENT '任务类型: list_monitor/list_discovery/announcement/positions',
    `task_name` VARCHAR(200) DEFAULT NULL COMMENT '任务名称',
    `task_params` JSON DEFAULT NULL COMMENT '任务参数',
    `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/running/completed/failed/cancelled',
    `progress` DOUBLE DEFAULT 0 COMMENT '进度 0-100',
    `result` JSON DEFAULT NULL COMMENT '执行结果',
    `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
    `items_scraped` INT DEFAULT 0 COMMENT '已爬取项数',
    `items_saved` INT DEFAULT 0 COMMENT '已保存项数',
    `started_at` DATETIME(3) DEFAULT NULL COMMENT '开始时间',
    `completed_at` DATETIME(3) DEFAULT NULL COMMENT '完成时间',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_task_id` (`task_id`),
    KEY `idx_what_crawl_tasks_task_type` (`task_type`),
    KEY `idx_what_crawl_tasks_status` (`status`),
    KEY `idx_what_crawl_tasks_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫任务表';

-- 爬虫日志表
CREATE TABLE IF NOT EXISTS `what_crawl_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `task_id` VARCHAR(100) DEFAULT NULL COMMENT '关联任务ID',
    `level` VARCHAR(20) DEFAULT NULL COMMENT '日志级别: debug/info/warning/error',
    `message` TEXT DEFAULT NULL COMMENT '日志消息',
    `data` JSON DEFAULT NULL COMMENT '附加数据',
    `created_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_what_crawl_logs_task_id` (`task_id`),
    KEY `idx_what_crawl_logs_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫日志表';

-- ============================================================================
-- 系统管理表
-- ============================================================================

-- 管理员表
CREATE TABLE IF NOT EXISTS `what_admins` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `role` VARCHAR(20) DEFAULT 'admin' COMMENT '角色: super_admin/admin/operator',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
    `last_login_at` DATETIME(3) DEFAULT NULL COMMENT '最后登录时间',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_what_admins_role` (`role`),
    KEY `idx_what_admins_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ============================================================================
-- 字典表
-- ============================================================================

-- 专业词典表
CREATE TABLE IF NOT EXISTS `what_major_dictionaries` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL COMMENT '专业代码',
    `name` VARCHAR(100) NOT NULL COMMENT '专业名称',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '学科门类',
    `parent_code` VARCHAR(20) DEFAULT NULL COMMENT '父级代码',
    `level` INT DEFAULT 1 COMMENT '层级: 1-门类, 2-类, 3-专业',
    `synonyms` JSON DEFAULT NULL COMMENT '同义词',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`),
    KEY `idx_what_major_dictionaries_category` (`category`),
    KEY `idx_what_major_dictionaries_parent_code` (`parent_code`),
    KEY `idx_what_major_dictionaries_level` (`level`),
    KEY `idx_what_major_dictionaries_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专业词典表';

-- 地区词典表
CREATE TABLE IF NOT EXISTS `what_region_dictionaries` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL COMMENT '地区代码',
    `name` VARCHAR(100) NOT NULL COMMENT '地区名称',
    `parent_code` VARCHAR(20) DEFAULT NULL COMMENT '父级代码',
    `level` INT DEFAULT 1 COMMENT '层级: 1-省, 2-市, 3-区县',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`),
    KEY `idx_what_region_dictionaries_parent_code` (`parent_code`),
    KEY `idx_what_region_dictionaries_level` (`level`),
    KEY `idx_what_region_dictionaries_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地区词典表';

-- ============================================================================
-- 全文索引 (需要 MySQL 5.7+ 并启用 ngram parser)
-- ============================================================================

-- 职位全文索引
ALTER TABLE `what_positions` ADD FULLTEXT INDEX `ft_position_name` (`position_name`) WITH PARSER ngram;
ALTER TABLE `what_positions` ADD FULLTEXT INDEX `ft_department_name` (`department_name`) WITH PARSER ngram;
ALTER TABLE `what_positions` ADD FULLTEXT INDEX `ft_position_search` (`position_name`, `department_name`) WITH PARSER ngram;

-- 公告全文索引
ALTER TABLE `what_announcements` ADD FULLTEXT INDEX `ft_announcement_title` (`title`) WITH PARSER ngram;
ALTER TABLE `what_announcements` ADD FULLTEXT INDEX `ft_announcement_content` (`content`) WITH PARSER ngram;
ALTER TABLE `what_announcements` ADD FULLTEXT INDEX `ft_announcement_search` (`title`, `content`) WITH PARSER ngram;

-- ============================================================================
-- 初始数据
-- ============================================================================

-- 插入默认管理员 (密码: admin123)
INSERT INTO `what_admins` (`username`, `password_hash`, `nickname`, `role`, `status`, `created_at`, `updated_at`) VALUES
('admin', '$2a$10$nn5yb5ws97Fy5NwVAC6aM.GpE5IOKHSw1W9fnObP8Lt3zEtMmqpvu', '超级管理员', 'super_admin', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- 插入示例地区数据
INSERT INTO `what_region_dictionaries` (`code`, `name`, `parent_code`, `level`, `created_at`, `updated_at`) VALUES
('110000', '北京市', NULL, 1, NOW(), NOW()),
('110100', '北京市', '110000', 2, NOW(), NOW()),
('110101', '东城区', '110100', 3, NOW(), NOW()),
('110102', '西城区', '110100', 3, NOW(), NOW()),
('310000', '上海市', NULL, 1, NOW(), NOW()),
('310100', '上海市', '310000', 2, NOW(), NOW()),
('310101', '黄浦区', '310100', 3, NOW(), NOW()),
('440000', '广东省', NULL, 1, NOW(), NOW()),
('440100', '广州市', '440000', 2, NOW(), NOW()),
('440300', '深圳市', '440000', 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updated_at` = NOW();

-- 插入示例专业数据
INSERT INTO `what_major_dictionaries` (`code`, `name`, `category`, `parent_code`, `level`, `created_at`, `updated_at`) VALUES
('01', '哲学', '哲学', NULL, 1, NOW(), NOW()),
('02', '经济学', '经济学', NULL, 1, NOW(), NOW()),
('03', '法学', '法学', NULL, 1, NOW(), NOW()),
('04', '教育学', '教育学', NULL, 1, NOW(), NOW()),
('05', '文学', '文学', NULL, 1, NOW(), NOW()),
('06', '历史学', '历史学', NULL, 1, NOW(), NOW()),
('07', '理学', '理学', NULL, 1, NOW(), NOW()),
('08', '工学', '工学', NULL, 1, NOW(), NOW()),
('0809', '计算机类', '工学', '08', 2, NOW(), NOW()),
('080901', '计算机科学与技术', '工学', '0809', 3, NOW(), NOW()),
('080902', '软件工程', '工学', '0809', 3, NOW(), NOW()),
('080903', '网络工程', '工学', '0809', 3, NOW(), NOW()),
('12', '管理学', '管理学', NULL, 1, NOW(), NOW()),
('1202', '工商管理类', '管理学', '12', 2, NOW(), NOW()),
('120201', '工商管理', '管理学', '1202', 3, NOW(), NOW()),
('120202', '市场营销', '管理学', '1202', 3, NOW(), NOW()),
('120203', '会计学', '管理学', '1202', 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updated_at` = NOW();

-- ============================================================================
-- LLM 配置表
-- ============================================================================

-- LLM 服务商配置表
CREATE TABLE IF NOT EXISTS `what_llm_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT '配置名称',
    `provider` VARCHAR(50) NOT NULL COMMENT '服务商: openai/azure/anthropic/deepseek/ollama/custom',
    `model` VARCHAR(100) NOT NULL COMMENT '模型名称',
    `api_url` VARCHAR(500) NOT NULL COMMENT 'API 接口地址',
    `api_key_encrypted` TEXT NOT NULL COMMENT '加密存储的 API Key',
    `organization_id` VARCHAR(100) DEFAULT NULL COMMENT '组织ID（部分服务商需要）',
    `max_tokens` INT DEFAULT 4096 COMMENT '最大token数',
    `temperature` DECIMAL(3,2) DEFAULT 0.70 COMMENT '温度参数 0-2',
    `timeout` INT DEFAULT 60 COMMENT '请求超时时间（秒）',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认配置',
    `is_enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `extra_params` JSON DEFAULT NULL COMMENT '额外参数（JSON格式）',
    `description` TEXT DEFAULT NULL COMMENT '配置描述',
    `last_test_at` DATETIME DEFAULT NULL COMMENT '最后测试时间',
    `last_test_status` TINYINT DEFAULT NULL COMMENT '最后测试状态: 1-成功 0-失败',
    `last_test_message` TEXT DEFAULT NULL COMMENT '最后测试消息',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_llm_config_name` (`name`),
    KEY `idx_llm_configs_provider` (`provider`),
    KEY `idx_llm_configs_is_default` (`is_default`),
    KEY `idx_llm_configs_is_enabled` (`is_enabled`),
    KEY `idx_llm_configs_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='LLM服务商配置表';

-- ============================================================================
-- 粉笔爬虫相关表
-- ============================================================================

-- 粉笔登录凭证表
CREATE TABLE IF NOT EXISTS `what_fenbi_credentials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `password_encrypted` TEXT NOT NULL COMMENT '加密存储的密码',
    `cookies` TEXT DEFAULT NULL COMMENT '登录后的Cookie',
    `cookie_expires_at` DATETIME DEFAULT NULL COMMENT 'Cookie过期时间',
    `login_status` TINYINT DEFAULT 0 COMMENT '登录状态: 0-未登录 1-已登录 2-已过期',
    `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `last_check_at` DATETIME DEFAULT NULL COMMENT '最后检查时间',
    `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认账号',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_fenbi_phone` (`phone`),
    KEY `idx_fenbi_credentials_login_status` (`login_status`),
    KEY `idx_fenbi_credentials_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='粉笔登录凭证表';

-- 粉笔筛选类别表
CREATE TABLE IF NOT EXISTS `what_fenbi_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_type` VARCHAR(20) NOT NULL COMMENT '类型: region/exam_type/year',
    `code` VARCHAR(50) NOT NULL COMMENT '代码',
    `name` VARCHAR(100) NOT NULL COMMENT '名称',
    `fenbi_param_id` VARCHAR(20) DEFAULT NULL COMMENT '粉笔网站URL参数使用的ID',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `is_enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_fenbi_type_code` (`category_type`, `code`),
    KEY `idx_fenbi_categories_type` (`category_type`),
    KEY `idx_fenbi_categories_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='粉笔筛选类别表';

-- 粉笔公告表
CREATE TABLE IF NOT EXISTS `what_fenbi_announcements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `fenbi_id` VARCHAR(50) NOT NULL COMMENT '粉笔公告ID',
    `title` VARCHAR(500) NOT NULL COMMENT '公告标题',
    `fenbi_url` VARCHAR(500) NOT NULL COMMENT '粉笔页面URL',
    `original_url` VARCHAR(500) DEFAULT NULL COMMENT '原文网址(短链接)',
    `final_url` VARCHAR(1000) DEFAULT NULL COMMENT '最终跳转URL(解析短链接后的真实URL)',
    `region_code` VARCHAR(50) DEFAULT NULL COMMENT '地区代码',
    `region_name` VARCHAR(100) DEFAULT NULL COMMENT '地区名称',
    `exam_type_code` VARCHAR(50) DEFAULT NULL COMMENT '考试类型代码',
    `exam_type_name` VARCHAR(100) DEFAULT NULL COMMENT '考试类型名称',
    `year` INT DEFAULT NULL COMMENT '年份',
    `publish_date` DATE DEFAULT NULL COMMENT '发布日期',
    `crawl_status` TINYINT DEFAULT 0 COMMENT '爬取状态: 0-待爬取 1-已爬取列表 2-已爬取详情',
    `sync_to_announcement` TINYINT(1) DEFAULT 0 COMMENT '是否同步到公告表',
    `announcement_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联的公告ID',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_fenbi_id` (`fenbi_id`),
    KEY `idx_fenbi_announcements_region` (`region_code`),
    KEY `idx_fenbi_announcements_exam_type` (`exam_type_code`),
    KEY `idx_fenbi_announcements_year` (`year`),
    KEY `idx_fenbi_announcements_crawl_status` (`crawl_status`),
    KEY `idx_fenbi_announcements_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='粉笔公告表';

-- ============================================================================
-- 微信公众号RSS相关表
-- ============================================================================

-- 微信公众号RSS源表
CREATE TABLE IF NOT EXISTS `what_wechat_rss_sources` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL COMMENT '公众号名称',
    `wechat_id` VARCHAR(100) DEFAULT NULL COMMENT '公众号ID',
    `rss_url` VARCHAR(500) NOT NULL COMMENT 'RSS订阅地址',
    `source_type` VARCHAR(20) DEFAULT 'custom' COMMENT '来源类型: rsshub/werss/feeddd/custom',
    `crawl_frequency` INT DEFAULT 60 COMMENT '抓取频率(分钟)',
    `last_crawl_at` DATETIME(3) DEFAULT NULL COMMENT '最后抓取时间',
    `next_crawl_at` DATETIME(3) DEFAULT NULL COMMENT '下次抓取时间',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态: active/paused/error',
    `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
    `error_count` INT DEFAULT 0 COMMENT '连续错误次数',
    `article_count` INT DEFAULT 0 COMMENT '文章数量',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `icon_url` VARCHAR(500) DEFAULT NULL COMMENT '图标URL',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_wechat_rss_url` (`rss_url`),
    KEY `idx_wechat_rss_sources_wechat_id` (`wechat_id`),
    KEY `idx_wechat_rss_sources_type` (`source_type`),
    KEY `idx_wechat_rss_sources_status` (`status`),
    KEY `idx_wechat_rss_sources_next_crawl` (`next_crawl_at`),
    KEY `idx_wechat_rss_sources_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='微信公众号RSS源表';

-- 微信公众号RSS文章表
CREATE TABLE IF NOT EXISTS `what_wechat_rss_articles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `source_id` BIGINT UNSIGNED NOT NULL COMMENT '关联RSS源ID',
    `guid` VARCHAR(500) NOT NULL COMMENT '文章唯一标识',
    `title` VARCHAR(500) NOT NULL COMMENT '文章标题',
    `link` VARCHAR(1000) NOT NULL COMMENT '文章链接',
    `description` TEXT DEFAULT NULL COMMENT '文章摘要',
    `content` LONGTEXT DEFAULT NULL COMMENT '文章内容',
    `author` VARCHAR(255) DEFAULT NULL COMMENT '作者',
    `image_url` VARCHAR(1000) DEFAULT NULL COMMENT '封面图URL',
    `pub_date` DATETIME(3) DEFAULT NULL COMMENT '发布时间',
    `read_status` VARCHAR(20) DEFAULT 'unread' COMMENT '阅读状态: unread/read/starred',
    `read_at` DATETIME(3) DEFAULT NULL COMMENT '阅读时间',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    `deleted_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_wechat_rss_article_guid` (`guid`),
    KEY `idx_wechat_rss_articles_source` (`source_id`),
    KEY `idx_wechat_rss_articles_pub_date` (`pub_date`),
    KEY `idx_wechat_rss_articles_read_status` (`read_status`),
    KEY `idx_wechat_rss_articles_deleted_at` (`deleted_at`),
    CONSTRAINT `fk_wechat_rss_articles_source` FOREIGN KEY (`source_id`) REFERENCES `what_wechat_rss_sources` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='微信公众号RSS文章表';

-- 插入粉笔筛选类别初始数据 - 地区（包含粉笔网站URL参数ID）
INSERT INTO `what_fenbi_categories` (`category_type`, `code`, `name`, `fenbi_param_id`, `sort_order`, `is_enabled`, `created_at`, `updated_at`) VALUES
('region', 'all', '全部', NULL, 0, 1, NOW(), NOW()),
('region', 'national', '国家级机构', '4012', 1, 1, NOW(), NOW()),
('region', 'anhui', '安徽', '1', 2, 1, NOW(), NOW()),
('region', 'beijing', '北京', '159', 3, 1, NOW(), NOW()),
('region', 'chongqing', '重庆', '180', 4, 1, NOW(), NOW()),
('region', 'fujian', '福建', '223', 5, 1, NOW(), NOW()),
('region', 'guangdong', '广东', '336', 6, 1, NOW(), NOW()),
('region', 'gansu', '甘肃', '557', 7, 1, NOW(), NOW()),
('region', 'guangxi', '广西', '683', 8, 1, NOW(), NOW()),
('region', 'guizhou', '贵州', '836', 9, 1, NOW(), NOW()),
('region', 'hebei', '河北', '947', 10, 1, NOW(), NOW()),
('region', 'hubei', '湖北', '1157', 11, 1, NOW(), NOW()),
('region', 'heilongjiang', '黑龙江', '1307', 12, 1, NOW(), NOW()),
('region', 'henan', '河南', '1480', 13, 1, NOW(), NOW()),
('region', 'hainan', '海南', '1694', 14, 1, NOW(), NOW()),
('region', 'hunan', '湖南', '1723', 15, 1, NOW(), NOW()),
('region', 'jilin', '吉林', '1887', 16, 1, NOW(), NOW()),
('region', 'jiangsu', '江苏', '1978', 17, 1, NOW(), NOW()),
('region', 'jiangxi', '江西', '2130', 18, 1, NOW(), NOW()),
('region', 'liaoning', '辽宁', '2267', 19, 1, NOW(), NOW()),
('region', 'neimenggu', '内蒙古', '2416', 20, 1, NOW(), NOW()),
('region', 'ningxia', '宁夏', '2551', 21, 1, NOW(), NOW()),
('region', 'qinghai', '青海', '2589', 22, 1, NOW(), NOW()),
('region', 'sichuan', '四川', '2650', 23, 1, NOW(), NOW()),
('region', 'shandong', '山东', '2894', 24, 1, NOW(), NOW()),
('region', 'shanghai', '上海', '3091', 25, 1, NOW(), NOW()),
('region', 'shanxi', '山西', '3114', 26, 1, NOW(), NOW()),
('region', 'shaanxi', '陕西', '3268', 27, 1, NOW(), NOW()),
('region', 'tianjin', '天津', '3406', 28, 1, NOW(), NOW()),
('region', 'xinjiang', '新疆', '3428', 29, 1, NOW(), NOW()),
('region', 'xizang', '西藏', '3559', 30, 1, NOW(), NOW()),
('region', 'yunnan', '云南', '3648', 31, 1, NOW(), NOW()),
('region', 'zhejiang', '浙江', '3818', 32, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `fenbi_param_id` = VALUES(`fenbi_param_id`), `updated_at` = NOW();

-- 插入粉笔筛选类别初始数据 - 考试类型（包含粉笔网站URL参数ID）
INSERT INTO `what_fenbi_categories` (`category_type`, `code`, `name`, `fenbi_param_id`, `sort_order`, `is_enabled`, `created_at`, `updated_at`) VALUES
('exam_type', 'shengkao', '省考', '1', 1, 1, NOW(), NOW()),
('exam_type', 'guokao', '国考', '2', 2, 1, NOW(), NOW()),
('exam_type', 'junduiwenzhi', '军队文职', '3', 3, 1, NOW(), NOW()),
('exam_type', 'xuandiao', '选调', '4', 4, 1, NOW(), NOW()),
('exam_type', 'shiyedanwei', '事业单位', '5', 5, 1, NOW(), NOW()),
('exam_type', 'daxueshengcunguan', '大学生村官', '6', 6, 1, NOW(), NOW()),
('exam_type', 'sanzhiyifu', '三支一扶', '7', 7, 1, NOW(), NOW()),
('exam_type', 'lianxuan', '遴选', '8', 8, 1, NOW(), NOW()),
('exam_type', 'zhaojing', '招警', '9', 9, 1, NOW(), NOW()),
('exam_type', 'guoqi', '国企', '10', 10, 1, NOW(), NOW()),
('exam_type', 'jiaoshi', '教师', '11', 11, 1, NOW(), NOW()),
('exam_type', 'yiliao', '医疗', '12', 12, 1, NOW(), NOW()),
('exam_type', 'yinhang', '银行', '13', 13, 1, NOW(), NOW()),
('exam_type', 'qita', '其他', '14', 14, 1, NOW(), NOW()),
('exam_type', 'nongxinshe', '农信社', '15', 15, 1, NOW(), NOW()),
('exam_type', 'paiqian', '派遣/临时/购买服务等', '16', 16, 1, NOW(), NOW()),
('exam_type', 'liankao', '联考/统考', '17', 17, 1, NOW(), NOW()),
('exam_type', 'shequ', '社区工作者', '18', 18, 1, NOW(), NOW()),
('exam_type', 'gaoxiao', '高校', '19', 19, 1, NOW(), NOW()),
('exam_type', 'gongwuyuandanzhao', '公务员单招', '20', 20, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `fenbi_param_id` = VALUES(`fenbi_param_id`), `updated_at` = NOW();

-- 插入粉笔筛选类别初始数据 - 年份
INSERT INTO `what_fenbi_categories` (`category_type`, `code`, `name`, `sort_order`, `is_enabled`, `created_at`, `updated_at`) VALUES
('year', '2026', '2026', 1, 1, NOW(), NOW()),
('year', '2025', '2025', 2, 1, NOW(), NOW()),
('year', '2024', '2024', 3, 1, NOW(), NOW()),
('year', '2023', '2023', 4, 1, NOW(), NOW()),
('year', '2022', '2022', 5, 1, NOW(), NOW()),
('year', '2021', '2021', 6, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updated_at` = NOW();

-- ============================================================================
-- 完成
-- ============================================================================
SELECT 'Database schema created successfully!' AS status;
