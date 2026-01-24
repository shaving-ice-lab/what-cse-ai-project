-- ============================================================================
-- 公考职位智能筛选系统 - 数据库建表脚本 (含Mock数据)
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
DROP TABLE IF EXISTS `what_user_notifications`;
DROP TABLE IF EXISTS `what_user_views`;
DROP TABLE IF EXISTS `what_user_favorites`;
DROP TABLE IF EXISTS `what_user_preferences`;
DROP TABLE IF EXISTS `what_user_certificates`;
DROP TABLE IF EXISTS `what_user_profiles`;
DROP TABLE IF EXISTS `what_users`;
DROP TABLE IF EXISTS `what_position_announcements`;
DROP TABLE IF EXISTS `what_positions`;
DROP TABLE IF EXISTS `what_announcements`;
DROP TABLE IF EXISTS `what_list_pages`;
DROP TABLE IF EXISTS `what_crawl_logs`;
DROP TABLE IF EXISTS `what_crawl_tasks`;
DROP TABLE IF EXISTS `what_admins`;
DROP TABLE IF EXISTS `what_major_dictionaries`;
DROP TABLE IF EXISTS `what_region_dictionaries`;

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
-- 初始数据 + Mock数据
-- ============================================================================

-- 插入默认管理员 (密码: admin123)
INSERT INTO `what_admins` (`username`, `password_hash`, `nickname`, `role`, `status`, `created_at`, `updated_at`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuLmGsAkMtWNsrG1QH/4f3EzSAE8I9Ck.', '超级管理员', 'super_admin', 1, NOW(), NOW()),
('operator1', '$2a$10$N.zmdr9k7uOCQb376NoUnuLmGsAkMtWNsrG1QH/4f3EzSAE8I9Ck.', '运营小王', 'operator', 1, NOW(), NOW()),
('editor1', '$2a$10$N.zmdr9k7uOCQb376NoUnuLmGsAkMtWNsrG1QH/4f3EzSAE8I9Ck.', '编辑小李', 'admin', 1, NOW(), NOW());

-- 插入地区数据
INSERT INTO `what_region_dictionaries` (`code`, `name`, `parent_code`, `level`, `created_at`, `updated_at`) VALUES
-- 北京
('110000', '北京市', NULL, 1, NOW(), NOW()),
('110100', '北京市', '110000', 2, NOW(), NOW()),
('110101', '东城区', '110100', 3, NOW(), NOW()),
('110102', '西城区', '110100', 3, NOW(), NOW()),
('110105', '朝阳区', '110100', 3, NOW(), NOW()),
('110106', '丰台区', '110100', 3, NOW(), NOW()),
('110108', '海淀区', '110100', 3, NOW(), NOW()),
-- 上海
('310000', '上海市', NULL, 1, NOW(), NOW()),
('310100', '上海市', '310000', 2, NOW(), NOW()),
('310101', '黄浦区', '310100', 3, NOW(), NOW()),
('310104', '徐汇区', '310100', 3, NOW(), NOW()),
('310105', '长宁区', '310100', 3, NOW(), NOW()),
('310115', '浦东新区', '310100', 3, NOW(), NOW()),
-- 广东
('440000', '广东省', NULL, 1, NOW(), NOW()),
('440100', '广州市', '440000', 2, NOW(), NOW()),
('440103', '荔湾区', '440100', 3, NOW(), NOW()),
('440104', '越秀区', '440100', 3, NOW(), NOW()),
('440106', '天河区', '440100', 3, NOW(), NOW()),
('440300', '深圳市', '440000', 2, NOW(), NOW()),
('440303', '罗湖区', '440300', 3, NOW(), NOW()),
('440304', '福田区', '440300', 3, NOW(), NOW()),
('440305', '南山区', '440300', 3, NOW(), NOW()),
-- 浙江
('330000', '浙江省', NULL, 1, NOW(), NOW()),
('330100', '杭州市', '330000', 2, NOW(), NOW()),
('330102', '上城区', '330100', 3, NOW(), NOW()),
('330105', '拱墅区', '330100', 3, NOW(), NOW()),
('330106', '西湖区', '330100', 3, NOW(), NOW()),
-- 江苏
('320000', '江苏省', NULL, 1, NOW(), NOW()),
('320100', '南京市', '320000', 2, NOW(), NOW()),
('320102', '玄武区', '320100', 3, NOW(), NOW()),
('320104', '秦淮区', '320100', 3, NOW(), NOW()),
('320500', '苏州市', '320000', 2, NOW(), NOW()),
('320505', '虎丘区', '320500', 3, NOW(), NOW()),
('320506', '吴中区', '320500', 3, NOW(), NOW()),
-- 四川
('510000', '四川省', NULL, 1, NOW(), NOW()),
('510100', '成都市', '510000', 2, NOW(), NOW()),
('510104', '锦江区', '510100', 3, NOW(), NOW()),
('510105', '青羊区', '510100', 3, NOW(), NOW()),
('510107', '武侯区', '510100', 3, NOW(), NOW());

-- 插入专业数据
INSERT INTO `what_major_dictionaries` (`code`, `name`, `category`, `parent_code`, `level`, `created_at`, `updated_at`) VALUES
-- 哲学
('01', '哲学', '哲学', NULL, 1, NOW(), NOW()),
('0101', '哲学类', '哲学', '01', 2, NOW(), NOW()),
('010101', '哲学', '哲学', '0101', 3, NOW(), NOW()),
('010102', '逻辑学', '哲学', '0101', 3, NOW(), NOW()),
-- 经济学
('02', '经济学', '经济学', NULL, 1, NOW(), NOW()),
('0201', '经济学类', '经济学', '02', 2, NOW(), NOW()),
('020101', '经济学', '经济学', '0201', 3, NOW(), NOW()),
('020102', '经济统计学', '经济学', '0201', 3, NOW(), NOW()),
('0202', '财政学类', '经济学', '02', 2, NOW(), NOW()),
('020201', '财政学', '经济学', '0202', 3, NOW(), NOW()),
('020202', '税收学', '经济学', '0202', 3, NOW(), NOW()),
-- 法学
('03', '法学', '法学', NULL, 1, NOW(), NOW()),
('0301', '法学类', '法学', '03', 2, NOW(), NOW()),
('030101', '法学', '法学', '0301', 3, NOW(), NOW()),
('0302', '政治学类', '法学', '03', 2, NOW(), NOW()),
('030201', '政治学与行政学', '法学', '0302', 3, NOW(), NOW()),
-- 文学
('05', '文学', '文学', NULL, 1, NOW(), NOW()),
('0501', '中国语言文学类', '文学', '05', 2, NOW(), NOW()),
('050101', '汉语言文学', '文学', '0501', 3, NOW(), NOW()),
('050102', '汉语言', '文学', '0501', 3, NOW(), NOW()),
('0502', '外国语言文学类', '文学', '05', 2, NOW(), NOW()),
('050201', '英语', '文学', '0502', 3, NOW(), NOW()),
('050202', '俄语', '文学', '0502', 3, NOW(), NOW()),
-- 工学
('08', '工学', '工学', NULL, 1, NOW(), NOW()),
('0809', '计算机类', '工学', '08', 2, NOW(), NOW()),
('080901', '计算机科学与技术', '工学', '0809', 3, NOW(), NOW()),
('080902', '软件工程', '工学', '0809', 3, NOW(), NOW()),
('080903', '网络工程', '工学', '0809', 3, NOW(), NOW()),
('080904', '信息安全', '工学', '0809', 3, NOW(), NOW()),
('080905', '物联网工程', '工学', '0809', 3, NOW(), NOW()),
('0810', '土木类', '工学', '08', 2, NOW(), NOW()),
('081001', '土木工程', '工学', '0810', 3, NOW(), NOW()),
('081002', '建筑环境与能源应用工程', '工学', '0810', 3, NOW(), NOW()),
-- 管理学
('12', '管理学', '管理学', NULL, 1, NOW(), NOW()),
('1201', '管理科学与工程类', '管理学', '12', 2, NOW(), NOW()),
('120102', '信息管理与信息系统', '管理学', '1201', 3, NOW(), NOW()),
('1202', '工商管理类', '管理学', '12', 2, NOW(), NOW()),
('120201', '工商管理', '管理学', '1202', 3, NOW(), NOW()),
('120202', '市场营销', '管理学', '1202', 3, NOW(), NOW()),
('120203', '会计学', '管理学', '1202', 3, NOW(), NOW()),
('120204', '财务管理', '管理学', '1202', 3, NOW(), NOW()),
('1204', '公共管理类', '管理学', '12', 2, NOW(), NOW()),
('120401', '公共事业管理', '管理学', '1204', 3, NOW(), NOW()),
('120402', '行政管理', '管理学', '1204', 3, NOW(), NOW());

-- 插入Mock用户数据 (密码都是: password123)
INSERT INTO `what_users` (`phone`, `email`, `password_hash`, `nickname`, `avatar`, `status`, `created_at`, `updated_at`) VALUES
('13800138001', 'zhangsan@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuLmGsAkMtWNsrG1QH/4f3EzSAE8I9Ck.', '张三', NULL, 1, NOW(), NOW()),
('13800138002', 'lisi@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuLmGsAkMtWNsrG1QH/4f3EzSAE8I9Ck.', '李四', NULL, 1, NOW(), NOW()),
('13800138003', 'wangwu@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuLmGsAkMtWNsrG1QH/4f3EzSAE8I9Ck.', '王五', NULL, 1, NOW(), NOW()),
('13800138004', 'zhaoliu@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuLmGsAkMtWNsrG1QH/4f3EzSAE8I9Ck.', '赵六', NULL, 1, NOW(), NOW()),
('13800138005', 'sunqi@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuLmGsAkMtWNsrG1QH/4f3EzSAE8I9Ck.', '孙七', NULL, 1, NOW(), NOW());

-- 插入Mock用户档案数据
INSERT INTO `what_user_profiles` (`user_id`, `gender`, `birth_date`, `hukou_province`, `hukou_city`, `political_status`, `education`, `major`, `school`, `graduation_date`, `is_fresh_graduate`, `work_years`, `grassroots_exp_years`, `created_at`, `updated_at`) VALUES
(1, '男', '1998-05-15', '北京市', '北京市', '中共党员', '本科', '计算机科学与技术', '北京大学', '2020-06-30', 0, 4, 0, NOW(), NOW()),
(2, '女', '1999-08-22', '上海市', '上海市', '共青团员', '硕士', '法学', '复旦大学', '2024-06-30', 1, 0, 0, NOW(), NOW()),
(3, '男', '1996-03-10', '广东省', '广州市', '中共党员', '本科', '行政管理', '中山大学', '2018-06-30', 0, 6, 2, NOW(), NOW()),
(4, '女', '2000-11-28', '浙江省', '杭州市', '群众', '本科', '汉语言文学', '浙江大学', '2023-06-30', 1, 0, 0, NOW(), NOW()),
(5, '男', '1997-07-05', '江苏省', '南京市', '中共党员', '硕士', '会计学', '南京大学', '2022-06-30', 0, 2, 0, NOW(), NOW());

-- 插入Mock公告数据
INSERT INTO `what_announcements` (`title`, `source_url`, `source_name`, `publish_date`, `content`, `announcement_type`, `exam_type`, `province`, `city`, `status`, `created_at`, `updated_at`) VALUES
('中央机关及其直属机构2026年度考试录用公务员公告', 'https://www.scs.gov.cn/ks/202510/12345.html', '国家公务员局', '2025-10-15', '根据公务员法和公务员录用规定等法律法规，国家公务员局将组织实施中央机关及其直属机构2026年度考试录用一级主任科员及以下和其他相当职级层次公务员工作...', '招录公告', '国考', NULL, NULL, 1, NOW(), NOW()),
('2026年度国家公务员考试报名统计（10月25日）', 'https://www.scs.gov.cn/ks/202510/12346.html', '国家公务员局', '2025-10-25', '截至2025年10月25日18:00，共有156万人报名，已通过资格审查人数为145万人，竞争最激烈岗位为国家统计局某职位，竞争比达3521:1...', '报名统计', '国考', NULL, NULL, 1, NOW(), NOW()),
('广东省2026年考试录用公务员公告', 'https://www.gdhrss.gov.cn/ks/202512/67890.html', '广东省人力资源和社会保障厅', '2025-12-10', '为满足全省各级机关补充公务员的需要，根据公务员法和公务员录用规定等法律法规，广东省公务员局将组织实施2026年全省各级机关考试录用公务员工作...', '招录公告', '省考', '广东省', NULL, 1, NOW(), NOW()),
('浙江省2026年考试录用公务员公告', 'https://www.zjhrss.gov.cn/ks/202512/11111.html', '浙江省人力资源和社会保障厅', '2025-12-08', '根据《中华人民共和国公务员法》等法律法规，浙江省公务员局将组织实施2026年全省各级机关和参照公务员法管理单位考试录用公务员工作...', '招录公告', '省考', '浙江省', NULL, 1, NOW(), NOW()),
('2026年上海市事业单位公开招聘工作人员公告', 'https://www.shhrss.gov.cn/ks/202601/22222.html', '上海市人力资源和社会保障局', '2026-01-05', '为进一步优化事业单位人才队伍结构，根据《事业单位人事管理条例》等有关规定，上海市将面向社会公开招聘事业单位工作人员...', '招录公告', '事业单位', '上海市', '上海市', 1, NOW(), NOW()),
('北京市2026年选调应届优秀大学毕业生公告', 'https://www.bjhrss.gov.cn/ks/202512/33333.html', '北京市委组织部', '2025-12-15', '为加强党政机关后备干部队伍建设，选拔优秀年轻干部人才，根据有关规定，北京市将选调2026年应届优秀大学毕业生到北京市各级党政机关工作...', '招录公告', '选调生', '北京市', '北京市', 1, NOW(), NOW());

-- 插入Mock职位数据
INSERT INTO `what_positions` (`position_id`, `position_name`, `department_code`, `department_name`, `department_level`, `work_location_province`, `work_location_city`, `work_location_district`, `recruit_count`, `exam_type`, `education_min`, `education_max`, `degree_required`, `major_category`, `major_specific`, `major_unlimited`, `political_status`, `work_exp_years_min`, `age_min`, `age_max`, `gender_required`, `hukou_required`, `registration_start`, `registration_end`, `exam_date_written`, `applicant_count`, `competition_ratio`, `parse_confidence`, `status`, `created_at`, `updated_at`) VALUES
-- 国考职位
('GK2026001001', '一级主任科员及以下', 'A001', '国家发展和改革委员会', '中央', '北京市', '北京市', '西城区', 2, '国考', '本科', '硕士', '是', '["经济学", "管理学"]', '["经济学", "财政学", "金融学", "会计学"]', 0, '中共党员', 2, 18, 35, '不限', 0, '2025-10-15 00:00:00', '2025-10-24 18:00:00', '2025-12-01', 1256, 628.00, 100, 1, NOW(), NOW()),
('GK2026001002', '一级主任科员及以下', 'A002', '财政部预算司', '中央', '北京市', '北京市', '西城区', 1, '国考', '硕士', NULL, '是', '["经济学"]', '["财政学", "税收学"]', 0, '中共党员', 0, 18, 35, '不限', 0, '2025-10-15 00:00:00', '2025-10-24 18:00:00', '2025-12-01', 2345, 2345.00, 100, 1, NOW(), NOW()),
('GK2026001003', '一级主任科员及以下', 'A003', '国家统计局综合司', '中央', '北京市', '北京市', '西城区', 1, '国考', '本科', NULL, '是', '["理学", "工学"]', '["统计学", "数学与应用数学", "数据科学与大数据技术"]', 0, '不限', 0, 18, 35, '不限', 0, '2025-10-15 00:00:00', '2025-10-24 18:00:00', '2025-12-01', 3521, 3521.00, 100, 1, NOW(), NOW()),
('GK2026001004', '网络安全工程师', 'A004', '工业和信息化部网络安全管理局', '中央', '北京市', '北京市', '海淀区', 2, '国考', '硕士', NULL, '是', '["工学"]', '["信息安全", "网络工程", "计算机科学与技术"]', 0, '中共党员', 0, 18, 35, '不限', 0, '2025-10-15 00:00:00', '2025-10-24 18:00:00', '2025-12-01', 856, 428.00, 100, 1, NOW(), NOW()),
('GK2026001005', '法律事务', 'A005', '司法部法制研究中心', '中央', '北京市', '北京市', '朝阳区', 3, '国考', '硕士', '博士', '是', '["法学"]', '["法学", "宪法学与行政法学"]', 0, '中共党员', 0, 18, 35, '不限', 0, '2025-10-15 00:00:00', '2025-10-24 18:00:00', '2025-12-01', 1532, 510.67, 100, 1, NOW(), NOW()),

-- 广东省考职位
('GD2026001001', '科员', 'B001', '广东省财政厅', '省级', '广东省', '广州市', '天河区', 2, '省考', '本科', NULL, '不限', '["经济学", "管理学"]', '["财政学", "会计学", "财务管理"]', 0, '不限', 0, 18, 35, '不限', 0, '2025-12-15 00:00:00', '2025-12-25 18:00:00', '2026-01-15', 568, 284.00, 100, 1, NOW(), NOW()),
('GD2026001002', '科员', 'B002', '深圳市南山区发展和改革局', '县级', '广东省', '深圳市', '南山区', 1, '省考', '本科', NULL, '是', '["经济学"]', '["经济学", "国际经济与贸易"]', 0, '不限', 0, 18, 35, '不限', 0, '2025-12-15 00:00:00', '2025-12-25 18:00:00', '2026-01-15', 423, 423.00, 100, 1, NOW(), NOW()),
('GD2026001003', '综合文秘', 'B003', '广州市越秀区人民政府办公室', '县级', '广东省', '广州市', '越秀区', 2, '省考', '本科', NULL, '不限', '["文学", "管理学"]', '["汉语言文学", "秘书学", "行政管理"]', 0, '中共党员', 0, 18, 35, '不限', 0, '2025-12-15 00:00:00', '2025-12-25 18:00:00', '2026-01-15', 789, 394.50, 100, 1, NOW(), NOW()),

-- 浙江省考职位
('ZJ2026001001', '科员', 'C001', '浙江省发展和改革委员会', '省级', '浙江省', '杭州市', '西湖区', 1, '省考', '硕士', NULL, '是', '["经济学"]', '["经济学", "产业经济学"]', 0, '中共党员', 0, 18, 35, '不限', 0, '2025-12-10 00:00:00', '2025-12-20 18:00:00', '2026-01-12', 612, 612.00, 100, 1, NOW(), NOW()),
('ZJ2026001002', '基层科员', 'C002', '杭州市上城区市场监督管理局', '县级', '浙江省', '杭州市', '上城区', 3, '省考', '本科', NULL, '不限', NULL, NULL, 1, '不限', 0, 18, 35, '不限', 0, '2025-12-10 00:00:00', '2025-12-20 18:00:00', '2026-01-12', 234, 78.00, 100, 1, NOW(), NOW()),

-- 事业单位职位
('SY2026001001', '研究人员', 'D001', '上海市教育科学研究院', '省级', '上海市', '上海市', '浦东新区', 2, '事业单位', '博士', NULL, '是', '["教育学"]', '["教育学原理", "课程与教学论"]', 0, '不限', 0, 18, 40, '不限', 0, '2026-01-10 00:00:00', '2026-01-25 18:00:00', '2026-02-20', 86, 43.00, 100, 1, NOW(), NOW()),
('SY2026001002', '软件开发工程师', 'D002', '上海市大数据中心', '省级', '上海市', '上海市', '黄浦区', 5, '事业单位', '本科', NULL, '是', '["工学"]', '["软件工程", "计算机科学与技术"]', 0, '不限', 2, 18, 40, '不限', 0, '2026-01-10 00:00:00', '2026-01-25 18:00:00', '2026-02-20', 356, 71.20, 100, 1, NOW(), NOW()),

-- 选调生职位
('XD2026001001', '选调生', 'E001', '北京市朝阳区', '县级', '北京市', '北京市', '朝阳区', 10, '选调生', '本科', NULL, '是', NULL, NULL, 1, '中共党员', 0, 18, 30, '不限', 0, '2025-12-20 00:00:00', '2026-01-05 18:00:00', '2026-01-20', 1256, 125.60, 100, 1, NOW(), NOW()),
('XD2026001002', '选调生', 'E002', '北京市海淀区', '县级', '北京市', '北京市', '海淀区', 8, '选调生', '硕士', NULL, '是', NULL, NULL, 1, '中共党员', 0, 18, 30, '不限', 0, '2025-12-20 00:00:00', '2026-01-05 18:00:00', '2026-01-20', 986, 123.25, 100, 1, NOW(), NOW()),

-- 待审核职位
('GK2026002001', '一级科员', 'F001', '外交部新闻司', '中央', '北京市', '北京市', '朝阳区', 2, '国考', '硕士', NULL, '是', '["文学"]', '["英语", "国际新闻"]', 0, '中共党员', 0, 18, 35, '不限', 0, '2025-10-15 00:00:00', '2025-10-24 18:00:00', '2025-12-01', 0, 0, 85, 0, NOW(), NOW());

-- 插入职位公告关联
INSERT INTO `what_position_announcements` (`position_id`, `announcement_id`, `stage`, `created_at`) VALUES
('GK2026001001', 1, '招录', NOW()),
('GK2026001002', 1, '招录', NOW()),
('GK2026001003', 1, '招录', NOW()),
('GK2026001004', 1, '招录', NOW()),
('GK2026001005', 1, '招录', NOW()),
('GD2026001001', 3, '招录', NOW()),
('GD2026001002', 3, '招录', NOW()),
('GD2026001003', 3, '招录', NOW()),
('ZJ2026001001', 4, '招录', NOW()),
('ZJ2026001002', 4, '招录', NOW()),
('SY2026001001', 5, '招录', NOW()),
('SY2026001002', 5, '招录', NOW()),
('XD2026001001', 6, '招录', NOW()),
('XD2026001002', 6, '招录', NOW());

-- 插入Mock用户收藏数据
INSERT INTO `what_user_favorites` (`user_id`, `position_id`, `created_at`) VALUES
(1, 'GK2026001004', NOW()),
(1, 'SY2026001002', NOW()),
(2, 'GK2026001005', NOW()),
(2, 'ZJ2026001001', NOW()),
(3, 'GD2026001001', NOW()),
(3, 'GD2026001003', NOW()),
(4, 'XD2026001001', NOW()),
(5, 'GK2026001002', NOW());

-- 插入Mock用户浏览记录
INSERT INTO `what_user_views` (`user_id`, `position_id`, `view_count`, `view_time`, `created_at`, `updated_at`) VALUES
(1, 'GK2026001001', 3, NOW(), NOW(), NOW()),
(1, 'GK2026001004', 5, NOW(), NOW(), NOW()),
(1, 'SY2026001002', 2, NOW(), NOW(), NOW()),
(2, 'GK2026001005', 4, NOW(), NOW(), NOW()),
(2, 'ZJ2026001001', 1, NOW(), NOW(), NOW()),
(3, 'GD2026001001', 6, NOW(), NOW(), NOW()),
(3, 'GD2026001002', 2, NOW(), NOW(), NOW()),
(3, 'GD2026001003', 3, NOW(), NOW(), NOW()),
(4, 'XD2026001001', 8, NOW(), NOW(), NOW()),
(4, 'XD2026001002', 4, NOW(), NOW(), NOW()),
(5, 'GK2026001002', 2, NOW(), NOW(), NOW());

-- 插入Mock列表页监控数据
INSERT INTO `what_list_pages` (`url`, `source_name`, `category`, `crawl_frequency`, `last_crawl_time`, `article_count`, `article_selector`, `status`, `created_at`, `updated_at`) VALUES
('https://www.scs.gov.cn/ks/kszl/', '国家公务员局', '国考', 'daily', NOW(), 156, '.list-item a', 'active', NOW(), NOW()),
('https://www.gdhrss.gov.cn/ks/gkks/', '广东省人社厅', '省考', 'daily', NOW(), 89, '.news-list li a', 'active', NOW(), NOW()),
('https://www.zjhrss.gov.cn/col/col1229505/', '浙江省人社厅', '省考', 'daily', NOW(), 67, '.list_content li a', 'active', NOW(), NOW()),
('https://www.shhrss.gov.cn/sydwzp/', '上海市人社局', '事业单位', 'daily', NOW(), 45, '.list a', 'active', NOW(), NOW()),
('https://www.jshrss.gov.cn/ks/', '江苏省人社厅', '省考', 'daily', NULL, 0, NULL, 'inactive', NOW(), NOW());

-- 插入Mock爬虫任务数据
INSERT INTO `what_crawl_tasks` (`task_id`, `task_type`, `task_name`, `status`, `progress`, `items_scraped`, `items_saved`, `started_at`, `completed_at`, `created_at`, `updated_at`) VALUES
('TASK-20260124-001', 'list_monitor', '国家公务员局列表监控', 'completed', 100, 156, 23, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW()),
('TASK-20260124-002', 'announcement', '广东省考公告爬取', 'completed', 100, 12, 12, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), NOW()),
('TASK-20260124-003', 'positions', '职位信息解析', 'running', 65, 89, 58, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NOW()),
('TASK-20260124-004', 'list_monitor', '浙江省人社厅监控', 'pending', 0, 0, 0, NULL, NULL, NOW(), NOW());

-- 插入Mock用户通知数据
INSERT INTO `what_user_notifications` (`user_id`, `type`, `title`, `content`, `is_read`, `created_at`) VALUES
(1, 'system', '欢迎使用公考职位智能筛选系统', '感谢您注册使用我们的系统，我们将为您提供最全面的公考职位信息和智能匹配服务。', 1, NOW()),
(1, 'position', '您收藏的职位报名即将截止', '您收藏的"网络安全工程师"职位报名将于2025年10月24日18:00截止，请及时报名。', 0, NOW()),
(2, 'system', '欢迎使用公考职位智能筛选系统', '感谢您注册使用我们的系统，我们将为您提供最全面的公考职位信息和智能匹配服务。', 1, NOW()),
(2, 'match', '发现3个与您条件匹配的新职位', '根据您的档案信息，我们为您匹配到3个适合的职位，点击查看详情。', 0, NOW()),
(3, 'position', '新公告发布提醒', '广东省2026年考试录用公务员公告已发布，共招录5000余人，请及时关注。', 0, NOW());

-- ============================================================================
-- 完成
-- ============================================================================
SELECT 'Database schema and mock data created successfully!' AS status;
