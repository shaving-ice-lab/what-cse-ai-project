-- 公考职位智能筛选系统 - 数据库初始化脚本
-- Database: what_cse
-- Charset: utf8mb4

-- 创建数据库
CREATE DATABASE IF NOT EXISTS what_cse
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE what_cse;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    status TINYINT DEFAULT 1 COMMENT '1-正常 2-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户档案表
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    gender VARCHAR(10),
    birth_date DATE,
    hukou_province VARCHAR(20),
    hukou_city VARCHAR(20),
    political_status VARCHAR(20),
    education VARCHAR(20),
    major VARCHAR(100),
    school VARCHAR(100),
    graduation_date DATE,
    is_fresh_graduate BOOLEAN DEFAULT FALSE,
    work_years INT DEFAULT 0,
    grassroots_exp_years INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_education (education),
    INDEX idx_major (major)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户证书表
CREATE TABLE IF NOT EXISTS user_certificates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    cert_type VARCHAR(50) NOT NULL,
    cert_name VARCHAR(100) NOT NULL,
    cert_level VARCHAR(50),
    obtained_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_cert_type (cert_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户偏好表
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    preferred_provinces JSON,
    preferred_cities JSON,
    preferred_departments JSON,
    exam_types JSON,
    match_strategy VARCHAR(20) DEFAULT 'balanced',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 职位表
CREATE TABLE IF NOT EXISTS positions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    position_id VARCHAR(50) NOT NULL UNIQUE,
    position_name VARCHAR(200) NOT NULL,
    department_code VARCHAR(50),
    department_name VARCHAR(200),
    department_level VARCHAR(20),
    work_location_province VARCHAR(20),
    work_location_city VARCHAR(20),
    work_location_district VARCHAR(20),
    recruit_count INT DEFAULT 1,
    exam_type VARCHAR(20),
    education_min VARCHAR(20),
    education_max VARCHAR(20),
    degree_required BOOLEAN DEFAULT FALSE,
    major_category JSON,
    major_specific JSON,
    major_unlimited BOOLEAN DEFAULT FALSE,
    political_status VARCHAR(20),
    work_exp_years_min INT DEFAULT 0,
    age_min INT,
    age_max INT,
    gender_required VARCHAR(10),
    hukou_required BOOLEAN DEFAULT FALSE,
    hukou_provinces JSON,
    registration_start DATE,
    registration_end DATE,
    exam_date_written DATE,
    applicant_count INT DEFAULT 0,
    competition_ratio DECIMAL(10,2) DEFAULT 0,
    parse_confidence INT DEFAULT 100,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_position_id (position_id),
    INDEX idx_exam_type (exam_type),
    INDEX idx_province (work_location_province),
    INDEX idx_city (work_location_city),
    INDEX idx_education (education_min),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 公告表
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    source_url VARCHAR(1000),
    source_name VARCHAR(100),
    publish_date DATE,
    content LONGTEXT,
    announcement_type VARCHAR(50),
    exam_type VARCHAR(20),
    province VARCHAR(20),
    city VARCHAR(20),
    attachment_urls JSON,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_exam_type (exam_type),
    INDEX idx_province (province),
    INDEX idx_publish_date (publish_date),
    INDEX idx_status (status),
    FULLTEXT INDEX ft_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 职位公告关联表
CREATE TABLE IF NOT EXISTS position_announcements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    position_id VARCHAR(50) NOT NULL,
    announcement_id BIGINT UNSIGNED NOT NULL,
    stage VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_position_id (position_id),
    INDEX idx_announcement_id (announcement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    position_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_position (user_id, position_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户浏览记录表
CREATE TABLE IF NOT EXISTS user_views (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    position_id VARCHAR(50) NOT NULL,
    view_count INT DEFAULT 1,
    last_view_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_position (user_id, position_id),
    INDEX idx_user_id (user_id),
    INDEX idx_last_view (last_view_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户通知表
CREATE TABLE IF NOT EXISTS user_notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    role VARCHAR(20) DEFAULT 'admin',
    status TINYINT DEFAULT 1,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 专业词典表
CREATE TABLE IF NOT EXISTS major_dictionary (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    parent_code VARCHAR(20),
    level INT DEFAULT 1,
    synonyms JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_category (category),
    INDEX idx_parent (parent_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 地区词典表
CREATE TABLE IF NOT EXISTS region_dictionary (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    parent_code VARCHAR(20),
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_parent (parent_code),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 列表页监控表
CREATE TABLE IF NOT EXISTS list_pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(1000) NOT NULL,
    source_name VARCHAR(100),
    category VARCHAR(50),
    crawl_frequency VARCHAR(20) DEFAULT 'daily',
    last_crawl_time TIMESTAMP,
    article_count INT DEFAULT 0,
    article_selector VARCHAR(500),
    pagination_pattern VARCHAR(200),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认管理员
INSERT INTO admins (username, password_hash, nickname, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuLmGsAkMtWNsrG1QH/4f3EzSAE8I9Ck.', '超级管理员', 'super_admin')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入示例地区数据
INSERT INTO region_dictionary (code, name, parent_code, level) VALUES
('110000', '北京市', NULL, 1),
('110100', '北京市', '110000', 2),
('110101', '东城区', '110100', 3),
('110102', '西城区', '110100', 3),
('310000', '上海市', NULL, 1),
('310100', '上海市', '310000', 2),
('310101', '黄浦区', '310100', 3),
('440000', '广东省', NULL, 1),
('440100', '广州市', '440000', 2),
('440300', '深圳市', '440000', 2)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 插入示例专业数据
INSERT INTO major_dictionary (code, name, category, parent_code, level) VALUES
('01', '哲学', '哲学', NULL, 1),
('02', '经济学', '经济学', NULL, 1),
('03', '法学', '法学', NULL, 1),
('04', '教育学', '教育学', NULL, 1),
('05', '文学', '文学', NULL, 1),
('06', '历史学', '历史学', NULL, 1),
('07', '理学', '理学', NULL, 1),
('08', '工学', '工学', NULL, 1),
('0809', '计算机类', '工学', '08', 2),
('080901', '计算机科学与技术', '工学', '0809', 3),
('080902', '软件工程', '工学', '0809', 3),
('080903', '网络工程', '工学', '0809', 3),
('12', '管理学', '管理学', NULL, 1),
('1202', '工商管理类', '管理学', '12', 2),
('120201', '工商管理', '管理学', '1202', 3),
('120202', '市场营销', '管理学', '1202', 3),
('120203', '会计学', '管理学', '1202', 3)
ON DUPLICATE KEY UPDATE name = VALUES(name);

SELECT 'Database initialization completed!' AS status;
