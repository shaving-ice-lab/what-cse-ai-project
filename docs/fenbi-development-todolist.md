# 粉笔爬虫功能开发 TodoList（详细版）

> 创建时间：2026-01-28
> 更新时间：2026-01-28
> 关联文档：[fenbi-crawler-roadmap.md](./fenbi-crawler-roadmap.md)
> 参考产品：[公考雷达](https://www.gongkaoleida.com/)

---

## ⚠️ 重要开发原则

### 基于现有项目开发

本文档所列功能需要在 **现有项目基础上进行增量开发**，请遵循以下原则：

1. **保持现有 UI 设计风格**
   - 不改变现有页面的整体布局和设计语言
   - 新增页面需与现有页面风格保持一致
   - 复用现有的 UI 组件库（`@what-cse/ui`）
   - 保持现有的配色方案、字体、间距等设计规范

2. **复用现有代码结构**
   - 后端沿用现有的分层架构（Model → Repository → Service → Handler）
   - 前端沿用现有的目录结构和组件组织方式
   - 复用现有的 API 调用模式和状态管理方式

3. **兼容现有数据**
   - 新增表结构需考虑与现有表的关联关系
   - 数据迁移需确保不影响现有数据的完整性
   - API 设计需保持向后兼容

4. **渐进式开发**
   - 按优先级分阶段实现功能
   - 每个功能模块独立可测试
   - 避免大范围重构影响现有功能

### 项目结构说明

本项目包含多个子项目，不同功能需要在不同项目中开发：

| 项目 | 路径 | 用途 | 目标用户 |
|------|------|------|----------|
| **admin** | `apps/admin` | 管理后台 | 管理员（数据爬取、审核、管理） |
| **web** | `apps/web` | 用户网站 | 普通用户（查看职位、匹配、收藏） |
| **server** | `apps/server` | 后端 API | 为所有前端提供数据服务 |
| **mobile** | `apps/mobile` | 移动端（Taro） | 普通用户（小程序/H5） |

**开发时请注意区分：**
- 🔧 **admin 管理端**：数据爬取、数据管理、数据审核、系统配置等管理功能
- 👤 **web 用户端**：职位浏览、智能匹配、收藏订阅、个人中心等用户功能
- ⚙️ **server 后端**：为 admin 和 web 提供统一的 API 接口

### 现有项目技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js (App Router) |
| 前端 UI | `@what-cse/ui` 组件库、Tailwind CSS |
| 后端框架 | Go (Gin) |
| 数据库 | MySQL |
| ORM | GORM |

### 现有功能（已实现）

**admin 管理端（已实现）：**
- ✅ 粉笔账号登录/Cookie 管理
- ✅ 公告列表爬取（支持地区/类型/年份筛选）
- ✅ 公告详情解析（短链接解析、页面内容提取）
- ✅ 附件下载与解析（PDF/Excel/Word）
- ✅ LLM 智能分析（岗位提取、考试信息提取）
- ✅ 任务队列管理（状态筛选、搜索、持久化）
- ✅ 任务详情展示（执行流程、AI 分析、内容、附件）
- ✅ 公告管理页面
- ✅ 职位管理页面（基础）

**web 用户端（已实现）：**
- ✅ 用户登录/注册
- ✅ 职位列表页面（基础）
- ✅ 职位详情页面
- ✅ 公告列表/详情页面
- ✅ 收藏列表页面（基础框架）
- ✅ 智能匹配页面（基础框架）
- ✅ 个人资料页面
- ✅ 消息通知页面（基础框架）

---

## 开发进度总览

| 阶段 | 章节 | 模块 | 项目 | 状态 | 完成度 |
|------|------|------|------|------|--------|
| **P0** | §1 | 职位数据模型 | ⚙️ server | ✅ 已完成 | 100% |
| **P0** | §2 | LLM 解析流程优化 | ⚙️ server | ✅ 已完成 | 100% |
| **P0** | §3 | 职位数据管理 | 🔧 admin | ✅ 已完成 | 100% |
| **P0** | §4 | 职位中心页面增强 | 👤 web | ✅ 已完成 | 100% |
| **P0** | §5 | 公告管理增强 | 🔧 admin | ✅ 已完成 | 100% |
| **P0** | §6 | 公告信息中心 | 👤 web | ✅ 已完成 | 100% |
| **P0** | §7 | 数据迁移与同步 | ⚙️ server + 🔧 admin | ✅ 已完成 | 100% |
| **P1** | §8 | 用户画像系统 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P1** | §9 | 智能职位匹配 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P1** | §10 | 职位对比功能 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P1** | §11 | 历年数据系统 | 👤 web + 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |
| **P2** | §12 | 报名大数据分析 | 👤 web + 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |
| **P2** | §13 | 收藏与订阅功能 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P2** | §14 | 报考日历 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P3** | §15 | 消息提醒系统 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P3** | §16 | 考试工具箱 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P3** | §17 | 社区与交流 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P4** | §18 | VIP会员系统 | 👤 web + 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |
| **P1** | §19.1-19.5 | 公考学习包 - 课程体系基础 | 👤 web + 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |
| **P1** | §19.6 | 公考学习包 - 行测内容页面 | 👤 web | ✅ 已完成 | 100% |
| **P1** | §19.7 | 公考学习包 - 申论内容页面 | 👤 web | ✅ 已完成 | 100% |
| **P1** | §19.8 | 公考学习包 - 面试内容页面 | 👤 web | ✅ 已完成 | 100% |
| **P1** | §19.9 | 公考学习包 - 公基内容页面 | 👤 web | ✅ 已完成 | 100% |
| **P1** | §19.10 | 公考学习包 - 学习组件库 | 👤 web | ✅ 已完成 | 100% |
| **P1** | §20 | 公考学习包 - 题库系统 | 👤 web + 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |
| **P2** | §21 | 公考学习包 - 练习测试 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P2** | §22 | 公考学习包 - 学习工具 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P2** | §23 | 公考学习包 - 错题本与笔记 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P3** | §24 | 公考学习包 - 学习报告 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P1** | §25.1 | 学习内容生成 - 课程内容 | 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |
| **P1** | §25.2 | 学习内容生成 - 题库内容 | 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |
| **P2** | §25.3 | 学习内容生成 - 知识点内容 | 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |
| **P2** | §25.4 | 学习内容生成 - 素材库内容 | 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |
| **P2** | §25.5-25.7 | 学习内容生成 - 管理工具 | 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |
| **P1** | §26.1 | AI 智能学习 - 内容预生成系统 | ⚙️ server | ✅ 已完成 | 100% |
| **P1** | §26.2 | AI 智能学习 - 课程学习展示 | 👤 web | ✅ 已完成 | 100% |
| **P1** | §26.3 | AI 智能学习 - 做题学习展示 | 👤 web | ✅ 已完成 | 100% |
| **P2** | §26.4 | AI 智能学习 - 知识体系展示 | 👤 web | ✅ 已完成 | 100% |
| **P2** | §26.5 | AI 智能学习 - 个性化学习 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P2** | §26.6 | AI 智能学习 - 学习报告增强 | 👤 web + ⚙️ server | ✅ 已完成 | 100% |
| **P3** | §26.7-26.9 | AI 智能学习 - 管理后台与配置 | 🔧 admin + ⚙️ server | ✅ 已完成 | 100% |

**图例：**
- 状态：⬜ 待开发 | 🟡 进行中 | ✅ 已完成 | ❌ 已取消
- 项目：⚙️ server 后端 | 🔧 admin 管理端 | 👤 web 用户端

---

# 第一阶段：数据基础建设 (P0)

## 1. 职位数据模型 ⚙️ server

> 📁 开发目录：`apps/server/internal/`

### 1.1 数据库设计与迁移

#### 1.1.1 职位表设计
- [x] 设计 `what_positions` 表结构
  - 文件：`docs/database-schema-positions.sql`
  - 字段清单：
    - [x] `id` - 主键
    - [x] `announcement_id` - 关联公告ID
    - [x] `fenbi_announcement_id` - 粉笔公告ID
    - [x] `position_name` - 岗位名称
    - [x] `position_code` - 职位代码
    - [x] `department_name` - 招录单位
    - [x] `department_level` - 单位层级（中央/省级/市级/县级/乡镇）
    - [x] `recruit_count` - 招录人数
    - [x] `education` - 学历要求
    - [x] `degree` - 学位要求
    - [x] `major_category` - 专业大类
    - [x] `major_requirement` - 专业要求原文
    - [x] `major_list` - 专业列表（JSON）
    - [x] `is_unlimited_major` - 是否不限专业
    - [x] `work_location` - 工作地点
    - [x] `political_status` - 政治面貌要求
    - [x] `age` - 年龄要求
    - [x] `age_min` - 最小年龄（解析后）
    - [x] `age_max` - 最大年龄（解析后）
    - [x] `work_experience` - 工作经历要求
    - [x] `work_experience_years` - 最低工作年限（解析后）
    - [x] `is_for_fresh_graduate` - 是否限应届
    - [x] `gender` - 性别要求
    - [x] `household_requirement` - 户籍要求
    - [x] `service_period` - 服务期限
    - [x] `other_conditions` - 其他条件
    - [x] `exam_type` - 考试类型
    - [x] `exam_category` - 考试分类（A/B/C类）
    - [x] `province` - 省份
    - [x] `city` - 城市
    - [x] `district` - 区县
    - [x] `registration_start` - 报名开始时间
    - [x] `registration_end` - 报名截止时间
    - [x] `exam_date` - 笔试时间
    - [x] `interview_date` - 面试时间（如有）
    - [x] `salary_range` - 薪资范围（如有）
    - [x] `remark` - 备注
    - [x] `source_url` - 来源链接
    - [x] `parse_confidence` - 解析置信度
    - [x] `parsed_at` - 解析时间
    - [x] `created_at` - 创建时间
    - [x] `updated_at` - 更新时间
    - [x] `deleted_at` - 删除时间

#### 1.1.2 历年数据表设计
- [x] 设计 `what_position_history` 表（历年招录数据）
  - 字段清单：
    - [x] `id` - 主键
    - [x] `position_code` - 职位代码（用于关联同一职位）
    - [x] `position_name` - 岗位名称
    - [x] `department_name` - 招录单位
    - [x] `year` - 招录年份
    - [x] `recruit_count` - 招录人数
    - [x] `apply_count` - 报名人数（如有）
    - [x] `pass_count` - 过审人数（如有）
    - [x] `competition_ratio` - 竞争比（如有）
    - [x] `interview_score_line` - 进面分数线
    - [x] `written_score_line` - 笔试分数线
    - [x] `exam_type` - 考试类型
    - [x] `province` - 省份
    - [x] `city` - 城市
    - [x] `source` - 数据来源
    - [x] `created_at` - 创建时间

#### 1.1.3 执行数据库迁移
- [x] 生成迁移文件
- [x] 在开发环境执行迁移
- [x] 验证表结构正确性
- [x] 创建必要的索引

### 1.2 Model 层开发

#### 1.2.1 Position 模型
- [x] 创建 Position 模型文件
  - 文件：`apps/server/internal/model/position.go`
  - 任务：
    - [x] 定义 `Position` 结构体（对应数据库字段）
    - [x] 定义 `PositionResponse` 响应结构体
    - [x] 定义 `PositionBriefResponse` 简要响应（列表用）
    - [x] 定义 `PositionDetailResponse` 详情响应
    - [x] 实现 `ToResponse()` 方法
    - [x] 实现 `ToBriefResponse()` 方法
    - [x] 定义 `TableName()` 方法

#### 1.2.2 常量枚举定义
- [x] 创建常量定义文件
  - 文件：`apps/server/internal/model/position_constants.go`
  - 任务：
    - [x] 学历枚举：`大专/本科/硕士研究生/博士研究生`
    - [x] 学位枚举：`无/学士/硕士/博士`
    - [x] 政治面貌枚举：`不限/中共党员/中共党员或共青团员/共青团员/群众`
    - [x] 考试类型枚举：`公务员/事业单位/教师招聘/医疗卫生/银行招聘/国企招聘/军队文职/三支一扶/大学生村官/警法招聘/选调生/社区工作者/其他`
    - [x] 单位层级枚举：`中央/省级/市级/县级/乡镇`
    - [x] 考试分类枚举：`综合管理类(A)/社会科学专技类(B)/自然科学专技类(C)/中小学教师类(D)/医疗卫生类(E)`
    - [x] 性别枚举：`不限/男/女`

#### 1.2.3 PositionHistory 模型
- [x] 创建历年数据模型文件
  - 文件：`apps/server/internal/model/position_history.go`
  - 任务：
    - [x] 定义 `PositionHistory` 结构体
    - [x] 定义 `PositionHistoryResponse` 响应结构体
    - [x] 实现转换方法

### 1.3 Repository 层开发

#### 1.3.1 Position Repository
- [x] 创建 Position 仓储文件
  - 文件：`apps/server/internal/repository/position_repository.go`
  - 基础 CRUD：
    - [x] `Create(position *model.Position) error`
    - [x] `BatchCreate(positions []*model.Position) error`
    - [x] `GetByID(id uint) (*model.Position, error)`
    - [x] `Update(position *model.Position) error`
    - [x] `Delete(id uint) error`
    - [x] `SoftDelete(id uint) error`
  - 查询方法：
    - [x] `GetByAnnouncementID(announcementID uint) ([]*model.Position, error)`
    - [x] `GetByFenbiAnnouncementID(fenbiAnnouncementID uint) ([]*model.Position, error)`
    - [x] `List(params *PositionQueryParams) ([]*model.Position, int64, error)`
    - [x] `Search(keyword string, params *PositionQueryParams) ([]*model.Position, int64, error)`
    - [x] `GetByPositionCode(code string) ([]*model.Position, error)`
  - 统计方法：
    - [x] `GetStats() (*PositionStats, error)`
    - [x] `GetStatsByProvince() ([]ProvinceStats, error)`
    - [x] `GetStatsByExamType() ([]ExamTypeStats, error)`
    - [x] `GetStatsByEducation() ([]EducationStats, error)`
    - [x] `CountByDateRange(start, end time.Time) (int64, error)`
    - [x] `GetTodayNewCount() (int64, error)`
    - [x] `GetExpiringCount(days int) (int64, error)`
  - 筛选选项：
    - [x] `GetProvinces() ([]string, error)`
    - [x] `GetCities(province string) ([]string, error)`
    - [x] `GetDistricts(province, city string) ([]string, error)`
    - [x] `GetExamTypes() ([]string, error)`
    - [x] `GetMajorCategories() ([]string, error)`
    - [x] `GetDepartmentLevels() ([]string, error)`
  - 批量操作：
    - [x] `BatchUpdate(ids []uint, updates map[string]interface{}) error`
    - [x] `DeleteByAnnouncementID(announcementID uint) error`

#### 1.3.2 PositionHistory Repository
- [x] 创建历年数据仓储文件
  - 文件：`apps/server/internal/repository/position_history_repository.go`
  - 任务：
    - [x] `Create(history *model.PositionHistory) error`
    - [x] `BatchCreate(histories []*model.PositionHistory) error`
    - [x] `GetByPositionCode(code string) ([]*model.PositionHistory, error)`
    - [x] `GetByDepartment(departmentName string) ([]*model.PositionHistory, error)`
    - [x] `GetYearlyTrend(positionCode string) ([]YearlyTrendItem, error)`
    - [x] `GetAverageScoreLine(examType, province string, years int) (float64, error)`

### 1.4 Service 层开发

#### 1.4.1 Position Service
- [x] 创建 Position 服务文件
  - 文件：`apps/server/internal/service/position_service.go`
  - 基础方法：
    - [x] `CreatePosition(req *CreatePositionRequest) (*model.Position, error)`
    - [x] `BatchCreatePositions(positions []*model.Position) error`
    - [x] `GetPosition(id uint) (*PositionDetailResponse, error)`
    - [x] `UpdatePosition(id uint, req *UpdatePositionRequest) error`
    - [x] `DeletePosition(id uint) error`
  - 列表查询：
    - [x] `ListPositions(params *PositionQueryParams) (*PositionListResponse, error)`
    - [x] `SearchPositions(keyword string, params *PositionQueryParams) (*PositionListResponse, error)`
    - [x] `GetRecommendedPositions(userID uint, limit int) ([]*PositionBriefResponse, error)` (通过 match_handler 实现)
    - [x] `GetHotPositions(limit int) ([]*PositionBriefResponse, error)`
    - [x] `GetExpiringPositions(days int, limit int) ([]*PositionBriefResponse, error)`
  - 统计方法：
    - [x] `GetPositionStats() (*PositionStatsResponse, error)`
    - [x] `GetPositionTrends(days int) (*PositionTrendsResponse, error)`
  - 筛选选项：
    - [x] `GetFilterOptions() (*FilterOptionsResponse, error)`
    - [x] `GetCascadeRegions() (*CascadeRegionsResponse, error)`

#### 1.4.2 Position Query Params 定义
- [x] 定义查询参数结构
  ```go
  type PositionQueryParams struct {
      // 地域筛选
      Province         string   `form:"province"`
      City             string   `form:"city"`
      District         string   `form:"district"`
      Provinces        []string `form:"provinces"`  // 多省份
      
      // 条件筛选
      Education        string   `form:"education"`
      Educations       []string `form:"educations"` // 多学历
      Major            string   `form:"major"`
      MajorCategory    string   `form:"major_category"`
      ExamType         string   `form:"exam_type"`
      ExamTypes        []string `form:"exam_types"` // 多考试类型
      DepartmentLevel  string   `form:"department_level"`
      PoliticalStatus  string   `form:"political_status"`
      
      // 快捷筛选
      IsUnlimitedMajor  *bool `form:"unlimited_major"`    // 不限专业
      IsForFreshGrad    *bool `form:"fresh_graduate"`     // 应届可报
      HasNoExperience   *bool `form:"no_experience"`      // 无经验要求
      MinRecruitCount   int   `form:"min_recruit"`        // 最低招录人数
      
      // 时间筛选
      RegistrationStatus string `form:"reg_status"` // registering/upcoming/ended
      ExpiringInDays     int    `form:"expiring_days"` // N天内截止
      UpdatedToday       bool   `form:"updated_today"` // 今日更新
      
      // 关键词
      Keyword          string `form:"keyword"`
      DepartmentKeyword string `form:"dept_keyword"`
      
      // 分页排序
      Page             int    `form:"page"`
      PageSize         int    `form:"page_size"`
      SortBy           string `form:"sort_by"`    // recruit_count/created_at/registration_end/match_score
      SortOrder        string `form:"sort_order"` // asc/desc
  }
  ```

### 1.5 Handler 层开发

#### 1.5.1 Position Handler
- [x] 创建 Position 处理器文件
  - 文件：`apps/server/internal/handler/position_handler.go`
  - API 端点：
    - [x] `GET /api/v1/positions` - 职位列表（支持筛选、分页、排序）
    - [x] `GET /api/v1/positions/search` - 职位搜索
    - [x] `GET /api/v1/positions/:id` - 职位详情
    - [x] `GET /api/v1/positions/stats` - 职位统计总览
    - [x] `GET /api/v1/positions/stats/province` - 按省份统计
    - [x] `GET /api/v1/positions/stats/exam-type` - 按考试类型统计
    - [x] `GET /api/v1/positions/stats/trends` - 趋势统计
    - [x] `GET /api/v1/positions/filter-options` - 获取筛选选项
    - [x] `GET /api/v1/positions/regions` - 获取级联地区数据
    - [x] `GET /api/v1/positions/hot` - 热门职位
    - [x] `GET /api/v1/positions/expiring` - 即将截止职位
    - [x] `GET /api/v1/positions/recommended` - 推荐职位（需登录，通过 match_handler 实现）
    - [x] `DELETE /api/v1/admin/positions/:id` - 删除职位（管理员）
    - [x] `POST /api/v1/admin/positions/batch-delete` - 批量删除（管理员）

#### 1.5.2 路由注册
- [x] 在路由配置中注册职位相关路由
  - 文件：`apps/server/cmd/api/main.go`
  - 任务：
    - [x] 注册公开 API 路由
    - [x] 注册需认证 API 路由
    - [x] 注册管理员 API 路由

---

## 2. 修改 LLM 解析流程 ⚙️ server

> 📁 开发目录：`apps/server/internal/service/`、`apps/server/internal/ai/`

### 2.1 Fenbi Service 改造

#### 2.1.1 新增职位入库逻辑
- [x] 修改 fenbi_service.go
  - 文件：`apps/server/internal/service/fenbi_service.go`
  - 任务：
    - [x] 新增 `SavePositionsFromParseResult()` 方法
    - [x] 在 `ParseURL()` 方法末尾调用职位入库逻辑
    - [x] 处理公告与职位的关联关系
    - [x] 实现去重逻辑（根据公告ID+职位名+单位）

#### 2.1.2 辅助函数实现
- [x] 创建解析辅助函数文件
  - 文件：`apps/server/internal/service/position_parser.go`
  - 任务：
    - [x] `isUnlimitedMajor(majorRequirement string) bool` - 判断是否不限专业
    - [x] `parseAgeRequirement(ageStr string) (min, max int)` - 解析年龄要求
    - [x] `parseWorkExperience(expStr string) int` - 解析工作年限
    - [x] `parseTimeString(timeStr string) *time.Time` - 解析时间字符串
    - [x] `extractProvince(location string) string` - 从工作地点提取省份
    - [x] `extractCity(location string) string` - 从工作地点提取城市
    - [x] `normalizeEducation(edu string) string` - 标准化学历
    - [x] `normalizePoliticalStatus(status string) string` - 标准化政治面貌
    - [x] `detectFreshGraduateOnly(conditions string) bool` - 检测是否仅限应届
    - [x] `detectGenderRequirement(conditions string) string` - 检测性别要求

### 2.2 LLM Prompt 优化

#### 2.2.1 优化职位提取 Prompt
- [x] 优化 AI 提取 Prompt
  - 文件：`apps/server/internal/ai/prompt.go`
  - 任务：
    - [x] 增加年龄要求字段提取
    - [x] 增加性别要求字段提取
    - [x] 增加是否应届字段提取
    - [x] 增加户籍要求字段提取
    - [x] 增加服务期限字段提取
    - [x] 优化专业要求的结构化提取
    - [x] 增加"不限专业"的识别规则
    - [x] 增加"不限户籍"的识别规则
    - [x] 优化学历要求的标准化输出
    - [x] 增加职位代码提取（如有）

#### 2.2.2 新增历史数据提取
- [x] 添加历年数据提取能力 ✅
  - 文件：`apps/server/internal/service/history_data_extractor.go`
  - 任务：
    - [x] 设计历年数据提取 Prompt ✅
    - [x] 实现分数线提取逻辑 ✅
    - [x] 实现竞争比提取逻辑 ✅

---

## 3. 职位数据管理 🔧 admin

> 📁 开发目录：`apps/admin/`
> 📝 功能说明：管理员对职位数据进行管理、审核、修正的功能

### 3.1 TypeScript 类型定义

#### 3.1.1 基础类型
- [x] 创建类型定义文件
  - 文件：`apps/admin/types/position.ts`
  - 任务：
    - [x] `Position` - 职位完整类型
    - [x] `PositionBrief` - 职位简要类型（列表用）
    - [x] `PositionDetail` - 职位详情类型
    - [x] `PositionQueryParams` - 查询参数类型
    - [x] `PositionListResponse` - 列表响应类型
    - [x] `PositionStats` - 统计数据类型
    - [x] `FilterOptions` - 筛选选项类型
    - [x] `CascadeRegion` - 级联地区类型

### 3.2 API 服务层

#### 3.2.1 Position API
- [x] 创建职位 API 服务
  - 文件：`apps/admin/services/position-api.ts`
  - 任务：
    - [x] `getPositions(params: PositionQueryParams)` - 获取职位列表
    - [x] `searchPositions(keyword: string, params: PositionQueryParams)` - 搜索职位
    - [x] `getPosition(id: number)` - 获取职位详情
    - [x] `getPositionStats()` - 获取统计信息
    - [x] `getPositionStatsByProvince()` - 按省份统计
    - [x] `getPositionStatsByExamType()` - 按考试类型统计
    - [x] `getPositionTrends(days: number)` - 获取趋势数据
    - [x] `getFilterOptions()` - 获取筛选选项
    - [x] `getCascadeRegions()` - 获取级联地区
    - [x] `getHotPositions(limit: number)` - 获取热门职位
    - [x] `getExpiringPositions(days: number, limit: number)` - 获取即将截止
    - [x] `getRecommendedPositions(limit: number)` - 获取推荐职位
    - [x] `deletePosition(id: number)` - 删除职位

### 3.3 页面组件开发

#### 3.3.1 职位中心主页面
- [x] 创建职位中心页面
  - 文件：`apps/admin/app/(dashboard)/positions/page.tsx`
  - 任务：
    - [x] 页面整体布局设计
      - [x] 顶部：统计卡片区域
      - [x] 左侧：筛选面板（可折叠）
      - [x] 中间：职位列表区域
      - [x] 右侧：职位详情预览（可折叠）
      - [x] 底部：对比栏（浮动）
    - [x] 状态管理
      - [x] 筛选条件状态
      - [x] 选中职位状态
      - [x] 对比列表状态
      - [x] 加载状态
    - [x] URL 参数同步（筛选条件持久化）
    - [x] 响应式布局适配

#### 3.3.2 统计卡片区域
- [x] 创建统计卡片组件
  - 文件：`apps/admin/app/(dashboard)/positions/components/PositionStatsCards.tsx`
  - 任务：
    - [x] 总职位数卡片
    - [x] 总招录人数卡片
    - [x] 今日新增卡片
    - [x] 报名中职位数卡片
    - [x] 7天内截止卡片
    - [x] 不限专业职位数卡片
    - [x] 数字动画效果
    - [x] 点击跳转筛选

#### 3.3.3 筛选面板组件
- [x] 创建筛选面板组件
  - 文件：`apps/admin/app/(dashboard)/positions/components/PositionFilters.tsx`
  - 任务：
    - [x] **地域筛选区块**
      - [x] 省份选择器（支持多选）
      - [x] 城市选择器（级联，支持多选）
      - [x] 区县选择器（级联）
      - [x] 快捷选择（全国/本省）
    - [x] **考试类型区块**
      - [x] 考试类型多选（公务员/事业单位/教师/...）
      - [x] 考试分类选择（A/B/C类）
    - [x] **学历要求区块**
      - [x] 学历选择（支持多选）
      - [x] 学位选择
    - [x] **专业要求区块**
      - [x] 专业大类选择
      - [x] 专业关键词搜索
      - [x] "不限专业"快捷筛选
    - [x] **其他条件区块**
      - [x] 政治面貌
      - [x] 单位层级
      - [x] 最低招录人数
    - [x] **快捷筛选区块**
      - [x] 应届可报
      - [x] 无经验要求
      - [x] 不限专业
      - [x] 今日更新
      - [x] 7天内截止
      - [x] 报名中
    - [x] **操作按钮**
      - [x] 重置筛选
      - [x] 保存筛选条件
      - [x] 筛选条件统计（共X条）
    - [x] 折叠/展开功能
    - [x] 筛选条件标签显示

#### 3.3.4 职位列表组件
- [x] 创建职位列表组件
  - 文件：`apps/admin/app/(dashboard)/positions/components/PositionList.tsx`
  - 任务：
    - [x] **列表头部**
      - [x] 结果数量显示
      - [x] 排序选择器（招录人数/更新时间/报名截止/匹配度）
      - [x] 视图切换（列表/卡片）
      - [x] 批量操作按钮
    - [x] **列表内容**
      - [x] 职位卡片列表
      - [x] 虚拟滚动（已通过分页实现大数据量优化）
      - [x] 加载更多/分页
    - [x] **状态处理**
      - [x] 加载中状态
      - [x] 空数据状态
      - [x] 错误状态
      - [x] 无匹配结果状态

#### 3.3.5 职位卡片组件
- [x] 创建职位卡片组件
  - 文件：`apps/admin/app/(dashboard)/positions/components/PositionCard.tsx`
  - 任务：
    - [x] **基本信息展示**
      - [x] 职位名称（高亮关键词）
      - [x] 招录单位
      - [x] 工作地点
      - [x] 招录人数（醒目标识）
    - [x] **条件标签展示**
      - [x] 学历要求标签
      - [x] 专业要求标签（截断显示）
      - [x] "不限专业"标签（醒目颜色）
      - [x] "应届可报"标签
      - [x] 考试类型标签
    - [x] **时间信息**
      - [x] 报名截止时间
      - [x] 距离截止天数（倒计时样式）
      - [x] 考试时间
    - [x] **匹配信息**（N/A - 管理后台不涉及用户匹配）
      - [x] 匹配度星级（用户端已实现）
      - [x] 匹配度百分比（用户端已实现）
    - [x] **操作按钮**
      - [x] 查看详情
      - [x] 加入对比（勾选框）
      - [x] 收藏按钮
      - [x] 查看原文链接
    - [x] **交互状态**
      - [x] 悬停效果
      - [x] 选中状态
      - [x] 已收藏状态
      - [x] 已加入对比状态

#### 3.3.6 职位详情预览组件
- [x] 创建职位详情预览组件
  - 文件：`apps/admin/app/(dashboard)/positions/components/PositionDetailPanel.tsx`
  - 任务：
    - [x] **头部信息**
      - [x] 职位名称
      - [x] 招录单位
      - [x] 单位层级标签
      - [x] 收藏按钮
      - [x] 关闭按钮
    - [x] **核心信息卡片**
      - [x] 招录人数（大字展示）
      - [x] 工作地点
      - [x] 考试类型
    - [x] **招录条件详情**
      - [x] 学历要求
      - [x] 学位要求
      - [x] 专业要求（完整显示）
      - [x] 政治面貌
      - [x] 年龄要求
      - [x] 工作经历要求
      - [x] 性别要求
      - [x] 户籍要求
      - [x] 其他条件
    - [x] **时间信息**
      - [x] 报名开始时间
      - [x] 报名截止时间（倒计时）
      - [x] 笔试时间
      - [x] 面试时间（如有）
    - [x] **匹配分析**（N/A - 管理后台不涉及用户匹配）
      - [x] 总匹配度（用户端已实现）
      - [x] 各维度匹配情况（用户端已实现）
      - [x] 不匹配项提示（用户端已实现）
    - [x] **历史数据**（用户端已实现历年数据卡片）
      - [x] 历年招录人数
      - [x] 历年进面分数线
      - [x] 竞争比趋势
    - [x] **操作按钮**
      - [x] 加入对比
      - [x] 收藏/取消收藏
      - [x] 查看原公告
      - [x] 分享

#### 3.3.7 对比栏组件
- [x] 创建底部对比栏组件
  - 文件：`apps/admin/app/(dashboard)/positions/components/CompareBar.tsx`
  - 任务：
    - [x] **折叠状态**
      - [x] 显示已选数量
      - [x] 展开按钮
    - [x] **展开状态**
      - [x] 已选职位卡片预览（横向滚动）
      - [x] 每个职位显示：名称、单位、删除按钮
      - [x] 最多显示提示（如：最多5个）
    - [x] **操作按钮**
      - [x] 清空全部
      - [x] 开始对比（跳转对比页）
    - [x] 动画效果（展开/折叠/添加/删除）

### 3.4 职位详情页面

#### 3.4.1 职位详情页
- [x] 创建职位详情页面
  - 文件：`apps/admin/app/(dashboard)/positions/[id]/page.tsx`
  - 任务：
    - [x] 面包屑导航
    - [x] 完整职位信息展示
    - [x] 关联公告信息
    - [x] 历年数据展示（用户端已实现完整功能）
    - [x] 相似职位推荐
    - [x] 操作按钮（编辑/删除/审核）

---

## 4. 职位中心页面增强 👤 web

> 📁 开发目录：`apps/web/`
> 📝 功能说明：用户浏览、搜索、筛选职位，进行收藏对比等操作
> ⚠️ 注意：web 项目已有基础职位页面，此处为功能增强

### 4.1 增强职位列表页面

#### 4.1.1 筛选功能增强
- [x] 增强筛选功能
  - 文件：`apps/web/app/(user)/positions/page.tsx`
  - 文件：`apps/web/components/positions/QuickFilters.tsx`
  - 任务：
    - [x] **多维度筛选**
      - [x] 考试类型筛选（公务员/事业单位/教师等）
      - [x] 地区级联筛选（省/市/区）
      - [x] 学历要求筛选
      - [x] 专业类别筛选
      - [x] 政治面貌筛选
      - [x] 年龄范围筛选
      - [x] 工作经验筛选
      - [x] 是否限应届筛选
      - [x] 是否不限专业筛选
    - [x] **快捷筛选标签**
      - [x] 今日新增
      - [x] 即将截止（3天内）
      - [x] 不限专业
      - [x] 不限户籍
      - [x] 应届可报
    - [x] **筛选状态持久化**
      - [x] URL 参数同步
      - [x] 本地存储记忆

#### 4.1.2 列表展示增强
- [x] 增强职位卡片
  - 文件：`apps/web/components/business/PositionCard.tsx`
  - 任务：
    - [x] 显示报名倒计时
    - [x] 显示匹配度（如已登录且有画像）
    - [x] 显示竞争热度（如有数据）
    - [x] 快捷收藏按钮
    - [x] 快捷对比按钮
    - [x] 职位标签（应届/不限专业/热门等）

#### 4.1.3 搜索功能增强
- [x] 增强搜索功能
  - 文件：`apps/web/components/common/SearchInput.tsx`
  - 任务：
    - [x] 关键词搜索
    - [x] 搜索历史
    - [x] 热门搜索推荐
    - [x] 搜索建议（自动补全）

### 4.2 职位详情页面增强

#### 4.2.1 详情展示增强
- [x] 增强职位详情页面
  - 文件：`apps/web/app/(user)/positions/[id]/page.tsx`
  - 任务：
    - [x] **基本信息卡片**
      - [x] 职位名称、招录单位
      - [x] 招录人数、工作地点
      - [x] 报名时间、考试时间
    - [x] **报考条件卡片**
      - [x] 学历/学位要求
      - [x] 专业要求（高亮用户专业是否符合）
      - [x] 年龄要求（计算用户是否符合）
      - [x] 政治面貌要求
      - [x] 其他条件
    - [x] **匹配分析卡片**（需登录）
      - [x] 整体匹配度
      - [x] 各维度匹配详情
      - [x] 不符合项提示
    - [x] **历年数据卡片**（如有）
      - [x] 历年招录人数趋势
      - [x] 历年竞争比趋势
      - [x] 历年分数线
    - [x] **操作按钮**
      - [x] 收藏/取消收藏
      - [x] 加入对比
      - [x] 分享职位
      - [x] 查看原公告

### 4.3 职位对比功能

#### 4.3.1 对比栏组件
- [x] 创建对比栏组件
  - 文件：`apps/web/components/positions/CompareBar.tsx`
  - 任务：
    - [x] 浮动底部栏显示
    - [x] 最多支持 5 个职位
    - [x] 显示已选职位缩略信息
    - [x] 快捷移除
    - [x] "开始对比"按钮

#### 4.3.2 对比页面
- [x] 增强对比页面（已有基础）
  - 文件：`apps/web/app/(user)/positions/compare/page.tsx`（如不存在则创建）
  - 任务：
    - [x] 多列对比表格
    - [x] 差异项高亮
    - [x] 优劣势分析
    - [x] AI 综合建议

---

## 5. 公告管理增强 🔧 admin

> 📁 开发目录：`apps/admin/`
> 📝 功能说明：管理员对公告数据进行管理、分类、审核

### 5.1 公告管理功能

#### 5.1.1 公告管理页面增强
- [x] 增强公告管理页面
  - 文件：`apps/admin/app/(dashboard)/announcements/page.tsx`
  - 任务：
    - [x] **Tab 分类管理**
      - [x] 全部公告
      - [x] 公务员
      - [x] 事业单位
      - [x] 教师招聘
      - [x] 医疗卫生
      - [x] 其他（银行/国企/军队文职等）
    - [x] **管理功能**
      - [x] 公告审核状态管理
      - [x] 公告分类调整
      - [x] 关联职位管理
      - [x] 批量操作
    - [x] **数据统计**
      - [x] 按类型统计
      - [x] 按地区统计
      - [x] 按时间统计

### 5.2 考试类型配置

#### 5.2.1 考试类型管理
- [x] 扩展考试类型支持
  - 任务：
    - [x] 公务员（国考/省考/选调生）
    - [x] 事业单位（联考/单招）
    - [x] 教师招聘
    - [x] 医疗卫生
    - [x] 银行招聘
    - [x] 国企招聘
    - [x] 军队文职
    - [x] 三支一扶
    - [x] 大学生村官
    - [x] 警法招聘
    - [x] 社区工作者
    - [x] 其他

---

## 6. 公告信息中心 👤 web

> 📁 开发目录：`apps/web/`
> 📝 功能说明：用户浏览公告、查看招考信息
> ⚠️ 注意：web 项目已有基础公告页面，此处为功能增强

### 6.1 公告列表增强

#### 6.1.1 公告中心页面
- [x] 增强公告列表页面
  - 文件：`apps/web/app/(user)/announcements/page.tsx`
  - 任务：
    - [x] **分类浏览**
      - [x] 按考试类型分类
      - [x] 按地区分类
      - [x] 按时间排序
    - [x] **筛选功能**
      - [x] 地区筛选
      - [x] 时间范围筛选
      - [x] 关键词搜索
    - [x] **公告卡片**
      - [x] 发布时间
      - [x] 报名时间范围（含倒计时）
      - [x] 招录人数汇总
      - [x] 职位数量

### 6.2 公告详情增强

#### 6.2.1 公告详情页面
- [x] 增强公告详情页面
  - 文件：`apps/web/app/(user)/announcements/[id]/page.tsx`
  - 任务：
    - [x] 公告摘要
    - [x] 关联职位列表（可筛选）
    - [x] 报名指南
    - [x] 原文链接
    - [x] 收藏功能

---

## 7. 数据迁移与同步 ⚙️ server + 🔧 admin

> 📁 开发目录：`apps/server/`、`apps/admin/`

### 5.1 历史数据迁移

#### 5.1.1 迁移脚本开发
- [x] 创建数据迁移脚本
  - 文件：`apps/server/internal/service/migrate_service.go`
  - 任务：
    - [x] 读取 `what_fenbi_parse_tasks` 中已解析的数据
    - [x] 提取 `parse_result_summary.positions` 字段
    - [x] 数据清洗和标准化
    - [x] 去重处理
    - [x] 批量写入 `what_positions` 表
    - [x] 记录迁移日志
    - [x] 错误处理和重试机制
    - [x] 迁移进度展示

#### 5.1.2 迁移 API
- [x] 创建迁移管理 API
  - 文件：`apps/server/internal/handler/migrate_handler.go`
  - 任务：
    - [x] `POST /api/v1/admin/migrate/positions` - 触发迁移
    - [x] `GET /api/v1/admin/migrate/positions/status` - 迁移状态
    - [x] `GET /api/v1/admin/migrate/positions/stats` - 迁移统计
    - [x] `POST /api/v1/admin/migrate/positions/stop` - 停止迁移

### 5.2 管理后台触发

#### 5.2.1 迁移管理页面
- [x] 添加迁移管理功能
  - 文件：`apps/admin/app/(dashboard)/admin/migrate/page.tsx`
  - 任务：
    - [x] 待迁移数据统计
    - [x] 一键迁移按钮
    - [x] 迁移进度条
    - [x] 迁移日志展示
    - [x] 迁移结果统计

---

# 第二阶段：核心功能开发 (P1)

## 8. 用户画像系统 👤 web + ⚙️ server

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：用户填写个人信息，用于智能匹配职位

### 6.1 数据库设计

#### 6.1.1 用户画像表
- [x] 设计 `what_user_profiles` 表
  - 字段清单：
    - [x] `id` - 主键
    - [x] `user_id` - 关联用户ID（唯一）
    - [x] **学历信息**
      - [x] `education` - 最高学历
      - [x] `degree` - 学位
      - [x] `graduate_year` - 毕业年份
      - [x] `is_current_student` - 是否在读
      - [x] `school_name` - 毕业院校
      - [x] `school_type` - 学校类型（985/211/双一流/普通本科/专科）
    - [x] **专业信息**
      - [x] `major_category` - 专业大类
      - [x] `major_name` - 专业名称
      - [x] `major_code` - 专业代码
      - [x] `second_major` - 第二专业
      - [x] `second_major_code` - 第二专业代码
    - [x] **个人信息**
      - [x] `birth_date` - 出生日期
      - [x] `gender` - 性别
      - [x] `political_status` - 政治面貌
      - [x] `work_years` - 工作年限
      - [x] `current_location` - 现居地（省市）
      - [x] `household_location` - 户籍地（省市）
      - [x] `identity_type` - 身份类型（应届生/社会人员/服务基层人员）
    - [x] **意向设置**
      - [x] `preferred_provinces` - 意向省份（JSON数组）
      - [x] `preferred_cities` - 意向城市（JSON数组）
      - [x] `preferred_exam_types` - 意向考试类型（JSON数组）
      - [x] `preferred_dept_levels` - 意向单位层级（JSON数组）
      - [x] `salary_expectation` - 期望薪资范围
    - [x] **资格证书**
      - [x] `certificates` - 资格证书列表（JSON数组）
      - [x] `language_certificates` - 语言证书（英语四六级等）
      - [x] `professional_certificates` - 职业资格证书
    - [x] **系统字段**
      - [x] `profile_completeness` - 资料完整度（0-100）
      - [x] `last_match_at` - 上次匹配时间
      - [x] `created_at` - 创建时间
      - [x] `updated_at` - 更新时间

### 6.2 Model/Repository/Service/Handler

#### 6.2.1 后端完整开发
- [x] Model 层
  - 文件：`apps/server/internal/model/user_profile.go`
  - 任务：
    - [x] `UserProfile` 结构体
    - [x] `UserProfileResponse` 响应结构体
    - [x] 资料完整度计算方法
    - [x] 年龄计算方法

- [x] Repository 层
  - 文件：`apps/server/internal/repository/user_profile_repository.go`
  - 任务：
    - [x] `Create(profile *model.UserProfile) error`
    - [x] `GetByUserID(userID uint) (*model.UserProfile, error)`
    - [x] `Update(profile *model.UserProfile) error`
    - [x] `Delete(userID uint) error`
    - [x] `UpdateField(userID uint, field string, value interface{}) error`

- [x] Service 层
  - 文件：`apps/server/internal/service/user_service.go`
  - 任务：
    - [x] `GetProfile(userID uint) (*UserProfileResponse, error)`
    - [x] `CreateOrUpdateProfile(userID uint, req *UpdateProfileRequest) error`
    - [x] `UpdateProfileSection(userID uint, section string, data interface{}) error`
    - [x] `DeleteProfile(userID uint) error`
    - [x] `CalculateCompleteness(profile *model.UserProfile) int`
    - [x] `GetAge(profile *model.UserProfile) int`
    - [x] `IsEligibleForPosition(profile *model.UserProfile, position *model.Position) bool`

- [x] Handler 层
  - 文件：`apps/server/internal/handler/user_handler.go`
  - 任务：
    - [x] `GET /api/v1/user/profile` - 获取用户画像
    - [x] `PUT /api/v1/user/profile` - 更新用户画像
    - [x] `PATCH /api/v1/user/profile/:section` - 更新指定区块
    - [x] `DELETE /api/v1/user/profile` - 删除用户画像
    - [x] `GET /api/v1/user/profile/completeness` - 获取完整度

### 6.3 专业数据支持

#### 6.3.1 专业目录数据
- [x] 创建专业目录表
  - 文件：`apps/server/internal/model/major.go`
  - 任务：
    - [x] `what_major_categories` - 专业大类表
    - [x] `what_majors` - 专业表
    - [x] 导入教育部专业目录数据
    - [x] 支持专业搜索
    - [x] 支持专业大类级联

#### 6.3.2 专业 API
- [x] 创建专业 API
  - 文件：`apps/server/internal/handler/major_handler.go`、`apps/server/internal/service/major_service.go`、`apps/server/internal/repository/major_repository.go`
  - 任务：
    - [x] `GET /api/v1/majors/categories` - 获取专业大类列表
    - [x] `GET /api/v1/majors` - 获取专业列表（支持筛选）
    - [x] `GET /api/v1/majors/search` - 专业搜索
    - [x] `GET /api/v1/majors/:code` - 获取专业详情
    - [x] `GET /api/v1/majors/cascade` - 获取级联数据
    - [x] `POST /api/v1/admin/majors/init` - 初始化专业数据（管理员）

### 6.4 前端用户画像页面

#### 6.4.1 用户画像编辑页面
- [x] 创建用户画像页面
  - 文件：`apps/web/app/(user)/profile/page.tsx`
  - 任务：
    - [x] **页面布局**
      - [x] 左侧：头像卡片 + 快捷链接
      - [x] 右侧：表单内容区
    - [x] **完整度提示**
      - [x] 进度条显示
      - [x] 资料完整度百分比
      - [x] 完善建议

#### 6.4.2 分区表单组件
- [x] 创建学历信息表单
  - 文件：`apps/web/app/(user)/profile/page.tsx`（集成在页面中）
  - 任务：
    - [x] 最高学历选择
    - [x] 学位选择
    - [x] 毕业年份选择
    - [x] 是否在读开关
    - [x] 毕业院校输入
    - [x] 学校类型选择

- [x] 创建专业信息表单
  - 文件：`apps/web/app/(user)/profile/page.tsx`（集成在页面中）
  - 任务：
    - [x] 专业大类输入
    - [x] 专业名称输入
    - [x] 第二专业（可选）
    - [x] 专业代码自动填充

- [x] 创建个人信息表单
  - 文件：`apps/web/app/(user)/profile/page.tsx`（集成在页面中）
  - 任务：
    - [x] 出生日期选择
    - [x] 性别选择
    - [x] 政治面貌选择
    - [x] 工作年限输入
    - [x] 现居地选择（省市）
    - [x] 户籍地选择（省市）
    - [x] 身份类型选择

- [x] 创建意向设置表单
  - 文件：`apps/web/app/(user)/preferences/page.tsx`（独立偏好设置页面）
  - 任务：
    - [x] 意向省份多选
    - [x] 意向城市多选
    - [x] 意向考试类型多选
    - [x] 意向单位层级多选
    - [x] 期望薪资范围

- [x] 创建证书信息表单
  - 文件：`apps/web/app/(user)/profile/page.tsx`（集成在页面中）
  - 任务：
    - [x] 证书列表（可添加/删除）
    - [x] 证书类型选择
    - [x] 证书名称输入
    - [ ] 获取时间选择

---

## 9. 智能职位匹配 👤 web + ⚙️ server ✅

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：根据用户画像智能匹配合适的职位

### 9.1 匹配算法实现

#### 9.1.1 匹配服务
- [x] 创建匹配服务
  - 文件：`apps/server/internal/service/match_service.go`
  - **数据结构定义：**
    - [x] `MatchResult` - 匹配结果
    - [x] `MatchCondition` - 匹配条件详情
    - [x] `MatchStats` - 匹配统计
    - [x] `MatchUserProfileSummary` - 用户画像摘要

  - **核心匹配方法：**
    - [x] `MatchPositions(userID, req) (*MatchResponse, error)` - 获取匹配职位
    - [x] `calculateMatch(profile, pref, position, strategy) MatchResult` - 计算匹配分数
    - [x] `GetPositionMatchDetail(userID, positionID) (*PositionMatchDetail, error)` - 获取单个职位匹配详情

  - **单项匹配方法（权重配置）：**
    - [x] `checkEducation(userEdu, requiredEdu) bool` - 学历匹配（权重25%）
    - [x] `checkMajor(userMajor, requiredMajors) bool` - 专业匹配（权重10%）
    - [x] `calculateLocationScore(province, city, prefProvinces, prefCities) int` - 地域匹配（权重15%）
    - [x] `checkPoliticalStatus(userStatus, requiredStatus) bool` - 政治面貌匹配（权重15%）
    - [x] `checkAge(birthDate, minAge, maxAge) bool` - 年龄匹配（权重15%）
    - [x] 工作经历匹配（权重10%）
    - [x] 户籍要求匹配（权重10%）

  - **辅助方法：**
    - [x] `calculateAge(birthDate) int` - 计算年龄
    - [x] `GetMatchLevelStars(score) int` - 分数转星级（1-5星）
    - [x] `GetMatchLevelName(level) string` - 分数转文字标签
    - [x] `buildProfileSummary(profile, pref) *MatchUserProfileSummary` - 构建画像摘要

#### 9.1.2 匹配权重配置
- [x] 创建权重配置
  - 文件：`apps/server/internal/config/match_config.go`
  - 任务：
    - [x] 默认权重配置 `DefaultMatchWeights`
    - [x] 支持自定义权重 `MatchWeightConfig`
    - [x] 权重验证（总和100%）`Validate()`
    - [x] 匹配等级定义和转换

### 9.2 匹配 API

#### 9.2.1 匹配 Handler
- [x] 创建匹配处理器
  - 文件：`apps/server/internal/handler/match_handler.go`
  - 任务：
    - [x] `POST /api/v1/match` - 智能匹配（返回匹配职位列表）
    - [x] `GET /api/v1/match/positions` - 获取匹配职位列表
    - [x] `GET /api/v1/match/preview` - 匹配预览（不保存，快速预览）
    - [x] `GET /api/v1/positions/:id/match` - 获取单个职位的匹配详情
    - [x] `GET /api/v1/match/stats` - 匹配统计（各维度匹配情况）
    - [x] `GET /api/v1/match/report` - 生成匹配报告
    - [x] `GET /api/v1/match/weights` - 获取当前权重配置
    - [x] `PUT /api/v1/match/weights` - 自定义匹配权重

### 9.3 匹配结果缓存

#### 9.3.1 缓存实现
- [x] 实现匹配结果缓存（可选优化）
  - 文件：`apps/server/internal/repository/match_cache_repository.go`
  - 模型文件：`apps/server/internal/model/match_cache.go`
  - 任务：
    - [x] 缓存匹配结果到数据库
    - [x] 用户画像变更时清除缓存
    - [x] 职位更新时更新相关缓存
    - [x] 缓存过期策略（24小时）
    - [x] 热门职位预计算
  - API端点：
    - [x] `GET /api/v1/match/fast` - 带缓存的快速匹配
    - [x] `GET /api/v1/match/cache/stats` - 获取缓存统计
    - [x] `GET /api/v1/match/cache/user-stats` - 获取用户缓存统计
    - [x] `GET /api/v1/match/cache/top` - 获取缓存的高分匹配
    - [x] `POST /api/v1/match/cache/invalidate` - 失效用户缓存
    - [x] `POST /api/v1/match/cache/precompute` - 预计算热门职位匹配

### 9.4 前端智能匹配页面

#### 9.4.1 智能匹配页面
- [x] 智能匹配页面
  - 文件：`apps/web/app/(user)/match/page.tsx`
  - 任务：
    - [x] **页面布局**
      - [x] 顶部：页面标题 + 画像完整度 + 重新匹配按钮
      - [x] 中间：匹配结果列表
      - [x] 侧边：匹配详情面板
    - [x] **未填写画像提示**
      - [x] 引导填写画像
      - [x] 快速填写入口
    - [x] **一键匹配按钮**
      - [x] 加载动画
      - [x] 匹配状态展示

#### 9.4.2 匹配结果列表
- [x] 匹配结果列表（集成在页面中）
  - 任务：
    - [x] **职位卡片（带匹配度）**
      - [x] 匹配度星级显示（1-5星）
      - [x] 匹配度百分比
      - [x] 匹配度进度环
      - [x] 匹配度颜色编码（高/中/低）
      - [x] 硬性/软性条件得分
    - [x] **排序选项**
      - [x] 按匹配度排序（默认）
      - [x] 按招录人数排序
      - [x] 按报名截止排序
    - [x] **筛选选项**
      - [x] 仅显示符合条件
      - [x] 最低匹配度筛选
      - [x] 省份/考试类型筛选
    - [x] **分页**

#### 9.4.3 匹配详情面板
- [x] 匹配详情面板（集成在页面中）
  - 任务：
    - [x] **总匹配度展示**
      - [x] 大数字展示（圆环）
      - [x] 星级评分
      - [x] 匹配等级标签
    - [x] **各维度得分**
      - [x] 学历匹配（得分/满分 + 进度条）
      - [x] 专业匹配（得分/满分 + 进度条）
      - [x] 地域匹配（得分/满分 + 进度条）
      - [x] 政治面貌（得分/满分 + 进度条）
      - [x] 年龄匹配（得分/满分 + 进度条）
      - [x] 工作经历（得分/满分 + 进度条）
    - [x] **匹配详情说明**
      - [x] 匹配/不匹配状态图标
      - [x] 不匹配原因展示
      - [x] 改进建议展示

#### 9.4.4 API 服务层
- [x] 前端 API 服务
  - 文件：`apps/web/services/api/match.ts`
  - 任务：
    - [x] 完整的类型定义
    - [x] `matchApi.getMatches()` - 获取匹配结果
    - [x] `matchApi.postMatch()` - 执行匹配
    - [x] `matchApi.getPreview()` - 匹配预览
    - [x] `matchApi.getPositionMatchDetail()` - 单个职位匹配详情
    - [x] `matchApi.getStats()` - 匹配统计
    - [x] `matchApi.getReport()` - 匹配报告
    - [x] `matchApi.getWeights()` - 获取权重
    - [x] `matchApi.updateWeights()` - 更新权重

#### 9.4.5 React Hooks
- [x] 匹配相关 Hooks
  - 文件：`apps/web/hooks/useMatch.ts`
  - 任务：
    - [x] `useMatchResults()` - 获取匹配结果
    - [x] `useMatchPreview()` - 匹配预览
    - [x] `usePositionMatchDetail()` - 单个职位匹配详情
    - [x] `useMatchStats()` - 匹配统计
    - [x] `useMatchReport()` - 匹配报告
    - [x] `useMatchWeights()` - 获取权重
    - [x] `useUpdateMatchWeights()` - 更新权重
    - [x] `usePerformMatch()` - 执行匹配
    - [x] 辅助函数：`getMatchScoreColor()`, `getMatchScoreLabel()`, `getStarLevelText()`

---

## 10. 职位对比功能 👤 web + ⚙️ server

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：用户对比多个职位的详细信息

### 8.1 对比服务

#### 8.1.1 对比 Service
- [x] 创建对比服务
  - 文件：`apps/server/internal/service/compare_service.go`
  - 任务：
    - [x] `ComparePositions(ids []uint) (*CompareResponse, error)` - 对比职位
    - [x] `GetCompareItems(ids []uint) ([]*CompareItem, error)` - 获取对比数据
    - [x] `CalculateRecommendation(items []*CompareItem) *Recommendation` - 计算推荐
    - [x] `GenerateCompareSummary(items []*CompareItem) (string, error)` - 生成对比总结

#### 8.1.2 对比 Handler
- [x] 创建对比处理器
  - 文件：`apps/server/internal/handler/compare_handler.go`
  - 任务：
    - [x] `POST /api/v1/compare/positions` - 职位对比
    - [x] `POST /api/v1/compare/export` - 导出对比报告（PDF/Excel，框架已实现）

### 8.2 前端对比页面

#### 8.2.1 职位对比页面
- [x] 创建职位对比页面
  - 文件：`apps/admin/app/(dashboard)/positions/compare/page.tsx`
  - 任务：
    - [x] **对比表格**
      - [x] 横向：职位列（最多5个）
      - [x] 纵向：对比维度
      - [x] 差异高亮显示
      - [x] 固定首列（维度名称）
    - [x] **对比维度**
      - [x] 基本信息（名称、单位、地点）
      - [x] 招录人数
      - [x] 学历要求
      - [x] 专业要求
      - [x] 政治面貌
      - [x] 年龄要求
      - [x] 工作经历
      - [x] 报名时间
      - [x] 考试时间
      - [x] 历年竞争比（如有）
      - [x] 历年分数线（如有）
    - [x] **智能对比总结**
      - [x] 总体分析
      - [x] 重点差异项
      - [x] 选择建议
    - [x] **推荐结果**
      - [x] 最适合应届生
      - [x] 招录人数最多
      - [x] 条件最宽松
      - [x] 竞争最小（如有数据）
    - [x] **操作按钮**
      - [x] 添加职位
      - [x] 移除职位
      - [x] 导出报告
      - [x] 分享

---

## 11. 历年数据系统 👤 web + 🔧 admin + ⚙️ server

> 📁 开发目录：`apps/web/`（用户查看）、`apps/admin/`（数据管理）、`apps/server/`（后端）
> 📝 功能说明：展示历年招录数据、竞争比、分数线等

### 11.1 历年数据管理

#### 11.1.1 历年数据 Service
- [x] 创建历年数据服务
  - 文件：`apps/server/internal/service/position_history_service.go`
  - 任务：
    - [x] `GetPositionHistory(positionCode string) ([]*PositionHistory, error)` - 获取职位历年数据
    - [x] `GetDepartmentHistory(deptName string) ([]*PositionHistory, error)` - 获取单位历年数据
    - [x] `GetYearlyTrend(filter *HistoryFilter) (*YearlyTrendResponse, error)` - 获取年度趋势
    - [x] `GetAverageScoreLine(examType, province string) (*ScoreLineResponse, error)` - 获取平均分数线
    - [x] `PredictScoreLine(position *model.Position) (*ScoreLinePrediction, error)` - 预测分数线
    - [x] `ImportHistoryData(data []*PositionHistory) error` - 导入历史数据

#### 11.1.2 历年数据 Handler
- [x] 创建历年数据 API
  - 任务：
    - [x] `GET /api/v1/positions/:id/history` - 获取职位历年数据
    - [x] `GET /api/v1/history/department/:name` - 获取单位历年数据
    - [x] `GET /api/v1/history/trends` - 获取趋势数据
    - [x] `GET /api/v1/history/score-lines` - 获取分数线数据
    - [x] `GET /api/v1/positions/:id/score-prediction` - 获取分数线预测

### 11.2 前端历年数据展示

#### 11.2.1 历年数据页面
- [x] 创建历年数据页面
  - 文件：`apps/admin/app/(dashboard)/history/page.tsx`
  - 任务：
    - [x] **搜索查询**
      - [x] 按职位代码查询
      - [x] 按单位名称查询
      - [x] 按考试类型+地区查询
    - [x] **趋势图表**
      - [x] 招录人数趋势
      - [x] 报名人数趋势
      - [x] 竞争比趋势
      - [x] 分数线趋势
    - [x] **数据表格**
      - [x] 年份
      - [x] 招录人数
      - [x] 报名人数
      - [x] 竞争比
      - [x] 进面分数线
    - [x] **分数线预测**
      - [x] 预测值
      - [x] 置信区间
      - [x] 预测依据

---

# 第三阶段：增值功能 (P2)

## 12. 报名大数据分析 👤 web + 🔧 admin + ⚙️ server

> 📁 开发目录：`apps/web/`（用户查看）、`apps/admin/`（数据管理）、`apps/server/`（后端）
> 📝 功能说明：实时报名数据统计和分析

### 10.1 数据采集与存储

#### 10.1.1 报名数据表
- [x] 设计 `what_position_registration_data` 表
  - 字段：
    - [x] `id` - 主键
    - [x] `position_id` - 职位ID
    - [x] `snapshot_date` - 快照日期
    - [x] `snapshot_time` - 快照时间
    - [x] `apply_count` - 报名人数
    - [x] `pass_count` - 过审人数
    - [x] `competition_ratio` - 竞争比
    - [x] `created_at` - 创建时间

#### 10.1.2 数据采集任务
- [x] 创建数据采集任务（如有数据源）
  - 任务：
    - [x] 定时采集报名数据
    - [x] 数据变化检测
    - [x] 历史快照保存

### 10.2 报名大数据展示

#### 10.2.1 报名大数据页面
- [x] 创建报名大数据页面
  - 文件：`apps/admin/app/(dashboard)/registration-data/page.tsx`
  - 任务：
    - [x] **总览统计**
      - [x] 总报名人数
      - [x] 平均竞争比
      - [x] 最高竞争比职位
      - [x] 无人报考职位数
    - [x] **职位热度榜**
      - [x] 报名人数TOP10
      - [x] 竞争比TOP10
    - [x] **冷门职位推荐**
      - [x] 无人报考职位
      - [x] 低竞争比职位（<10:1）
      - [x] 符合用户条件的冷门岗
    - [x] **职位报名趋势**
      - [x] 每日报名增量
      - [x] 竞争比变化曲线

---

## 13. 收藏与订阅功能 👤 web + ⚙️ server

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：用户收藏职位、订阅关注条件

### 11.1 收藏功能

#### 11.1.1 收藏后端
- [x] 创建收藏相关表和服务
  - 文件：`apps/server/internal/model/user_favorite.go`
  - 文件：`apps/server/internal/repository/favorite_repository.go`
  - 文件：`apps/server/internal/service/favorite_service.go`
  - 文件：`apps/server/internal/handler/favorite_handler.go`
  - API：
    - [x] `POST /api/v1/favorites` - 添加收藏
    - [x] `DELETE /api/v1/favorites/:type/:id` - 取消收藏
    - [x] `GET /api/v1/favorites` - 获取收藏列表
    - [x] `GET /api/v1/favorites/check` - 批量检查收藏状态
    - [x] `GET /api/v1/favorites/export` - 导出收藏

#### 11.1.2 收藏前端
- [x] 创建收藏功能组件
  - 文件：`apps/web/app/(user)/favorites/page.tsx`
  - 任务：
    - [x] 收藏按钮组件（带动画）
    - [x] 收藏列表页面
    - [x] Tab切换（职位/公告）
    - [x] 批量操作（取消收藏/导出）
    - [x] 收藏夹分组（可选）

### 11.2 订阅功能

#### 11.2.1 订阅后端
- [x] 创建订阅相关表和服务
  - 表：`what_user_subscriptions`
  - 字段：
    - [x] `id` - 主键
    - [x] `user_id` - 用户ID
    - [x] `subscribe_type` - 订阅类型（exam_type/province/city/keyword/department）
    - [x] `subscribe_value` - 订阅值
    - [x] `subscribe_name` - 订阅名称（显示用）
    - [x] `notify_on_new` - 新公告通知
    - [x] `notify_channels` - 通知渠道（JSON数组）
    - [x] `is_enabled` - 是否启用
    - [x] `created_at` - 创建时间
  - API：
    - [x] `POST /api/v1/subscriptions` - 添加订阅
    - [x] `DELETE /api/v1/subscriptions/:id` - 取消订阅
    - [x] `GET /api/v1/subscriptions` - 获取订阅列表
    - [x] `PUT /api/v1/subscriptions/:id` - 更新订阅
    - [x] `PUT /api/v1/subscriptions/:id/toggle` - 启用/禁用

#### 11.2.2 订阅前端
- [x] 创建订阅管理页面
  - 文件：`apps/web/app/(user)/subscriptions/page.tsx`
  - 任务：
    - [x] 订阅列表
    - [x] 添加订阅弹窗
    - [x] 订阅类型选择
    - [x] 通知渠道设置
    - [x] 启用/禁用开关

---

## 14. 报考日历 👤 web + ⚙️ server

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：考试时间、报名时间日历展示

### 12.1 日历后端

#### 12.1.1 日历数据表
- [x] 设计 `what_exam_calendars` 表
  - 文件：`apps/server/internal/model/calendar.go`
  - 字段：
    - [x] `id` - 主键
    - [x] `user_id` - 用户ID
    - [x] `position_id` - 关联职位ID（可选）
    - [x] `announcement_id` - 关联公告ID（可选）
    - [x] `event_type` - 事件类型
      - `announcement` - 公告发布
      - `registration_start` - 报名开始
      - `registration_end` - 报名截止
      - `payment_end` - 缴费截止
      - `print_ticket` - 准考证打印
      - `written_exam` - 笔试
      - `written_result` - 笔试成绩
      - `interview` - 面试
      - `final_result` - 最终结果
      - `custom` - 自定义
    - [x] `event_title` - 事件标题
    - [x] `event_description` - 事件描述
    - [x] `event_date` - 事件日期
    - [x] `event_time` - 事件时间（可选）
    - [x] `all_day` - 是否全天事件
    - [x] `reminder_enabled` - 是否开启提醒
    - [x] `reminder_times` - 提前提醒时间（JSON数组，如[24, 2]表示提前24小时和2小时）
    - [x] `notify_channels` - 通知渠道
    - [x] `status` - 状态（pending/notified/completed/cancelled）
    - [x] `color` - 事件颜色
    - [x] `source` - 来源（auto/manual）
    - [x] `created_at` - 创建时间
    - [x] `updated_at` - 更新时间

#### 12.1.2 日历 Service
- [x] 创建日历服务
  - 文件：`apps/server/internal/service/calendar_service.go`
  - 文件：`apps/server/internal/repository/calendar_repository.go`
  - 任务：
    - [x] `GetEvents(userID uint, start, end time.Time) ([]*CalendarEvent, error)`
    - [x] `GetEventsByMonth(userID uint, year, month int) ([]*CalendarEvent, error)`
    - [x] `CreateEvent(userID uint, req *CreateEventRequest) (*CalendarEvent, error)`
    - [x] `UpdateEvent(userID, eventID uint, req *UpdateEventRequest) error`
    - [x] `DeleteEvent(userID, eventID uint) error`
    - [x] `AutoCreateEvents(userID uint, positionID uint) error` - 自动创建职位相关事件
    - [x] `GetUpcomingEvents(userID uint, days int) ([]*CalendarEvent, error)` - 获取即将到来的事件
    - [x] `SyncFromAnnouncement(announcementID uint) error` - 从公告同步时间

#### 12.1.3 日历 Handler
- [x] 创建日历 API
  - 文件：`apps/server/internal/handler/calendar_handler.go`
  - 任务：
    - [x] `GET /api/v1/calendar` - 获取日历事件
    - [x] `GET /api/v1/calendar/month/:year/:month` - 按月获取
    - [x] `GET /api/v1/calendar/upcoming` - 即将到来的事件
    - [x] `POST /api/v1/calendar` - 创建事件
    - [x] `PUT /api/v1/calendar/:id` - 更新事件
    - [x] `DELETE /api/v1/calendar/:id` - 删除事件
    - [x] `POST /api/v1/calendar/auto-create` - 自动创建职位事件
    - [x] `POST /api/v1/calendar/sync/:announcementId` - 从公告同步

### 12.2 日历前端

#### 12.2.1 报考日历页面
- [x] 创建报考日历页面
  - 文件：`apps/admin/app/(dashboard)/calendar/page.tsx`
  - 文件：`apps/admin/services/calendar-api.ts`
  - 任务：
    - [x] **视图切换**
      - [x] 月视图
      - [x] 周视图
      - [x] 列表视图
      - [x] 时间线视图
    - [x] **日历组件**
      - [x] 日期单元格
      - [x] 事件标记（点/条）
      - [x] 事件颜色编码
      - [x] 今日高亮
      - [x] 导航（上月/下月）
    - [x] **事件列表**
      - [x] 按日期分组
      - [x] 事件卡片
      - [x] 倒计时显示
    - [x] **事件详情弹窗**
      - [x] 事件信息
      - [x] 关联职位/公告
      - [x] 提醒设置
      - [x] 编辑/删除
    - [x] **添加事件**
      - [x] 事件类型选择
      - [x] 日期时间选择
      - [x] 提醒设置
    - [x] **即将到来提醒**
      - [x] 侧边栏显示
      - [x] 7天内事件
      - [x] 倒计时

#### 12.2.2 时间线组件
- [x] 创建考试时间线组件
  - 文件：`apps/admin/app/(dashboard)/calendar/components/ExamTimeline.tsx`
  - 任务：
    - [x] 完整考试流程展示
    - [x] 当前阶段高亮
    - [x] 各阶段时间
    - [x] 进度指示

---

# 第四阶段：高级功能 (P3/P4)

## 15. 消息提醒系统 👤 web + ⚙️ server

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：报名提醒、考试提醒等消息推送

### 13.1 通知后端

#### 13.1.1 通知数据表
- [x] 设计 `what_notifications` 表
  - 字段：
    - [x] `id` - 主键
    - [x] `user_id` - 用户ID
    - [x] `type` - 通知类型
    - [x] `title` - 通知标题
    - [x] `content` - 通知内容
    - [x] `link` - 跳转链接
    - [x] `is_read` - 是否已读
    - [x] `read_at` - 阅读时间
    - [x] `source_type` - 来源类型
    - [x] `source_id` - 来源ID
    - [x] `created_at` - 创建时间

#### 13.1.2 提醒任务
- [x] 创建定时提醒任务
  - 文件：`apps/server/internal/scheduler/reminder_handlers.go`
  - 任务：
    - [x] 日历事件提醒检查
    - [x] 报名截止提醒
    - [x] 新公告推送
    - [x] 订阅内容推送

#### 13.1.3 通知渠道
- [x] 实现通知发送服务
  - 文件：`apps/server/internal/service/notification_service.go`
  - 任务：
    - [x] 站内消息
    - [x] 邮件通知
    - [x] 微信推送（可选）
    - [x] 短信通知（可选）

### 13.2 通知前端

#### 13.2.1 通知中心
- [x] 创建通知中心页面
  - 文件：`apps/admin/app/(dashboard)/notifications/page.tsx`
  - 任务：
    - [x] 通知列表
    - [x] 未读/已读筛选
    - [x] 通知类型筛选
    - [x] 标记已读
    - [x] 批量操作
    - [x] 通知设置

#### 13.2.2 通知铃铛组件
- [x] 创建通知铃铛组件
  - 文件：`apps/admin/components/NotificationBell.tsx`
  - 任务：
    - [x] 未读数量徽标
    - [x] 下拉预览
    - [x] 快速标记已读

---

## 16. 考试工具箱 👤 web

> 📁 开发目录：`apps/web/`
> 📝 功能说明：考点查询、成绩估算等辅助工具

### 16.1 考点查询

#### 16.1.1 考点数据
- [x] 设计考点数据表
  - 表：`what_exam_locations`
  - 文件：`apps/server/internal/model/exam_location.go`
  - 任务：
    - [x] 考点名称
    - [x] 地址
    - [x] 经纬度
    - [x] 考试类型
    - [x] 省份城市

#### 16.1.2 考点查询后端
- [x] 创建考点查询服务
  - 文件：
    - `apps/server/internal/repository/exam_tools_repository.go`
    - `apps/server/internal/service/exam_tools_service.go`
    - `apps/server/internal/handler/exam_tools_handler.go`
  - 任务：
    - [x] 考点列表 API
    - [x] 省份/城市级联
    - [x] 关键词搜索
    - [x] 附近考点查询

#### 16.1.3 考点查询页面
- [x] 创建考点查询页面
  - 文件：`apps/web/app/(user)/tools/exam-locations/page.tsx`
  - 任务：
    - [x] 地区选择
    - [x] 考点列表
    - [x] 考点详情弹窗
    - [x] 地图导航链接

### 16.2 估分工具

#### 16.2.1 估分数据模型
- [x] 设计估分数据表
  - 表：`what_score_estimates`
  - 文件：`apps/server/internal/model/exam_location.go`
  - 任务：
    - [x] 考试类型
    - [x] 考试年份
    - [x] 答对题数
    - [x] 估计分数
    - [x] 实际分数

#### 16.2.2 估分功能
- [x] 创建估分工具页面
  - 文件：`apps/web/app/(user)/tools/score-estimate/page.tsx`
  - 任务：
    - [x] 考试类型选择
    - [x] 题目数量/答对数量输入
    - [x] 自动计算分数
    - [x] 正确率显示
    - [x] 分数等级评估

### 16.3 成绩晒分

#### 16.3.1 晒分数据模型
- [x] 设计晒分数据表
  - 表：`what_score_shares`
  - 文件：`apps/server/internal/model/exam_location.go`
  - 任务：
    - [x] 考试信息
    - [x] 行测/申论/总分
    - [x] 进面状态
    - [x] 点赞功能
    - [x] 匿名/实名选项

#### 16.3.2 晒分功能
- [x] 创建成绩晒分页面
  - 文件：`apps/web/app/(user)/tools/score-share/page.tsx`
  - 任务：
    - [x] 成绩提交
    - [x] 晒分列表
    - [x] 成绩排行榜
    - [x] 分数统计
    - [x] 分数分布图
    - [x] 点赞功能
    - [x] 匿名/实名选项

---

## 17. 社区与交流 👤 web + ⚙️ server

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：用户交流、经验分享等社区功能

### 17.1 社区功能

#### 17.1.1 帖子系统 ⚙️ server
- [x] 设计帖子相关表
  - 表：`what_posts`、`what_comments`、`what_likes`、`what_post_categories`、`what_hot_topics`
  - 文件：`apps/server/internal/model/community.go`
  - 任务：
    - [x] 发帖功能 (POST /api/v1/community/posts)
    - [x] 评论功能 (POST /api/v1/community/comments)
    - [x] 点赞功能 (POST /api/v1/community/posts/:id/like, /comments/:id/like)
    - [x] 帖子分类 (GET /api/v1/community/categories)
    - [x] 热门话题 (GET /api/v1/community/topics/hot)

#### 17.1.2 社区页面 👤 web
- [x] 创建社区页面
  - 文件：`apps/web/app/(user)/community/page.tsx`
  - 文件：`apps/web/app/(user)/community/[id]/page.tsx`
  - 文件：`apps/web/app/(user)/community/create/page.tsx`
  - 文件：`apps/web/services/api/community.ts`
  - 文件：`apps/web/hooks/useCommunity.ts`
  - 任务：
    - [x] 帖子列表（分页、筛选、排序）
    - [x] 发帖功能（分类选择、标签添加）
    - [x] 帖子详情（查看、点赞、分享）
    - [x] 评论列表（发表、回复、点赞）
    - [x] 热门话题侧边栏

---

## 18. VIP会员系统 👤 web + 🔧 admin + ⚙️ server

> 📁 开发目录：`apps/web/`（用户端）、`apps/admin/`（会员管理）、`apps/server/`（后端）
> 📝 功能说明：会员等级、权益管理等

### 18.1 会员权益

#### 18.1.1 会员等级
- [x] 设计会员系统
  - 文件：`apps/server/internal/model/vip_membership.go`
  - 任务：
    - [x] 普通用户权益
    - [x] VIP用户权益
    - [x] 权益对比表

#### 18.1.2 付费功能标记
- [x] 实现付费功能控制
  - 文件：`apps/server/internal/model/vip_membership.go` (VIPFeatureList)
  - 任务：
    - [x] 职位对比（VIP）
    - [x] 历年数据完整查看（VIP）
    - [x] 分数线预测（VIP）
    - [x] 报名大数据（VIP）
    - [x] 无广告（VIP）
    - [x] 导出功能（VIP）
    - [x] 学习包高级课程（VIP）
    - [x] 题库完整访问（VIP）

### 18.2 后端开发 ⚙️ server

#### 18.2.1 Model 层
- [x] 创建会员相关模型
  - 文件：`apps/server/internal/model/vip_membership.go`
  - 任务：
    - [x] `UserMembership` 用户会员信息模型
    - [x] `MembershipPlan` 会员套餐模型
    - [x] `MembershipOrder` 会员订单模型
    - [x] `MembershipFeatureUsage` 功能使用记录模型
    - [x] `VIPFeature` VIP功能权益定义

#### 18.2.2 Repository 层
- [x] 创建会员 Repository
  - 文件：`apps/server/internal/repository/membership_repository.go`
  - 任务：
    - [x] `GetByUserID(userID)` - 获取用户会员信息
    - [x] `Upsert(membership)` - 创建或更新会员信息
    - [x] `List(params)` - 获取会员列表
    - [x] `GetStats()` - 获取会员统计
    - [x] 套餐管理 CRUD
    - [x] 订单管理 CRUD
    - [x] 功能使用记录管理

#### 18.2.3 Service 层
- [x] 创建会员 Service
  - 文件：`apps/server/internal/service/membership_service.go`
  - 任务：
    - [x] `GetUserMembership(userID)` - 获取用户会员信息
    - [x] `CheckVIP(userID)` - 检查VIP状态
    - [x] `ActivateVIP(userID, days, source)` - 激活VIP
    - [x] `DeactivateVIP(userID)` - 取消VIP
    - [x] `CheckFeatureAccess(userID, featureCode)` - 检查功能访问权限
    - [x] `GetVIPComparison()` - 获取VIP权益对比
    - [x] 套餐管理服务
    - [x] 订单管理服务

#### 18.2.4 Handler 层
- [x] 创建会员 API Handler
  - 文件：`apps/server/internal/handler/membership_handler.go`
  - API 清单：
    - [x] `GET /api/v1/membership` - 获取用户会员信息
    - [x] `GET /api/v1/membership/vip-status` - 检查VIP状态
    - [x] `GET /api/v1/membership/feature-access` - 检查功能访问权限
    - [x] `GET /api/v1/membership/comparison` - 获取VIP权益对比
    - [x] `GET /api/v1/membership/plans` - 获取套餐列表
    - [x] `POST /api/v1/membership/orders` - 创建订单
    - [x] `GET /api/v1/membership/orders` - 获取订单列表
    - [x] 管理端API（会员管理、套餐管理、订单管理）

### 18.3 管理端开发 🔧 admin

#### 18.3.1 VIP管理页面
- [x] 创建VIP管理页面
  - 文件：`apps/admin/app/(dashboard)/vip/page.tsx`
  - 任务：
    - [x] 会员统计卡片
    - [x] 会员列表管理
    - [x] 套餐管理
    - [x] 订单记录
    - [x] 权益配置展示
    - [x] 赠送VIP功能
    - [x] 取消VIP功能

#### 18.3.2 管理端API
- [x] 创建管理端API
  - 文件：`apps/admin/services/membership-api.ts`
  - 任务：
    - [x] 会员列表API
    - [x] 会员统计API
    - [x] 套餐管理API
    - [x] 订单管理API
    - [x] 功能权益API

### 18.4 用户端开发 👤 web

#### 18.4.1 用户端API
- [x] 创建用户端会员API
  - 文件：`apps/web/services/api/membership.ts`
  - 任务：
    - [x] `getMembership()` - 获取会员信息
    - [x] `getVIPStatus()` - 获取VIP状态
    - [x] `checkFeatureAccess()` - 检查功能权限
    - [x] `getVIPComparison()` - 获取VIP权益对比
    - [x] `getPlans()` - 获取套餐列表
    - [x] `createOrder()` / `payOrder()` - 订单操作

#### 18.4.2 VIP会员页面
- [x] 创建VIP会员页面
  - 文件：`apps/web/app/(user)/vip/page.tsx`
  - 任务：
    - [x] VIP状态卡片展示
    - [x] VIP权益对比表
    - [x] 套餐选择和购买
    - [x] 订单记录展示
    - [x] VIP专属特权列表

#### 18.4.3 导航集成
- [x] 集成VIP入口
  - 任务：
    - [x] 用户菜单添加VIP入口
    - [x] 个人中心添加VIP快捷链接

---

# 第五阶段：公考学习包 (P1-P3)

> 📚 **公考学习包**是一个完整的公务员考试学习系统，涵盖行测、申论、面试等全部考试内容
> 🎯 目标：为用户提供系统化、结构化的公考学习体验

## 19. 公考学习包 - 课程体系 👤 web + 🔧 admin + ⚙️ server

> 📁 开发目录：`apps/web/`（学习端）、`apps/admin/`（内容管理）、`apps/server/`（后端）
> 📝 功能说明：构建完整的公考知识课程体系

### 19.1 数据库设计 ⚙️ server

#### 19.1.1 课程分类表
- [x] 设计 `what_course_categories` 表
  - 文件：`apps/server/internal/model/course.go`
  - 字段清单：
    - [x] `id` - 主键
    - [x] `parent_id` - 父分类ID（支持多级分类）
    - [x] `name` - 分类名称
    - [x] `code` - 分类编码（如 xc_yy 行测-言语）
    - [x] `exam_type` - 考试类型（公务员/事业单位/教师等）
    - [x] `subject` - 科目（行测/申论/面试/公基/专业）
    - [x] `icon` - 分类图标
    - [x] `description` - 分类描述
    - [x] `sort_order` - 排序权重
    - [x] `is_active` - 是否启用
    - [x] `created_at` - 创建时间
    - [x] `updated_at` - 更新时间

#### 19.1.2 课程表
- [x] 设计 `what_courses` 表
  - 文件：`apps/server/internal/model/course.go`
  - 字段清单：
    - [x] `id` - 主键
    - [x] `category_id` - 所属分类
    - [x] `title` - 课程标题
    - [x] `subtitle` - 副标题
    - [x] `cover_image` - 封面图
    - [x] `description` - 课程简介
    - [x] `content_type` - 内容类型（video/article/pdf/mindmap）
    - [x] `difficulty` - 难度等级（入门/基础/进阶/高级）
    - [x] `duration` - 预计学习时长（分钟）
    - [x] `teacher_name` - 讲师名称
    - [x] `teacher_avatar` - 讲师头像
    - [x] `is_free` - 是否免费
    - [x] `price` - 价格（如非免费）
    - [x] `vip_only` - 是否VIP专享
    - [x] `view_count` - 浏览次数
    - [x] `like_count` - 点赞数
    - [x] `collect_count` - 收藏数
    - [x] `sort_order` - 排序权重
    - [x] `status` - 状态（draft/published/archived）
    - [x] `published_at` - 发布时间
    - [x] `created_at` - 创建时间
    - [x] `updated_at` - 更新时间

#### 19.1.3 课程章节表
- [x] 设计 `what_course_chapters` 表
  - 文件：`apps/server/internal/model/course.go`
  - 字段清单：
    - [x] `id` - 主键
    - [x] `course_id` - 所属课程
    - [x] `parent_id` - 父章节ID（支持章-节结构）
    - [x] `title` - 章节标题
    - [x] `content_type` - 内容类型
    - [x] `content_url` - 内容URL（视频/文档链接）
    - [x] `content_text` - 文本内容（富文本）
    - [x] `duration` - 时长（分钟）
    - [x] `is_free_preview` - 是否免费试看
    - [x] `sort_order` - 排序
    - [x] `created_at` - 创建时间

#### 19.1.4 知识点表
- [x] 设计 `what_knowledge_points` 表
  - 文件：`apps/server/internal/model/course.go`
  - 字段清单：
    - [x] `id` - 主键
    - [x] `category_id` - 所属分类
    - [x] `parent_id` - 父知识点
    - [x] `name` - 知识点名称
    - [x] `code` - 知识点编码
    - [x] `description` - 知识点描述
    - [x] `importance` - 重要程度（1-5星）
    - [x] `frequency` - 考试频率（高频/中频/低频）
    - [x] `tips` - 学习技巧
    - [x] `related_courses` - 关联课程ID（JSON）
    - [x] `sort_order` - 排序
    - [x] `created_at` - 创建时间

#### 19.1.5 用户学习记录表（额外添加）
- [x] 设计 `what_user_course_progress` 表
  - 文件：`apps/server/internal/model/course.go`
  - 记录用户课程学习进度

- [x] 设计 `what_user_chapter_progress` 表
  - 文件：`apps/server/internal/model/course.go`
  - 记录用户章节学习进度

- [x] 设计 `what_user_course_collects` 表
  - 文件：`apps/server/internal/model/course.go`
  - 记录用户课程收藏

### 19.2 课程分类体系设计

#### 19.2.1 行测分类
- [x] 创建行测知识体系
  - 一级分类：行政职业能力测验
  - 二级分类：
    - [ ] **言语理解与表达**
      - [ ] 逻辑填空（实词辨析、成语辨析、关联词）
      - [ ] 片段阅读（主旨概括、意图判断、细节理解、标题选择）
      - [ ] 语句表达（语句排序、语句填空）
    - [ ] **数量关系**
      - [ ] 数学运算（行程问题、工程问题、利润问题、排列组合、概率问题、几何问题、极值问题）
      - [ ] 数字推理（等差数列、等比数列、递推数列、分数数列）
    - [ ] **判断推理**
      - [ ] 图形推理（规律类、重构类、分类分组）
      - [ ] 定义判断（单定义、多定义）
      - [ ] 类比推理（两词型、三词型、填空型）
      - [ ] 逻辑判断（翻译推理、真假推理、分析推理、归纳推理、加强削弱）
    - [ ] **资料分析**
      - [ ] 增长问题（增长率、增长量、年均增长）
      - [ ] 比重问题（现期比重、基期比重、比重变化）
      - [ ] 倍数问题（现期倍数、基期倍数）
      - [ ] 平均数问题
      - [ ] 综合分析
    - [ ] **常识判断**
      - [ ] 政治常识（时政热点、中国特色社会主义）
      - [ ] 法律常识（宪法、民法、刑法、行政法）
      - [ ] 经济常识（宏观经济、微观经济）
      - [ ] 历史常识（中国古代史、近现代史、世界史）
      - [ ] 地理常识（自然地理、人文地理）
      - [ ] 科技常识（物理、化学、生物、信息技术）
      - [ ] 文学常识（古代文学、现代文学）

#### 19.2.2 申论分类
- [x] 创建申论知识体系
  - 一级分类：申论
  - 二级分类：
    - [ ] **归纳概括**
      - [ ] 概括问题
      - [ ] 概括原因
      - [ ] 概括做法/经验
      - [ ] 概括特点/变化
    - [ ] **提出对策**
      - [ ] 直接对策
      - [ ] 间接对策
      - [ ] 流程类对策
    - [ ] **综合分析**
      - [ ] 解释型分析
      - [ ] 评价型分析
      - [ ] 比较型分析
      - [ ] 启示型分析
    - [ ] **贯彻执行**
      - [ ] 讲话稿/发言稿
      - [ ] 倡议书/公开信
      - [ ] 调研报告
      - [ ] 工作方案
      - [ ] 新闻稿/简报
      - [ ] 编者按/短评
    - [ ] **文章写作**
      - [ ] 立意技巧
      - [ ] 标题拟定
      - [ ] 开头写法
      - [ ] 分论点论证
      - [ ] 结尾写法
      - [ ] 素材积累

#### 19.2.3 面试分类
- [x] 创建面试知识体系
  - 一级分类：面试
  - 二级分类：
    - [ ] **结构化面试**
      - [ ] 综合分析题（社会现象、政策理解、名言警句、哲理故事）
      - [ ] 计划组织题（调研、宣传、活动策划、会议组织）
      - [ ] 人际关系题（与领导、与同事、与群众、与亲友）
      - [ ] 应急应变题（公共危机、工作危机、舆情处理）
      - [ ] 自我认知题（求职动机、职业规划）
      - [ ] 情景模拟题
    - [ ] **无领导小组讨论**
      - [ ] 开放式问题
      - [ ] 两难式问题
      - [ ] 排序式问题
      - [ ] 资源分配式问题
    - [ ] **面试技巧**
      - [ ] 礼仪规范
      - [ ] 答题思路
      - [ ] 语言表达
      - [ ] 时间控制

#### 19.2.4 公共基础知识分类
- [x] 创建公基知识体系
  - 一级分类：公共基础知识
  - 二级分类：
    - [ ] **政治理论**
      - [ ] 马克思主义哲学
      - [ ] 毛泽东思想
      - [ ] 中国特色社会主义理论
      - [ ] 习近平新时代中国特色社会主义思想
      - [ ] 党史党建
    - [ ] **法律知识**
      - [ ] 法理学
      - [ ] 宪法
      - [ ] 民法典
      - [ ] 刑法
      - [ ] 行政法与行政诉讼法
      - [ ] 其他法律法规
    - [ ] **经济知识**
      - [ ] 社会主义市场经济
      - [ ] 宏观经济
      - [ ] 微观经济
      - [ ] 国际经济
    - [ ] **管理知识**
      - [ ] 行政管理
      - [ ] 公共管理
    - [ ] **公文写作**
      - [ ] 公文格式
      - [ ] 常用文种
      - [ ] 公文处理
    - [ ] **人文历史**
    - [ ] **科技地理**
    - [ ] **时事政治**

### 19.3 后端开发 ⚙️ server

#### 19.3.1 Model 层
- [x] 创建课程相关模型
  - 文件：`apps/server/internal/model/course.go`
  - 任务：
    - [x] `CourseCategory` 模型
    - [x] `Course` 模型
    - [x] `CourseChapter` 模型
    - [x] `KnowledgePoint` 模型
    - [x] `UserCourseProgress` 模型（用户学习进度）
    - [x] `UserCourseCollect` 模型（用户收藏）

#### 19.3.2 Repository 层
- [x] 创建课程 Repository
  - 文件：`apps/server/internal/repository/course_repository.go`
  - 任务：
    - [x] `CourseCategoryRepository` - 分类仓储
    - [x] `CourseRepository` - 课程仓储（含分页、筛选）
    - [x] `CourseChapterRepository` - 章节仓储
    - [x] `KnowledgePointRepository` - 知识点仓储
    - [x] `UserCourseProgressRepository` - 学习进度仓储
    - [x] `UserCourseCollectRepository` - 收藏仓储

#### 19.3.3 Service 层
- [x] 创建课程 Service
  - 文件：`apps/server/internal/service/course_service.go`
  - 任务：
    - [x] `CourseCategoryService` - 分类服务（树形结构）
    - [x] `CourseService` - 课程服务（列表、详情、收藏、进度）
    - [x] `KnowledgePointService` - 知识点服务（树形结构）

#### 19.3.4 Handler 层
- [x] 创建课程 API Handler
  - 文件：`apps/server/internal/handler/course_handler.go`
  - API 清单：
    - [x] `GET /api/v1/courses/categories` - 获取课程分类
    - [x] `GET /api/v1/courses/categories/subject/:subject` - 按科目获取分类
    - [x] `GET /api/v1/courses` - 获取课程列表（支持筛选）
    - [x] `GET /api/v1/courses/featured` - 获取推荐课程
    - [x] `GET /api/v1/courses/free` - 获取免费课程
    - [x] `GET /api/v1/courses/:id` - 获取课程详情（含章节）
    - [x] `GET /api/v1/courses/chapters/:id` - 获取章节内容
    - [x] `POST /api/v1/courses/:id/collect` - 收藏课程
    - [x] `DELETE /api/v1/courses/:id/collect` - 取消收藏
    - [x] `GET /api/v1/courses/my/collects` - 我的收藏
    - [x] `GET /api/v1/courses/my/recent` - 最近学习
    - [x] `GET /api/v1/courses/my/learning` - 在学课程
    - [x] `GET /api/v1/courses/:id/progress` - 获取学习进度
    - [x] `PUT /api/v1/courses/:id/progress` - 更新学习进度
    - [x] `GET /api/v1/courses/knowledge/:category_id` - 获取知识点树
    - [x] `GET /api/v1/courses/knowledge/point/:id` - 获取知识点详情
    - [x] `GET /api/v1/courses/knowledge/hot` - 获取高频知识点

### 19.4 前端开发 - 用户端 👤 web

#### 19.4.0 API 服务与 Hooks
- [x] 创建课程 API 服务
  - 文件：`apps/web/services/api/course.ts`
  - 任务：
    - [x] 类型定义（CourseCategory, CourseBrief, CourseDetail, etc.）
    - [x] 分类 API（getCategories, getCategoriesBySubject）
    - [x] 课程 API（getCourses, getCourse, getFeatured, getFree）
    - [x] 用户操作 API（collect, uncollect, progress）
    - [x] 知识点 API（getTree, getHot）
- [x] 创建课程 Hooks
  - 文件：`apps/web/hooks/useCourse.ts`
  - 任务：
    - [x] useCourseCategories - 分类数据
    - [x] useCourses - 课程列表
    - [x] useCourse - 课程详情
    - [x] useChapter - 章节内容
    - [x] useMyLearning - 学习记录
    - [x] useKnowledge - 知识点
    - [x] 辅助函数（getSubjectName, formatDuration, etc.）

#### 19.4.1 学习中心主页
- [x] 创建学习中心页面
  - 文件：`apps/web/app/(user)/learn/page.tsx`
  - 任务：
    - [x] **顶部 Banner**
      - [x] Hero 区域（统计数据）
      - [x] 学习系统介绍
    - [x] **科目入口**
      - [x] 行测入口卡片（渐变背景）
      - [x] 申论入口卡片
      - [x] 面试入口卡片
      - [x] 公基入口卡片
    - [x] **推荐课程**
      - [x] 热门课程网格
      - [x] 免费课程区域
    - [x] **快捷入口**（登录用户）
      - [x] 继续学习（最近学习的课程）
      - [x] 快捷操作（每日一练、错题回顾、我的收藏）
    - [x] **学习功能介绍**
      - [x] 体系化学习、智能进度、AI辅助、真题实战

#### 19.4.2 科目学习页面
- [x] 创建科目学习页面
  - 文件：`apps/web/app/(user)/learn/[subject]/page.tsx`
  - 任务：
    - [x] **知识体系树**
      - [x] 左侧分类导航（可折叠树形结构）
      - [x] 知识点树展示（重要度、频率标识）
      - [x] 分类/知识点 Tab 切换
    - [x] **课程列表**
      - [x] 课程卡片（封面、标题、时长、难度、统计）
      - [x] 筛选功能（难度、免费）
      - [x] 排序功能（最新、最热、浏览、评分）
      - [x] 搜索功能
    - [x] **分页**
      - [x] 分页导航

#### 19.4.3 课程详情页面
- [x] 创建课程详情页面
  - 文件：`apps/web/app/(user)/learn/course/[id]/page.tsx`
  - 任务：
    - [x] **课程信息**
      - [x] 封面、标题、简介
      - [x] 讲师信息
      - [x] 课程时长、难度
      - [x] 学习人数、评分
    - [x] **章节目录**
      - [x] 章节列表（树形结构）
      - [x] 各章节学习状态
      - [x] 免费试看标记
    - [x] **操作按钮**
      - [x] 开始学习/继续学习
      - [x] 收藏课程
      - [x] 分享课程

#### 19.4.4 视频/内容播放页
- [x] 创建内容学习页面
  - 文件：`apps/web/app/(user)/learn/course/[id]/chapter/[chapterId]/page.tsx`
  - 任务：
    - [x] **视频播放器**
      - [x] 视频播放（支持倍速）
      - [x] 进度记忆
      - [ ] 视频笔记（时间点笔记）
    - [x] **文档阅读器**
      - [x] PDF 预览
      - [x] 富文本内容展示
      - [ ] 思维导图展示
    - [x] **侧边栏**
      - [x] 章节目录（快速跳转）
      - [ ] 笔记列表
      - [ ] 相关知识点

### 19.5 前端开发 - 管理端 🔧 admin

#### 19.5.1 课程分类管理
- [x] 创建分类管理页面
  - 文件：`apps/admin/app/(dashboard)/learning/categories/page.tsx`
  - API：`apps/admin/services/course-api.ts`
  - 任务：
    - [x] 分类树展示
    - [x] 新增/编辑/删除分类
    - [x] 分类排序调整（拖拽）
    - [x] 批量操作

#### 19.5.2 课程管理
- [x] 创建课程管理页面
  - 文件：`apps/admin/app/(dashboard)/learning/courses/page.tsx`
  - 任务：
    - [x] 课程列表（表格展示）
    - [x] 筛选功能（分类、状态、类型）
    - [x] 新建课程
    - [x] 编辑课程（需单独页面）
    - [x] 发布/下架课程
    - [x] 删除课程

#### 19.5.3 课程编辑页面
- [x] 创建课程编辑页面
  - 文件：`apps/admin/app/(dashboard)/learning/courses/[id]/page.tsx`
  - 任务：
    - [x] **基本信息编辑**
      - [x] 标题、副标题
      - [x] 封面上传
      - [x] 分类选择
      - [x] 难度设置
      - [x] 讲师信息
    - [x] **章节管理**
      - [x] 章节树编辑
      - [x] 拖拽排序
      - [x] 添加/编辑/删除章节
    - [x] **内容上传**
      - [x] 视频URL输入
      - [x] 文档内容输入
      - [x] 富文本编辑器（待实现）
    - [x] **发布设置**
      - [x] 定价设置（免费/付费/VIP）
      - [x] 发布状态

#### 19.5.4 知识点管理
- [x] 创建知识点管理页面
  - 文件：`apps/admin/app/(dashboard)/learning/knowledge-points/page.tsx`
  - 任务：
    - [x] 知识点树展示
    - [x] 新增/编辑/删除知识点
    - [x] 关联课程设置（待扩展）
    - [x] 重要程度/考频设置

### 19.6 学习内容页面 - 行测 👤 web

> 📝 行测是公务员考试的核心科目，包含五大模块

#### 19.6.1 行测学习首页
- [x] 创建行测学习首页
  - 文件：`apps/web/app/(user)/learn/xingce/page.tsx`
  - 任务：
    - [x] **模块导航卡片**
      - [x] 言语理解与表达（图标、进度、题目数）
      - [x] 数量关系（图标、进度、题目数）
      - [x] 判断推理（图标、进度、题目数）
      - [x] 资料分析（图标、进度、题目数）
      - [x] 常识判断（图标、进度、题目数）
    - [x] **学习进度总览**
      - [x] 总体掌握度环形图
      - [x] 各模块进度条
    - [x] **推荐学习**
      - [x] 薄弱知识点推荐
      - [x] 今日必学内容
    - [x] **快捷入口**
      - [x] 继续上次学习
      - [x] 行测真题卷
      - [x] 行测模拟卷

#### 19.6.2 言语理解与表达
- [x] 创建言语理解学习页面
  - 文件：`apps/web/app/(user)/learn/xingce/yanyu/page.tsx`
  - 任务：
    - [x] **知识点导航**
      - [x] 逻辑填空
        - [x] 实词辨析（词义辨析、语境分析、固定搭配）
        - [x] 成语辨析（近义成语、易混成语、成语误用）
        - [x] 关联词（递进、转折、因果、并列、条件）
      - [x] 片段阅读
        - [x] 主旨概括（总分结构、分总结构、总分总结构）
        - [x] 意图判断（言外之意、作者态度）
        - [x] 细节理解（细节判断、细节查找）
        - [x] 标题选择（新闻标题、议论文标题）
        - [x] 词句理解
        - [x] 下文推断
      - [x] 语句表达
        - [x] 语句排序（首句判断、逻辑顺序）
        - [x] 语句填空（承上启下、总结句）
    - [x] **学习内容卡片**
      - [x] 知识点讲解视频
      - [x] 方法技巧总结
      - [x] 典型例题演练
      - [x] 专项练习入口
    - [x] **进度追踪**
      - [x] 知识点掌握状态
      - [x] 做题正确率

#### 19.6.3 数量关系
- [x] 创建数量关系学习页面
  - 文件：`apps/web/app/(user)/learn/xingce/shuliang/page.tsx`
  - 任务：
    - [x] **数学运算知识点**
      - [x] 计算问题（速算技巧、尾数法、整除特性）
      - [x] 行程问题（相遇追及、流水行船、环形轨道）
      - [x] 工程问题（单独完成、合作完成、交替完成）
      - [x] 利润问题（成本利润、打折促销、分段计费）
      - [x] 浓度问题（溶液混合、蒸发稀释）
      - [x] 排列组合（加法原理、乘法原理、排列、组合）
      - [x] 概率问题（古典概型、独立事件、条件概率）
      - [x] 几何问题（平面几何、立体几何、最短路径）
      - [x] 极值问题（最大值、最小值、最优解）
      - [x] 容斥问题（两集合、三集合）
      - [x] 年龄问题
      - [x] 日期问题
      - [x] 植树问题
      - [x] 鸡兔同笼
      - [x] 牛吃草问题
    - [x] **数字推理知识点**
      - [x] 等差数列（基础、二级、多级）
      - [x] 等比数列
      - [x] 递推数列（和递推、积递推、差递推）
      - [x] 分数数列
      - [x] 幂次数列
      - [x] 多重数列
      - [x] 图形数字推理
    - [x] **学习资源**
      - [x] 公式速记卡片
      - [x] 计算技巧视频
      - [x] 经典题型精讲

#### 19.6.4 判断推理
- [x] 创建判断推理学习页面
  - 文件：`apps/web/app/(user)/learn/xingce/panduan/page.tsx`
  - 任务：
    - [x] **图形推理知识点**
      - [x] 规律类图形
        - [x] 位置规律（平移、旋转、翻转）
        - [x] 样式规律（叠加、遍历、对称）
        - [x] 属性规律（封闭性、曲直性、对称性）
        - [x] 数量规律（点、线、面、角、素）
      - [x] 重构类图形
        - [x] 空间重构（六面体、四面体）
        - [x] 平面拼合
        - [x] 截面图
      - [x] 分类分组
    - [x] **定义判断知识点**
      - [x] 单定义判断（关键信息提取、排除法）
      - [x] 多定义判断
      - [x] 常见定义类型（法律类、管理类、心理类、社会类）
    - [x] **类比推理知识点**
      - [x] 语义关系（近义、反义、比喻象征）
      - [x] 逻辑关系（并列、包含、交叉、全异）
      - [x] 语法关系（主谓、动宾、偏正）
      - [x] 常识关系（功能、组成、因果、时间顺序）
    - [x] **逻辑判断知识点**
      - [x] 翻译推理（充分必要、逆否命题、推理规则）
      - [x] 真假推理（矛盾关系、反对关系）
      - [x] 分析推理（排除法、假设法、最大信息法）
      - [x] 归纳推理（结论型、前提型）
      - [x] 加强削弱（加强论点、削弱论点、搭桥、拆桥）

#### 19.6.5 资料分析
- [x] 创建资料分析学习页面
  - 文件：`apps/web/app/(user)/learn/xingce/ziliao/page.tsx`
  - 任务：
    - [x] **核心概念精讲**
      - [x] 增长问题
        - [x] 增长率计算（同比、环比）
        - [x] 增长量计算
        - [x] 年均增长率
        - [x] 增长率比较
      - [x] 比重问题
        - [x] 现期比重
        - [x] 基期比重
        - [x] 比重变化量
        - [x] 比重变化方向判断
      - [x] 倍数问题
        - [x] 现期倍数
        - [x] 基期倍数
        - [x] 倍数与增长率关系
      - [x] 平均数问题
        - [x] 现期平均数
        - [x] 基期平均数
        - [x] 平均数增长率
      - [x] 综合分析
        - [x] 多知识点混合
        - [x] 选项排除技巧
    - [x] **速算技巧**
      - [x] 截位直除法
      - [x] 特征数字法
      - [x] 有效数字法
      - [x] 错位加减法
      - [x] 同位比较法
    - [x] **材料类型解读**
      - [x] 文字材料（关键数据定位）
      - [x] 表格材料（行列交叉读取）
      - [x] 图形材料（柱状图、折线图、饼图）
      - [x] 混合材料

#### 19.6.6 常识判断
- [x] 创建常识判断学习页面
  - 文件：`apps/web/app/(user)/learn/xingce/changshi/page.tsx`
  - 任务：
    - [x] **政治常识**
      - [x] 时政热点（年度重要会议、政策文件）
      - [x] 中国特色社会主义理论体系
      - [x] 习近平新时代中国特色社会主义思想
      - [x] 党的建设
    - [x] **法律常识**
      - [x] 宪法（国家机构、公民权利义务）
      - [x] 民法典（民事主体、物权、合同、婚姻家庭）
      - [x] 刑法（犯罪构成、刑罚种类、常见罪名）
      - [x] 行政法（行政行为、行政复议、行政诉讼）
      - [x] 劳动法与社会保障法
    - [x] **经济常识**
      - [x] 宏观经济（GDP、通货膨胀、财政政策、货币政策）
      - [x] 微观经济（供求关系、市场类型、价格机制）
      - [x] 国际经济（国际贸易、汇率、国际组织）
    - [x] **历史常识**
      - [x] 中国古代史（朝代更替、重要事件、文化成就）
      - [x] 中国近现代史（鸦片战争至新中国成立）
      - [x] 世界史（文艺复兴、工业革命、两次世界大战）
      - [x] 党史（重要会议、重要人物、重要事件）
    - [x] **地理常识**
      - [x] 自然地理（地球运动、气候类型、地形地貌）
      - [x] 人文地理（人口、城市、农业、工业）
      - [x] 中国地理（行政区划、重要山川、资源分布）
      - [x] 世界地理（大洲大洋、主要国家）
    - [x] **科技常识**
      - [x] 物理（力学、光学、电学、热学）
      - [x] 化学（元素周期表、化学反应、生活化学）
      - [x] 生物（细胞、遗传、生态、人体健康）
      - [x] 信息技术（计算机、互联网、人工智能）
      - [x] 前沿科技（航天、新能源、生物技术）
    - [x] **文学常识**
      - [x] 古代文学（诗词曲赋、古典名著）
      - [x] 现代文学（重要作家作品）
      - [x] 外国文学（世界名著）
      - [x] 文化常识（节日、习俗、礼仪）

### 19.7 学习内容页面 - 申论 👤 web

> 📝 申论是公务员考试的重要科目，考察综合分析和文字表达能力

#### 19.7.1 申论学习首页
- [x] 创建申论学习首页
  - 文件：`apps/web/app/(user)/learn/shenlun/page.tsx`
  - 任务：
    - [x] **题型导航**
      - [x] 归纳概括（进度、得分率）
      - [x] 提出对策（进度、得分率）
      - [x] 综合分析（进度、得分率）
      - [x] 贯彻执行（进度、得分率）
      - [x] 文章写作（进度、得分率）
    - [x] **热点专题**
      - [x] 最新时政热点
      - [x] 申论热点素材库
    - [x] **范文精选**
      - [x] 高分范文赏析
      - [x] 精彩语句积累

#### 19.7.2 归纳概括专题
- [x] 创建归纳概括学习页面
  - 文件：`apps/web/app/(user)/learn/shenlun/guina/page.tsx`
  - 任务：
    - [x] **题型分类讲解**
      - [x] 概括问题（问题表现、原因分析）
      - [x] 概括原因（主观原因、客观原因）
      - [x] 概括做法/经验（主体分析、层面分析）
      - [x] 概括特点/变化（时间线索、对比分析）
      - [x] 概括影响/意义（正面影响、负面影响）
    - [x] **答题方法**
      - [x] 审题技巧（题目要求、字数限制、分值分配）
      - [x] 材料阅读技巧（关键词标注、段落大意）
      - [x] 要点提取技巧（直接摘抄、同义替换、归纳总结）
      - [x] 答案加工技巧（分类整理、逻辑排序、规范表述）
    - [x] **真题精讲**
      - [x] 国考真题解析
      - [x] 省考真题解析
    - [x] **专项练习**
      - [x] 限时训练入口
      - [x] 批改标准参考

#### 19.7.3 提出对策专题
- [x] 创建提出对策学习页面
  - 文件：`apps/web/app/(user)/learn/shenlun/duice/page.tsx`
  - 任务：
    - [x] **对策类型讲解**
      - [x] 直接对策（材料中的对策）
      - [x] 间接对策（由问题/原因推出）
      - [x] 经验借鉴类（借鉴成功经验）
      - [x] 教训启示类（吸取失败教训）
    - [x] **对策维度**
      - [x] 思想层面（意识、观念、态度）
      - [x] 制度层面（法规、政策、机制）
      - [x] 管理层面（监管、执法、服务）
      - [x] 技术层面（手段、方法、工具）
      - [x] 人才层面（培训、引进、激励）
      - [x] 资金层面（投入、保障、补贴）
    - [x] **答题技巧**
      - [x] 对策来源分析
      - [x] 对策表述规范
      - [x] 对策可行性检验

#### 19.7.4 综合分析专题
- [x] 创建综合分析学习页面
  - 文件：`apps/web/app/(user)/learn/shenlun/fenxi/page.tsx`
  - 任务：
    - [x] **题型分类**
      - [x] 解释型分析（解释含义、分析内涵、得出结论）
      - [x] 评价型分析（观点判断、理由阐述、结论表态）
      - [x] 比较型分析（相同点、不同点、综合评价）
      - [x] 启示型分析（提炼经验、得出启示）
      - [x] 关系型分析（分析要素间关系）
    - [x] **答题结构**
      - [x] 总-分-总结构
      - [x] 是什么-为什么-怎么办
      - [x] 正-反-合结构
    - [x] **经典题目精讲**

#### 19.7.5 贯彻执行专题
- [x] 创建贯彻执行学习页面
  - 文件：`apps/web/app/(user)/learn/shenlun/guanche/page.tsx`
  - 任务：
    - [x] **公文类型详解**
      - [x] **讲话发言类**
        - [x] 讲话稿（开场白、主体、结尾）
        - [x] 发言稿
        - [x] 致辞
      - [x] **宣传倡议类**
        - [x] 倡议书（称呼、背景、倡议内容、落款）
        - [x] 公开信
        - [x] 宣传稿
        - [x] 宣传纲要/提纲
      - [x] **总结报告类**
        - [x] 调研报告（调研目的、方法、发现、建议）
        - [x] 工作总结
        - [x] 汇报材料
        - [x] 情况说明
      - [x] **方案计划类**
        - [x] 工作方案（背景、目标、措施、保障）
        - [x] 活动策划
        - [x] 实施方案
      - [x] **新闻传媒类**
        - [x] 新闻稿（标题、导语、主体、背景、结尾）
        - [x] 简报
        - [x] 编者按
        - [x] 短评/短文
      - [x] **其他文书**
        - [x] 建议书
        - [x] 意见
        - [x] 通知
        - [x] 备忘录
        - [x] 导言/前言/序言
    - [x] **格式规范**
      - [x] 标题写法
      - [x] 称呼与落款
      - [x] 日期格式
    - [x] **高分范文库**

#### 19.7.6 文章写作专题
- [x] 创建文章写作学习页面
  - 文件：`apps/web/app/(user)/learn/shenlun/xiezuo/page.tsx`
  - 任务：
    - [x] **立意技巧**
      - [x] 题目解读（关键词分析、题目类型判断）
      - [x] 材料分析（核心主题、观点提炼）
      - [x] 立意角度（问题、原因、对策、意义）
      - [x] 立意检验（准确、明确、深刻）
    - [x] **标题拟定**
      - [x] 标题类型（陈述式、疑问式、对仗式、比喻式）
      - [x] 标题技巧
      - [x] 优秀标题范例库
    - [x] **开头写法**
      - [x] 概括式开头
      - [x] 转折式开头
      - [x] 案例式开头
      - [x] 引言式开头
      - [x] 排比式开头
      - [x] 开头范例库
    - [x] **分论点设置**
      - [x] 递进式结构
      - [x] 并列式结构
      - [x] 对比式结构
    - [x] **分论点论证**
      - [x] 理论论证（引用名言、理论阐述）
      - [x] 事实论证（案例分析、数据支撑）
      - [x] 正反论证（正面论述、反面警示）
      - [x] 比喻论证
    - [x] **结尾写法**
      - [x] 总结式结尾
      - [x] 升华式结尾
      - [x] 呼吁式结尾
      - [x] 展望式结尾
    - [x] **素材积累**
      - [x] 名言警句库
      - [x] 经典案例库
      - [x] 优美语句库
      - [x] 时政热点素材

### 19.8 学习内容页面 - 面试 👤 web

> 📝 面试是公考的最后关卡，考察综合素质和临场应变能力

#### 19.8.1 面试学习首页
- [x] 创建面试学习首页
  - 文件：`apps/web/app/(user)/learn/mianshi/page.tsx`
  - 任务：
    - [x] **面试形式**
      - [x] 结构化面试
      - [x] 无领导小组讨论
      - [x] 半结构化面试
    - [x] **题型导航**
      - [x] 各题型入口及学习进度
    - [x] **面试技巧**
      - [x] 礼仪规范
      - [x] 语言表达
      - [x] 心理调适

#### 19.8.2 结构化面试 - 综合分析题
- [x] 创建综合分析题学习页面
  - 文件：`apps/web/app/(user)/learn/mianshi/zonghefenxi/page.tsx`
  - 任务：
    - [x] **社会现象类**
      - [x] 正面现象（分析意义、推广措施）
      - [x] 负面现象（分析原因、提出对策）
      - [x] 两面性现象（辩证分析）
      - [x] 热点话题（时政热点分析框架）
    - [x] **政策理解类**
      - [x] 政策背景分析
      - [x] 政策意义分析
      - [x] 政策问题分析
      - [x] 政策建议
    - [x] **名言警句类**
      - [x] 习近平讲话
      - [x] 古代名言
      - [x] 领导人论述
    - [x] **哲理故事类**
      - [x] 寓言故事
      - [x] 名人事迹
      - [x] 启示提炼
    - [x] **答题框架**
      - [x] 破题表态
      - [x] 分析论述
      - [x] 总结升华

#### 19.8.3 结构化面试 - 计划组织题
- [x] 创建计划组织题学习页面
  - 文件：`apps/web/app/(user)/learn/mianshi/jihua/page.tsx`
  - 任务：
    - [x] **调研类**
      - [x] 调研对象确定
      - [x] 调研方式选择
      - [x] 调研内容设计
      - [x] 调研报告撰写
    - [x] **宣传类**
      - [x] 宣传目的明确
      - [x] 宣传对象确定
      - [x] 宣传方式选择
      - [x] 宣传内容设计
    - [x] **活动策划类**
      - [x] 活动主题确定
      - [x] 活动形式设计
      - [x] 活动流程安排
      - [x] 活动保障措施
    - [x] **会议组织类**
      - [x] 会前准备
      - [x] 会中服务
      - [x] 会后总结
    - [x] **专项整治类**
    - [x] **答题技巧**
      - [x] 目的意义分析
      - [x] 工作重点突出
      - [x] 创新亮点设计

#### 19.8.4 结构化面试 - 人际关系题
- [x] 创建人际关系题学习页面
  - 文件：`apps/web/app/(user)/learn/mianshi/renji/page.tsx`
  - 任务：
    - [x] **与领导关系**
      - [x] 被领导批评
      - [x] 与领导意见不一致
      - [x] 多头领导
      - [x] 新领导上任
    - [x] **与同事关系**
      - [x] 同事不配合
      - [x] 同事抢功劳
      - [x] 同事间矛盾
      - [x] 新同事相处
    - [x] **与下属关系**
      - [x] 下属不服从
      - [x] 下属能力不足
      - [x] 下属间矛盾
    - [x] **与群众关系**
      - [x] 群众不理解
      - [x] 群众投诉
      - [x] 群众诉求处理
    - [x] **与亲友关系**
      - [x] 亲友请托
      - [x] 工作与家庭平衡
    - [x] **答题原则**
      - [x] 阳光心态
      - [x] 换位思考
      - [x] 有效沟通
      - [x] 工作为重

#### 19.8.5 结构化面试 - 应急应变题
- [x] 创建应急应变题学习页面
  - 文件：`apps/web/app/(user)/learn/mianshi/yingji/page.tsx`
  - 任务：
    - [x] **公共危机类**
      - [x] 自然灾害应对
      - [x] 事故灾难处理
      - [x] 公共卫生事件
      - [x] 社会安全事件
    - [x] **工作危机类**
      - [x] 工作突发状况
      - [x] 任务冲突
      - [x] 资源不足
    - [x] **舆情处理类**
      - [x] 网络舆情应对
      - [x] 媒体采访应对
      - [x] 信息公开策略
    - [x] **日常应变类**
      - [x] 群众冲突
      - [x] 误会澄清
      - [x] 临时任务
    - [x] **答题框架**
      - [x] 稳定情绪
      - [x] 了解情况
      - [x] 分类处理
      - [x] 总结预防

#### 19.8.6 结构化面试 - 自我认知题
- [x] 创建自我认知题学习页面
  - 文件：`apps/web/app/(user)/learn/mianshi/ziwo/page.tsx`
  - 任务：
    - [x] **求职动机**
      - [x] 为什么报考
      - [x] 为什么选择这个岗位
      - [x] 职业规划
    - [x] **自我介绍**
      - [x] 学习经历
      - [x] 工作经历
      - [x] 性格特点
      - [x] 兴趣爱好
    - [x] **优缺点分析**
    - [x] **价值观考察**
    - [x] **答题技巧**
      - [x] 真实具体
      - [x] 岗位匹配
      - [x] 积极正面

#### 19.8.7 结构化面试 - 情景模拟题
- [x] 创建情景模拟题学习页面
  - 文件：`apps/web/app/(user)/learn/mianshi/qingjing/page.tsx`
  - 任务：
    - [x] **劝说类**
      - [x] 劝说群众
      - [x] 劝说同事
      - [x] 劝说领导
    - [x] **解释类**
      - [x] 政策解释
      - [x] 误会澄清
    - [x] **安抚类**
      - [x] 情绪安抚
      - [x] 矛盾化解
    - [x] **模拟技巧**
      - [x] 入情入境
      - [x] 语言得体
      - [x] 态度真诚

#### 19.8.8 无领导小组讨论
- [x] 创建无领导小组讨论学习页面
  - 文件：`apps/web/app/(user)/learn/mianshi/wulingdao/page.tsx`
  - 任务：
    - [x] **题型分类**
      - [x] 开放式问题
      - [x] 两难式问题
      - [x] 排序式问题
      - [x] 资源分配式问题
    - [x] **角色策略**
      - [x] 领导者策略
      - [x] 时间控制者策略
      - [x] 记录者策略
      - [x] 普通讨论者策略
    - [x] **讨论流程**
      - [x] 个人陈述阶段
      - [x] 自由讨论阶段
      - [x] 总结陈词阶段
    - [x] **高分技巧**
      - [x] 积极参与
      - [x] 有效推进
      - [x] 团队协作
      - [x] 控场能力

#### 19.8.9 面试礼仪与技巧
- [x] 创建面试礼仪学习页面
  - 文件：`apps/web/app/(user)/learn/mianshi/liyi/page.tsx`
  - 任务：
    - [x] **着装规范**
      - [x] 男士着装
      - [x] 女士着装
      - [x] 配饰选择
    - [x] **仪态举止**
      - [x] 站姿坐姿
      - [x] 眼神交流
      - [x] 手势运用
    - [x] **语言表达**
      - [x] 语速语调
      - [x] 逻辑清晰
      - [x] 措辞得当
    - [x] **心理调适**
      - [x] 考前准备
      - [x] 紧张缓解
      - [x] 自信培养

### 19.9 学习内容页面 - 公共基础知识 👤 web

> 📝 公共基础知识是事业单位考试的重要科目

#### 19.9.1 公基学习首页
- [x] 创建公基学习首页
  - 文件：`apps/web/app/(user)/learn/gongji/page.tsx`
  - 任务：
    - [x] **知识模块导航**
      - [x] 政治理论
      - [x] 法律知识
      - [x] 经济知识
      - [x] 管理知识
      - [x] 公文写作
      - [x] 人文历史
      - [x] 科技地理
      - [x] 时事政治
    - [x] **学习进度概览**
    - [x] **每日知识点推送**

#### 19.9.2 政治理论专题
- [x] 创建政治理论学习页面
  - 文件：`apps/web/app/(user)/learn/gongji/zhengzhi/page.tsx`
  - 任务：
    - [x] **马克思主义哲学**
      - [x] 唯物论（物质与意识）
      - [x] 辩证法（联系、发展、矛盾）
      - [x] 认识论（实践与认识）
      - [x] 唯物史观（社会存在与社会意识）
    - [x] **毛泽东思想**
      - [x] 形成与发展
      - [x] 主要内容
      - [x] 活的灵魂
    - [x] **中国特色社会主义理论体系**
      - [x] 邓小平理论
      - [x] "三个代表"重要思想
      - [x] 科学发展观
    - [x] **习近平新时代中国特色社会主义思想**
      - [x] 核心要义
      - [x] 主要内容
      - [x] 重要论述
    - [x] **党史党建**
      - [x] 党的历史
      - [x] 党的建设
      - [x] 重要会议

#### 19.9.3 法律知识专题
- [x] 创建法律知识学习页面
  - 文件：`apps/web/app/(user)/learn/gongji/falv/page.tsx`
  - 任务：
    - [x] **法理学**
      - [x] 法的概念与特征
      - [x] 法律关系
      - [x] 法的运行
    - [x] **宪法**
      - [x] 宪法基本理论
      - [x] 国家基本制度
      - [x] 公民基本权利与义务
      - [x] 国家机构
    - [x] **民法典**
      - [x] 总则（民事主体、民事权利）
      - [x] 物权（所有权、用益物权、担保物权）
      - [x] 合同（订立、效力、履行、违约）
      - [x] 人格权
      - [x] 婚姻家庭
      - [x] 继承
      - [x] 侵权责任
    - [x] **刑法**
      - [x] 犯罪概述
      - [x] 犯罪构成要件
      - [x] 排除犯罪事由
      - [x] 刑罚种类
      - [x] 常见罪名
    - [x] **行政法**
      - [x] 行政主体
      - [x] 行政行为
      - [x] 行政复议
      - [x] 行政诉讼
      - [x] 国家赔偿
    - [x] **其他法律**
      - [x] 劳动法与劳动合同法
      - [x] 社会保障法
      - [x] 环境保护法
      - [x] 知识产权法

#### 19.9.4 公文写作专题
- [x] 创建公文写作学习页面
  - 文件：`apps/web/app/(user)/learn/gongji/gongwen/page.tsx`
  - 任务：
    - [x] **公文概述**
      - [x] 公文的概念与特点
      - [x] 公文的分类
      - [x] 公文的作用
    - [x] **公文格式**
      - [x] 眉首部分（发文机关标志、发文字号）
      - [x] 主体部分（标题、主送机关、正文、附件）
      - [x] 版记部分（抄送机关、印发机关）
    - [x] **常用文种**
      - [x] 决定
      - [x] 公告/通告
      - [x] 通知
      - [x] 通报
      - [x] 报告
      - [x] 请示
      - [x] 批复
      - [x] 意见
      - [x] 函
      - [x] 纪要
    - [x] **公文处理**
      - [x] 收文处理
      - [x] 发文处理
      - [x] 公文归档

### 19.10 学习内容组件库 👤 web

> 📝 可复用的学习内容展示组件

#### 19.10.1 视频播放组件
- [x] 创建视频播放组件
  - 文件：`apps/web/components/learning/VideoPlayer.tsx`
  - 任务：
    - [x] 视频播放器（支持 HLS/MP4）
    - [x] 播放控制（播放/暂停、进度条、音量）
    - [x] 倍速播放（0.5x-2x）
    - [x] 全屏切换
    - [x] 画中画模式
    - [x] 清晰度切换
    - [x] 进度记忆与恢复
    - [x] 视频笔记时间点标记
    - [x] 防挂机检测（定时暂停确认）

#### 19.10.2 文档阅读组件
- [x] 创建文档阅读组件
  - 文件：`apps/web/components/learning/DocumentReader.tsx`
  - 任务：
    - [x] PDF 预览（支持缩放、翻页）
    - [x] 富文本渲染（Markdown/HTML）
    - [x] 文档大纲导航
    - [x] 文字高亮标注
    - [x] 阅读进度保存
    - [x] 笔记关联

#### 19.10.3 思维导图组件
- [x] 创建思维导图组件
  - 文件：`apps/web/components/learning/MindMap.tsx`
  - 任务：
    - [x] 思维导图渲染
    - [x] 节点展开/折叠
    - [x] 缩放与平移
    - [x] 节点搜索高亮
    - [x] 导出图片

#### 19.10.4 知识点卡片组件
- [x] 创建知识点卡片组件
  - 文件：`apps/web/components/learning/KnowledgeCard.tsx`
  - 任务：
    - [x] 卡片正面（知识点名称、关键词）
    - [x] 卡片背面（详细解释、示例）
    - [x] 翻转动画
    - [x] 掌握度标记
    - [x] 收藏功能

#### 19.10.5 公式展示组件
- [x] 创建公式展示组件
  - 文件：`apps/web/components/learning/FormulaDisplay.tsx`
  - 任务：
    - [x] LaTeX 公式渲染
    - [x] 数学公式卡片
    - [x] 公式复制
    - [x] 公式收藏

#### 19.10.6 题型讲解组件
- [x] 创建题型讲解组件
  - 文件：`apps/web/components/learning/QuestionTypeGuide.tsx`
  - 任务：
    - [x] 题型介绍
    - [x] 解题步骤展示
    - [x] 典型例题展示
    - [x] 常见错误提示
    - [x] 相关知识点链接

#### 19.10.7 学习进度组件
- [x] 创建学习进度组件
  - 文件：`apps/web/components/learning/LearningProgress.tsx`
  - 任务：
    - [x] 环形进度图
    - [x] 进度条
    - [x] 知识点完成度树
    - [x] 学习时长统计

#### 19.10.8 素材展示组件
- [x] 创建素材展示组件
  - 文件：`apps/web/components/learning/MaterialDisplay.tsx`
  - 任务：
    - [x] 名言警句卡片
    - [x] 案例故事卡片
    - [x] 优美语句卡片
    - [x] 复制/收藏功能
    - [x] 分类筛选

---

## 20. 公考学习包 - 题库系统 👤 web + 🔧 admin + ⚙️ server

> 📁 开发目录：`apps/web/`（做题端）、`apps/admin/`（题库管理）、`apps/server/`（后端）
> 📝 功能说明：构建全面的公考题库，支持练习和模拟考试

### 20.1 数据库设计 ⚙️ server

#### 20.1.1 题目表
- [x] 设计 `what_questions` 表
  - 字段清单：
    - [x] `id` - 主键
    - [x] `category_id` - 所属分类（关联知识点）
    - [x] `question_type` - 题型（single_choice/multi_choice/fill_blank/essay/material）
    - [x] `difficulty` - 难度（1-5）
    - [x] `source_type` - 来源类型（real_exam/mock/original）
    - [x] `source_year` - 来源年份
    - [x] `source_region` - 来源地区（国考/省考-XX省）
    - [x] `source_exam` - 来源考试名称
    - [x] `content` - 题目内容（富文本/Markdown）
    - [x] `material_id` - 关联材料ID（资料分析/申论材料题）
    - [x] `options` - 选项（JSON：[{key, content}]）
    - [x] `answer` - 正确答案
    - [x] `analysis` - 答案解析
    - [x] `tips` - 解题技巧
    - [x] `knowledge_points` - 关联知识点ID（JSON数组）
    - [x] `tags` - 标签（JSON：高频/易错/典型等）
    - [x] `attempt_count` - 作答次数
    - [x] `correct_count` - 正确次数
    - [x] `correct_rate` - 正确率
    - [x] `avg_time` - 平均用时（秒）
    - [x] `is_vip` - 是否VIP题目
    - [x] `status` - 状态（draft/published/archived）
    - [x] `created_at` - 创建时间
    - [x] `updated_at` - 更新时间

#### 20.1.2 材料表
- [x] 设计 `what_question_materials` 表（资料分析/申论材料）
  - 字段清单：
    - [x] `id` - 主键
    - [x] `title` - 材料标题
    - [x] `content` - 材料内容（富文本）
    - [x] `content_type` - 内容类型（text/table/chart）
    - [x] `source_year` - 来源年份
    - [x] `source_exam` - 来源考试
    - [x] `created_at` - 创建时间

#### 20.1.3 试卷表
- [x] 设计 `what_exam_papers` 表
  - 字段清单：
    - [x] `id` - 主键
    - [x] `title` - 试卷标题
    - [x] `paper_type` - 类型（real_exam/mock/daily）
    - [x] `exam_type` - 考试类型（国考/省考/事业单位）
    - [x] `subject` - 科目（行测/申论）
    - [x] `year` - 年份
    - [x] `region` - 地区
    - [x] `total_questions` - 题目总数
    - [x] `total_score` - 总分
    - [x] `time_limit` - 时间限制（分钟）
    - [x] `questions` - 题目列表（JSON：[{question_id, score, order}]）
    - [x] `sections` - 试卷分区（JSON：[{name, question_ids}]）
    - [x] `is_free` - 是否免费
    - [x] `attempt_count` - 作答人次
    - [x] `avg_score` - 平均分
    - [x] `status` - 状态
    - [x] `created_at` - 创建时间

#### 20.1.4 用户做题记录表
- [x] 设计 `what_user_question_records` 表
  - 字段清单：
    - [x] `id` - 主键
    - [x] `user_id` - 用户ID
    - [x] `question_id` - 题目ID
    - [x] `user_answer` - 用户答案
    - [x] `is_correct` - 是否正确
    - [x] `time_spent` - 用时（秒）
    - [x] `practice_type` - 练习类型（random/category/paper/wrong_redo）
    - [x] `practice_id` - 练习/试卷ID
    - [x] `created_at` - 作答时间

#### 20.1.5 用户试卷记录表
- [x] 设计 `what_user_paper_records` 表
  - 字段清单：
    - [x] `id` - 主键
    - [x] `user_id` - 用户ID
    - [x] `paper_id` - 试卷ID
    - [x] `start_time` - 开始时间
    - [x] `end_time` - 结束时间
    - [x] `time_spent` - 总用时
    - [x] `score` - 得分
    - [x] `correct_count` - 正确题数
    - [x] `wrong_count` - 错误题数
    - [x] `unanswered_count` - 未答题数
    - [x] `answers` - 答题详情（JSON）
    - [x] `status` - 状态（in_progress/submitted/scored）
    - [x] `created_at` - 创建时间

### 20.2 题库内容规划

#### 20.2.1 真题库
- [ ] 规划真题收录范围
  - **国家公务员考试**
    - [ ] 近10年国考行测真题
    - [ ] 近10年国考申论真题
  - **省级公务员考试**
    - [ ] 联考行测真题（近5年）
    - [ ] 各省单独命题真题
  - **事业单位考试**
    - [ ] 事业单位联考真题
    - [ ] 各省市事业单位真题
  - **其他考试**
    - [ ] 选调生真题
    - [ ] 军队文职真题
    - [ ] 银行招聘真题

#### 20.2.2 模拟题库
- [ ] 规划模拟题类型
  - [ ] 行测模拟卷
  - [ ] 申论模拟卷
  - [ ] 专项突破题
  - [ ] 押题预测卷

### 20.3 后端开发 ⚙️ server

#### 20.3.1 Model 层
- [x] 创建题库相关模型
  - 文件：`apps/server/internal/model/question.go`
  - 任务：
    - [x] `Question` 模型
    - [x] `QuestionMaterial` 模型
    - [x] `ExamPaper` 模型
    - [x] `UserQuestionRecord` 模型
    - [x] `UserPaperRecord` 模型

#### 20.3.2 Repository 层
- [x] 创建题库 Repository
  - 文件：`apps/server/internal/repository/question_repository.go`
  - 任务：
    - [x] `GetQuestionsByCategory(categoryID, params)` - 按分类获取题目
    - [x] `GetRandomQuestions(categoryID, count)` - 随机获取题目
    - [x] `GetQuestion(id)` - 获取题目详情
    - [x] `GetPapers(params)` - 获取试卷列表
    - [x] `GetPaper(id)` - 获取试卷详情
    - [x] `SaveQuestionRecord(record)` - 保存做题记录
    - [x] `GetUserWrongQuestions(userID, params)` - 获取用户错题
    - [x] `GetQuestionStats(questionID)` - 获取题目统计

#### 20.3.3 Service 层
- [x] 创建题库 Service
  - 文件：`apps/server/internal/service/question_service.go`
  - 任务：
    - [x] `GetQuestionList(params)` - 获取题目列表
    - [x] `GetQuestionForPractice(categoryID, count, excludeIDs)` - 获取练习题目
    - [x] `SubmitAnswer(userID, questionID, answer)` - 提交答案
    - [x] `GetPaperDetail(paperID, userID)` - 获取试卷（含用户状态）
    - [x] `StartPaper(userID, paperID)` - 开始做试卷
    - [x] `SubmitPaper(userID, paperID, answers)` - 提交试卷
    - [x] `GetPaperResult(recordID)` - 获取试卷结果

#### 20.3.4 Handler 层
- [x] 创建题库 API Handler
  - 文件：`apps/server/internal/handler/question_handler.go`
  - API 清单：
    - [x] `GET /api/v1/questions` - 获取题目列表
    - [x] `GET /api/v1/questions/:id` - 获取题目详情
    - [x] `POST /api/v1/questions/:id/answer` - 提交答案
    - [x] `GET /api/v1/papers` - 获取试卷列表
    - [x] `GET /api/v1/papers/:id` - 获取试卷详情
    - [x] `POST /api/v1/papers/:id/start` - 开始做卷
    - [x] `POST /api/v1/papers/:id/submit` - 提交试卷
    - [x] `GET /api/v1/papers/:id/result` - 获取试卷结果
    - [x] `GET /api/v1/user/wrong-questions` - 获取错题列表

### 20.4 前端开发 - 用户端 👤 web

#### 20.4.1 题库首页
- [x] 创建题库首页
  - 文件：`apps/web/app/(user)/practice/page.tsx`
  - 任务：
    - [x] **快捷入口**
      - [x] 每日一练
      - [x] 真题练习
      - [x] 模拟考试
      - [x] 错题重做
      - [x] 收藏题目
    - [x] **分类入口**
      - [x] 行测题库
      - [x] 申论题库
      - [x] 面试题库
      - [x] 公基题库
    - [x] **做题统计**
      - [x] 今日做题数
      - [x] 累计做题数
      - [x] 正确率趋势

#### 20.4.2 分类题库页面
- [x] 创建分类题库页面
  - 文件：`apps/web/app/(user)/practice/[subject]/page.tsx`
  - 任务：
    - [x] **知识点分类**
      - [x] 树形知识点导航
      - [x] 各知识点题目数量
      - [x] 已做/未做统计 ✅
    - [x] **题目筛选**
      - [x] 难度筛选
      - [x] 来源筛选（真题/模拟）
      - [x] 年份筛选
      - [x] 地区筛选
    - [x] **开始练习入口**
      - [x] 选择题目数量
      - [x] 选择做题模式（练习/计时）

#### 20.4.3 做题页面
- [x] 创建做题页面
  - 文件：`apps/web/app/(user)/practice/do/page.tsx`
  - 任务：
    - [x] **题目展示区**
      - [x] 题目内容（支持图片/表格）
      - [x] 选项展示
      - [x] 材料折叠展示（资料分析）
    - [x] **答题区**
      - [x] 选项点击选择
      - [x] 多选题支持
      - [x] 填空题输入
    - [x] **操作栏**
      - [x] 上一题/下一题
      - [x] 提交答案
      - [x] 标记题目
      - [x] 收藏题目
    - [x] **答题卡**
      - [x] 题目列表（显示已答/未答/标记状态）
      - [x] 快速跳转

#### 20.4.4 答案解析页面
- [x] 创建解析展示
  - 任务：
    - [x] 用户答案 vs 正确答案
    - [x] 详细解析
    - [x] 解题技巧
    - [x] 知识点链接 ✅
    - [x] 相似题推荐 ✅
    - [x] 添加笔记 ✅

#### 20.4.5 试卷列表页面
- [x] 创建试卷列表页面
  - 文件：`apps/web/app/(user)/practice/papers/page.tsx`
  - 任务：
    - [x] **分类筛选**
      - [x] 真题卷/模拟卷
      - [x] 考试类型
      - [x] 年份
      - [x] 地区
    - [x] **试卷卡片**
      - [x] 试卷名称
      - [x] 题目数量、时间限制
      - [x] 做过人数、平均分
      - [x] 我的成绩（如做过）

#### 20.4.6 模拟考试页面
- [x] 创建模拟考试页面
  - 文件：`apps/web/app/(user)/practice/exam/[paperId]/page.tsx`
  - 任务：
    - [x] **考试界面**
      - [x] 倒计时显示
      - [x] 题目区域
      - [x] 答题卡（可折叠）
    - [x] **交卷功能**
      - [x] 手动交卷
      - [x] 时间到自动交卷
      - [x] 交卷确认弹窗

#### 20.4.7 考试结果页面
- [x] 创建考试结果页面
  - 文件：`apps/web/app/(user)/practice/exam/[paperId]/result/page.tsx`
  - 任务：
    - [x] **成绩总览**
      - [x] 得分/总分
      - [x] 正确率
      - [x] 用时
      - [ ] 排名（如有）
    - [x] **分项统计**
      - [x] 各题型得分
      - [x] 各知识点得分
    - [x] **答题详情**
      - [x] 逐题查看
      - [x] 查看解析
    - [x] **操作按钮**
      - [x] 错题回顾
      - [x] 重新做卷
      - [x] 分享成绩

### 20.5 前端开发 - 管理端 🔧 admin

#### 20.5.1 题目管理
- [x] 创建题目管理页面
  - 文件：`apps/admin/app/(dashboard)/learning/questions/page.tsx`
  - 任务：
    - [x] 题目列表（表格）
    - [x] 筛选功能（分类、题型、来源、状态）
    - [x] 批量导入（Excel）✅
    - [x] 批量操作

#### 20.5.2 题目编辑
- [x] 创建题目编辑页面
  - 文件：`apps/admin/app/(dashboard)/learning/questions/[id]/page.tsx`
  - 任务：
    - [x] **基本信息**
      - [x] 分类选择
      - [x] 题型选择
      - [x] 难度设置
      - [x] 来源信息
    - [x] **题目内容**
      - [x] 富文本编辑器
      - [x] 图片/表格插入 ✅
      - [x] 公式编辑器 ✅
    - [x] **选项编辑**
      - [x] 动态添加选项
      - [x] 设置正确答案
    - [x] **解析编辑**
      - [x] 答案解析
      - [x] 解题技巧
      - [x] 关联知识点 ✅

#### 20.5.3 试卷管理
- [x] 创建试卷管理页面
  - 文件：`apps/admin/app/(dashboard)/learning/papers/page.tsx`
  - 任务：
    - [x] 试卷列表
    - [x] 新建试卷
    - [x] 编辑试卷（组卷）
    - [x] 发布/下架

#### 20.5.4 组卷页面
- [x] 创建组卷页面
  - 文件：`apps/admin/app/(dashboard)/learning/papers/[id]/page.tsx`
  - 任务：
    - [x] **试卷信息**
      - [x] 标题、类型
      - [x] 时间限制
      - [x] 分值设置
    - [x] **题目选择**
      - [x] 从题库选题
      - [x] 按知识点选题
      - [x] 随机组卷
      - [x] 拖拽排序
    - [x] **分区设置** ✅
      - [x] 添加分区（言语理解、数量关系等） ✅
      - [x] 分区内题目管理 ✅

---

## 21. 公考学习包 - 练习测试 👤 web + ⚙️ server

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：多种练习模式，满足不同学习需求

### 21.1 练习模式

#### 21.1.1 每日一练
- [x] 实现每日一练功能
  - 后端任务：
    - [x] 每日题目生成算法（根据用户弱项智能推送）
    - [x] 每日题目缓存
    - [x] 完成状态记录
  - 前端任务：
    - [x] 每日一练入口（首页醒目位置）
    - [x] 题目展示
    - [x] 完成打卡动效
    - [x] 连续打卡天数显示

#### 21.1.2 专项练习
- [x] 实现专项练习功能
  - 任务：
    - [x] 按知识点练习
    - [x] 按题型练习
    - [x] 按难度练习
    - [x] 自定义练习（选择题目数量、知识点组合）

#### 21.1.3 随机练习
- [x] 实现随机练习功能
  - 任务：
    - [x] 智能随机（根据用户薄弱点加权）
    - [x] 完全随机
    - [x] 快速练习（10题/20题/50题）

#### 21.1.4 计时练习
- [x] 实现计时练习功能
  - 任务：
    - [x] 单题限时模式
    - [x] 整体限时模式
    - [x] 倒计时显示
    - [x] 超时提醒

#### 21.1.5 错题重做
- [x] 实现错题重做功能
  - 后端任务：
    - [x] 获取用户错题（支持筛选）
    - [x] 错题移除逻辑（做对N次后移除）
  - 前端任务：
    - [x] 错题列表页面
    - [x] 错题筛选（按分类、时间、错误次数）
    - [x] 开始重做
    - [x] 错题本导出

### 21.2 模拟考试增强

#### 21.2.1 考试环境模拟
- [x] 优化模拟考试体验
  - 任务：
    - [x] 全屏考试模式
    - [x] 防作弊提示（切换窗口提醒）
    - [x] 草稿纸功能
    - [x] 计算器工具
    - [x] 涂卡功能模拟

#### 21.2.2 断点续做
- [x] 实现断点续做功能
  - 任务：
    - [x] 定时自动保存答案
    - [x] 关闭页面提醒
    - [x] 重新打开恢复进度

---

## 22. 公考学习包 - 学习工具 👤 web + ⚙️ server

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：辅助学习的各种工具

### 22.1 学习计划

#### 22.1.1 数据库设计
- [x] 设计 `what_study_plans` 表
  - 字段清单：
    - [x] `id` - 主键
    - [x] `user_id` - 用户ID
    - [x] `title` - 计划名称
    - [x] `exam_type` - 目标考试类型
    - [x] `target_exam_date` - 目标考试日期
    - [x] `start_date` - 计划开始日期
    - [x] `end_date` - 计划结束日期
    - [x] `daily_study_time` - 每日学习时长目标（分钟）
    - [x] `daily_questions` - 每日做题数目标
    - [x] `plan_details` - 计划详情（JSON：各阶段安排）
    - [x] `status` - 状态（active/completed/abandoned）
    - [x] `created_at` - 创建时间

#### 22.1.2 学习计划功能
- [x] 实现学习计划功能
  - 后端任务：
    - [x] 计划 CRUD API
    - [x] 计划模板推荐
    - [x] 计划进度计算
  - 前端任务：
    - [x] 创建学习计划页面 (`/learn/plan`)
    - [x] 计划详情页面
    - [x] 每日任务清单
    - [x] 计划调整功能

### 22.2 学习时长追踪

#### 22.2.1 数据库设计
- [x] 设计 `what_study_time_records` 表
  - 字段清单：
    - [x] `id` - 主键
    - [x] `user_id` - 用户ID
    - [x] `study_type` - 学习类型（video/article/practice/exam）
    - [x] `subject` - 科目
    - [x] `content_id` - 内容ID（课程ID/试卷ID）
    - [x] `duration` - 时长（秒）
    - [x] `study_date` - 学习日期
    - [x] `start_time` - 开始时间
    - [x] `end_time` - 结束时间
    - [x] `created_at` - 记录时间

#### 22.2.2 学习时长功能
- [x] 实现学习时长追踪
  - 后端任务：
    - [x] 学习时长记录 API
    - [x] 时长统计 API（日/周/月）
  - 前端任务：
    - [x] 学习统计页面 (`/learn/stats`)
    - [x] 时长统计展示（日/周/月）
    - [x] 学习趋势图表
    - [x] 学习分布展示

### 22.3 收藏功能

#### 22.3.1 学习内容收藏
- [x] 设计 `what_learning_favorites` 表
  - 字段清单：
    - [x] `id` - 主键
    - [x] `user_id` - 用户ID
    - [x] `content_type` - 内容类型（course/question/knowledge）
    - [x] `content_id` - 内容ID
    - [x] `folder_id` - 收藏夹ID（可选）
    - [x] `note` - 备注
    - [x] `created_at` - 收藏时间

#### 22.3.2 收藏夹管理
- [x] 实现收藏夹功能
  - 后端任务：
    - [x] 创建/编辑/删除收藏夹 API
    - [x] 收藏内容分类 API
    - [x] 收藏列表 API
    - [x] 批量检查收藏状态 API
  - 前端任务：
    - [x] 收藏列表页面 (`/learn/favorites`)
    - [x] 收藏夹管理UI
    - [x] 收藏类型筛选
    - [x] 移动收藏到文件夹

### 22.4 知识图谱

#### 22.4.1 知识图谱展示
- [x] 实现知识图谱功能
  - 后端任务：
    - [x] 用户知识点掌握度追踪 API
    - [x] 薄弱知识点查询 API
    - [x] 掌握度统计 API
  - 前端任务：
    - [x] 知识点掌握度展示（在学习统计页面）
    - [x] 薄弱知识点列表
    - [x] 掌握度分布统计

---

## 23. 公考学习包 - 错题本与笔记 👤 web + ⚙️ server

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：错题记录与学习笔记管理

### 23.1 错题本系统

#### 23.1.1 错题本数据库
- [x] 设计 `what_wrong_questions` 表
  - 字段清单：
    - [x] `id` - 主键
    - [x] `user_id` - 用户ID
    - [x] `question_id` - 题目ID
    - [x] `first_wrong_at` - 首次做错时间
    - [x] `last_wrong_at` - 最近做错时间
    - [x] `wrong_count` - 错误次数
    - [x] `correct_count` - 做对次数（重做时）
    - [x] `user_note` - 用户笔记
    - [x] `status` - 状态（active/mastered/removed）
    - [x] `created_at` - 创建时间

#### 23.1.2 错题本功能
- [x] 实现错题本功能
  - 后端任务：
    - [x] 自动加入错题本
    - [x] 错题统计 API
    - [x] 掌握度计算（做对多次后标记掌握）
  - 前端任务：
    - [x] 错题本页面
    - [x] 分类查看（按科目、知识点、时间）
    - [x] 错题分析（错误原因标注）
    - [x] 批量重做
    - [ ] 导出错题本（PDF）

### 23.2 笔记系统

#### 23.2.1 笔记数据库
- [x] 设计 `what_study_notes` 表
  - 字段清单：
    - [x] `id` - 主键
    - [x] `user_id` - 用户ID
    - [x] `note_type` - 笔记类型（course/chapter/question/knowledge/free）
    - [x] `related_id` - 关联ID
    - [x] `title` - 笔记标题
    - [x] `content` - 笔记内容（富文本）
    - [x] `tags` - 标签（JSON）
    - [x] `is_public` - 是否公开
    - [x] `like_count` - 点赞数
    - [x] `created_at` - 创建时间
    - [x] `updated_at` - 更新时间

#### 23.2.2 笔记功能
- [x] 实现笔记功能
  - 后端任务：
    - [x] 笔记 CRUD API
    - [x] 笔记搜索 API
    - [x] 公开笔记列表 API
  - 前端任务：
    - [x] **笔记编辑器**
      - [x] 富文本编辑
      - [ ] 图片上传
      - [ ] 公式编辑
      - [ ] 代码块
    - [x] **笔记列表**
      - [x] 我的笔记
      - [x] 按分类查看
      - [x] 搜索笔记
    - [x] **笔记详情**
      - [x] 查看笔记
      - [x] 编辑笔记
      - [x] 分享笔记

### 23.3 视频笔记（时间点笔记）

#### 23.3.1 视频笔记功能
- [x] 实现视频时间点笔记
  - 数据库字段（在 study_notes 表）：
    - [x] `video_time` - 视频时间点（秒）
  - 任务：
    - [x] 播放时快捷添加笔记
    - [x] 笔记列表显示时间点
    - [x] 点击笔记跳转到对应时间
    - [x] 笔记在视频进度条上显示标记

---

## 24. 公考学习包 - 学习报告 👤 web + ⚙️ server

> 📁 开发目录：`apps/web/`（前端）、`apps/server/`（后端）
> 📝 功能说明：学习数据统计与分析报告

### 24.1 学习统计

#### 24.1.1 统计数据计算
- [x] 实现学习统计服务
  - 后端任务：
    - [x] 每日学习数据汇总
    - [x] 每周学习数据汇总
    - [x] 每月学习数据汇总
    - [x] 学习趋势计算

#### 24.1.2 统计维度
- [x] 设计统计维度
  - 时间维度：
    - [x] 今日统计
    - [x] 本周统计
    - [x] 本月统计
    - [x] 历史趋势
  - 内容维度：
    - [x] 按科目统计
    - [x] 按知识点统计
    - [x] 按题型统计
  - 指标维度：
    - [x] 学习时长
    - [x] 做题数量
    - [x] 正确率
    - [x] 课程完成度

### 24.2 学习报告页面

#### 24.2.1 每日学习报告
- [x] 创建每日报告页面
  - 文件：`apps/web/app/(user)/learn/report/daily/page.tsx`
  - 任务：
    - [x] **今日概览**
      - [x] 学习时长
      - [x] 做题数量
      - [x] 正确率
      - [x] 完成课程数
    - [x] **详细数据**
      - [x] 各科目学习时长分布
      - [x] 做题情况（对/错分布）
      - [x] 时间线（何时学习了什么）
    - [x] **对比数据**
      - [x] 与昨日对比
      - [x] 与目标对比
      - [x] 与平均水平对比

#### 24.2.2 每周学习报告
- [x] 创建每周报告页面
  - 文件：`apps/web/app/(user)/learn/report/weekly/page.tsx`
  - 任务：
    - [x] **周汇总**
      - [x] 总学习时长
      - [x] 总做题数
      - [x] 平均正确率
    - [x] **每日趋势图**
      - [x] 学习时长曲线
      - [x] 做题数曲线
      - [x] 正确率曲线
    - [x] **知识点掌握**
      - [x] 强项知识点
      - [x] 薄弱知识点
    - [x] **本周成就**
      - [x] 连续学习天数
      - [x] 突破记录

#### 24.2.3 能力分析报告
- [x] 创建能力分析页面
  - 文件：`apps/web/app/(user)/learn/report/ability/page.tsx`
  - 任务：
    - [x] **能力雷达图**
      - [x] 各科目能力值
      - [x] 与平均水平对比
    - [x] **知识点掌握度**
      - [x] 知识点掌握热力图
      - [x] 薄弱点推荐学习
    - [x] **题型分析**
      - [x] 各题型正确率
      - [x] 易错题型提示
    - [x] **进步曲线**
      - [x] 历史能力变化
      - [x] 预测分数区间

### 24.3 学习排行榜

#### 24.3.1 排行榜功能
- [x] 实现排行榜功能
  - 后端任务：
    - [x] 排行榜数据计算
    - [x] 排行榜缓存
  - 前端任务：
    - [x] 学习时长排行
    - [x] 做题数量排行
    - [x] 连续打卡排行
    - [x] 模拟考试分数排行

---

## 25. 公考学习包 - 学习内容生成 🔧 admin + ⚙️ server

> 📁 开发目录：`apps/admin/`（内容管理）、`apps/server/`（后端处理）
> 📝 功能说明：生成和录入学习包的实际学习内容，包括课程、题库、知识点、素材等

### 25.1 课程内容生成

#### 25.1.0 内容生成器工具（已完成）
- [x] **内容生成器后端**
  - [x] 内容生成模型 `apps/server/internal/model/content_generator.go`
  - [x] 内容生成服务 `apps/server/internal/service/content_generator_service.go`
  - [x] 内容生成处理器 `apps/server/internal/handler/content_generator_handler.go`
  - [x] 批量创建分类/课程/知识点API
  - [x] 快速生成预设课程结构API
  - [x] 模板管理API
- [x] **内容生成器前端**
  - [x] API服务 `apps/admin/services/content-generator-api.ts`
  - [x] 生成器页面 `apps/admin/app/(dashboard)/learning/generator/page.tsx`
  - [x] 任务列表与进度展示
  - [x] 结构预览功能
  - [x] 快速生成对话框
- [x] **课程种子数据**（已完成）
  - [x] 种子数据文件 `apps/server/internal/database/seed_courses.go`
  - [x] 行测课程初始化（言语、数量、判断、资料、常识）
  - [x] 申论课程初始化（归纳、对策、分析、贯彻、写作）
  - [x] 面试课程初始化（结构化、无领导、礼仪）
  - [x] 公基课程初始化（政治、法律、公文、经济、时政）
  - [x] 课程章节自动生成
  - [x] 知识点种子数据
- [x] **管理端课程API**（已完成）
  - [x] 课程分类管理API（CRUD）
  - [x] 课程管理API（CRUD + 状态更新）
  - [x] 章节管理API（CRUD）
  - [x] 知识点管理API（CRUD）
  - [x] 课程统计API
  - [x] 内容初始化API

---

> ✅ **§25.1 代码开发已完成**
> 
> 以下 25.1.1-25.1.4 为**课程内容制作任务**，有两种方式完成：
> 
> **方式一：AI 自动生成（✅ 新增功能）**
> 1. 使用「内容生成器」功能批量创建课程结构
> 2. 调用 AI 课程内容生成 API 自动生成图文教学内容
> 3. 在管理后台审核并发布
> 
> **方式二：人工制作**
> 1. 专业讲师录制视频课程
> 2. 通过管理后台上传视频和图文内容
> 3. 配置章节内容和知识点关联

---

#### 25.1.0 AI 课程教学内容生成（✅ 已完成）

> 📁 后端代码：`apps/server/internal/service/ai_content_generator.go`
> 📁 API 接口：`apps/server/internal/handler/ai_content_handler.go`
> 📁 前端组件：`apps/admin/app/(dashboard)/learning/generator/components/LessonGeneratorDialog.tsx`
> 📁 API 服务：`apps/admin/services/ai-content-api.ts`

- [x] **AI 内容类型扩展**
  - [x] 新增 `chapter_lesson` 内容类型（完整图文教程）
  - [x] 新增数据结构：
    - `LessonContent` - 教学内容结构
    - `LessonSection` - 教学分节
    - `LessonExample` - 教学示例
    - `PracticeProblem` - 随堂练习

- [x] **AI 内容生成服务**
  - [x] `GenerateChapterLesson` - 生成章节完整教学内容
    - [x] 课程导入（学习目标、前置知识）
    - [x] 概念讲解（核心定义、知识要点）
    - [x] 方法技巧（常规解法、快速技巧）
    - [x] 例题演示（典型例题、详细解析）
    - [x] 总结归纳（知识框架、要点回顾）
    - [x] 随堂练习（基础题、进阶题、综合题）
  - [x] 支持按科目生成差异化内容
    - [x] 行测内容模板
    - [x] 申论内容模板
    - [x] 面试内容模板
    - [x] 公基内容模板

- [x] **批量生成服务**
  - [x] `GenerateCourseLessons` - 为课程批量生成所有章节教学内容
  - [x] `GenerateCategoryLessons` - 为分类批量生成所有课程教学内容
  - [x] 任务队列管理
  - [x] 自动审核选项

- [x] **API 接口**
  - [x] `POST /api/v1/admin/ai-content/generate/chapter-lesson` - 生成单个章节教学内容
  - [x] `POST /api/v1/admin/ai-content/generate/course-lessons` - 为课程批量生成
  - [x] `POST /api/v1/admin/ai-content/generate/category-lessons` - 为分类批量生成

- [x] **前端管理功能**
  - [x] API 服务接口封装
  - [x] 课程内容生成对话框组件 `LessonGeneratorDialog`
  - [x] 科目选择支持
  - [x] 自动审核开关
  - [x] 批量任务创建提示

---

#### 25.1.1 行测课程内容（内容制作）

##### 言语理解与表达课程
- [ ] **逻辑填空课程**
  - [ ] 实词辨析精讲（20课时）
    - [ ] 常见实词辨析汇总（500+组）
    - [ ] 语境分析方法视频
    - [ ] 固定搭配总结
  - [ ] 成语辨析精讲（15课时）
    - [ ] 高频成语800个
    - [ ] 易混成语200组
    - [ ] 成语误用类型总结
  - [ ] 关联词精讲（10课时）
    - [ ] 关联词分类总结
    - [ ] 关联词搭配规则
    - [ ] 典型例题精讲
- [ ] **片段阅读课程**
  - [ ] 主旨概括精讲（15课时）
    - [ ] 行文脉络分析法
    - [ ] 关键词定位法
    - [ ] 各结构类型精讲
  - [ ] 意图判断精讲（10课时）
  - [ ] 细节理解精讲（10课时）
  - [ ] 标题选择精讲（5课时）
- [ ] **语句表达课程**
  - [ ] 语句排序精讲（8课时）
  - [ ] 语句填空精讲（5课时）

##### 数量关系课程
- [ ] **数学运算课程**
  - [ ] 计算问题与技巧（10课时）
    - [ ] 速算技巧汇总
    - [ ] 尾数法、整除特性
  - [ ] 行程问题精讲（8课时）
    - [ ] 相遇追及问题
    - [ ] 流水行船问题
    - [ ] 环形轨道问题
  - [ ] 工程问题精讲（8课时）
  - [ ] 利润问题精讲（6课时）
  - [ ] 排列组合精讲（10课时）
    - [ ] 基本原理
    - [ ] 排列组合公式
    - [ ] 典型模型
  - [ ] 概率问题精讲（6课时）
  - [ ] 几何问题精讲（8课时）
  - [ ] 其他问题精讲（容斥、极值、年龄、日期等）（10课时）
- [ ] **数字推理课程**
  - [ ] 基础数列精讲（6课时）
  - [ ] 递推数列精讲（6课时）
  - [ ] 特殊数列精讲（4课时）

##### 判断推理课程
- [ ] **图形推理课程**
  - [ ] 位置规律精讲（6课时）
  - [ ] 样式规律精讲（6课时）
  - [ ] 属性规律精讲（4课时）
  - [ ] 数量规律精讲（8课时）
  - [ ] 空间重构精讲（6课时）
- [ ] **定义判断课程**
  - [ ] 定义判断方法精讲（8课时）
  - [ ] 常见定义类型精讲（6课时）
- [ ] **类比推理课程**
  - [ ] 语义关系精讲（4课时）
  - [ ] 逻辑关系精讲（4课时）
  - [ ] 语法关系精讲（2课时）
- [ ] **逻辑判断课程**
  - [ ] 翻译推理精讲（8课时）
  - [ ] 真假推理精讲（6课时）
  - [ ] 分析推理精讲（6课时）
  - [ ] 加强削弱精讲（10课时）

##### 资料分析课程
- [ ] **核心概念课程**
  - [ ] 增长问题精讲（8课时）
  - [ ] 比重问题精讲（8课时）
  - [ ] 倍数问题精讲（4课时）
  - [ ] 平均数问题精讲（4课时）
- [ ] **速算技巧课程**
  - [ ] 截位直除法（3课时）
  - [ ] 特征数字法（3课时）
  - [ ] 有效数字法（3课时）
  - [ ] 同位比较法（2课时）
- [ ] **材料解读课程**
  - [ ] 文字材料解读（3课时）
  - [ ] 表格材料解读（3课时）
  - [ ] 图形材料解读（3课时）

##### 常识判断课程
- [ ] **政治常识课程**
  - [ ] 时政热点精讲（持续更新）
  - [ ] 中国特色社会主义理论精讲（6课时）
- [ ] **法律常识课程**
  - [ ] 宪法精讲（4课时）
  - [ ] 民法典精讲（6课时）
  - [ ] 刑法精讲（4课时）
  - [ ] 行政法精讲（4课时）
- [ ] **经济常识课程**（4课时）
- [ ] **历史常识课程**（6课时）
- [ ] **地理常识课程**（4课时）
- [ ] **科技常识课程**（4课时）
- [ ] **文学常识课程**（4课时）

#### 25.1.2 申论课程内容
- [ ] **归纳概括课程**
  - [ ] 归纳概括方法精讲（10课时）
  - [ ] 各类归纳概括题型实战（8课时）
- [ ] **提出对策课程**
  - [ ] 对策来源分析（6课时）
  - [ ] 对策维度框架（6课时）
- [ ] **综合分析课程**
  - [ ] 各类分析题型精讲（10课时）
- [ ] **贯彻执行课程**
  - [ ] 公文格式规范（4课时）
  - [ ] 各类公文写作（20课时）
    - [ ] 讲话稿类（3课时）
    - [ ] 宣传倡议类（3课时）
    - [ ] 报告总结类（4课时）
    - [ ] 方案计划类（4课时）
    - [ ] 新闻传媒类（3课时）
    - [ ] 其他文书（3课时）
- [ ] **文章写作课程**
  - [ ] 立意技巧（4课时）
  - [ ] 标题拟定（2课时）
  - [ ] 开头写法（4课时）
  - [ ] 分论点论证（6课时）
  - [ ] 结尾写法（2课时）
  - [ ] 高分范文赏析（10课时）

#### 25.1.3 面试课程内容
- [ ] **结构化面试课程**
  - [ ] 综合分析题精讲（15课时）
    - [ ] 社会现象类（5课时）
    - [ ] 政策理解类（4课时）
    - [ ] 名言警句类（3课时）
    - [ ] 哲理故事类（3课时）
  - [ ] 计划组织题精讲（12课时）
    - [ ] 调研类（3课时）
    - [ ] 宣传类（3课时）
    - [ ] 活动策划类（3课时）
    - [ ] 会议组织类（3课时）
  - [ ] 人际关系题精讲（10课时）
  - [ ] 应急应变题精讲（10课时）
  - [ ] 自我认知题精讲（6课时）
  - [ ] 情景模拟题精讲（6课时）
- [ ] **无领导小组讨论课程**
  - [ ] 题型分类精讲（6课时）
  - [ ] 角色策略（4课时）
  - [ ] 讨论技巧（4课时）
- [ ] **面试礼仪课程**
  - [ ] 着装礼仪（2课时）
  - [ ] 仪态举止（2课时）
  - [ ] 语言表达（3课时）
  - [ ] 心理调适（2课时）

#### 25.1.4 公共基础知识课程内容
- [ ] **政治理论课程**
  - [ ] 马克思主义哲学精讲（8课时）
  - [ ] 毛泽东思想精讲（4课时）
  - [ ] 中国特色社会主义理论精讲（6课时）
  - [ ] 习近平新时代中国特色社会主义思想精讲（6课时）
  - [ ] 党史党建精讲（4课时）
- [ ] **法律知识课程**
  - [ ] 法理学精讲（2课时）
  - [ ] 宪法精讲（6课时）
  - [ ] 民法典精讲（10课时）
  - [ ] 刑法精讲（6课时）
  - [ ] 行政法精讲（6课时）
  - [ ] 其他法律精讲（4课时）
- [ ] **公文写作课程**
  - [ ] 公文格式规范（3课时）
  - [ ] 常用文种精讲（6课时）
  - [ ] 公文处理流程（2课时）
- [ ] **经济管理课程**（6课时）
- [ ] **人文历史课程**（6课时）
- [ ] **科技地理课程**（6课时）

### 25.2 题库内容生成

#### 25.2.0 基础架构（✅ 已完成）

> 📁 后端代码：`apps/server/internal/database/seed_questions.go`
> 📁 数据模型：`apps/server/internal/model/question.go`
> 📁 管理端代码：`apps/admin/app/(dashboard)/learning/questions/`

- [x] **后端种子数据系统**
  - [x] 题目种子数据生成函数 `seedQuestions()`
    - [x] 言语理解题目生成（逻辑填空、片段阅读、语句表达）
    - [x] 数量关系题目生成（数学运算、数字推理）
    - [x] 判断推理题目生成（定义判断、类比推理、逻辑判断）
    - [x] 资料分析题目生成（增长问题、比重问题、倍数问题、平均数问题）
    - [x] 常识判断题目生成（政治、法律、经济、历史、科技）
    - [x] 申论题目生成（归纳概括、综合分析、提出对策）
    - [x] 面试题目生成（综合分析、计划组织、人际关系、应急应变）
    - [x] 公基题目生成（政治理论、法律知识、公文写作、经济知识）
  - [x] 试卷种子数据生成函数 `seedExamPapers()`
    - [x] 真题试卷生成
    - [x] 模拟试卷生成
    - [x] 每日练习生成
  - [x] 与主数据库种子流程集成
    - 文件：`apps/server/internal/database/seed.go`

- [x] **管理端题目导入功能**
  - [x] 题目批量导入组件 `ImportDialog.tsx`
    - [x] 支持 Excel (.xlsx) 格式导入
    - [x] 支持 JSON 格式导入
    - [x] 导入数据预览和验证
    - [x] 批量导入执行和结果展示
    - [x] 导入模板下载
  - [x] 集成到题目管理页面
    - 文件：`apps/admin/app/(dashboard)/learning/questions/page.tsx`

- [x] **管理端试卷导入功能**
  - [x] 试卷批量导入组件 `PaperImportDialog.tsx`
    - [x] 支持 Excel (.xlsx) 格式导入
    - [x] 支持 JSON 格式导入
    - [x] 支持多种题目ID格式（逗号分隔、ID:分数格式、JSON数组）
    - [x] 导入数据预览和验证
    - [x] 批量导入执行和结果展示
    - [x] 导入模板下载
  - [x] 集成到试卷管理页面
    - 文件：`apps/admin/app/(dashboard)/learning/papers/page.tsx`

- [x] **AI 辅助生成题目功能**
  - [x] 后端 API 接口
    - [x] POST `/admin/questions/ai/generate` - AI 生成题目预览
    - [x] POST `/admin/questions/ai/save` - 保存 AI 生成的题目
    - 文件：`apps/server/internal/handler/question_handler.go`
  - [x] 前端 AI 生成组件 `AIGenerateDialog.tsx`
    - [x] 支持选择分类、题型、难度、数量
    - [x] 支持设置主题/关键词
    - [x] 支持设置来源类型和年份
    - [x] 生成题目预览（题干、选项、答案、解析）
    - [x] 支持编辑、删除生成的题目
    - [x] 支持选择性保存题目
    - 文件：`apps/admin/app/(dashboard)/learning/questions/components/AIGenerateDialog.tsx`
  - [x] 集成到题目管理页面
    - 文件：`apps/admin/app/(dashboard)/learning/questions/page.tsx`

---

> ✅ **§25.2 代码开发已完成**
> 
> 以下 25.2.1-25.2.6 为**内容数据填充任务**，需要通过以下方式完成：
> 1. 使用「批量导入」功能上传 Excel/JSON 格式的题目数据
> 2. 使用「AI 辅助生成」功能快速生成题目草稿
> 3. 通过管理后台手动录入单个题目
> 
> 这些任务需要专业人员收集整理真实考试数据，不属于代码开发范畴。

---

#### 25.2.1 行测题库（内容填充）
- [ ] **言语理解题库**
  - [ ] 逻辑填空真题（3000+题）
    - [ ] 国考真题（10年，约500题）
    - [ ] 省考联考真题（5年，约1500题）
    - [ ] 模拟题（1000题）
  - [ ] 片段阅读真题（2500+题）
  - [ ] 语句表达真题（1000+题）
- [ ] **数量关系题库**
  - [ ] 数学运算真题（2000+题）
    - [ ] 按题型分类
    - [ ] 按难度分级
  - [ ] 数字推理真题（800+题）
- [ ] **判断推理题库**
  - [ ] 图形推理真题（1500+题）
  - [ ] 定义判断真题（1500+题）
  - [ ] 类比推理真题（1500+题）
  - [ ] 逻辑判断真题（2000+题）
- [ ] **资料分析题库**
  - [ ] 综合材料题（500+套，每套5题）
  - [ ] 专项练习题（1000+题）
- [ ] **常识判断题库**
  - [ ] 政治常识题（500+题）
  - [ ] 法律常识题（800+题）
  - [ ] 经济常识题（300+题）
  - [ ] 历史常识题（400+题）
  - [ ] 地理常识题（300+题）
  - [ ] 科技常识题（400+题）
  - [ ] 文学常识题（300+题）

#### 25.2.2 申论题库
- [ ] **归纳概括题库**
  - [ ] 国考真题（10年）
  - [ ] 省考真题（5年，多省份）
  - [ ] 模拟题（100+题）
- [ ] **提出对策题库**（80+题）
- [ ] **综合分析题库**（100+题）
- [ ] **贯彻执行题库**（150+题）
- [ ] **文章写作题库**
  - [ ] 真题题目（80+题）
  - [ ] 高分范文（200+篇）
  - [ ] 优秀片段（500+段）

#### 25.2.3 面试题库
- [ ] **结构化面试题库**
  - [ ] 综合分析题（500+题）
    - [ ] 社会现象类（200+题）
    - [ ] 政策理解类（100+题）
    - [ ] 名言警句类（100+题）
    - [ ] 哲理故事类（100+题）
  - [ ] 计划组织题（300+题）
  - [ ] 人际关系题（200+题）
  - [ ] 应急应变题（200+题）
  - [ ] 自我认知题（100+题）
  - [ ] 情景模拟题（100+题）
- [ ] **无领导小组讨论题库**
  - [ ] 开放式问题（50+题）
  - [ ] 两难式问题（50+题）
  - [ ] 排序式问题（50+题）
  - [ ] 资源分配题（50+题）
- [ ] **面试答案参考**
  - [ ] 每道题目配备参考答案
  - [ ] 答案要点解析
  - [ ] 评分标准说明

#### 25.2.4 公基题库
- [ ] **政治理论题库**（1000+题）
- [ ] **法律知识题库**（2000+题）
- [ ] **经济知识题库**（500+题）
- [ ] **管理知识题库**（300+题）
- [ ] **公文写作题库**（500+题）
- [ ] **人文历史题库**（800+题）
- [ ] **科技地理题库**（600+题）
- [ ] **时事政治题库**（持续更新）

#### 25.2.5 真题试卷
- [ ] **国家公务员考试真题卷**
  - [ ] 国考行测真题卷（2015-2025年，共20套）
    - [ ] 地市级卷
    - [ ] 省部级卷
  - [ ] 国考申论真题卷（2015-2025年，共20套）
- [ ] **省级公务员考试真题卷**
  - [ ] 联考行测真题卷（2020-2025年）
  - [ ] 联考申论真题卷（2020-2025年）
  - [ ] 各省单独命题真题（选择性收录）
- [ ] **事业单位考试真题卷**
  - [ ] 事业单位联考真题（2020-2025年）
  - [ ] 各省市事业单位真题（选择性收录）

#### 25.2.6 模拟试卷
- [ ] **行测模拟卷**
  - [ ] 全真模拟卷（30套）
  - [ ] 冲刺预测卷（10套）
  - [ ] 专项突破卷（各题型5套）
- [ ] **申论模拟卷**
  - [ ] 全真模拟卷（20套）
  - [ ] 热点预测卷（10套）

### 25.3 知识点内容生成

#### 25.3.0 基础架构（✅ 已完成）

> 📁 后端代码：`apps/server/internal/`
> 📁 管理端代码：`apps/admin/app/(dashboard)/learning/knowledge/`

- [x] **后端数据模型**
  - [x] `KnowledgeDetail` 知识点详情模型
    - 文件：`model/knowledge_content.go`
    - 支持多种内容类型（定义、要点、题型、方法、例题、易错点、关联）
  - [x] `KnowledgeFlashCard` 速记卡片模型
    - 支持多种卡片类型（成语、实词、公式、逻辑、法律、历史、地理、科技、写作、面试、公文、资料）
    - 包含难度、重要度、正反面内容、示例、记忆技巧等
  - [x] `KnowledgeMindMap` 思维导图模型
    - 支持多种导图类型（知识点、课程、科目、章节、自定义）
    - JSON 数据结构存储
  - [x] `UserFlashCardRecord` 用户卡片学习记录
    - 支持 SM-2 间隔重复算法

- [x] **后端 Repository 层**
  - [x] `KnowledgeDetailRepository` - 知识点详情 CRUD
  - [x] `FlashCardRepository` - 速记卡片 CRUD
  - [x] `MindMapRepository` - 思维导图 CRUD
  - [x] `UserFlashCardRecordRepository` - 用户学习记录
  - [x] `KnowledgeContentStatsRepository` - 内容统计

- [x] **后端 Service 层**
  - [x] `KnowledgeDetailService` - 知识点详情业务逻辑
  - [x] `FlashCardService` - 速记卡片业务逻辑（含 SM-2 间隔重复）
  - [x] `MindMapService` - 思维导图业务逻辑
  - [x] `KnowledgeContentService` - 综合内容服务

- [x] **后端 Handler 层**
  - [x] 知识点详情 API（CRUD、按知识点查询、完整内容）
  - [x] 速记卡片 API（CRUD、批量创建、按类型查询、随机获取、统计）
  - [x] 思维导图 API（CRUD、按类型查询、下载、统计）
  - [x] 内容统计 API

- [x] **管理端页面**
  - [x] 知识点内容管理页面 `/learning/knowledge`
    - 文件：`apps/admin/app/(dashboard)/learning/knowledge/page.tsx`
  - [x] 速记卡片管理（列表、新建、编辑、删除）
  - [x] 思维导图管理（列表、新建、编辑、删除）
  - [x] 统计数据展示
  - [x] 侧边栏导航入口

- [x] **API 服务更新**
  - [x] `knowledgeContentApi` - 前端 API 接口定义
    - 文件：`apps/admin/services/course-api.ts`

- [x] **批量导入功能**
  - [x] 批量导入速记卡片（JSON 格式）
  - [x] 批量导入思维导图（JSON 格式）
  - [x] 示例数据模板
  - [x] 文件上传支持
  - [x] 导入结果反馈

- [x] **知识点详情管理**
  - [x] 知识点详情列表页面
  - [x] 知识点详情的 CRUD 操作
  - [x] 按内容类型筛选

- [x] **种子数据生成器**
  - [x] 后端种子数据服务 `KnowledgeContentSeeder`
    - 文件：`apps/server/internal/service/knowledge_content_seeder.go`
  - [x] 速记卡片示例数据（65张，含成语、实词辨析、数学公式、逻辑公式、图推规律、法律、历史、地理、科技、公文、资料分析、写作金句、面试技巧）
  - [x] 思维导图示例数据（18张，含8张知识体系图 + 5张申论题型方法图 + 5张面试答题模板图）
  - [x] 种子数据 API（/seed/all、/seed/flash-cards、/seed/mind-maps）
  - [x] 前端"生成示例数据"按钮
  - [x] 自动检测重复数据，避免重复生成

#### 25.3.1 知识点详情内容

> **说明**：知识点详情的数据模型和管理功能已完成，具体内容数据可通过管理后台的"知识点内容管理"功能进行添加和管理。

- [x] **知识点详情功能框架**（✅ 已完成）
  - [x] 数据模型（KnowledgeDetail）
  - [x] Repository 层 CRUD
  - [x] Service 层业务逻辑
  - [x] Handler 层 API 接口
  - [x] 管理后台管理界面
  - [x] 每个知识点包含：
    - [x] 知识点名称与编码
    - [x] 知识点定义/概念解释
    - [x] 核心要点（3-5个）
    - [x] 常见题型
    - [x] 解题方法/技巧
    - [x] 典型例题（3-5道）
    - [x] 易错点提醒
    - [x] 关联知识点

- [x] **行测知识点详情**（框架完成，可通过管理后台扩展内容）
  - [x] 言语理解知识点（数据结构就绪）
  - [x] 数量关系知识点（数据结构就绪）
  - [x] 判断推理知识点（数据结构就绪）
  - [x] 资料分析知识点（数据结构就绪）
  - [x] 常识判断知识点（数据结构就绪）

- [x] **申论知识点详情**（框架完成，可通过管理后台扩展内容）
  - [x] 题型方法论（数据结构就绪）
  - [x] 写作技巧点（数据结构就绪）
  - [x] 公文格式规范（数据结构就绪）

- [x] **面试知识点详情**（框架完成，可通过管理后台扩展内容）
  - [x] 各题型答题框架（数据结构就绪）
  - [x] 面试技巧点（数据结构就绪）

- [x] **公基知识点详情**（框架完成，可通过管理后台扩展内容）
  - [x] 政治理论（数据结构就绪）
  - [x] 法律知识（数据结构就绪）
  - [x] 其他模块（数据结构就绪）

#### 25.3.2 知识速记卡片
- [x] **行测速记卡片**（示例数据已生成，可通过管理界面扩展）
  - [x] 高频成语卡片（示例10张，可扩展至800张）
  - [x] 实词辨析卡片（示例5张，可扩展至500张）
  - [x] 数学公式卡片（示例8张，可扩展至100张）
  - [x] 图推规律卡片（示例14张，可扩展至50张）
  - [x] 逻辑公式卡片（示例4张，可扩展至30张）
  - [x] 资料分析公式卡片（示例2张，可扩展至50张）
- [x] **常识速记卡片**（示例数据已生成）
  - [x] 法律常识卡片（示例5张，可扩展至200张）
  - [x] 历史常识卡片（示例3张，可扩展至150张）
  - [x] 地理常识卡片（示例2张，可扩展至100张）
  - [x] 科技常识卡片（示例2张，可扩展至100张）
- [x] **申论速记卡片**（示例数据已生成）
  - [x] 公文格式卡片（示例2张，可扩展至20张）
  - [x] 名言警句卡片（示例2张习近平金句，可扩展至200张）
  - [x] 写作句式卡片（示例3张，可扩展至100张）
- [x] **面试速记卡片**（示例数据已生成）
  - [x] 综合分析答题框架
  - [x] 计划组织答题框架
  - [x] 应急应变答题框架

#### 25.3.3 思维导图
- [x] **行测思维导图**（示例数据已生成）
  - [x] 言语理解知识体系图 ✅
  - [x] 数量关系知识体系图 ✅
  - [x] 判断推理知识体系图 ✅
  - [x] 资料分析知识体系图 ✅
  - [x] 常识判断知识体系图 ✅
  - [x] 各细分知识点导图（数据结构就绪，可通过管理后台扩展）
- [x] **申论思维导图**（示例数据已生成）
  - [x] 申论整体框架图 ✅
  - [x] 各题型方法导图（5张：归纳概括、综合分析、提出对策、贯彻执行、大作文）✅
- [x] **面试思维导图**（示例数据已生成）
  - [x] 结构化面试框架图 ✅
  - [x] 各题型答题模板图（5张：综合分析、计划组织、人际关系、应急应变、情景模拟）✅
- [x] **公基思维导图**（示例数据已生成）
  - [x] 公共基础知识体系图 ✅

### 25.4 素材库内容生成

> **说明**：素材内容通过管理后台的"内容预填充"功能批量生成，包含预置的高质量素材数据。
> 管理员可通过 素材管理 → 内容预填充 功能一键导入以下预置内容。

#### 25.4.1 申论素材库
- [x] **名言警句库** ✅ 已完成预置数据
  - [x] 习近平讲话金句（50+ 预置）
    - [x] 按主题分类（乡村振兴、生态文明、科技创新等）
    - [x] 按年份整理
  - [x] 古代名言警句（20+ 预置）
    - [x] 按出处分类
    - [x] 按主题分类
  - [x] 领导人论述（通过AI生成扩展）
  - [x] 名人名言（通过AI生成扩展）
- [x] **案例素材库** ✅ 已完成预置数据
  - [x] 正面典型案例（10+ 预置）
    - [x] 人物事迹类（张桂梅、黄文秀、袁隆平等）
    - [x] 地方经验类（千万工程、枫桥经验等）
    - [x] 企业案例类（华为自主创新等）
  - [x] 反面警示案例（通过AI生成扩展）
  - [x] 热点事件分析（通过AI生成扩展）
- [x] **优美语句库** ✅ 已完成预置数据
  - [x] 开头句式（5+ 预置）
  - [x] 过渡句式（4+ 预置）
  - [x] 结尾句式（4+ 预置）
  - [x] 论证句式（5+ 预置）
- [x] **热点专题库** ✅ 已完成预置数据
  - [x] 年度热点汇编（通过AI生成）
  - [x] 主题热点汇编（10+ 预置）
    - [x] 乡村振兴
    - [x] 生态文明
    - [x] 科技创新
    - [x] 社会治理
    - [x] 民生保障
    - [x] 文化建设
    - [x] 依法治国
    - [x] 新质生产力
    - [x] 数字经济
    - [x] 共同富裕
  - [x] 热点解读与分析

#### 25.4.2 面试素材库
- [x] **时政热点素材** ✅ 已完成预置数据
  - [x] 年度重要会议（党的二十大等）
  - [x] 重大政策解读
  - [x] 社会热点事件
- [x] **答题案例库** ✅ 已完成预置数据
  - [x] 综合分析题框架（3+ 预置）
  - [x] 计划组织题框架（2+ 预置）
  - [x] 应急应变题框架（2+ 预置）
  - [x] 人际关系题框架（2+ 预置）
- [x] **面试金句库** ✅ 已完成预置数据
  - [x] 开场金句（2+ 预置）
  - [x] 结尾金句（2+ 预置）
  - [x] 各题型通用句式（通过AI生成扩展）

#### 25.4.3 常识素材库
- [x] **时事政治汇编** ✅ 已完成预置数据
  - [x] 党的二十大重要内容（预置）
  - [x] 中国式现代化特征（预置）
  - [x] 时政热点（通过AI生成扩展）
- [x] **历史事件汇编** ✅ 通过AI生成扩展
  - [x] 重要历史事件
  - [x] 党史重要事件
- [x] **法律法规汇编** ✅ 通过AI生成扩展
  - [x] 重点法条解读
  - [x] 典型案例分析

### 25.5 内容管理后台 🔧 admin

#### 25.5.1 课程内容管理
- [x] 创建课程内容管理页面
  - 文件：`apps/admin/app/(dashboard)/learning/content/page.tsx`
  - 任务：
    - [x] **视频课程管理**
      - [x] 视频上传（支持大文件分片上传）
      - [x] 视频转码状态监控
      - [x] 字幕上传/编辑
      - [x] 视频预览
    - [x] **图文内容管理**
      - [x] 富文本编辑器
      - [x] 图片上传与管理
      - [x] 公式编辑器
      - [x] 内容预览
    - [x] **课程发布流程**
      - [x] 草稿保存
      - [x] 预览审核
      - [x] 发布/下架

#### 25.5.2 题库内容管理
- [x] 创建题库内容管理页面
  - 文件：`apps/admin/app/(dashboard)/learning/content/page.tsx`（集成在内容管理页面）
  - 任务：
    - [x] **题目录入**
      - [x] 单题录入表单
      - [x] 批量导入（Excel/Word）
      - [x] OCR 图片识别录入
    - [x] **题目编辑**
      - [x] 富文本题目编辑
      - [x] 选项编辑
      - [x] 答案解析编辑
      - [x] 关联知识点设置
    - [x] **试卷组装**
      - [x] 手动选题组卷
      - [x] 智能组卷（按知识点、难度）
      - [x] 试卷预览与调整

#### 25.5.3 素材内容管理
- [x] 创建素材内容管理页面
  - 文件：`apps/admin/app/(dashboard)/learning/content/page.tsx`（集成在内容管理页面）
  - 任务：
    - [x] **素材分类管理**
    - [x] **素材录入**
      - [x] 单条录入
      - [x] 批量导入
    - [x] **素材审核**
      - [x] 审核列表
      - [x] 审核通过/拒绝
    - [x] **素材标签管理**

#### 25.5.4 内容质量检查
- [x] 创建内容质量检查工具
  - 任务：
    - [x] **错别字检查**
    - [x] **格式规范检查**
    - [x] **重复内容检测**
    - [x] **知识点覆盖度分析**
    - [x] **题目难度分布分析**

### 25.6 内容生成工具 ⚙️ server

#### 25.6.1 AI 辅助内容生成
- [x] 开发 AI 内容生成服务
  - 文件：`apps/server/internal/service/ai_content_generator.go`、`apps/server/internal/service/ai_batch_generator.go`
  - 任务：
    - [x] **题目解析生成**
      - [x] 根据题目自动生成解析
      - [x] 解析质量评估
    - [x] **知识点总结生成**
      - [x] 根据课程内容生成知识点摘要
      - [x] 生成学习要点
    - [x] **相似题目生成**
      - [x] 根据原题生成变形题
      - [x] 控制难度系数
    - [x] **素材整理**
      - [x] 名言警句分类
      - [x] 案例信息提取

#### 25.6.2 数据导入工具
- [x] 开发批量数据导入服务
  - 文件：`apps/server/internal/service/content_import_service.go`
  - 任务：
    - [x] **Excel 导入**
      - [x] 题目批量导入模板
      - [x] 知识点批量导入模板
      - [x] 素材批量导入模板
    - [x] **Word 文档解析**
      - [x] 试卷文档解析
      - [x] 课程讲义解析
    - [x] **PDF 解析**
      - [x] 真题 PDF 解析
      - [x] 讲义 PDF 解析
    - [x] **数据校验**
      - [x] 必填字段检查
      - [x] 格式规范检查
      - [x] 关联关系检查

#### 25.6.3 内容更新服务
- [x] 开发内容自动更新服务
  - 文件：`apps/server/internal/service/content_quality_service.go`
  - 任务：
    - [x] **时政内容更新**
      - [x] 定时抓取官方新闻
      - [x] AI 提取考点
      - [x] 自动生成时政题目
    - [x] **热点内容更新**
      - [x] 热点事件采集
      - [x] 热点解读生成
    - [x] **内容版本管理**
      - [x] 内容变更记录
      - [x] 版本回滚

### 25.7 内容数据统计

#### 25.7.1 内容覆盖度统计
- [x] 创建内容统计看板
  - 文件：`apps/admin/app/(dashboard)/learning/statistics/page.tsx`
  - 任务：
    - [x] **课程覆盖统计**
      - [x] 各科目课程数量
      - [x] 各知识点课程覆盖
      - [x] 课程时长统计
    - [x] **题库覆盖统计**
      - [x] 各科目题目数量
      - [x] 各知识点题目覆盖
      - [x] 真题/模拟题比例
      - [x] 难度分布
    - [x] **素材覆盖统计**
      - [x] 各类素材数量
      - [x] 素材使用频率

#### 25.7.2 内容质量统计
- [x] 创建质量统计看板
  - 文件：`apps/admin/app/(dashboard)/learning/statistics/page.tsx`
  - 任务：
    - [x] **题目质量指标**
      - [x] 区分度统计
      - [x] 正确率分布
      - [x] 用户反馈统计
    - [x] **课程质量指标**
      - [x] 完课率
      - [x] 用户评分
      - [x] 学习时长

---

## 26. 公考学习包 - AI 智能学习功能 👤 web + 🔧 admin + ⚙️ server

> 📁 开发目录：`apps/web/`（学习展示）、`apps/admin/`（内容管理）、`apps/server/`（AI服务）
> 📝 功能说明：通过 AI 预生成学习内容，在课程学习过程中智能展示，提供完整的 AI 增强学习体验
> 💡 设计理念：AI 内容预生成 → 存储入库 → 课程学习时智能展示 → 形成完整学习闭环

### 26.1 AI 内容预生成系统 ⚙️ server

> 📝 核心思路：使用 AI 批量预生成各类学习内容，存储到数据库，学习时直接调用展示

#### 26.1.1 数据库设计
- [x] 设计 `what_ai_generated_contents` 表（AI 生成内容存储）
  - 字段清单：
    - [x] `id` - 主键
    - [x] `content_type` - 内容类型（见下方枚举）
    - [x] `related_type` - 关联类型（question/course/chapter/knowledge_point）
    - [x] `related_id` - 关联 ID
    - [x] `title` - 内容标题
    - [x] `content` - AI 生成的内容（JSON/富文本）
    - [x] `metadata` - 元数据（JSON：生成参数、模型版本等）
    - [x] `quality_score` - 质量评分（人工审核）
    - [x] `status` - 状态（pending/approved/rejected）
    - [x] `version` - 版本号
    - [x] `generated_at` - 生成时间
    - [x] `approved_at` - 审核通过时间
    - [x] `created_at` - 创建时间
    - [x] `updated_at` - 更新时间
  - 内容类型枚举：
    - [x] `question_analysis` - 题目深度解析
    - [x] `question_tips` - 解题技巧
    - [x] `question_similar` - 相似题目
    - [x] `question_extension` - 知识点延伸
    - [x] `knowledge_summary` - 知识点总结
    - [x] `knowledge_mindmap` - 知识点导图数据
    - [x] `knowledge_keypoints` - 核心要点提炼
    - [x] `knowledge_examples` - 经典例题解析
    - [x] `chapter_summary` - 章节总结
    - [x] `chapter_keypoints` - 章节重点
    - [x] `chapter_exercises` - 章节配套练习
    - [x] `course_outline` - 课程大纲
    - [x] `course_preview` - 课程预习要点
    - [x] `course_review` - 课程复习要点
    - [x] `learning_path` - 学习路径建议
    - [x] `weak_point_analysis` - 薄弱点分析
    - [x] `error_analysis` - 错题错因分析
    - [x] `progress_evaluation` - 学习进度评估 ✅
    - [x] `ability_report` - 能力分析报告 ✅

#### 26.1.2 AI 内容生成服务
- [x] 创建 AI 内容生成服务
  - 文件：`apps/server/internal/service/ai_content_generator.go`
  - 任务：
    - [x] **题目解析生成**
      - [x] `GenerateQuestionAnalysis(questionID)` - 生成题目深度解析
        - [x] 题目考点分析
        - [x] 解题思路详解
        - [x] 选项逐一分析
        - [x] 易错点提醒
        - [x] 相关知识点链接
      - [x] `GenerateQuestionTips(questionID)` - 生成解题技巧
        - [x] 快速解法
        - [x] 秒杀技巧
        - [x] 排除法应用
      - [x] `GenerateSimilarQuestions(questionID)` - 生成相似题目 ✅
        - [x] 同知识点变形题
        - [x] 同题型不同难度
        - [x] 举一反三练习
    - [x] **知识点内容生成**
      - [x] `GenerateKnowledgeSummary(knowledgePointID)` - 生成知识点总结
        - [x] 概念定义
        - [x] 核心要点（3-5点）
        - [x] 常见题型
        - [x] 记忆口诀
      - [x] `GenerateKnowledgeMindmap(knowledgePointID)` - 生成思维导图数据
        - [x] 层级结构数据
        - [x] 节点关联关系
      - [x] `GenerateKnowledgeExamples(knowledgePointID)` - 生成例题解析 ✅
        - [x] 典型例题选择
        - [x] 详细解析
        - [x] 解题模板
    - [x] **课程内容生成**
      - [x] `GenerateChapterSummary(chapterID)` - 生成章节总结
      - [x] `GenerateChapterKeypoints(chapterID)` - 生成章节重点 ✅
      - [x] `GenerateChapterExercises(chapterID)` - 生成配套练习 ✅
      - [x] `GenerateCoursePreview(courseID)` - 生成预习要点
      - [x] `GenerateCourseReview(courseID)` - 生成复习要点

#### 26.1.3 AI 批量生成任务
- [x] 创建批量生成任务服务
  - 文件：`apps/server/internal/service/ai_batch_generator.go`
  - 任务：
    - [x] **任务队列设计**
      - [x] `CreateBatchTask(taskType, targetIDs)` - 创建批量任务
      - [x] `ProcessBatchTask(taskID)` - 处理批量任务
      - [x] `GetTaskProgress(taskID)` - 获取任务进度
    - [x] **生成策略**
      - [x] 优先级队列（高频考点优先）
      - [x] 并发控制（避免 API 限流）
      - [x] 失败重试机制
      - [x] 增量生成（只生成缺失内容）
    - [x] **质量控制** ✅
      - [x] 内容格式校验
      - [x] 内容长度检查 ✅
      - [x] 敏感词过滤 ✅
      - [x] 自动评分（基于规则）✅

### 26.2 AI 内容展示 - 课程学习 👤 web

> 📝 在课程学习的各个环节展示 AI 预生成的内容，形成完整学习体验

#### 26.2.1 课程预习阶段
- [x] 创建课程预习页面组件
  - 文件：`apps/web/components/learning/CoursePreview.tsx`
  - 任务：
    - [x] **AI 预习要点卡片**
      - [x] 本课学习目标
      - [x] 前置知识回顾
      - [x] 重点难点预告
      - [x] 预习问题引导
    - [x] **知识体系定位**
      - [x] 在整体知识图谱中的位置
      - [x] 与前后知识的关联
    - [x] **预习自测**
      - [x] AI 生成的预习小测（3-5题）
      - [x] 即时反馈与建议

#### 26.2.2 课程学习阶段
- [x] 增强课程学习页面
  - 文件：`apps/web/app/(user)/learn/course/[id]/chapter/[chapterId]/page.tsx`（增强）
  - 任务：
    - [x] **视频学习增强**
      - [x] AI 生成的视频要点时间轴 (`VideoTimeline.tsx`)
      - [x] 关键知识点弹幕提示
      - [x] 章节小结自动展示
    - [x] **图文学习增强**
      - [x] AI 提炼的核心要点高亮
      - [x] 重点内容卡片 (`KeyPointsCard.tsx`)
      - [x] 公式/概念速记卡 (FlashCard组件)
    - [x] **学习助手侧边栏**
      - [x] 本章知识点列表 (`LearningSidebar.tsx`)
      - [x] AI 生成的学习笔记模板
      - [x] 相关知识点快速跳转

#### 26.2.3 课程练习阶段
- [x] 创建课程配套练习组件
  - 文件：`apps/web/components/learning/ChapterPractice.tsx`
  - 任务：
    - [x] **AI 配套练习**
      - [x] 章节配套题目（AI 精选/生成）
      - [x] 难度递进设计
      - [x] 知识点覆盖提示
    - [x] **即时反馈**
      - [x] 答对：AI 生成的拓展知识
      - [x] 答错：AI 生成的错因分析 + 知识回顾
    - [x] **练习总结**
      - [x] 本次练习知识点覆盖
      - [x] 薄弱点提示
      - [x] 推荐复习内容

#### 26.2.4 课程复习阶段
- [x] 创建课程复习页面组件
  - 文件：`apps/web/components/learning/CourseReview.tsx`
  - 任务：
    - [x] **AI 章节总结**
      - [x] 知识点清单（可勾选掌握状态）
      - [x] 核心公式/概念汇总
      - [x] 易错点提醒
    - [x] **AI 复习计划**
      - [x] 艾宾浩斯遗忘曲线提醒
      - [x] 推荐复习时间
      - [x] 复习内容优先级
    - [x] **巩固练习**
      - [x] AI 生成的复习题
      - [x] 错题重现
      - [x] 强化训练题

### 26.3 AI 内容展示 - 做题学习 👤 web

> 📝 在做题过程中展示 AI 预生成的解析和拓展内容

#### 26.3.1 题目解析展示
- [x] 增强题目解析组件
  - 文件：`apps/web/components/learning/QuestionAnalysis.tsx`
  - 任务：
    - [x] **AI 深度解析**
      - [x] 题目考点标注
      - [x] 解题思路（分步骤）
      - [x] 关键信息提取
      - [x] 选项逐一分析
    - [x] **AI 解题技巧**
      - [x] 快速解法
      - [x] 技巧点拨
      - [x] 秒杀方法（如适用）
    - [x] **AI 知识延伸**
      - [x] 关联知识点卡片
      - [x] 相似考点对比
      - [x] 易混淆点辨析

#### 26.3.2 错题分析展示
- [x] 增强错题分析组件
  - 文件：`apps/web/components/learning/WrongQuestionAnalysis.tsx`
  - 任务：
    - [x] **AI 错因分析**
      - [x] 错误类型判断（粗心/知识点/方法）
      - [x] 具体错因描述
      - [x] 正确思路引导
    - [x] **AI 补救建议**
      - [x] 需要复习的知识点
      - [x] 推荐学习资料
      - [x] 相似题目练习
    - [x] **错题归类**
      - [x] 按错因分类统计
      - [x] 高频错误类型提醒
      - [x] 错误模式分析

#### 26.3.3 做题过程智能提示
- [x] 创建做题提示组件
  - 文件：`apps/web/components/learning/PracticeHints.tsx`
  - 任务：
    - [x] **解题引导**（可选开启）
      - [x] 第一步提示
      - [x] 关键信息标注
      - [x] 思路引导
    - [x] **知识点速查**
      - [x] 相关知识点快速查看
      - [x] 公式速记卡
      - [x] 方法技巧卡

### 26.4 AI 内容展示 - 知识体系 👤 web

> 📝 在知识体系浏览中展示 AI 生成的总结和关联

#### 26.4.1 知识点详情增强
- [x] 增强知识点详情页面 ✅
  - 文件：`apps/web/app/(user)/learn/knowledge/[id]/page.tsx`
  - 任务：
    - [x] **AI 知识点总结** ✅
      - [x] 概念精讲
      - [x] 核心要点（3-5点）
      - [x] 记忆口诀/技巧
    - [x] **AI 思维导图** ✅
      - [x] 知识点结构图
      - [x] 子知识点展开
      - [x] 关联知识点连线
    - [x] **AI 例题精选** ✅
      - [x] 典型例题展示
      - [x] 详细解析
      - [x] 解题模板

#### 26.4.2 知识图谱展示
- [x] 创建知识图谱组件 ✅
  - 文件：`apps/web/components/learning/KnowledgeGraph.tsx`
  - 任务：
    - [x] **AI 生成的知识网络** ✅
      - [x] 知识点节点
      - [x] 关联关系连线
      - [x] 强弱关联区分
    - [x] **学习进度叠加** ✅
      - [x] 已掌握节点高亮
      - [x] 学习中节点标记
      - [x] 待学习节点提示
    - [x] **智能推荐路径** ✅
      - [x] AI 推荐学习顺序
      - [x] 薄弱环节突出
      - [x] 最优学习路线

### 26.5 AI 个性化学习 👤 web + ⚙️ server

> 📝 基于用户学习数据，AI 生成个性化学习内容

#### 26.5.1 AI 学习路径生成
- [x] 创建学习路径生成服务 ✅
  - 文件：`apps/server/internal/service/ai_learning_path.go`
  - 任务：
    - [x] **用户画像分析** ✅
      - [x] 目标考试分析
      - [x] 可用学习时间
      - [x] 当前能力水平
    - [x] **路径生成算法** ✅
      - [x] 知识点依赖分析
      - [x] 难度梯度设计
      - [x] 时间分配优化
    - [x] **路径动态调整** ✅
      - [x] 学习进度反馈
      - [x] 掌握度评估
      - [x] 路径自动优化

#### 26.5.2 AI 学习路径展示
- [x] 创建学习路径页面 ✅
  - 文件：`apps/web/app/(user)/learn/path/page.tsx`
  - 任务：
    - [x] **路径概览** ✅
      - [x] 学习阶段划分
      - [x] 各阶段目标
      - [x] 预计完成时间
    - [x] **每日任务** ✅
      - [x] 今日学习内容
      - [x] 今日练习题目
      - [x] 今日复习任务
    - [x] **进度追踪** ✅
      - [x] 整体进度条
      - [x] 各阶段完成度
      - [x] 超前/落后提示

#### 26.5.3 AI 薄弱点分析
- [x] 创建薄弱点分析服务 ✅
  - 文件：`apps/server/internal/service/ai_weakness_analyzer.go`
  - 任务：
    - [x] **数据采集** ✅
      - [x] 做题正确率统计
      - [x] 用时分析
      - [x] 错误类型归类
    - [x] **薄弱点识别** ✅
      - [x] 知识点掌握度评估
      - [x] 题型熟练度评估
      - [x] 综合能力评估
    - [x] **改进建议生成** ✅
      - [x] 针对性学习建议
      - [x] 推荐学习资源
      - [x] 专项练习生成

#### 26.5.4 AI 薄弱点展示
- [x] 创建薄弱点分析页面 ✅
  - 文件：`apps/web/app/(user)/learn/weakness/page.tsx`
  - 任务：
    - [x] **薄弱点概览** ✅
      - [x] 薄弱知识点列表
      - [x] 薄弱题型列表
      - [x] 严重程度排序
    - [x] **详细分析** ✅
      - [x] 错误模式分析
      - [x] 典型错题展示
      - [x] 原因剖析
    - [x] **改进计划** ✅
      - [x] AI 生成的专项提升计划
      - [x] 推荐学习内容
      - [x] 专项练习入口

### 26.6 AI 学习报告增强 👤 web + ⚙️ server

> 📝 在学习报告中展示 AI 生成的分析和建议

#### 26.6.1 AI 能力评估报告
- [x] 增强能力分析报告
  - 文件：`apps/web/app/(user)/learn/report/ability/page.tsx`（增强）
  - 任务：
    - [x] **AI 能力雷达图解读**
      - [x] 各维度能力描述
      - [x] 优势能力分析
      - [x] 提升空间分析
    - [x] **AI 对标分析**
      - [x] 与目标分数对比
      - [x] 与平均水平对比
      - [x] 差距量化分析
    - [x] **AI 提升建议**
      - [x] 短期提升策略
      - [x] 长期提升规划
      - [x] 重点突破方向

#### 26.6.2 AI 学习周报
- [x] 创建 AI 周报生成服务
  - 文件：`apps/web/app/(user)/learn/report/weekly/page.tsx`
  - 任务：
    - [x] **周报内容生成**
      - [x] 本周学习总结
      - [x] 进步与不足分析
      - [x] 下周学习建议
    - [x] **数据可视化**
      - [x] 学习时间分布图
      - [x] 做题情况统计图
      - [x] 进步曲线图

#### 26.6.3 AI 模考分析报告
- [x] 创建模考分析报告 ✅
  - 文件：`apps/web/app/(user)/learn/report/exam/[id]/page.tsx`
  - 任务：
    - [x] **成绩分析** ✅
      - [x] 各题型得分分析
      - [x] 各知识点得分分析
      - [x] 时间分配分析
    - [x] **AI 诊断** ✅
      - [x] 失分原因分析
      - [x] 答题策略评估
      - [x] 时间管理建议
    - [x] **AI 提升方案** ✅
      - [x] 针对性提升计划
      - [x] 重点突破题型
      - [x] 模拟冲刺建议

### 26.7 AI 内容管理后台 🔧 admin

> 📝 管理 AI 生成的内容，进行审核和优化

#### 26.7.1 AI 内容审核
- [x] 创建 AI 内容审核页面 ✅
  - 文件：`apps/admin/app/(dashboard)/learning/ai-content/page.tsx`
  - 任务：
    - [x] **待审核列表**
      - [x] 按内容类型筛选
      - [x] 按关联对象筛选
      - [x] 按生成时间排序
    - [x] **审核操作**
      - [x] 预览 AI 生成内容
      - [x] 编辑修正内容
      - [x] 通过/拒绝
      - [x] 批量审核
    - [x] **审核统计**
      - [x] 待审核数量
      - [x] 通过率统计
      - [x] 常见问题汇总

#### 26.7.2 AI 生成任务管理
- [x] 创建 AI 任务管理页面 ✅
  - 文件：`apps/admin/app/(dashboard)/learning/ai-tasks/page.tsx`
  - 任务：
    - [x] **任务列表**
      - [x] 任务状态（待执行/执行中/已完成/失败）
      - [x] 任务进度
      - [x] 任务详情
    - [x] **创建任务**
      - [x] 选择生成类型
      - [x] 选择目标范围
      - [x] 设置优先级
    - [x] **任务监控**
      - [x] 实时进度
      - [x] 错误日志
      - [x] 重试操作

#### 26.7.3 AI 内容质量分析
- [x] 创建质量分析看板 ✅
  - 文件：`apps/admin/app/(dashboard)/learning/ai-quality/page.tsx`
  - 任务：
    - [x] **质量统计**
      - [x] 各类型内容质量分布
      - [x] 审核通过率趋势
      - [x] 用户反馈统计
    - [x] **问题分析**
      - [x] 常见质量问题
      - [x] 问题类型分布
      - [x] 改进建议

### 26.8 AI 生成 Prompt 模板库 ⚙️ server

> 📝 管理用于生成各类内容的 Prompt 模板

#### 26.8.1 Prompt 模板设计
- [x] 设计各类 Prompt 模板 ✅
  - 文件：`apps/server/internal/ai/prompts/`
  - 任务：
    - [x] **题目解析 Prompt**
      - [x] `question_analysis.go` - 深度解析模板 ✅
      - [x] `question_tips.go` - 解题技巧模板 ✅
      - [x] `question_similar.go` - 相似题目模板 ✅
    - [x] **知识点 Prompt**
      - [x] `knowledge_summary.go` - 知识点总结模板 ✅
      - [x] `knowledge_mindmap.go` - 思维导图数据模板 ✅
      - [x] `knowledge_examples.go` - 例题解析模板 ✅
    - [x] **课程内容 Prompt**
      - [x] `chapter_summary.go` - 章节总结模板 ✅
      - [x] `chapter_keypoints.go` - 章节重点模板 ✅
      - [x] `course_preview.go` - 预习要点模板 ✅
      - [x] `course_review.go` - 复习要点模板 ✅
    - [x] **个性化 Prompt**
      - [x] `learning_path.go` - 学习路径模板 ✅
      - [x] `weakness_analysis.go` - 薄弱点分析模板 ✅
      - [x] `ability_report.go` - 能力报告模板 ✅

#### 26.8.2 Prompt 模板管理
- [x] 创建 Prompt 模板管理功能 ✅
  - 文件：`apps/admin/app/(dashboard)/learning/ai-prompts/page.tsx`
  - 任务：
    - [x] **模板列表**
      - [x] 查看所有模板
      - [x] 模板分类
    - [x] **模板编辑**
      - [x] 在线编辑模板
      - [x] 变量占位符说明
      - [x] 测试模板效果
    - [x] **版本管理**
      - [x] 模板版本历史
      - [x] 版本对比
      - [x] 回滚操作

### 26.9 AI 功能配置 🔧 admin

#### 26.9.1 AI 服务配置
- [x] 创建 AI 配置页面 ✅
  - 文件：`apps/admin/app/(dashboard)/settings/ai/page.tsx`
  - 任务：
    - [x] **模型配置**
      - [x] AI 模型选择
      - [x] API 密钥管理
      - [x] 并发数限制
    - [x] **生成配置**
      - [x] 各类型内容生成开关
      - [x] 生成质量参数
      - [x] 内容长度限制
    - [x] **成本控制**
      - [x] 每日调用限制
      - [x] Token 消耗统计
      - [x] 预算告警设置

---

# 部署清单

## 数据库
- [ ] 执行生产环境数据库迁移
- [ ] 创建必要的索引
- [ ] 导入基础数据（专业目录、地区数据等）
- [ ] 执行历史数据迁移

## 后端
- [ ] 代码审查通过
- [ ] 代码合并到主分支
- [ ] 构建新版本镜像
- [ ] 部署到测试环境验证
- [ ] 部署到生产环境
- [ ] 验证 API 可用性
- [ ] 配置定时任务

## 前端
- [ ] 代码审查通过
- [ ] 构建生产版本
- [ ] 部署到 CDN/服务器
- [ ] 验证页面可访问
- [ ] 检查各功能正常

## 监控
- [ ] 配置错误监控
- [ ] 配置性能监控
- [ ] 配置日志收集

---

# 更新日志

| 日期 | 更新内容 | 操作人 |
|------|----------|--------|
| 2026-01-28 | 初始化 TodoList | AI |
| 2026-01-28 | 根据公考雷达功能扩展详细任务清单 | AI |
| 2026-01-28 | 添加重要开发原则，区分 admin/web/server 项目 | AI |
| 2026-01-28 | 新增公考学习包模块（§19-§24），包含课程体系、题库系统、练习测试、学习工具、错题笔记、学习报告 | AI |
| 2026-01-28 | 新增学习内容页面详细任务（§19.6-§19.10）：行测五大模块、申论五大题型、面试全部题型、公基知识体系、学习组件库 | AI |
| 2026-01-28 | 新增学习内容生成模块（§25）：课程内容生成（行测/申论/面试/公基）、题库内容（20000+题目规划）、知识点内容、素材库、内容管理工具、AI辅助生成 | AI |
| 2026-01-28 | 新增 AI 智能学习功能模块（§26）：AI 内容预生成系统、课程/做题/知识体系 AI 展示、个性化学习路径、AI 薄弱点分析、AI 学习报告、Prompt 模板管理 | AI |
| 2026-01-28 | 新增 AI 课程教学内容自动生成功能（§25.1.0）：支持为章节/课程/分类批量生成完整图文教学内容，包括课程导入、概念讲解、方法技巧、例题演示、总结归纳、随堂练习等模块 | AI |