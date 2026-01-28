-- ============================================================================
-- 用户画像系统 - 数据库增强脚本
-- Database: what-cse-ai
-- Created: 2026-01-28
-- Description: 为用户画像系统添加更多字段，支持智能职位匹配
-- ============================================================================

USE `what-cse-ai`;

-- ============================================================================
-- 1. 修改用户档案表 - 增加更多字段
-- ============================================================================

-- 添加学历信息增强字段
ALTER TABLE `what_user_profiles`
    ADD COLUMN IF NOT EXISTS `degree` VARCHAR(20) DEFAULT NULL COMMENT '学位: 无/学士/硕士/博士' AFTER `education`,
    ADD COLUMN IF NOT EXISTS `graduate_year` INT DEFAULT NULL COMMENT '毕业年份' AFTER `graduation_date`,
    ADD COLUMN IF NOT EXISTS `is_current_student` TINYINT(1) DEFAULT 0 COMMENT '是否在读' AFTER `graduate_year`,
    ADD COLUMN IF NOT EXISTS `school_type` VARCHAR(50) DEFAULT NULL COMMENT '学校类型: 985/211/双一流/普通本科/大专' AFTER `school`;

-- 添加专业信息增强字段
ALTER TABLE `what_user_profiles`
    ADD COLUMN IF NOT EXISTS `major_category` VARCHAR(50) DEFAULT NULL COMMENT '专业大类' AFTER `major`,
    ADD COLUMN IF NOT EXISTS `major_code` VARCHAR(20) DEFAULT NULL COMMENT '专业代码' AFTER `major_category`,
    ADD COLUMN IF NOT EXISTS `second_major` VARCHAR(100) DEFAULT NULL COMMENT '第二专业' AFTER `major_code`,
    ADD COLUMN IF NOT EXISTS `second_major_code` VARCHAR(20) DEFAULT NULL COMMENT '第二专业代码' AFTER `second_major`;

-- 添加个人信息增强字段
ALTER TABLE `what_user_profiles`
    ADD COLUMN IF NOT EXISTS `current_province` VARCHAR(50) DEFAULT NULL COMMENT '现居省份' AFTER `hukou_city`,
    ADD COLUMN IF NOT EXISTS `current_city` VARCHAR(50) DEFAULT NULL COMMENT '现居城市' AFTER `current_province`,
    ADD COLUMN IF NOT EXISTS `identity_type` VARCHAR(50) DEFAULT NULL COMMENT '身份类型: 应届生/社会人员/服务基层人员' AFTER `grassroots_exp_years`,
    ADD COLUMN IF NOT EXISTS `age_at_exam` INT DEFAULT NULL COMMENT '考试时年龄(自动计算)' AFTER `birth_date`;

-- 添加系统字段
ALTER TABLE `what_user_profiles`
    ADD COLUMN IF NOT EXISTS `profile_completeness` INT DEFAULT 0 COMMENT '资料完整度(0-100)' AFTER `identity_type`,
    ADD COLUMN IF NOT EXISTS `last_match_at` DATETIME DEFAULT NULL COMMENT '上次匹配时间' AFTER `profile_completeness`;

-- 添加索引
ALTER TABLE `what_user_profiles`
    ADD INDEX IF NOT EXISTS `idx_what_user_profiles_major_category` (`major_category`),
    ADD INDEX IF NOT EXISTS `idx_what_user_profiles_degree` (`degree`),
    ADD INDEX IF NOT EXISTS `idx_what_user_profiles_school_type` (`school_type`),
    ADD INDEX IF NOT EXISTS `idx_what_user_profiles_identity_type` (`identity_type`);

-- ============================================================================
-- 2. 增强用户偏好表
-- ============================================================================

ALTER TABLE `what_user_preferences`
    ADD COLUMN IF NOT EXISTS `preferred_dept_levels` JSON DEFAULT NULL COMMENT '意向单位层级(JSON数组)' AFTER `exam_types`,
    ADD COLUMN IF NOT EXISTS `salary_expectation_min` INT DEFAULT NULL COMMENT '期望最低薪资' AFTER `preferred_dept_levels`,
    ADD COLUMN IF NOT EXISTS `salary_expectation_max` INT DEFAULT NULL COMMENT '期望最高薪资' AFTER `salary_expectation_min`,
    ADD COLUMN IF NOT EXISTS `accept_unlimited_major` TINYINT(1) DEFAULT 1 COMMENT '是否接受不限专业职位' AFTER `salary_expectation_max`,
    ADD COLUMN IF NOT EXISTS `accept_fresh_grad_only` TINYINT(1) DEFAULT 0 COMMENT '是否仅看应届生职位' AFTER `accept_unlimited_major`;

-- ============================================================================
-- 3. 增强用户证书表 - 添加证书分类
-- ============================================================================

ALTER TABLE `what_user_certificates`
    ADD COLUMN IF NOT EXISTS `cert_category` VARCHAR(50) DEFAULT 'other' COMMENT '证书分类: language/professional/other' AFTER `cert_type`,
    ADD COLUMN IF NOT EXISTS `score` VARCHAR(50) DEFAULT NULL COMMENT '证书成绩(如英语四级分数)' AFTER `cert_level`;

-- ============================================================================
-- 4. 创建专业目录表 (用于专业选择级联)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `what_major_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL COMMENT '专业大类代码',
    `name` VARCHAR(50) NOT NULL COMMENT '专业大类名称',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_major_category_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专业大类表';

CREATE TABLE IF NOT EXISTS `what_majors` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL COMMENT '专业代码',
    `name` VARCHAR(100) NOT NULL COMMENT '专业名称',
    `category_code` VARCHAR(10) NOT NULL COMMENT '所属大类代码',
    `level` INT DEFAULT 3 COMMENT '层级: 1-门类 2-类 3-专业',
    `parent_code` VARCHAR(20) DEFAULT NULL COMMENT '父级代码',
    `education_level` VARCHAR(20) DEFAULT NULL COMMENT '学历层次: 本科/专科/研究生',
    `synonyms` JSON DEFAULT NULL COMMENT '同义词/别名',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `created_at` DATETIME(3) DEFAULT NULL,
    `updated_at` DATETIME(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_major_code` (`code`),
    KEY `idx_majors_category` (`category_code`),
    KEY `idx_majors_name` (`name`),
    KEY `idx_majors_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专业表';

-- 添加全文索引
ALTER TABLE `what_majors` ADD FULLTEXT INDEX `ft_major_name` (`name`) WITH PARSER ngram;

-- ============================================================================
-- 5. 插入专业大类初始数据
-- ============================================================================

INSERT INTO `what_major_categories` (`code`, `name`, `sort_order`, `created_at`, `updated_at`) VALUES
('01', '哲学', 1, NOW(), NOW()),
('02', '经济学', 2, NOW(), NOW()),
('03', '法学', 3, NOW(), NOW()),
('04', '教育学', 4, NOW(), NOW()),
('05', '文学', 5, NOW(), NOW()),
('06', '历史学', 6, NOW(), NOW()),
('07', '理学', 7, NOW(), NOW()),
('08', '工学', 8, NOW(), NOW()),
('09', '农学', 9, NOW(), NOW()),
('10', '医学', 10, NOW(), NOW()),
('11', '军事学', 11, NOW(), NOW()),
('12', '管理学', 12, NOW(), NOW()),
('13', '艺术学', 13, NOW(), NOW()),
('14', '交叉学科', 14, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updated_at` = NOW();

-- ============================================================================
-- 6. 插入常用专业数据 (计算机类、管理类、经济类等)
-- ============================================================================

INSERT INTO `what_majors` (`code`, `name`, `category_code`, `level`, `parent_code`, `education_level`, `sort_order`, `created_at`, `updated_at`) VALUES
-- 计算机类
('0809', '计算机类', '08', 2, '08', NULL, 1, NOW(), NOW()),
('080901', '计算机科学与技术', '08', 3, '0809', '本科', 1, NOW(), NOW()),
('080902', '软件工程', '08', 3, '0809', '本科', 2, NOW(), NOW()),
('080903', '网络工程', '08', 3, '0809', '本科', 3, NOW(), NOW()),
('080904K', '信息安全', '08', 3, '0809', '本科', 4, NOW(), NOW()),
('080905', '物联网工程', '08', 3, '0809', '本科', 5, NOW(), NOW()),
('080906', '数字媒体技术', '08', 3, '0809', '本科', 6, NOW(), NOW()),
('080910T', '数据科学与大数据技术', '08', 3, '0809', '本科', 7, NOW(), NOW()),
('080911TK', '网络空间安全', '08', 3, '0809', '本科', 8, NOW(), NOW()),
('080912T', '人工智能', '08', 3, '0809', '本科', 9, NOW(), NOW()),

-- 电子信息类
('0807', '电子信息类', '08', 2, '08', NULL, 2, NOW(), NOW()),
('080701', '电子信息工程', '08', 3, '0807', '本科', 1, NOW(), NOW()),
('080702', '电子科学与技术', '08', 3, '0807', '本科', 2, NOW(), NOW()),
('080703', '通信工程', '08', 3, '0807', '本科', 3, NOW(), NOW()),

-- 工商管理类
('1202', '工商管理类', '12', 2, '12', NULL, 1, NOW(), NOW()),
('120201K', '工商管理', '12', 3, '1202', '本科', 1, NOW(), NOW()),
('120202', '市场营销', '12', 3, '1202', '本科', 2, NOW(), NOW()),
('120203K', '会计学', '12', 3, '1202', '本科', 3, NOW(), NOW()),
('120204', '财务管理', '12', 3, '1202', '本科', 4, NOW(), NOW()),
('120206', '人力资源管理', '12', 3, '1202', '本科', 5, NOW(), NOW()),

-- 公共管理类
('1204', '公共管理类', '12', 2, '12', NULL, 2, NOW(), NOW()),
('120401', '公共事业管理', '12', 3, '1204', '本科', 1, NOW(), NOW()),
('120402', '行政管理', '12', 3, '1204', '本科', 2, NOW(), NOW()),
('120405', '城市管理', '12', 3, '1204', '本科', 3, NOW(), NOW()),

-- 经济学类
('0201', '经济学类', '02', 2, '02', NULL, 1, NOW(), NOW()),
('020101', '经济学', '02', 3, '0201', '本科', 1, NOW(), NOW()),
('020102', '经济统计学', '02', 3, '0201', '本科', 2, NOW(), NOW()),

-- 金融学类
('0203', '金融学类', '02', 2, '02', NULL, 2, NOW(), NOW()),
('020301K', '金融学', '02', 3, '0203', '本科', 1, NOW(), NOW()),
('020302', '金融工程', '02', 3, '0203', '本科', 2, NOW(), NOW()),

-- 法学类
('0301', '法学类', '03', 2, '03', NULL, 1, NOW(), NOW()),
('030101K', '法学', '03', 3, '0301', '本科', 1, NOW(), NOW()),

-- 中国语言文学类
('0501', '中国语言文学类', '05', 2, '05', NULL, 1, NOW(), NOW()),
('050101', '汉语言文学', '05', 3, '0501', '本科', 1, NOW(), NOW()),
('050102', '汉语言', '05', 3, '0501', '本科', 2, NOW(), NOW()),
('050103', '汉语国际教育', '05', 3, '0501', '本科', 3, NOW(), NOW()),

-- 外国语言文学类
('0502', '外国语言文学类', '05', 2, '05', NULL, 2, NOW(), NOW()),
('050201', '英语', '05', 3, '0502', '本科', 1, NOW(), NOW()),
('050202', '俄语', '05', 3, '0502', '本科', 2, NOW(), NOW()),
('050207', '日语', '05', 3, '0502', '本科', 3, NOW(), NOW()),

-- 新闻传播学类
('0503', '新闻传播学类', '05', 2, '05', NULL, 3, NOW(), NOW()),
('050301', '新闻学', '05', 3, '0503', '本科', 1, NOW(), NOW()),
('050302', '广播电视学', '05', 3, '0503', '本科', 2, NOW(), NOW()),
('050304', '传播学', '05', 3, '0503', '本科', 3, NOW(), NOW())

ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `category_code` = VALUES(`category_code`), `updated_at` = NOW();

-- ============================================================================
-- 完成
-- ============================================================================
SELECT '用户画像系统数据库增强完成!' AS status;
