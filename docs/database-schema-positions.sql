-- =====================================================
-- 职位系统数据库迁移脚本
-- 创建时间: 2026-01-28
-- 说明: 用于支持职位筛选、智能匹配、用户画像等功能
-- =====================================================

-- -----------------------------------------------------
-- 1. 职位表 what_positions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `what_positions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `announcement_id` bigint unsigned DEFAULT NULL COMMENT '关联公告ID',
  `fenbi_announcement_id` bigint unsigned DEFAULT NULL COMMENT '粉笔公告ID',
  
  -- 基本信息
  `position_name` varchar(200) NOT NULL DEFAULT '' COMMENT '岗位名称',
  `position_code` varchar(50) DEFAULT NULL COMMENT '职位代码',
  `department_name` varchar(200) DEFAULT NULL COMMENT '招录单位',
  `department_level` varchar(50) DEFAULT NULL COMMENT '单位层级(省级/市级/县级/乡镇)',
  
  -- 招录条件
  `recruit_count` int DEFAULT 1 COMMENT '招录人数',
  `education` varchar(50) DEFAULT NULL COMMENT '学历要求',
  `degree` varchar(50) DEFAULT NULL COMMENT '学位要求',
  `major_category` varchar(100) DEFAULT NULL COMMENT '专业大类',
  `major_requirement` text COMMENT '专业要求原文',
  `major_list` json DEFAULT NULL COMMENT '专业列表JSON数组',
  `is_unlimited_major` tinyint(1) DEFAULT 0 COMMENT '是否不限专业',
  
  -- 其他条件
  `work_location` varchar(200) DEFAULT NULL COMMENT '工作地点',
  `political_status` varchar(50) DEFAULT NULL COMMENT '政治面貌要求',
  `age` varchar(100) DEFAULT NULL COMMENT '年龄要求',
  `work_experience` varchar(200) DEFAULT NULL COMMENT '工作经历要求',
  `is_for_fresh_graduate` tinyint(1) DEFAULT NULL COMMENT '是否限应届(NULL=不限,1=仅应届,0=需经验)',
  `gender` varchar(10) DEFAULT NULL COMMENT '性别要求',
  `other_conditions` text COMMENT '其他条件',
  
  -- 考试信息
  `exam_type` varchar(50) DEFAULT NULL COMMENT '考试类型(事业单位/公务员/教师等)',
  `exam_category` varchar(50) DEFAULT NULL COMMENT '考试分类(A类/B类/C类)',
  `province` varchar(50) DEFAULT NULL COMMENT '省份',
  `city` varchar(50) DEFAULT NULL COMMENT '城市',
  `district` varchar(50) DEFAULT NULL COMMENT '区县',
  
  -- 时间信息
  `registration_start` datetime DEFAULT NULL COMMENT '报名开始时间',
  `registration_end` datetime DEFAULT NULL COMMENT '报名截止时间',
  `exam_date` datetime DEFAULT NULL COMMENT '考试时间',
  
  -- AI解析元数据
  `parse_confidence` int DEFAULT 0 COMMENT '解析置信度(0-100)',
  `parsed_at` datetime DEFAULT NULL COMMENT '解析时间',
  
  -- 系统字段
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  KEY `idx_positions_announcement_id` (`announcement_id`),
  KEY `idx_positions_fenbi_announcement_id` (`fenbi_announcement_id`),
  KEY `idx_positions_province` (`province`),
  KEY `idx_positions_city` (`city`),
  KEY `idx_positions_exam_type` (`exam_type`),
  KEY `idx_positions_education` (`education`),
  KEY `idx_positions_registration_end` (`registration_end`),
  KEY `idx_positions_is_unlimited_major` (`is_unlimited_major`),
  KEY `idx_positions_deleted_at` (`deleted_at`),
  KEY `idx_positions_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职位表';


-- -----------------------------------------------------
-- 2. 用户画像表 what_user_profiles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `what_user_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '关联用户ID',
  
  -- 学历信息
  `education` varchar(50) DEFAULT NULL COMMENT '最高学历(大专/本科/硕士/博士)',
  `degree` varchar(50) DEFAULT NULL COMMENT '学位(学士/硕士/博士)',
  `graduate_year` int DEFAULT NULL COMMENT '毕业年份',
  `is_current_student` tinyint(1) DEFAULT 0 COMMENT '是否在读',
  `school_type` varchar(50) DEFAULT NULL COMMENT '学校类型(985/211/双一流/普通)',
  
  -- 专业信息
  `major_category` varchar(100) DEFAULT NULL COMMENT '专业大类',
  `major_name` varchar(100) DEFAULT NULL COMMENT '专业名称',
  `major_code` varchar(50) DEFAULT NULL COMMENT '专业代码',
  `second_major` varchar(100) DEFAULT NULL COMMENT '第二专业',
  
  -- 个人信息
  `birth_date` date DEFAULT NULL COMMENT '出生日期',
  `gender` varchar(10) DEFAULT NULL COMMENT '性别',
  `political_status` varchar(50) DEFAULT NULL COMMENT '政治面貌',
  `work_years` int DEFAULT 0 COMMENT '工作年限',
  `current_location` varchar(100) DEFAULT NULL COMMENT '现居地',
  `household_location` varchar(100) DEFAULT NULL COMMENT '户籍地',
  
  -- 意向设置 (JSON数组)
  `preferred_provinces` json DEFAULT NULL COMMENT '意向省份',
  `preferred_cities` json DEFAULT NULL COMMENT '意向城市',
  `preferred_exam_types` json DEFAULT NULL COMMENT '意向考试类型',
  `preferred_dept_levels` json DEFAULT NULL COMMENT '意向单位层级',
  
  -- 资格证书
  `certificates` json DEFAULT NULL COMMENT '资格证书列表',
  
  -- 系统字段
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_profiles_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户画像表';


-- -----------------------------------------------------
-- 3. 用户收藏表 what_user_favorites
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `what_user_favorites` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `target_type` varchar(20) NOT NULL COMMENT '收藏类型(position/announcement)',
  `target_id` bigint unsigned NOT NULL COMMENT '目标ID',
  `notes` text COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_favorites` (`user_id`, `target_type`, `target_id`),
  KEY `idx_user_favorites_user_id` (`user_id`),
  KEY `idx_user_favorites_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';


-- -----------------------------------------------------
-- 4. 报考日历表 what_exam_calendars
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `what_exam_calendars` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `position_id` bigint unsigned DEFAULT NULL COMMENT '关联职位ID',
  `announcement_id` bigint unsigned DEFAULT NULL COMMENT '关联公告ID',
  
  `event_type` varchar(50) NOT NULL COMMENT '事件类型(announcement/registration_start/registration_end/exam/result)',
  `event_title` varchar(200) NOT NULL COMMENT '事件标题',
  `event_date` datetime NOT NULL COMMENT '事件日期',
  
  `reminder_enabled` tinyint(1) DEFAULT 1 COMMENT '是否开启提醒',
  `reminder_before` int DEFAULT 24 COMMENT '提前多少小时提醒',
  `notify_channel` varchar(20) DEFAULT 'email' COMMENT '通知渠道(email/wechat/sms)',
  `status` varchar(20) DEFAULT 'pending' COMMENT '状态(pending/notified/completed)',
  
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_exam_calendars_user_id` (`user_id`),
  KEY `idx_exam_calendars_event_date` (`event_date`),
  KEY `idx_exam_calendars_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报考日历表';


-- -----------------------------------------------------
-- 5. 用户订阅表 what_user_subscriptions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `what_user_subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `subscribe_type` varchar(50) NOT NULL COMMENT '订阅类型(exam_type/province/city/keyword)',
  `subscribe_value` varchar(200) NOT NULL COMMENT '订阅值',
  `notify_on_new` tinyint(1) DEFAULT 1 COMMENT '新公告是否通知',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_subscriptions` (`user_id`, `subscribe_type`, `subscribe_value`),
  KEY `idx_user_subscriptions_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户订阅表';


-- -----------------------------------------------------
-- 6. 职位匹配记录表 what_position_matches (可选，用于缓存匹配结果)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `what_position_matches` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `position_id` bigint unsigned NOT NULL COMMENT '职位ID',
  
  `match_score` int NOT NULL DEFAULT 0 COMMENT '匹配总分(0-100)',
  `match_level` varchar(20) DEFAULT NULL COMMENT '匹配等级(1-5星)',
  
  -- 各维度得分
  `education_score` int DEFAULT 0 COMMENT '学历匹配得分',
  `major_score` int DEFAULT 0 COMMENT '专业匹配得分',
  `location_score` int DEFAULT 0 COMMENT '地域匹配得分',
  `political_score` int DEFAULT 0 COMMENT '政治面貌得分',
  `age_score` int DEFAULT 0 COMMENT '年龄匹配得分',
  `experience_score` int DEFAULT 0 COMMENT '工作经历得分',
  
  `match_details` json DEFAULT NULL COMMENT '匹配详情JSON',
  
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_position_matches` (`user_id`, `position_id`),
  KEY `idx_position_matches_user_id` (`user_id`),
  KEY `idx_position_matches_score` (`match_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职位匹配记录表';


-- -----------------------------------------------------
-- 数据字典说明
-- -----------------------------------------------------
-- 
-- education 学历枚举值:
--   - 大专
--   - 本科
--   - 硕士研究生
--   - 博士研究生
--
-- degree 学位枚举值:
--   - 无
--   - 学士
--   - 硕士
--   - 博士
--
-- political_status 政治面貌枚举值:
--   - 不限
--   - 中共党员
--   - 中共党员或共青团员
--   - 共青团员
--   - 群众
--
-- exam_type 考试类型枚举值:
--   - 公务员
--   - 事业单位
--   - 教师招聘
--   - 医疗卫生
--   - 银行招聘
--   - 国企招聘
--   - 军队文职
--   - 三支一扶
--   - 大学生村官
--   - 警法招聘
--   - 选调生
--   - 社区工作者
--
-- department_level 单位层级枚举值:
--   - 中央
--   - 省级
--   - 市级
--   - 县级
--   - 乡镇
--
-- event_type 日历事件类型:
--   - announcement: 公告发布
--   - registration_start: 报名开始
--   - registration_end: 报名截止
--   - exam: 考试
--   - result: 成绩公布
