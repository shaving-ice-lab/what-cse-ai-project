# 粉笔爬虫功能规划 - 对标公考雷达

> 文档创建时间：2026-01-28
> 参考：[公考雷达](https://www.gongkaoleida.com/)

---

## 一、项目现状分析

### 1.1 已实现功能

#### 数据爬取层
| 功能 | 状态 | 说明 |
|------|------|------|
| 粉笔账号登录/Cookie导入 | ✅ 完成 | RSA加密登录、Cookie有效性验证 |
| 公告列表爬取 | ✅ 完成 | 支持地区/类型/年份筛选 |
| 短链接解析 | ✅ 完成 | t.fenbi.com -> 最终URL |
| 页面内容提取 | ✅ 完成 | 支持GBK编码转换 |
| 附件下载解析 | ✅ 完成 | PDF/Excel/Word内容提取 |
| 列表页URL提取 | ✅ 完成 | 用于后续监控 |

#### AI分析层
| 功能 | 状态 | 说明 |
|------|------|------|
| 公告摘要生成 | ✅ 完成 | LLM自动摘要 |
| 岗位信息提取 | ✅ 完成 | 岗位名、单位、人数、学历、专业、地点、政治面貌 |
| 考试信息提取 | ✅ 完成 | 报名时间、考试时间 |
| 置信度评估 | ✅ 完成 | 分析结果可信度 |

#### 前端管理界面
| 功能 | 状态 | 说明 |
|------|------|------|
| 爬取任务控制 | ✅ 完成 | 开始/停止/分页爬取 |
| 任务队列管理 | ✅ 完成 | 状态筛选、搜索、持久化 |
| 任务详情展示 | ✅ 完成 | 执行流程、AI分析、内容、附件 |
| URL手动解析 | ✅ 完成 | 支持单个URL解析 |

### 1.2 数据存储现状

当前职位数据以 JSON 格式存储在 `what_fenbi_parse_tasks.parse_result_summary` 字段中，未做结构化存储，无法支持高效查询和筛选。

---

## 二、公考雷达功能对标

### 2.1 公考雷达核心功能

#### 职位服务（核心）
| 功能 | 描述 |
|------|------|
| **智能职位匹配** | 根据简历（学历/专业/地区/性别/工作经验）自动推荐，带"匹配度星级"评分 |
| **多维度筛选** | 按专业目录查询、按专业直接查询、学历/地区/考试类型组合筛选 |
| **职位对比** | 六维数据横向对比（招录人数、竞争比、专业要求、学历限制等），生成PK报告 |
| **历年数据** | 历年招录数据、进面分数线参考 |

#### 报名大数据（差异化竞争力）
| 功能 | 描述 |
|------|------|
| **实时报名数据** | 过审人数、报名人数实时更新 |
| **竞争比分析** | 职位竞争比排名、竞争最激烈/最低的岗位 |
| **机会发现** | 无人过审职位、低竞争比岗位推荐 |
| **热度预测** | 职位热度、报考竞争力预估 |

#### 全流程服务
| 功能 | 描述 |
|------|------|
| **报考日历** | 重要时间节点可视化 |
| **节点提醒** | 公告发布、报名、准考证、成绩查询等提醒 |
| **考试工具** | 考前模考、考点查询、考后估分、成绩晒分 |

#### 覆盖范围
- 14大考试类型：公务员、事业单位、教师、国企、医疗、银行、军队文职、三支一扶、大学生村官、警法类等
- 31省/370市/2628区县的完整覆盖

#### 技术能力
- 公告发布后16秒同步官网
- 7分钟内完成2万+岗位精准解析

### 2.2 功能差距分析

| 功能模块 | 公考雷达 | 本项目现状 | 可行性评估 |
|----------|----------|--------------|------------|
| **数据采集** | 官方渠道+历史数据 | 粉笔网爬取 | ✅ 已具备，可扩展其他源 |
| **AI内容解析** | 7分钟解析2万岗位 | LLM逐条解析（较慢） | ⚠️ 需要优化并行度 |
| **职位结构化存储** | 完整的职位数据库 | JSON存储在summary中 | 🔴 需要重构 |
| **用户画像** | 完整的简历系统 | 暂无 | 🔴 需要开发 |
| **智能匹配** | 匹配度星级评分 | 暂无 | 🔴 需要开发 |
| **职位筛选** | 多维度组合筛选 | 仅公告级别筛选 | 🔴 需要开发 |
| **职位对比** | 六维PK报告 | 暂无 | 🔴 需要开发 |
| **报名大数据** | 实时竞争比 | 暂无（缺数据源） | ❌ 暂无数据源 |
| **历年数据** | 完整积累 | 暂无 | ⚠️ 需要时间积累 |
| **消息提醒** | 多节点推送 | 暂无 | 🔴 需要开发 |
| **考试类型覆盖** | 14大类 | 主要是事业单位 | ⚠️ 可扩展 |

---

## 三、开发规划

### 3.1 第一阶段：数据基础建设（P0 - 高优先级）

**预计周期：2-3周**

#### 3.1.1 职位数据模型

创建独立的职位表 `what_positions`：

```go
type Position struct {
    ID                  uint           `gorm:"primaryKey"`
    AnnouncementID      uint           `gorm:"index"` // 关联公告
    FenbiAnnouncementID *uint          // 粉笔公告ID
    
    // 基本信息
    PositionName        string         `gorm:"type:varchar(200)"`
    PositionCode        string         `gorm:"type:varchar(50)"` // 职位代码
    DepartmentName      string         `gorm:"type:varchar(200)"` // 招录单位
    DepartmentLevel     string         `gorm:"type:varchar(50)"`  // 单位层级(省级/市级/县级)
    
    // 招录条件
    RecruitCount        int            // 招录人数
    Education           string         `gorm:"type:varchar(50)"`  // 学历要求
    Degree              string         `gorm:"type:varchar(50)"`  // 学位要求
    MajorCategory       string         `gorm:"type:varchar(100)"` // 专业大类
    MajorRequirement    string         `gorm:"type:text"`         // 专业要求原文
    MajorList           JSON           // 专业列表 []string
    IsUnlimitedMajor    bool           // 是否不限专业
    
    // 其他条件
    WorkLocation        string         `gorm:"type:varchar(200)"` // 工作地点
    PoliticalStatus     string         `gorm:"type:varchar(50)"`  // 政治面貌
    Age                 string         `gorm:"type:varchar(100)"` // 年龄要求
    WorkExperience      string         `gorm:"type:varchar(200)"` // 工作经历
    IsForFreshGraduate  *bool          // 是否限应届
    Gender              string         `gorm:"type:varchar(10)"`  // 性别要求
    OtherConditions     string         `gorm:"type:text"`         // 其他条件
    
    // 考试信息
    ExamType            string         `gorm:"type:varchar(50)"`  // 考试类型
    ExamCategory        string         `gorm:"type:varchar(50)"`  // 考试分类(A类/B类/C类)
    Province            string         `gorm:"type:varchar(50);index"` // 省份
    City                string         `gorm:"type:varchar(50);index"` // 城市
    District            string         `gorm:"type:varchar(50)"`  // 区县
    
    // 时间信息
    RegistrationStart   *time.Time     // 报名开始
    RegistrationEnd     *time.Time     // 报名截止
    ExamDate            *time.Time     // 考试时间
    
    // AI解析元数据
    ParseConfidence     int            // 解析置信度
    ParsedAt            *time.Time     // 解析时间
    
    CreatedAt           time.Time
    UpdatedAt           time.Time
    DeletedAt           gorm.DeletedAt `gorm:"index"`
}
```

**数据库迁移 SQL：**

```sql
CREATE TABLE `what_positions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `announcement_id` bigint unsigned DEFAULT NULL COMMENT '关联公告ID',
  `fenbi_announcement_id` bigint unsigned DEFAULT NULL COMMENT '粉笔公告ID',
  
  -- 基本信息
  `position_name` varchar(200) NOT NULL DEFAULT '' COMMENT '岗位名称',
  `position_code` varchar(50) DEFAULT NULL COMMENT '职位代码',
  `department_name` varchar(200) DEFAULT NULL COMMENT '招录单位',
  `department_level` varchar(50) DEFAULT NULL COMMENT '单位层级',
  
  -- 招录条件
  `recruit_count` int DEFAULT 1 COMMENT '招录人数',
  `education` varchar(50) DEFAULT NULL COMMENT '学历要求',
  `degree` varchar(50) DEFAULT NULL COMMENT '学位要求',
  `major_category` varchar(100) DEFAULT NULL COMMENT '专业大类',
  `major_requirement` text COMMENT '专业要求原文',
  `major_list` json DEFAULT NULL COMMENT '专业列表',
  `is_unlimited_major` tinyint(1) DEFAULT 0 COMMENT '是否不限专业',
  
  -- 其他条件
  `work_location` varchar(200) DEFAULT NULL COMMENT '工作地点',
  `political_status` varchar(50) DEFAULT NULL COMMENT '政治面貌',
  `age` varchar(100) DEFAULT NULL COMMENT '年龄要求',
  `work_experience` varchar(200) DEFAULT NULL COMMENT '工作经历',
  `is_for_fresh_graduate` tinyint(1) DEFAULT NULL COMMENT '是否限应届',
  `gender` varchar(10) DEFAULT NULL COMMENT '性别要求',
  `other_conditions` text COMMENT '其他条件',
  
  -- 考试信息
  `exam_type` varchar(50) DEFAULT NULL COMMENT '考试类型',
  `exam_category` varchar(50) DEFAULT NULL COMMENT '考试分类',
  `province` varchar(50) DEFAULT NULL COMMENT '省份',
  `city` varchar(50) DEFAULT NULL COMMENT '城市',
  `district` varchar(50) DEFAULT NULL COMMENT '区县',
  
  -- 时间信息
  `registration_start` datetime DEFAULT NULL COMMENT '报名开始',
  `registration_end` datetime DEFAULT NULL COMMENT '报名截止',
  `exam_date` datetime DEFAULT NULL COMMENT '考试时间',
  
  -- AI解析元数据
  `parse_confidence` int DEFAULT 0 COMMENT '解析置信度',
  `parsed_at` datetime DEFAULT NULL COMMENT '解析时间',
  
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  KEY `idx_announcement_id` (`announcement_id`),
  KEY `idx_fenbi_announcement_id` (`fenbi_announcement_id`),
  KEY `idx_province` (`province`),
  KEY `idx_city` (`city`),
  KEY `idx_exam_type` (`exam_type`),
  KEY `idx_education` (`education`),
  KEY `idx_registration_end` (`registration_end`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职位表';
```

#### 3.1.2 用户画像模型

创建用户画像表 `what_user_profiles`：

```go
type UserProfile struct {
    ID                  uint           `gorm:"primaryKey"`
    UserID              uint           `gorm:"uniqueIndex"` // 关联用户
    
    // 学历信息
    Education           string         // 最高学历: 大专/本科/硕士/博士
    Degree              string         // 学位: 学士/硕士/博士
    GraduateYear        int            // 毕业年份
    IsCurrentStudent    bool           // 是否在读
    SchoolType          string         // 学校类型: 985/211/双一流/普通
    
    // 专业信息
    MajorCategory       string         // 专业大类
    MajorName           string         // 专业名称
    MajorCode           string         // 专业代码
    SecondMajor         string         // 第二专业(如有)
    
    // 个人信息
    BirthDate           *time.Time     // 出生日期
    Gender              string         // 性别
    PoliticalStatus     string         // 政治面貌
    WorkYears           int            // 工作年限
    CurrentLocation     string         // 现居地
    HouseholdLocation   string         // 户籍地
    
    // 意向设置
    PreferredProvinces  JSON           // 意向省份 []string
    PreferredCities     JSON           // 意向城市 []string
    PreferredExamTypes  JSON           // 意向考试类型 []string
    PreferredDeptLevels JSON           // 意向单位层级 []string
    
    // 资格证书
    Certificates        JSON           // 资格证书 []string
    
    CreatedAt           time.Time
    UpdatedAt           time.Time
}
```

#### 3.1.3 修改LLM解析流程

在 `ParseURL` 完成后，自动将岗位数据结构化入库：

```go
// fenbi_service.go 中新增方法
func (s *FenbiService) SavePositionsFromParseResult(
    announcementID uint, 
    llmResult *LLMAnalysisResult,
    examInfo *ExamInfo,
) error {
    if llmResult == nil || len(llmResult.Positions) == 0 {
        return nil
    }
    
    positions := make([]*model.Position, 0, len(llmResult.Positions))
    for _, pos := range llmResult.Positions {
        position := &model.Position{
            AnnouncementID:     announcementID,
            PositionName:       pos.PositionName,
            DepartmentName:     pos.DepartmentName,
            RecruitCount:       pos.RecruitCount,
            Education:          pos.Education,
            MajorList:          pos.Major,
            IsUnlimitedMajor:   isUnlimitedMajor(pos.Major),
            WorkLocation:       pos.WorkLocation,
            PoliticalStatus:    pos.PoliticalStatus,
            ParseConfidence:    llmResult.Confidence,
            ParsedAt:           timePtr(time.Now()),
        }
        
        // 从考试信息填充
        if examInfo != nil {
            position.ExamType = examInfo.ExamType
            position.RegistrationStart = parseTime(examInfo.RegistrationStart)
            position.RegistrationEnd = parseTime(examInfo.RegistrationEnd)
            position.ExamDate = parseTime(examInfo.ExamDate)
        }
        
        positions = append(positions, position)
    }
    
    return s.repo.BatchCreatePositions(positions)
}
```

---

### 3.2 第二阶段：核心功能开发（P1 - 中优先级）

**预计周期：3-4周**

#### 3.2.1 职位筛选 API

```go
// GET /api/v1/positions
type PositionQueryParams struct {
    Province         string   `form:"province"`
    City             string   `form:"city"`
    Education        string   `form:"education"`
    Major            string   `form:"major"`
    MajorCategory    string   `form:"major_category"`
    ExamType         string   `form:"exam_type"`
    IsUnlimitedMajor *bool    `form:"unlimited_major"`
    IsForFreshGrad   *bool    `form:"fresh_graduate"`
    MinRecruitCount  int      `form:"min_recruit"`
    Keyword          string   `form:"keyword"`
    Page             int      `form:"page"`
    PageSize         int      `form:"page_size"`
    SortBy           string   `form:"sort_by"` // recruit_count/created_at/registration_end
    SortOrder        string   `form:"sort_order"` // asc/desc
}

type PositionListResponse struct {
    Positions  []*PositionItem `json:"positions"`
    Total      int64           `json:"total"`
    Page       int             `json:"page"`
    PageSize   int             `json:"page_size"`
    TotalPages int             `json:"total_pages"`
}
```

#### 3.2.2 智能匹配算法

```go
type MatchResult struct {
    PositionID    uint          `json:"position_id"`
    MatchScore    int           `json:"match_score"`    // 0-100 总分
    MatchLevel    string        `json:"match_level"`    // 五星级别
    MatchDetails  MatchDetails  `json:"match_details"`
}

type MatchDetails struct {
    EducationMatch    MatchItem `json:"education_match"`   // 学历匹配 (权重25%)
    MajorMatch        MatchItem `json:"major_match"`       // 专业匹配 (权重30%)
    LocationMatch     MatchItem `json:"location_match"`    // 地域匹配 (权重15%)
    PoliticalMatch    MatchItem `json:"political_match"`   // 政治面貌匹配 (权重10%)
    AgeMatch          MatchItem `json:"age_match"`         // 年龄匹配 (权重10%)
    ExperienceMatch   MatchItem `json:"experience_match"`  // 工作经历匹配 (权重10%)
}

type MatchItem struct {
    Matched     bool   `json:"matched"`
    Score       int    `json:"score"`      // 该项得分
    MaxScore    int    `json:"max_score"`  // 该项满分
    Reason      string `json:"reason"`     // 匹配/不匹配原因
}

// 匹配度计算核心逻辑
func CalculateMatchScore(profile *UserProfile, position *Position) *MatchResult {
    result := &MatchResult{PositionID: position.ID}
    
    // 1. 学历匹配 (权重 25%)
    result.MatchDetails.EducationMatch = matchEducation(profile, position)
    
    // 2. 专业匹配 (权重 30%)
    result.MatchDetails.MajorMatch = matchMajor(profile, position)
    
    // 3. 地域匹配 (权重 15%)
    result.MatchDetails.LocationMatch = matchLocation(profile, position)
    
    // 4. 政治面貌 (权重 10%)
    result.MatchDetails.PoliticalMatch = matchPolitical(profile, position)
    
    // 5. 年龄 (权重 10%)
    result.MatchDetails.AgeMatch = matchAge(profile, position)
    
    // 6. 工作经历 (权重 10%)
    result.MatchDetails.ExperienceMatch = matchExperience(profile, position)
    
    // 计算总分
    result.MatchScore = calculateTotalScore(result.MatchDetails)
    result.MatchLevel = scoreToLevel(result.MatchScore)
    
    return result
}

// 星级评分
func scoreToLevel(score int) string {
    switch {
    case score >= 90:
        return "⭐⭐⭐⭐⭐" // 完全符合，强烈推荐
    case score >= 75:
        return "⭐⭐⭐⭐"   // 高度匹配
    case score >= 60:
        return "⭐⭐⭐"     // 基本符合
    case score >= 40:
        return "⭐⭐"       // 部分符合
    default:
        return "⭐"         // 不太符合
    }
}
```

#### 3.2.3 职位对比功能

```go
// POST /api/v1/positions/compare
type CompareRequest struct {
    PositionIDs []uint `json:"position_ids"` // 最多5个
}

type CompareResponse struct {
    Positions      []*CompareItem  `json:"positions"`
    Recommendation *Recommendation `json:"recommendation"`
    Summary        string          `json:"summary"` // AI生成的对比总结
}

type CompareItem struct {
    PositionID        uint     `json:"position_id"`
    PositionName      string   `json:"position_name"`
    DepartmentName    string   `json:"department_name"`
    RecruitCount      int      `json:"recruit_count"`
    Education         string   `json:"education"`
    MajorRequirement  string   `json:"major_requirement"`
    WorkLocation      string   `json:"work_location"`
    PoliticalStatus   string   `json:"political_status"`
    Age               string   `json:"age"`
    WorkExperience    string   `json:"work_experience"`
    RegistrationEnd   string   `json:"registration_end"`
    ExamDate          string   `json:"exam_date"`
}

type Recommendation struct {
    BestForFreshGraduate uint `json:"best_for_fresh_graduate"` // 最适合应届生
    MostRecruit          uint `json:"most_recruit"`            // 招录最多
    LowestRequirement    uint `json:"lowest_requirement"`      // 条件最宽松
}
```

---

### 3.3 第三阶段：增值功能（P2 - 低优先级）

**预计周期：2-3周**

#### 3.3.1 收藏功能

```go
type UserFavorite struct {
    ID          uint      `gorm:"primaryKey"`
    UserID      uint      `gorm:"index"`
    TargetType  string    // position/announcement
    TargetID    uint
    Notes       string    // 备注
    CreatedAt   time.Time
}
```

#### 3.3.2 报考日历 & 提醒

```go
type ExamCalendar struct {
    ID              uint       `gorm:"primaryKey"`
    UserID          uint       `gorm:"index"`
    PositionID      *uint      // 关联职位（可选）
    AnnouncementID  *uint      // 关联公告
    EventType       string     // announcement/registration_start/registration_end/exam/result
    EventTitle      string
    EventDate       time.Time
    ReminderEnabled bool
    ReminderBefore  int        // 提前多少小时提醒
    NotifyChannel   string     // email/wechat/sms
    Status          string     // pending/notified/completed
    CreatedAt       time.Time
}
```

#### 3.3.3 订阅功能

```go
type UserSubscription struct {
    ID              uint      `gorm:"primaryKey"`
    UserID          uint      `gorm:"index"`
    SubscribeType   string    // exam_type/province/city/keyword
    SubscribeValue  string
    NotifyOnNew     bool      // 新公告通知
    CreatedAt       time.Time
}
```

---

## 四、前端页面规划

### 4.1 职位中心页面

**路由：** `/positions`

**功能：**
- 左侧筛选面板（省份、城市、学历、专业大类、考试类型、是否不限专业）
- 中间职位列表（卡片式展示）
- 右侧职位详情预览
- 支持收藏职位
- 加入对比功能

**组件结构：**
```
PositionsPage/
├── PositionFilters/          # 筛选面板
│   ├── ProvinceFilter
│   ├── CityFilter
│   ├── EducationFilter
│   ├── MajorCategoryFilter
│   ├── ExamTypeFilter
│   └── QuickFilters          # 快捷筛选（不限专业、应届可报）
├── PositionList/             # 职位列表
│   └── PositionCard          # 职位卡片
├── PositionDetail/           # 职位详情预览
└── CompareBar/               # 底部对比栏
```

### 4.2 智能匹配页面

**路由：** `/match`

**功能：**
- 用户画像编辑
- 一键匹配
- 匹配结果列表（按匹配度排序）
- 匹配详情（各维度得分）

### 4.3 职位对比页面

**路由：** `/compare`

**功能：**
- 多职位并排对比
- 差异高亮显示
- AI对比总结
- 导出对比报告

### 4.4 个人中心

**路由：** `/profile`

**功能：**
- 用户画像管理
- 收藏列表
- 订阅管理
- 报考日历

---

## 五、技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                     前端 (Next.js Admin)                     │
├─────────────────────────────────────────────────────────────┤
│  职位中心  │  智能匹配  │  职位对比  │  报考日历  │  个人中心  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (Go)                        │
├─────────────────────────────────────────────────────────────┤
│   /positions  │  /match  │  /compare  │  /calendar  │ /user │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │ 爬虫服务      │   │ 匹配服务      │   │ 通知服务      │
   │ (现有)        │   │ (新增)        │   │ (新增)        │
   └──────────────┘   └──────────────┘   └──────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                    ┌──────────────────┐
                    │     MySQL        │
                    │ ┌──────────────┐ │
                    │ │ positions    │ │
                    │ │ user_profiles│ │
                    │ │ favorites    │ │
                    │ │ calendars    │ │
                    │ └──────────────┘ │
                    └──────────────────┘
```

---

## 六、优先级总结

| 优先级 | 功能 | 预计工时 | 依赖 |
|--------|------|----------|------|
| **P0** | 职位数据结构化存储 | 1周 | 无 |
| **P0** | 职位列表筛选页面 | 1周 | P0-职位存储 |
| **P1** | 用户画像系统 | 1周 | 无 |
| **P1** | 智能职位匹配 | 1.5周 | P0-职位存储, P1-用户画像 |
| **P2** | 职位对比功能 | 1周 | P0-职位存储 |
| **P2** | 收藏功能 | 0.5周 | P0-职位存储 |
| **P3** | 报考日历 | 1周 | P0-职位存储 |
| **P3** | 消息提醒 | 1周 | P3-报考日历 |

---

## 七、后续扩展

### 7.1 数据源扩展
- 接入更多招考网站（如各省人事考试网）
- 历史数据积累

### 7.2 功能扩展
- 竞争比分析（需获取报名数据）
- 进面分数线预测
- 社区交流功能

### 7.3 技术优化
- LLM解析并行度优化
- 增量更新机制
- 缓存策略优化

---

## 附录

### A. 学历匹配规则

| 职位要求 | 用户学历 | 匹配结果 |
|----------|----------|----------|
| 本科及以上 | 本科/硕士/博士 | ✅ 匹配 |
| 本科及以上 | 大专 | ❌ 不匹配 |
| 仅限硕士 | 硕士 | ✅ 匹配 |
| 仅限硕士 | 本科/博士 | ❌ 不匹配 |
| 大专及以上 | 大专/本科/硕士/博士 | ✅ 匹配 |

### B. 专业匹配规则

1. **不限专业**：所有用户都匹配
2. **指定专业**：检查用户专业是否在列表中
3. **专业大类**：检查用户专业是否属于指定大类
4. **相近专业**：使用专业相似度算法判断

### C. 年龄匹配规则

解析职位年龄要求字符串，计算用户年龄是否在范围内：
- "35周岁以下" → age < 35
- "18-35周岁" → 18 <= age <= 35
- "不限" → 所有用户匹配
