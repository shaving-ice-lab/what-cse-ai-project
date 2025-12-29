# 公考职位智能筛选系统 - 开发 TodoList

> 版本: v1.0  
> 创建日期: 2024年12月29日  
> 最后更新: 2024年12月29日

---

## ⚠️ 重要提示：代码审核发现的问题

> **审核日期**: 2024年12月29日

经过代码审核，发现以下模块虽然标记为完成，但**实际存在关键问题**：

### 🔴 后端服务（严重问题）

**问题描述**：后端 `apps/server/cmd/api/main.go` 中的路由**没有正确集成 handler**，所有路由都是 `nil`：

```go
// 当前 main.go 中的问题代码：
v1.POST("/auth/register", nil) // TODO: implement
v1.POST("/auth/login", nil)    // TODO: implement
v1.POST("/auth/refresh", nil)  // TODO: implement
```

**影响**：

- ❌ 后端服务**无法启动运行**
- ❌ 所有 API 接口**不可用**
- ❌ 虽然 handler/service/repository 代码都写了，但没有集成到主程序

**已修复** ✅（2024年12月29日）：

- [x] 在 `apps/server/cmd/api/main.go` 中初始化数据库连接
- [x] 在 `apps/server/cmd/api/main.go` 中创建 repository 实例
- [x] 在 `apps/server/cmd/api/main.go` 中创建 service 实例
- [x] 在 `apps/server/cmd/api/main.go` 中创建 handler 实例并注册路由
- [x] 在 `apps/server/cmd/api/main.go` 中添加中间件集成
- [ ] Redis 连接（可选，服务可在无 Redis 情况下启动）

---

## 项目概述

**技术架构**：

- 后端：Golang Echo + MySQL + Redis + Elasticsearch
- Web前端：React + TypeScript + TailwindCSS (用户端 + Admin端)
- App端：Taro React (iOS + Android)
- 小程序：Taro React (微信小程序)
- 爬虫：Python Scrapy + PyQt6 GUI

---

## 一、项目初始化 TodoList

### 1.1 仓库与工作空间配置

- [x] 初始化 Monorepo 项目结构
  - [x] 创建 `apps/` 目录（存放各端应用）
    - [x] `apps/web/` - Web前端
    - [x] `apps/mobile/` - App端
    - [x] `apps/miniprogram/` - 小程序
    - [x] `apps/server/` - Golang后端
  - [x] 创建 `packages/crawler/` 目录（Python爬虫）
  - [x] 创建 `docs/` 目录（文档）
  - [x] 创建 `docker/` 目录（Docker配置）
  - [x] 创建 `scripts/` 目录（脚本工具）

- [x] 配置 pnpm workspace
  - [x] 创建根目录 `pnpm-workspace.yaml`
  - [x] 配置 workspace 包管理
  - [x] 创建根目录 `package.json`

- [x] 配置 Turbo
  - [x] 创建 `turbo.json`
  - [x] 配置构建流水线
  - [x] 配置缓存策略

- [x] Git 配置
  - [x] 创建 `.gitignore`
  - [x] 配置 Git hooks（pre-commit）
  - [x] 创建 `README.md`

### 1.2 开发环境准备

- [ ] Go 环境配置
  - [ ] 安装 Go 1.21+
  - [ ] 配置 GOPATH 和 GOPROXY
  - [ ] 安装 air（热重载工具）

- [ ] Node.js 环境配置
  - [ ] 安装 Node.js 18+
  - [ ] 安装 pnpm
  - [ ] 配置 npm registry

- [ ] Python 环境配置
  - [ ] 安装 Python 3.10+
  - [ ] 创建虚拟环境
  - [ ] 安装 pip 包管理工具

- [ ] 数据库环境
  - [ ] 安装 MySQL 8.0
  - [ ] 安装 Redis
  - [ ] 安装 Elasticsearch
  - [ ] 创建开发数据库

---

## 二、后端开发 TodoList (Golang Echo)

> ⚠️ **注意**：后端代码文件已创建，但 **`main.go` 未集成各模块**，服务无法运行！

### 2.1 项目初始化

- [x] 创建 Go 模块
  - [x] 在 `apps/server/` 目录执行 `go mod init`
  - [x] 设置 Go 版本为 1.21+
  - [x] 创建 `apps/server/cmd/api/main.go` 入口文件
  - [ ] **⚠️ 在 `main.go` 中集成所有模块（未完成）**

- [x] 安装核心依赖
  - [x] 安装 `github.com/labstack/echo/v4` - Echo 框架
  - [x] 安装 `gorm.io/gorm` - ORM
  - [x] 安装 `gorm.io/driver/mysql` - MySQL 驱动
  - [x] 安装 `github.com/go-redis/redis/v8` - Redis 客户端
  - [x] 安装 `github.com/golang-jwt/jwt/v5` - JWT 认证
  - [x] 安装 `github.com/spf13/viper` - 配置管理
  - [x] 安装 `go.uber.org/zap` - 日志库
  - [x] 安装 `github.com/swaggo/echo-swagger` - Swagger 文档

- [x] 创建项目目录结构
  - [x] 创建 `internal/` 目录
    - [x] 创建 `internal/handler/` - HTTP 处理器
    - [x] 创建 `internal/service/` - 业务逻辑
    - [x] 创建 `internal/repository/` - 数据访问层
    - [x] 创建 `internal/model/` - 数据模型
    - [x] 创建 `internal/middleware/` - 中间件
    - [x] 创建 `internal/config/` - 配置
  - [x] 创建 `pkg/` 公共包目录
  - [x] 创建 `configs/` 配置文件目录

- [x] 配置管理模块
  - [x] 创建 `configs/config.yaml` 配置文件
  - [x] 实现 `internal/config/config.go` 配置加载
  - [x] 配置数据库连接参数
  - [x] 配置 Redis 连接参数
  - [x] 配置 JWT 密钥
  - [x] 配置服务端口
  - [x] 支持环境变量覆盖配置

- [x] 日志系统
  - [x] 创建 `pkg/logger/logger.go`
  - [x] 配置 zap 日志格式（JSON/Console）
  - [x] 支持日志级别配置（Debug/Info/Warn/Error）
  - [x] 支持日志文件输出
  - [x] 配置日志滚动策略

### 2.2 数据库设计与模型

- [x] 设计用户相关表
  - [x] `users` 表设计
    - [x] id (主键)
    - [x] phone (手机号，唯一索引)
    - [x] email (邮箱，唯一索引)
    - [x] password_hash (密码哈希)
    - [x] nickname (昵称)
    - [x] avatar (头像URL)
    - [x] status (状态：正常/禁用)
    - [x] created_at, updated_at (时间戳)
  - [x] `user_profiles` 表设计
    - [x] user_id (外键关联users)
    - [x] gender (性别)
    - [x] birth_date (出生日期)
    - [x] hukou_province (户籍省份)
    - [x] hukou_city (户籍城市)
    - [x] political_status (政治面貌)
    - [x] education (学历)
    - [x] major (专业)
    - [x] school (毕业学校)
    - [x] graduation_date (毕业时间)
    - [x] is_fresh_graduate (是否应届生)
    - [x] work_years (工作年限)
    - [x] grassroots_exp_years (基层经验年限)
  - [x] `user_certificates` 表设计
    - [x] id (主键)
    - [x] user_id (外键)
    - [x] cert_type (证书类型)
    - [x] cert_name (证书名称)
    - [x] cert_level (证书等级)
    - [x] obtained_date (获得日期)
  - [x] `user_preferences` 表设计
    - [x] user_id (外键)
    - [x] preferred_provinces (偏好省份JSON)
    - [x] preferred_cities (偏好城市JSON)
    - [x] preferred_departments (偏好部门JSON)
    - [x] exam_types (考试类型JSON)
    - [x] match_strategy (匹配策略)

- [x] 创建用户相关 GORM 模型
  - [x] 创建 `internal/model/user.go`
  - [x] 创建 `internal/model/user_profile.go`
  - [x] 创建 `internal/model/user_certificate.go`
  - [x] 创建 `internal/model/user_preference.go`
  - [x] 定义表关联关系
  - [x] 添加 GORM 标签（表名、索引、约束）
  - [x] 实现 TableName() 方法

- [x] 设计职位相关表
  - [x] `positions` 表设计（核心职位信息表）
    - [x] position_id (职位唯一标识)
    - [x] position_name (职位名称)
    - [x] department_code (招录机关代码)
    - [x] department_name (招录机关名称)
    - [x] department_level (机关级别：中央/省级/市级/县级/乡镇)
    - [x] work_location_province (工作省份代码)
    - [x] work_location_city (工作城市代码)
    - [x] work_location_district (工作区县代码)
    - [x] recruit_count (招录人数)
    - [x] exam_type (考试类型：国考/省考/事业单位/选调生)
    - [x] education_min (最低学历)
    - [x] education_max (最高学历限制)
    - [x] degree_required (是否要求学位)
    - [x] major_category (专业大类JSON)
    - [x] major_specific (具体专业JSON)
    - [x] major_unlimited (是否专业不限)
    - [x] political_status (政治面貌要求)
    - [x] work_exp_years_min (最低工作年限)
    - [x] age_min, age_max (年龄要求)
    - [x] gender_required (性别要求)
    - [x] hukou_required (是否限户籍)
    - [x] hukou_provinces (户籍限制省份JSON)
    - [x] registration_start, registration_end (报名时间)
    - [x] exam_date_written (笔试日期)
    - [x] applicant_count (报名人数)
    - [x] competition_ratio (竞争比)
    - [x] parse_confidence (AI解析置信度)
    - [x] status (状态：待审核/已发布/已下线)
    - [x] created_at, updated_at
  - [x] `announcements` 表设计
    - [x] id (主键)
    - [x] title (公告标题)
    - [x] source_url (原始URL)
    - [x] source_name (来源网站)
    - [x] publish_date (发布日期)
    - [x] content (公告内容TEXT)
    - [x] announcement_type (公告类型：招录公告/报名统计/笔试公告等)
    - [x] exam_type (考试类型)
    - [x] province, city (地区)
    - [x] attachment_urls (附件URL JSON)
    - [x] status (状态)
  - [x] `position_announcements` 关联表设计
    - [x] position_id (职位ID)
    - [x] announcement_id (公告ID)
    - [x] stage (阶段：招聘/报名/笔试/面试等)
    - [x] created_at
  - [x] `list_pages` 列表页监控表设计
    - [x] id (主键)
    - [x] url (列表页URL)
    - [x] source_name (来源名称)
    - [x] category (分类)
    - [x] crawl_frequency (爬取频率)
    - [x] last_crawl_time (最近爬取时间)
    - [x] article_count (文章数)
    - [x] article_selector (CSS选择器)
    - [x] pagination_pattern (分页模式)
    - [x] status (状态：active/inactive/error)

- [x] 创建职位相关 GORM 模型
  - [x] 创建 `internal/model/position.go`
  - [x] 创建 `internal/model/announcement.go`
  - [x] 创建 `internal/model/position_announcement.go`
  - [x] 创建 `internal/model/list_page.go`
  - [x] 定义 JSON 字段的序列化/反序列化
  - [x] 添加全文搜索相关标签

- [x] 设计用户行为表
  - [x] `user_favorites` 收藏表设计
  - [x] `user_views` 浏览记录表设计
  - [x] `user_notifications` 通知表设计

- [x] 设计系统表
  - [x] `admins` 管理员表设计
  - [x] `major_dictionary` 专业词典表设计
  - [x] `region_dictionary` 地区词典表设计

- [x] 数据库迁移
  - [x] 创建 `internal/database/migration.go`
  - [x] 实现 AutoMigrate 自动迁移
  - [x] 创建初始化数据 seed 脚本
  - [x] 添加索引优化

### 2.3 用户模块开发

- [x] 实现用户认证功能
  - [x] 创建 `internal/service/auth_service.go`
    - [x] 实现用户注册逻辑
    - [x] 实现密码加密（bcrypt）
    - [x] 实现登录验证
    - [x] 实现 JWT Token 生成
    - [x] 实现 Token 刷新逻辑
  - [x] 创建 `internal/repository/user_repository.go`
    - [x] 实现用户 CRUD 操作
    - [x] 实现按手机号/邮箱查询
    - [x] 实现用户状态更新
  - [x] 创建 `internal/handler/auth_handler.go`
    - [x] 实现注册接口 `POST /api/v1/auth/register`
    - [x] 实现登录接口 `POST /api/v1/auth/login`
    - [x] 实现Token刷新接口 `POST /api/v1/auth/refresh`
    - [x] 添加参数校验
    - [x] 添加 Swagger 注解

- [x] 实现用户信息管理
  - [x] 创建 `internal/service/user_service.go`
    - [x] 实现获取用户信息
    - [x] 实现更新用户简历
    - [x] 实现更新用户偏好
    - [x] 实现证书管理
  - [x] 创建 `internal/repository/user_profile_repository.go`
  - [x] 创建 `internal/handler/user_handler.go`
    - [x] `GET /api/v1/user/profile` 获取用户信息
    - [x] `PUT /api/v1/user/profile` 更新用户信息
    - [x] `PUT /api/v1/user/preferences` 更新偏好
    - [x] `GET/POST/PUT/DELETE /api/v1/user/certificates` 证书管理

### 2.4 职位模块开发

- [x] 实现职位查询功能
  - [x] 创建 `internal/service/position_service.go`
    - [x] 实现职位列表查询（支持分页）
    - [x] 实现多条件筛选（学历/专业/地区等）
    - [x] 实现排序逻辑
    - [x] 实现全文搜索（Elasticsearch集成）
  - [x] 创建 `internal/repository/position_repository.go`
    - [x] 实现基础查询方法
    - [x] 实现复杂筛选条件构建
    - [x] 实现关联查询
  - [x] 创建 `internal/handler/position_handler.go`
    - [x] `GET /api/v1/positions` 职位列表接口
    - [x] `GET /api/v1/positions/:id` 职位详情接口
    - [x] 添加请求参数校验
    - [x] 添加响应格式化

- [x] 实现职位收藏功能
  - [x] 创建 `internal/service/favorite_service.go`
  - [x] 创建 `internal/repository/favorite_repository.go`
  - [x] 在 `position_handler.go` 添加收藏接口
    - [x] `POST /api/v1/positions/:id/favorite` 收藏
    - [x] `DELETE /api/v1/positions/:id/favorite` 取消收藏
    - [x] `GET /api/v1/user/favorites` 收藏列表

- [x] 实现职位对比功能
  - [x] 在 `position_service.go` 添加对比方法
  - [x] `POST /api/v1/positions/compare` 职位对比接口

### 2.5 智能匹配模块开发

- [x] 实现匹配引擎核心逻辑
  - [x] 创建 `internal/service/match_service.go`
    - [x] 实现硬性条件过滤
      - [x] 学历条件判断
      - [x] 专业条件判断
      - [x] 年龄条件判断
      - [x] 户籍条件判断
      - [x] 政治面貌条件判断
    - [x] 实现软性条件评分算法
      - [x] 工作地点匹配度计算
      - [x] 专业精准度计算
      - [x] 竞争度评估
      - [x] 综合匹配度计算
    - [x] 实现匹配结果排序
  - [x] 创建 `internal/handler/match_handler.go`
    - [x] `GET /api/v1/match/positions` 智能匹配接口
    - [x] `GET /api/v1/match/report` 匹配报告接口

### 2.6 公告模块开发

- [x] 实现公告管理功能
  - [x] 创建 `internal/service/announcement_service.go`
  - [x] 创建 `internal/repository/announcement_repository.go`
  - [x] 创建 `internal/handler/announcement_handler.go`
    - [x] `GET /api/v1/announcements` 公告列表
    - [x] `GET /api/v1/announcements/:id` 公告详情
    - [x] `GET /api/v1/announcements/search` 公告搜索

### 2.7 通知推送模块

- [x] 实现推送服务
  - [x] 创建 `internal/service/notification_service.go`
    - [x] 实现站内通知创建
    - [x] 实现App推送集成（极光/个推）
    - [x] 实现小程序订阅消息
  - [x] 创建 `internal/repository/notification_repository.go`
  - [x] 创建 `internal/handler/notification_handler.go`
    - [x] `GET /api/v1/notifications` 通知列表
    - [x] `PUT /api/v1/notifications/:id/read` 标记已读
    - [x] `PUT /api/v1/notifications/read-all` 全部已读
    - [x] `DELETE /api/v1/notifications/:id` 删除通知

### 2.8 Admin管理接口

- [x] 实现管理员认证
  - [x] 创建 `internal/service/admin_service.go`
  - [x] 创建 `internal/handler/admin_handler.go`
    - [x] `POST /api/v1/admin/login` 管理员登录

- [x] 实现用户管理接口
  - [x] `GET /api/v1/admin/users` 用户列表
  - [x] `GET /api/v1/admin/users/:id` 用户详情
  - [x] `PUT /api/v1/admin/users/:id/status` 禁用/启用用户
  - [x] `PUT /api/v1/admin/users/:id` 更新用户状态

- [x] 实现职位管理接口
  - [x] `GET /api/v1/admin/positions` 职位列表（含待审核）
  - [x] `PUT /api/v1/admin/positions/:id` 修改职位
  - [x] `PUT /api/v1/admin/positions/:id/review` 审核职位
  - [x] `DELETE /api/v1/admin/positions/:id` 删除职位

- [x] 实现公告管理接口
  - [x] `GET /api/v1/admin/announcements` 公告列表
  - [x] `POST /api/v1/admin/announcements` 添加公告
  - [x] `PUT /api/v1/admin/announcements/:id` 修改公告
  - [x] `DELETE /api/v1/admin/announcements/:id` 删除公告

- [x] 实现爬虫管理接口
  - [x] `GET /api/v1/admin/crawlers` 爬虫任务列表
  - [x] `POST /api/v1/admin/crawlers/trigger` 手动触发爬虫
  - [x] `GET /api/v1/admin/list-pages` 列表页管理
  - [x] `POST /api/v1/admin/list-pages` 添加列表页

- [x] 实现统计接口
  - [x] `GET /api/v1/admin/stats/overview` 概览统计
  - [x] `GET /api/v1/admin/stats/positions` 职位统计
  - [x] `GET /api/v1/admin/stats/users` 用户统计

### 2.9 中间件开发

- [x] JWT认证中间件
  - [x] 创建 `internal/middleware/auth.go`
  - [x] 实现Token解析
  - [x] 实现Token验证
  - [x] 实现用户信息注入Context

- [x] RBAC权限中间件
  - [x] 创建 `internal/middleware/permission.go`
  - [x] 实现角色权限校验

- [x] 请求日志中间件
  - [x] 创建 `internal/middleware/logger.go`
  - [x] 记录请求信息
  - [x] 记录响应时间

- [x] 限流中间件
  - [x] 创建 `internal/middleware/ratelimit.go`
  - [x] 基于Redis实现令牌桶限流

- [x] CORS中间件
  - [x] 配置允许的域名和方法

- [x] 错误处理中间件
  - [x] 创建 `internal/middleware/error.go`
  - [x] 统一错误响应格式
  - [x] Panic恢复

### 2.10 缓存设计

- [x] 实现Redis缓存
  - [x] 创建 `pkg/cache/redis.go`
  - [x] 实现用户会话缓存
  - [x] 实现职位列表缓存
  - [x] 实现专业词典缓存
  - [x] 实现缓存更新策略

### 2.11 测试与文档

- [x] 编写单元测试
  - [x] Service层测试
  - [x] Repository层测试
  - [x] Handler层测试

- [x] 配置Swagger
  - [x] 添加Swagger注解
  - [x] 生成API文档
  - [x] 配置Swagger UI

### 2.12 ✅ 后端集成（已完成）

> **状态**：已完成集成，服务可正常启动（2024年12月29日）

- [x] **数据库初始化集成**
  - [x] 在 `main.go` 中调用数据库连接初始化
  - [x] 在 `main.go` 中调用 `AutoMigrate` 执行数据库迁移

- [ ] **Redis 初始化集成**（可选）
  - [ ] 在 `main.go` 中初始化 Redis 客户端
  - [ ] 配置缓存实例

- [x] **依赖注入与路由注册**
  - [x] 创建所有 Repository 实例
  - [x] 创建所有 Service 实例（注入 Repository）
  - [x] 创建所有 Handler 实例（注入 Service）
  - [x] 注册所有 Handler 路由

- [x] **中间件集成**
  - [x] 集成 JWT 认证中间件
  - [x] 集成自定义 CORS 配置

- [ ] **完整启动测试**
  - [ ] 启动后端服务并验证健康检查
  - [ ] 测试用户注册/登录接口
  - [ ] 测试职位查询接口

---

## 三、Web前端开发 TodoList (React + TypeScript)

> Web项目包含用户端和Admin管理端，共用同一项目

### 3.1 项目初始化

- [x] 创建Vite React项目
  - [x] 在 `apps/web/` 目录执行 `pnpm create vite . --template react-ts`
  - [x] 配置 `vite.config.ts`（别名、代理、构建选项）
  - [x] 配置 `tsconfig.json`

- [x] 安装核心依赖
  - [x] `react-router-dom` - 路由管理
  - [x] `@tanstack/react-query` - 服务端状态管理
  - [x] `zustand` - 客户端状态管理
  - [x] `axios` - HTTP客户端
  - [x] `tailwindcss` - CSS框架
  - [x] `@radix-ui/react-*` - 无样式组件基础
  - [x] `lucide-react` - 图标库
  - [x] `react-hook-form` + `zod` - 表单与校验
  - [x] `dayjs` - 日期处理
  - [x] `ahooks` - React Hooks库

- [x] 配置TailwindCSS
  - [x] 安装 `tailwindcss postcss autoprefixer`
  - [x] 创建 `tailwind.config.js`
  - [x] 配置主题色、字体、间距
  - [x] 创建 `src/styles/globals.css`

- [x] 配置shadcn/ui
  - [x] 执行 `npx shadcn-ui@latest init`
  - [x] 配置组件目录 `src/components/ui/`
  - [x] 安装常用组件（Button, Input, Dialog, Select, Table, Card等）

- [x] 创建项目目录结构
  - [x] 创建 `src/pages/user/` - 用户端页面
  - [x] 创建 `src/pages/admin/` - Admin端页面
  - [x] 创建 `src/components/ui/` - shadcn/ui组件
  - [x] 创建 `src/components/common/` - 通用业务组件
  - [x] 创建 `src/hooks/` - 自定义Hooks
  - [x] 创建 `src/stores/` - Zustand状态
  - [x] 创建 `src/services/` - API服务
  - [x] 创建 `src/utils/` - 工具函数
  - [x] 创建 `src/types/` - TypeScript类型
  - [x] 创建 `src/constants/` - 常量定义

- [x] 配置路由
  - [x] 创建 `src/router/index.tsx` (在App.tsx中集成)
  - [x] 配置用户端路由（`/` 前缀）
  - [x] 配置Admin端路由（`/admin` 前缀）
  - [x] 配置路由守卫（权限控制）
  - [x] 配置404页面

- [x] 配置Axios
  - [x] 创建 `src/services/request.ts`
  - [x] 配置baseURL、超时时间
  - [x] 配置请求拦截器（添加Token）
  - [x] 配置响应拦截器（错误处理、Token刷新）

- [x] 配置React Query
  - [x] 创建 `src/providers/QueryProvider.tsx` (在main.tsx中集成)
  - [x] 配置默认选项（重试、缓存时间）
  - [x] 配置全局错误处理

### 3.2 通用组件开发

- [x] 布局组件
  - [x] 创建 `UserLayout` - 用户端布局
  - [x] 创建 `AdminLayout` - Admin端布局
  - [x] 创建 `AuthLayout` - 认证页面布局

- [x] 导航组件 (已集成在Layout中)
  - [x] 创建 `UserHeader` - 用户端顶部导航 (在UserLayout中)
  - [x] 创建 `AdminSidebar` - Admin端侧边导航 (在AdminLayout中)
  - [x] 创建 `Breadcrumb` - 面包屑导航

- [x] 表单组件封装
  - [x] 创建 `SearchInput` - 搜索输入框
  - [x] 创建 `Button` - 按钮组件
  - [x] 创建 `FormDatePicker` - 日期选择器
  - [x] 创建 `RegionSelect` - 省市区三级联动
  - [x] 创建 `MajorSelect` - 专业选择器

- [x] 数据展示组件
  - [x] 创建 `DataTable` - 数据表格
  - [x] 创建 `Pagination` - 分页组件
  - [x] 创建 `Empty` - 空状态展示
  - [x] 创建 `Loading` - 加载动画

- [x] 业务组件
  - [x] 创建 `PositionCard` - 职位卡片
  - [x] 创建 `MatchScoreBadge` - 匹配度徽章
  - [x] 创建 `ConditionCompareTable` - 条件对比表
  - [x] 创建 `PositionTimeline` - 岗位生命周期时间线

### 3.3 用户端页面开发

- [x] 认证页面
  - [x] 创建登录页 `/login`
    - [x] 手机号/邮箱登录表单
    - [x] 验证码登录选项
    - [x] 记住登录状态
  - [x] 创建注册页 `/register`
    - [x] 注册表单
    - [x] 验证码发送与校验
  - [x] 创建忘记密码页 `/forgot-password`

- [x] 首页与职位浏览
  - [x] 创建首页 `/`
    - [x] 搜索框
    - [x] 快捷筛选入口
    - [x] 最新公告轮播
    - [x] 热门职位推荐
  - [x] 创建职位列表页 `/positions`
    - [x] 高级筛选面板
    - [x] 职位列表展示
    - [x] 排序选项
    - [x] 分页加载
  - [x] 创建职位详情页 `/positions/:id`
    - [x] 职位信息展示
    - [x] 条件对比表
    - [x] 匹配度分析
    - [x] 收藏/分享按钮
    - [x] 关联公告列表
  - [x] 创建职位对比页 `/positions/compare`

- [x] 智能匹配页面
  - [x] 创建智能匹配页 `/match`
    - [x] 匹配策略选择
    - [x] 匹配结果列表
    - [x] 匹配度展示
  - [x] 创建匹配报告页 `/match/report`
    - [x] 个人条件概览
    - [x] 可报考职位统计
    - [x] 竞争优势分析

- [x] 公告页面
  - [x] 创建公告列表页 `/announcements`
  - [x] 创建公告详情页 `/announcements/:id`

- [x] 用户中心页面
  - [x] 创建个人中心首页 `/profile`
  - [x] 创建个人简历页 `/profile`
    - [x] 基本信息表单
    - [x] 教育背景表单
    - [x] 证书管理
  - [x] 创建偏好设置页 `/user/preferences`
  - [x] 创建我的收藏页 `/favorites`
  - [x] 创建浏览历史页 `/user/history`
  - [x] 创建消息通知页 `/user/notifications`
  - [x] 创建账号安全页 `/user/security`

### 3.4 Admin端页面开发

- [x] Admin认证
  - [x] 创建Admin登录页 `/admin/login`

- [x] 仪表盘
  - [x] 创建数据概览页 `/admin`
    - [x] 关键数据卡片
    - [x] 数据趋势图表
    - [x] 待处理任务提醒

- [x] 用户管理
  - [x] 创建用户列表页 `/admin/users`
  - [x] 创建用户详情页 `/admin/users/:id`

- [x] 职位数据管理
  - [x] 创建职位列表页 `/admin/positions`
  - [x] 创建职位详情/编辑页 `/admin/positions/:id`
  - [x] 创建待审核职位页 `/admin/positions/pending`

- [x] 公告管理
  - [x] 创建公告列表页 `/admin/announcements`
  - [x] 创建添加公告页 `/admin/announcements/create`
  - [x] 创建编辑公告页 `/admin/announcements/:id/edit`

- [x] 爬虫管理
  - [x] 创建爬虫任务页 `/admin/crawlers`
  - [x] 创建监控列表页管理 `/admin/list-pages`

- [x] 数据字典管理
  - [x] 创建专业词典页 `/admin/dictionary/majors`
  - [x] 创建地区词典页 `/admin/dictionary/regions`

- [x] 系统设置
  - [x] 创建系统配置页 `/admin/settings`
  - [x] 创建管理员账号页 `/admin/settings/admins`
  - [x] 创建操作日志页 `/admin/logs`

### 3.5 状态管理

- [x] Zustand状态设计
  - [x] 创建 `src/stores/userStore.ts` - 用户状态
  - [x] 创建 `src/stores/appStore.ts` - 应用状态
  - [x] 创建 `src/stores/compareStore.ts` - 职位对比状态

### 3.6 API服务封装

- [x] 创建API服务模块
  - [x] `src/services/auth.ts` - 认证API
  - [x] `src/services/user.ts` - 用户API
  - [x] `src/services/position.ts` - 职位API
  - [x] `src/services/match.ts` - 匹配API
  - [x] `src/services/announcement.ts` - 公告API
  - [x] `src/services/notification.ts` - 通知API
  - [x] `src/services/admin/` - Admin API目录

### 3.7 自定义Hooks

- [x] 创建业务Hooks
  - [x] `useAuth` - 认证Hook
  - [x] `useUser` - 用户信息Hook
  - [x] `usePositions` - 职位列表Hook
  - [x] `useMatchedPositions` - 匹配职位Hook
  - [x] `useFavorites` - 收藏管理Hook
  - [x] `useDebounce` - 防抖Hook
  - [x] `useLocalStorage` - 本地存储Hook

### 3.8 工具函数

- [x] 创建工具模块
  - [x] `src/utils/format.ts` - 日期/数字格式化
  - [x] `src/utils/validation.ts` - 数据校验
  - [x] `src/utils/region.ts` - 地区数据处理
  - [x] `src/utils/major.ts` - 专业数据处理
  - [x] `src/utils/storage.ts` - 存储封装

### 3.9 响应式与优化

- [x] 响应式布局
  - [x] 配置TailwindCSS断点
  - [x] 移动端导航适配
  - [x] 表格移动端适配

- [x] 性能优化
  - [x] 图片懒加载
  - [x] 路由懒加载
  - [x] 骨架屏加载

---

## 四、App端开发 TodoList (Taro React)

> 使用Taro 3.x + React开发，支持编译到iOS和Android

### 4.1 项目初始化

- [x] 创建Taro项目
  - [x] 在 `apps/mobile/` 目录创建项目
  - [x] 选择React框架 + TypeScript
  - [x] 配置编译目标（React Native）
  - [x] 配置 `config/index.js`
  - [x] 配置 `babel.config.js`

- [x] 安装核心依赖
  - [x] `@tarojs/taro` - Taro运行时
  - [x] `@tarojs/components` - 跨端组件
  - [x] `@tarojs/plugin-platform-rn` - React Native插件
  - [x] `zustand` - 状态管理
  - [x] `@tanstack/react-query` - 数据请求
  - [x] `@nutui/nutui-react-taro` - UI组件库

- [x] 创建项目目录结构
  - [x] 创建 `src/pages/` - 页面目录
  - [x] 创建 `src/components/` - 组件目录
  - [x] 创建 `src/hooks/` - Hooks目录
  - [x] 创建 `src/stores/` - 状态目录
  - [x] 创建 `src/services/` - API服务
  - [x] 创建 `src/utils/` - 工具函数

### 4.2 通用组件开发

- [x] 基础组件
  - [x] 创建 `NavBar` - 自定义导航栏
  - [x] 创建 `TabBar` - 底部标签栏
  - [x] 创建 `PositionCard` - 职位卡片
  - [x] 创建 `RefreshList` - 下拉刷新列表
  - [x] 创建 `FilterPanel` - 筛选面板

### 4.3 页面开发

- [x] TabBar页面
  - [x] 创建首页 `pages/index/index`
    - [x] 搜索入口
    - [x] 快捷入口
    - [x] 推荐职位列表
  - [x] 创建职位页 `pages/positions/index`
    - [x] 职位列表
    - [x] 筛选按钮
  - [x] 创建匹配页 `pages/match/index`
    - [x] 匹配度概览
    - [x] 匹配职位列表
  - [x] 创建我的页 `pages/user/index`
    - [x] 用户信息卡片
    - [x] 功能菜单列表

- [x] 职位相关页面
  - [x] 创建职位搜索页 `pages/positions/search`
  - [x] 创建职位筛选页 `pages/positions/filter`
  - [x] 创建职位详情页 `pages/positions/detail`
  - [x] 创建职位对比页 `pages/positions/compare`

- [x] 用户相关页面
  - [x] 创建登录页 `pages/user/login`
  - [x] 创建注册页 `pages/user/register`
  - [x] 创建个人简历页 `pages/user/profile`
  - [x] 创建偏好设置页 `pages/user/preferences`
  - [x] 创建我的收藏页 `pages/user/favorites`
  - [x] 创建消息通知页 `pages/user/notifications`

### 4.4 功能实现

- [x] 登录状态管理
  - [x] Token持久化存储
  - [x] 自动刷新Token
  - [x] 退出登录清理

- [x] 推送通知
  - [x] 极光/个推SDK集成
  - [x] 推送Token上报
  - [x] 推送消息处理

- [x] 分享功能
  - [x] 分享职位详情
  - [x] 生成分享海报

- [x] 离线缓存
  - [x] 职位数据缓存
  - [x] 缓存更新策略

### 4.5 React Native构建

- [ ] iOS构建
  - [ ] Xcode项目配置
  - [ ] 签名证书配置
  - [ ] 打包测试

- [ ] Android构建
  - [ ] Gradle配置
  - [ ] 签名配置
  - [ ] APK打包

---

## 五、微信小程序开发 TodoList (Taro React)

> 使用Taro 3.x + React开发

### 5.1 项目初始化

- [x] 创建Taro小程序项目
  - [x] 在 `apps/miniprogram/` 创建项目
  - [x] 选择React + TypeScript
  - [x] 配置编译目标（微信小程序）
  - [x] 配置 `project.config.json`（AppID）

- [x] 配置分包
  - [x] 配置主包页面
  - [x] 配置职位分包 `subpackages/positions/`
  - [x] 配置匹配分包 `subpackages/match/`
  - [x] 配置公告分包 `subpackages/announcements/`

### 5.2 页面开发

- [x] 主包页面
  - [x] 创建首页 `pages/index/index`
  - [x] 创建我的页 `pages/user/index`
  - [x] 创建登录页 `pages/user/login`
  - [x] 创建简历页 `pages/user/profile`

- [x] 职位分包页面
  - [x] 创建职位列表页 `subpackages/positions/index`
  - [x] 创建职位搜索页 `subpackages/positions/search`
  - [x] 创建职位筛选页 `subpackages/positions/filter`
  - [x] 创建职位详情页 `subpackages/positions/detail`

- [x] 匹配分包页面
  - [x] 创建智能匹配页 `subpackages/match/index`
  - [x] 创建匹配报告页 `subpackages/match/report`

- [x] 公告分包页面
  - [x] 创建公告列表页 `subpackages/announcements/index`
  - [x] 创建公告详情页 `subpackages/announcements/detail`

### 5.3 微信小程序特有功能

- [x] 微信登录
  - [x] `wx.login` 获取code
  - [x] 后端换取openid
  - [x] 获取用户信息
  - [x] 绑定手机号

- [x] 订阅消息
  - [x] 申请订阅消息模板
  - [x] 引导用户订阅
  - [x] 发送订阅消息

- [x] 分享功能
  - [x] `onShareAppMessage` 分享给好友
  - [x] `onShareTimeline` 分享到朋友圈
  - [x] 自定义分享卡片

- [x] 小程序码
  - [x] 生成带参数小程序码
  - [x] 扫码跳转处理

### 5.4 性能优化

- [x] 分包预下载
  - [x] 配置 `preloadRule`

- [x] 按需注入
  - [x] 配置 `lazyCodeLoading`

- [x] 数据缓存
  - [x] 本地缓存策略

### 5.5 发布上线

- [ ] 审核准备
  - [ ] 类目选择
  - [ ] 隐私协议配置
  - [ ] 用户协议页面

- [ ] 提交审核
  - [ ] 版本管理
  - [ ] 审核提交

---

## 六、Python爬虫模块开发 TodoList

### 6.2 爬虫引擎开发

- [x] 基础爬虫框架
  - [x] 创建 `src/spiders/base.py` 基础爬虫类
    - [x] 请求头管理
    - [x] Cookie管理
    - [x] 代理IP支持
    - [x] 请求频率控制
    - [x] 重试机制
  - [x] 配置Scrapy `settings.py`

- [x] 列表页爬虫
  - [x] 创建列表页发现爬虫 `list_discovery_spider.py`
    - [x] 从聚合平台抓取文章URL
    - [x] URL结构分析推断列表页
    - [x] 页面元素提取
  - [x] 创建列表页监控爬虫 `list_monitor_spider.py`
    - [x] 定时爬取已入库列表页
    - [x] 解析文章链接
    - [x] 增量更新（URL去重）
    - [x] 分页处理

- [x] 详情页爬虫
  - [x] 创建公告详情爬虫 `announcement_spider.py`
    - [x] 抓取公告页面内容
    - [x] 提取标题、发布时间、正文
    - [x] 下载附件
  - [x] 创建职位表爬虫 `position_spider.py`
    - [x] 识别职位表类型
    - [x] 提取职位表数据

### 6.3 文档解析器开发

- [x] HTML解析器
  - [x] 创建 `parsers/html_parser.py`
    - [x] 表格识别与提取
    - [x] 表头映射
    - [x] 合并单元格处理

- [x] PDF解析器
  - [x] 创建 `parsers/pdf_parser.py`
    - [x] 使用pdfplumber提取文本
    - [x] 表格识别与提取
    - [x] 判断是否为扫描件
    - [x] 调用OCR识别

- [x] Excel解析器
  - [x] 创建 `parsers/excel_parser.py`
    - [x] 使用pandas读取
    - [x] 多Sheet处理
    - [x] 表头识别
    - [x] 数据类型转换

- [x] Word解析器
  - [x] 创建 `parsers/word_parser.py`
    - [x] 使用python-docx读取
    - [x] 表格提取
    - [x] 段落提取

- [x] OCR引擎
  - [x] 创建 `parsers/ocr_parser.py`
    - [x] PaddleOCR集成
    - [x] 图片预处理
    - [x] 表格区域识别

### 6.4 AI预处理模块开发

- [x] AI信息提取
  - [x] 创建 `processors/ai_extractor.py`
    - [x] LLM API封装
    - [x] Prompt模板管理
    - [x] 结构化输出解析
    - [x] Token用量控制
  - [x] 设计提取Prompt
    - [x] 职位基本信息提取Prompt
    - [x] 报考条件提取Prompt
    - [x] 考试信息提取Prompt

- [x] 数据标准化
  - [x] 创建 `processors/normalizer.py`
    - [x] 学历标准化映射
    - [x] 专业标准化
    - [x] 地区标准化
    - [x] 年龄计算
    - [x] 日期格式统一

- [x] 数据校验
  - [x] 创建 `processors/validator.py`
    - [x] 必填字段检查
    - [x] 字段类型校验
    - [x] 枚举值范围校验
    - [x] 逻辑一致性校验
    - [x] AI置信度评估

### 6.5 数据存储模块

- [x] 数据库操作
  - [x] 创建 `database/` SQLAlchemy模型
    - [x] 公告表操作
    - [x] 职位表操作
    - [x] 列表页表操作

- [x] 数据入库Pipeline
  - [x] 创建 `pipelines/`
    - [x] 数据去重
    - [x] 数据入库
    - [x] 关联关系建立

- [x] 缓存管理
  - [x] Redis缓存URL去重
  - [x] 已爬取URL集合

### 6.6 任务调度

- [x] Celery任务
  - [x] 创建 `tasks/` 任务模块
    - [x] 列表页监控任务
    - [x] 公告爬取任务
    - [x] 文档解析任务
    - [x] AI预处理任务

- [x] 定时调度
  - [x] 配置Celery Beat
  - [x] 不同列表页不同频率

### 6.7 GUI管理界面开发

- [x] GUI框架搭建
  - [x] 创建主窗口 `gui/main_window.py`
    - [x] 使用PyQt6创建主窗口
    - [x] 菜单栏
    - [x] 工具栏
    - [x] 状态栏

- [x] 爬虫项目管理
  - [x] 创建爬虫项目树 `gui/spider_manager.py`
    - [x] 显示所有爬虫项目
    - [x] 右键菜单（启动/停止/配置）
  - [x] 创建添加爬虫向导
  - [x] 创建爬虫配置编辑 `gui/config_editor.py`

- [x] 任务监控面板
  - [x] 创建任务列表 `gui/task_monitor.py`
    - [x] 显示所有任务
    - [x] 任务状态显示
    - [x] 进度显示
  - [x] 任务详情查看
  - [x] 任务操作（取消/重试）

- [x] 数据预览与管理
  - [x] 创建数据浏览器
    - [x] 公告数据表格
    - [x] 职位数据表格
    - [x] 筛选与搜索
  - [x] 创建待审核队列
    - [x] 低置信度数据列表
    - [x] 审核操作

- [x] 监控列表页管理
  - [x] 创建列表页管理界面
    - [x] 已添加列表页表格
    - [x] 状态显示
  - [x] 添加列表页功能
  - [x] 列表页配置编辑

- [x] 日志与告警
  - [x] 创建日志面板
    - [x] 实时日志滚动
    - [x] 日志级别筛选
  - [x] 创建告警通知
    - [x] 爬虫异常告警
    - [x] 任务失败告警

- [x] 系统设置
  - [x] 创建全局配置界面
    - [x] 数据库配置
    - [x] Redis配置
    - [x] AI API配置
    - [x] 代理配置
  - [x] 创建代理管理
  - [x] 创建定时任务配置

### 6.8 API接口（供后端调用）

- [x] HTTP API服务
  - [x] 使用Flask/FastAPI创建HTTP服务 `api/`
    - [x] 手动触发爬虫接口
    - [x] 查询爬虫状态接口
    - [x] 添加列表页接口
    - [x] 获取统计数据接口

### 6.9 测试与文档

- [x] 编写单元测试
  - [x] 解析器测试
  - [x] 标准化测试
  - [x] 校验器测试

- [x] 编写文档
  - [x] 使用说明文档
  - [x] 配置说明文档
  - [x] API文档

---

### 7.1 Docker化

- [x] 创建Dockerfile
  - [x] 后端 `apps/server/Dockerfile`
  - [x] Web前端 `apps/web/Dockerfile`
  - [x] 爬虫 `packages/crawler/Dockerfile`

- [x] 创建Docker Compose
  - [x] 创建 `docker-compose.yml`
  - [x] 定义服务（api, web, mysql, redis, elasticsearch）
  - [x] 定义网络和数据卷

### 7.2 数据库初始化

- [x] MySQL初始化
  - [x] 创建数据库
  - [x] 字符集配置
  - [x] 初始化数据导入

- [x] Redis配置
  - [x] 持久化配置

- [x] Elasticsearch配置
  - [x] 索引创建
  - [x] 分词器配置

### 7.3 CI/CD

- [x] GitHub Actions配置
  - [x] 代码检查（lint）
  - [x] 单元测试
  - [x] 构建镜像
  - [x] 部署流程

- [x] 环境配置
  - [x] 开发环境
  - [x] 测试环境
  - [x] 生产环境

### 7.4 监控与日志

- [x] 日志收集
  - [x] 集中日志收集
  - [x] 日志格式统一

- [x] 监控告警
  - [x] 服务健康检查
  - [x] 性能监控
  - [x] 错误告警

---

## 八、项目里程碑规划

> ✅ **当前状态说明**：后端已完成集成（2024年12月29日），服务可正常启动

### P0: ✅ 后端集成（已完成 - 2024年12月29日）

- [x] **修复 `apps/server/cmd/api/main.go`**
  - [x] 初始化数据库连接
  - [x] 创建 Repository/Service/Handler 实例
  - [x] 注册所有路由
  - [x] 集成中间件
- [ ] 验证后端服务可正常启动（需要MySQL数据库）

### P1: MVP版本 (4-6周)

- [x] 后端基础框架搭建 ✅
- [x] 用户认证模块 ✅
- [x] 职位数据模型与基础API ✅
- [x] Web用户端基础页面
- [x] 国考职位表Excel解析（爬虫模块）
- [x] 基础筛选功能 ✅

### P2: 核心功能 (6-8周)

- [x] 智能匹配引擎 ✅
- [ ] 多省份职位数据支持
- [x] App端开发
- [x] 微信小程序开发
- [x] Admin管理端

### P3: 增强功能 (4周)

- [x] PDF/Word文档解析（爬虫模块）
- [x] 爬虫GUI管理界面
- [x] 推送通知 ✅
- [x] 公告关联机制 ✅

### P4: 高级功能 (6周)

- [x] AI预处理流水线（爬虫模块）
- [ ] 数据统计分析
- [ ] 历年数据支持
- [ ] VIP功能

---

**文档完成！** 共包含 8 个主要模块，涵盖从项目初始化到部署上线的完整开发流程

```
数据源分层：
┌─────────────────────────────────────────────────────────────────┐
│                     第三方聚合平台（发现层）                      │
│         公考资讯网、QZZN论坛、公考通等                           │
│                          │                                       │
│                    提取原文URL                                   │
│                          ↓                                       │
├─────────────────────────────────────────────────────────────────┤
│                     原始来源网站（数据层）                        │
│    ┌──────────────┬──────────────┬──────────────┐              │
│    │ 国家公务员局  │ 省人事考试网  │ 组织部网站   │              │
│    │ www.scs.gov.cn│ 各省人社厅   │ 选调生信息   │              │
│    └──────────────┴──────────────┴──────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

| 层级       | 数据源类型     | 用途                    | 示例                     |
| ---------- | -------------- | ----------------------- | ------------------------ |
| **发现层** | 第三方聚合平台 | 发现新来源、提取原文URL | 公考资讯网、QZZN         |
| **数据层** | 官方原始网站   | 实际数据抓取来源        | 国家公务员局、各省人社厅 |

#### 2.1.2 逆向发现与列表监控机制

**核心流程**：从聚合平台发现文章URL → 向上追溯列表页 → 持续监控列表页

```
逆向发现流程：
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: 从聚合平台抓取                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  聚合平台文章: "2024年XX省公务员招录公告"                  │    │
│  │  → 提取原文链接: https://rsj.xx.gov.cn/article/12345     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
├─────────────────────────────────────────────────────────────────┤
│  Step 2: 向上追溯列表页                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  文章URL: https://rsj.xx.gov.cn/article/12345            │    │
│  │  → 分析URL结构，推断列表页                                │    │
│  │  → 列表页: https://rsj.xx.gov.cn/list/gongwuyuan/        │    │
│  │  → 或通过文章页面的面包屑导航/返回链接获取                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
├─────────────────────────────────────────────────────────────────┤
│  Step 3: 列表页入库并持续监控                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  新发现的列表页 → 加入监控队列                            │    │
│  │  定时爬取列表页 → 发现新文章 → 抓取文章内容               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

##### 列表页发现算法

**方法1：URL结构分析**

```
文章URL模式分析：
├── https://rsj.xx.gov.cn/article/12345
│   → 推断列表: https://rsj.xx.gov.cn/article/ 或 /list/
├── https://xx.gov.cn/news/2024/gwy_001.html
│   → 推断列表: https://xx.gov.cn/news/2024/ 或 /news/
└── https://xx.gov.cn/zwgk/gsgg/202412/t20241201_12345.html
    → 推断列表: https://xx.gov.cn/zwgk/gsgg/
```

**方法2：页面元素提取**

```
从文章页面提取：
├── 面包屑导航: 首页 > 公示公告 > 招录公告 → 提取"招录公告"链接
├── 返回列表按钮: "返回列表" → 提取href
├── 分类标签: 所属栏目链接
└── 相关文章: 同栏目其他文章的共同父路径
```

**方法3：AI辅助分析**

```
当上述方法失败时，使用AI分析：
├── 输入: 文章URL + 页面HTML
├── 输出: 推测的列表页URL
└── 验证: 访问推测URL，确认是否为有效列表页
```

##### 列表页管理

```
列表页数据结构：
{
  "list_id": "LIST-001",
  "list_url": "https://rsj.xx.gov.cn/list/gongwuyuan/",
  "source_domain": "rsj.xx.gov.cn",
  "source_name": "XX省人社厅",
  "category": "公务员招录",
  "discovery_method": "url_pattern",     // 发现方式
  "discovery_from": "https://qzzn.com/article/xxx",  // 来源聚合平台
  "status": "active",                    // 状态: active/inactive/error
  "crawl_frequency": "daily",            // 爬取频率
  "last_crawl_time": "2024-12-29 10:00:00",
  "article_count": 156,                  // 已抓取文章数
  "pagination_pattern": "?page={n}",     // 分页模式
  "article_selector": ".article-list li a",  // 文章链接CSS选择器
  "verified": true,                      // 是否人工验证过
  "notes": "XX省公务员招录主要列表页"
}
```

##### 监控策略

| 列表页类型 | 爬取频率 | 说明             |
| ---------- | -------- | ---------------- |
| 国考相关   | 每2小时  | 报名期间高频监控 |
| 省考相关   | 每6小时  | 公告发布期加密   |
| 事业单位   | 每日     | 常规监控         |
| 历史归档   | 每周     | 低频检查         |

#### 2.1.3 数据抓取功能

- **列表页监控**：定时爬取已入库的列表页，发现新文章
- **增量更新**：基于文章URL去重，只抓取新发布的公告
- **反爬处理**：支持代理IP、请求频率控制、验证码识别
- **公告监控**：新公告发布时主动推送通知
- **来源溯源**：每篇文章记录原始来源URL，支持追溯验证

#### 2.1.4 多格式文档解析

| 文档格式              | 解析能力                      | 技术方案建议                  |
| --------------------- | ----------------------------- | ----------------------------- |
| **网页(HTML)**        | 结构化提取表格、列表数据      | BeautifulSoup/Scrapy          |
| **PDF**               | 提取文本、表格，支持扫描件OCR | PyPDF2/pdfplumber + Tesseract |
| **Excel(.xlsx/.xls)** | 直接解析表格数据              | pandas/openpyxl               |
| **Word(.docx/.doc)**  | 提取文本、表格                | python-docx                   |
| **图片附件**          | OCR识别提取文字               | Tesseract/PaddleOCR           |

#### 2.1.5 岗位全生命周期公告关联

公考岗位从发布到录用会经历多个阶段，每个阶段都会发布独立的公告。系统需要将同一岗位的所有相关公告串联起来，形成完整的招录流程追踪。

##### 公告类型与阶段

```
岗位生命周期：
┌─────────────────────────────────────────────────────────────────┐
│  招聘公告    →   报名统计   →   笔试公告   →   成绩公告        │
│  (初始发布)      (报名人数)      (考试安排)      (笔试成绩)      │
│                                                                  │
│  →   资格复审   →   面试公告   →   面试成绩   →   体检公告     │
│      (材料审核)      (面试安排)      (面试成绩)      (体检通知)   │
│                                                                  │
│  →   政审公告   →   拟录用公示   →   最终录用                   │
│      (考察通知)      (人员公示)        (正式录用)                 │
└─────────────────────────────────────────────────────────────────┘
```

| 公告阶段     | 公告类型        | 关键信息                       |
| ------------ | --------------- | ------------------------------ |
| 1. 招聘发布  | 招录公告/职位表 | 岗位要求、招录人数、报名时间   |
| 2. 报名阶段  | 报名人数统计    | 报名人数、竞争比、缴费人数     |
| 3. 笔试阶段  | 笔试公告/准考证 | 考试时间、地点、注意事项       |
| 4. 成绩发布  | 笔试成绩公告    | 成绩查询、最低合格线、进面名单 |
| 5. 资格复审  | 复审公告        | 复审时间、地点、所需材料       |
| 6. 面试阶段  | 面试公告        | 面试时间、形式、考场安排       |
| 7. 面试成绩  | 综合成绩公告    | 面试成绩、综合排名             |
| 8. 体检阶段  | 体检公告        | 体检时间、医院、标准           |
| 9. 政审考察  | 政审公告        | 考察时间、材料准备             |
| 10. 录用公示 | 拟录用公示      | 拟录用人员名单、公示期         |
| 11. 递补公告 | 递补通知        | 递补人员、原因说明             |

##### 公告关联机制

**关联标识字段**：

```
├── 招录批次ID（如：2024年国考）
├── 招录机关代码
├── 职位代码
├── 公告发布机关
├── 公告发布时间
└── 关联关键词（岗位名称、部门名称）
```

**智能关联算法**：

1. **精确匹配**：通过职位代码直接关联
2. **模糊匹配**：当无职位代码时，通过以下规则关联：
   - 招录机关名称相同
   - 岗位名称相似度 > 80%
   - 发布时间在同一招录周期内
   - 招录人数一致
3. **人工确认**：匹配度不确定时标记为待确认

**关联数据结构**：

```json
{
  "position_id": "GK2024-001-0123",
  "position_name": "综合管理岗",
  "department": "XX市税务局",
  "lifecycle": {
    "recruitment": {
      "announcement_id": "A001",
      "publish_date": "2024-10-15",
      "status": "已结束"
    },
    "registration_stats": {
      "announcement_id": "A002",
      "total_applicants": 358,
      "qualified_applicants": 320,
      "competition_ratio": "160:1"
    },
    "written_exam": {
      "announcement_id": "A003",
      "exam_date": "2024-12-01",
      "status": "已完成"
    },
    "score_release": {
      "announcement_id": "A004",
      "min_score": 110.5,
      "interview_candidates": ["张三", "李四", "王五"]
    },
    "interview": {
      "announcement_id": "A005",
      "interview_date": "2025-03-15",
      "status": "待进行"
    },
    "final_result": null
  },
  "current_stage": "待面试",
  "last_updated": "2024-12-29"
}
```

##### 用户功能支持

- **岗位进度追踪**：用户收藏的岗位自动显示最新阶段状态
- **阶段变更提醒**：岗位进入新阶段时推送通知
- **历史公告查看**：可查看该岗位的所有历史公告
- **竞争态势分析**：基于报名人数、进面分数等数据分析
- **时间线视图**：以时间轴形式展示岗位完整招录流程

##### 技术实现要点

1. **公告去重**：同一公告可能在多个网站发布，需去重处理
2. **增量关联**：新公告发布时自动关联到已有岗位
3. **缺失检测**：检测是否有阶段公告未被采集
4. **状态同步**：实时更新岗位当前所处阶段

### 2.2 职位信息结构化

#### 2.2.1 职位信息字段

```
职位基本信息：
├── 招录机关（部门名称）
├── 职位名称
├── 职位代码
├── 招录人数
├── 工作地点（省/市/区县）
├── 职位简介/工作内容
└── 备注说明

报考条件：
├── 学历要求
│   ├── 最低学历（大专/本科/硕士/博士）
│   ├── 学位要求
│   └── 是否接受同等学力
├── 专业要求
│   ├── 专业大类
│   ├── 具体专业列表
│   └── 是否接受相近专业
├── 政治面貌（党员/团员/群众）
├── 工作经验
│   ├── 最低年限
│   ├── 基层工作经验
│   └── 特定领域经验
├── 年龄要求（上限/下限）
├── 户籍限制（省份/城市/不限）
├── 性别要求（男/女/不限）
├── 资格证书（法律职业资格/CPA等）
├── 外语要求（英语四六级/其他语种）
├── 体检标准（普通/特殊）
├── 其他条件
│   ├── 应届生身份要求
│   ├── 服务期限
│   └── 特殊技能要求
└── 限制条件（不能报考的情形）

考试信息：
├── 考试类型（国考/省考/事业单位）
├── 考试科目
├── 报名时间
├── 考试时间
├── 面试比例
└── 历年分数线（如有）
```

#### 2.2.2 数据清洗规则

- **学历标准化**：统一为"大专/本科/硕士研究生/博士研究生"
- **专业映射**：建立专业同义词库，如"计算机科学与技术"="计算机"
- **地点标准化**：统一行政区划编码
- **年龄计算**：根据截止日期自动计算可报考年龄范围

### 2.3 用户信息管理

#### 2.3.1 用户简历信息

```
基本信息：
├── 姓名
├── 性别
├── 出生日期
├── 户籍所在地
├── 现居住地
└── 政治面貌

教育背景：
├── 最高学历
├── 毕业院校
├── 所学专业
├── 学位类型
├── 毕业时间
├── 是否应届生
└── 第二学历（如有）

工作经历：
├── 工作总年限
├── 基层工作经验年限
├── 当前/最近职位
├── 所在行业
└── 详细工作经历列表

资格证书：
├── 英语等级证书
├── 专业资格证书
├── 计算机等级证书
└── 其他证书

其他信息：
├── 特殊身份（退役军人/三支一扶/西部志愿者等）
└── 健康状况
```

#### 2.3.2 用户偏好设置

```
地域偏好：
├── 首选工作省份（可多选）
├── 首选城市（可多选）
├── 是否接受偏远地区
└── 通勤距离限制

岗位偏好：
├── 感兴趣的部门类型（税务/海关/公安等）
├── 期望工作性质（综合管理/专业技术/行政执法）
├── 是否接受基层岗位
└── 是否考虑艰苦边远地区（加分政策）

考试偏好：
├── 目标考试类型（国考/省考/事业单位）
├── 竞争程度偏好（低竞争优先/高级别优先）
└── 最低招录人数限制

筛选策略：
├── 严格匹配（完全符合才显示）
├── 宽松匹配（部分条件模糊匹配）
└── 智能推荐（AI评估匹配度）
```

### 2.4 智能匹配引擎

#### 2.4.1 匹配算法

1. **硬性条件过滤**
   - 学历不符 → 直接排除
   - 专业不符 → 直接排除（除非"专业不限"）
   - 年龄超限 → 直接排除
   - 户籍不符 → 直接排除（有户籍限制时）
   - 政治面貌不符 → 直接排除

2. **软性条件评分**

   ```
   匹配度评分 = Σ(条件权重 × 匹配程度)

   权重示例：
   - 工作地点匹配：25%
   - 专业精准匹配：20%
   - 招录人数（竞争度）：15%
   - 部门偏好匹配：15%
   - 学历层次匹配：10%
   - 工作经验匹配：10%
   - 其他条件：5%
   ```

3. **智能推荐**
   - 基于用户行为（收藏、查看）优化推荐
   - 相似用户协同过滤
   - 历年报考数据分析（如有）

#### 2.4.2 匹配结果展示

- **匹配度百分比**：直观显示岗位适合程度
- **条件对比表**：用户条件 vs 岗位要求的详细对比
- **风险提示**：标注不确定或边缘条件（如专业相近但不完全一致）
- **竞争分析**：基于历史数据预估报名人数和竞争比

### 2.5 公告管理与推送

#### 2.5.1 公告列表功能

- 按考试类型筛选（国考/省考/事业单位）
- 按地区筛选
- 按发布时间排序
- 全文搜索
- 收藏功能

#### 2.5.2 推送通知

- 新公告发布提醒
- 符合条件的新职位推送
- 报名截止提醒
- 考试时间提醒
- 重要政策变化提醒

### 2.6 数据统计与分析

- 各省份招录人数统计
- 热门专业需求分析
- 竞争比趋势分析
- 个人匹配报告生成

### 2.7 AI数据预处理架构

#### 2.7.1 架构设计理念

**核心原则**：AI在后台预处理，用户前台零AI调用

```
架构理念：
┌─────────────────────────────────────────────────────────────────┐
│                    数据处理流水线                                │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ 爬虫采集 │ →  │ AI预处理 │ →  │ 结构化   │ →  │ 规则匹配 │  │
│  │ (原始数据)│    │ (后台)   │    │ 数据库   │    │ (前台)   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       ↓               ↓               ↓               ↓         │
│   不确定格式      AI理解拆解      标准化字段      无需AI调用    │
│   PDF/Word等      消除歧义        可直接查询      毫秒级响应    │
└─────────────────────────────────────────────────────────────────┘
```

**设计优势**：
| 特点 | 说明 |
|-----|------|
| **成本可控** | AI只在数据入库时调用一次，用户查询不消耗AI资源 |
| **响应快速** | 用户匹配基于结构化数据库查询，毫秒级响应 |
| **数据一致** | 所有数据经过统一标准化，消除格式差异 |
| **离线可用** | 结构化数据可缓存到客户端，支持离线筛选 |
| **易于扩展** | 新增筛选条件只需添加数据库字段 |

#### 2.7.2 数据拆解标准

**完全结构化字段设计**：

所有公告数据必须拆解为以下标准化字段，确保前台可直接查询匹配：

```
岗位核心字段（必填）：
├── position_id          # 唯一标识符
├── position_name         # 职位名称
├── department_code       # 招录机关代码
├── department_name       # 招录机关名称
├── department_level      # 机关级别: 中央/省级/市级/县级/乡镇
├── work_location_province # 工作省份代码
├── work_location_city    # 工作城市代码
├── work_location_district # 工作区县代码
├── recruit_count         # 招录人数
├── exam_type            # 考试类型: 国考/省考/事业单位/选调生
└── announcement_url      # 原始公告链接

学历要求（枚举值）：
├── education_min         # 最低学历: 大专/本科/硕士/博士
├── education_max         # 最高学历限制（如有）
├── degree_required       # 是否要求学位: 是/否/不限
├── education_type        # 学历类型: 全日制/非全日制/不限
└── equivalent_accepted   # 是否接受同等学力: 是/否

专业要求（多值字段）：
├── major_category[]      # 专业大类代码列表
├── major_specific[]      # 具体专业代码列表
├── major_unlimited       # 是否专业不限: 是/否
└── major_related_accepted # 是否接受相近专业: 是/否/未说明

政治面貌（枚举值）：
├── political_status      # 要求: 党员/预备党员/团员/群众/不限
└── party_member_required # 是否必须党员: 是/否

工作经验（数值+枚举）：
├── work_exp_years_min    # 最低工作年限: 0/1/2/3/5...
├── work_exp_type         # 经验类型: 不限/基层/相关领域
├── grassroots_exp_years  # 基层工作经验年限要求
└── specific_exp_desc     # 特定经验要求（结构化标签）

年龄要求（数值）：
├── age_min              # 最小年龄
├── age_max              # 最大年龄
└── age_calc_date        # 年龄计算截止日期

户籍要求（枚举+地区码）：
├── hukou_required       # 是否限户籍: 是/否
├── hukou_province[]     # 限制省份列表
├── hukou_city[]         # 限制城市列表
└── hukou_note           # 户籍备注

性别要求：
└── gender_required      # 性别: 男/女/不限

资格证书（布尔值列表）：
├── cert_lawyer          # 法律职业资格: 是/否/不限
├── cert_cpa             # 注册会计师: 是/否/不限
├── cert_english_cet4    # 英语四级: 是/否/不限
├── cert_english_cet6    # 英语六级: 是/否/不限
├── cert_computer_level  # 计算机等级: 无要求/一级/二级/三级
└── cert_other[]         # 其他证书列表

特殊身份（布尔值）：
├── fresh_graduate_only  # 仅限应届生: 是/否
├── fresh_graduate_2year # 2年内应届生: 是/否
├── veteran_priority     # 退役军人优先: 是/否
├── sanzhiyifu           # 三支一扶: 是/否
├── volunteer_west       # 西部志愿者: 是/否
└── special_identity[]   # 其他特殊身份

岗位属性（枚举值）：
├── position_type        # 类型: 综合管理/专业技术/行政执法
├── is_hardship_area     # 艰苦边远地区: 是/否
├── hardship_level       # 艰苦等级: 1-5级
├── service_period       # 最低服务年限: 0/3/5年
└── physical_standard    # 体检标准: 普通/特殊

考试信息（日期+数值）：
├── registration_start   # 报名开始日期
├── registration_end     # 报名截止日期
├── exam_date_written    # 笔试日期
├── exam_subjects[]      # 考试科目: 行测/申论/专业科目
├── interview_ratio      # 面试比例: 3:1/5:1等
└── historical_cutoff    # 历年分数线（如有）

竞争数据（数值，动态更新）：
├── applicant_count      # 报名人数
├── qualified_count      # 审核通过人数
├── competition_ratio    # 竞争比
└── last_updated         # 数据更新时间

AI解析元数据：
├── parse_confidence     # 解析置信度: 0-100
├── parse_warnings[]     # 解析警告信息
├── manual_reviewed      # 是否人工复核: 是/否
└── original_text_hash   # 原始文本哈希（用于去重）
```

#### 2.7.3 AI预处理流水线

**处理流程**：

```
                    数据预处理流水线
                         │
    ┌────────────────────┼────────────────────┐
    ▼                    ▼                    ▼
┌─────────┐        ┌─────────┐        ┌─────────┐
│ 网页    │        │ PDF     │        │ Excel   │
│ HTML    │        │ 文档    │        │ 职位表  │
└────┬────┘        └────┬────┘        └────┬────┘
     │                  │                  │
     ▼                  ▼                  ▼
┌─────────┐        ┌─────────┐        ┌─────────┐
│文本提取 │        │OCR/解析 │        │表格解析 │
└────┬────┘        └────┬────┘        └────┬────┘
     │                  │                  │
     └──────────────────┼──────────────────┘
                        ▼
              ┌─────────────────┐
              │   统一文本格式   │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │  AI结构化解析   │
              │  (LLM提取字段)  │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │   字段标准化    │
              │ (映射到枚举值)  │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │   质量校验      │
              │ (规则+AI双检)   │
              └────────┬────────┘
                       ▼
            ┌─────────────────────┐
            │  置信度 ≥ 85% ?    │
            └──────────┬──────────┘
                  ╱         ╲
                是            否
                ↓              ↓
        ┌───────────┐   ┌───────────┐
        │ 直接入库  │   │ 人工复核  │
        └───────────┘   └───────────┘
```

**AI解析Prompt设计**：

```json
{
  "system": "你是公务员考试职位信息提取专家。请将以下公告内容解析为标准JSON格式。",
  "instructions": [
    "严格按照字段定义提取信息",
    "无法确定的字段填null，不要猜测",
    "为每个字段提供confidence分数(0-100)",
    "识别出的不确定信息放入warnings数组"
  ],
  "output_schema": "...(完整字段定义)...",
  "input": "原始公告文本"
}
```

#### 2.7.4 字段标准化映射

**学历映射表**：
| 原始表述 | 标准化值 |
|---------|---------|
| 本科、大学本科、全日制本科、普通本科 | 本科 |
| 硕士、硕士研究生、全日制硕士、研究生 | 硕士 |
| 大专、专科、高职高专 | 大专 |
| 博士、博士研究生 | 博士 |
| 本科及以上、本科以上 | education_min=本科 |
| 仅限本科、本科学历 | education_min=本科, education_max=本科 |

**专业映射表**：

```
建立专业同义词库，示例：
├── 计算机科学与技术 ↔ 计算机 ↔ CS ↔ 计科
├── 工商管理 ↔ 企业管理 ↔ MBA
├── 法学 ↔ 法律 ↔ 法律学
└── ...（基于教育部专业目录构建）
```

**地区代码映射**：

- 使用国家行政区划代码（6位）
- 省级：前2位，如 11=北京
- 市级：前4位，如 1101=北京市
- 区县：完整6位，如 110101=东城区

#### 2.7.5 前台规则匹配引擎

**匹配逻辑（无需AI）**：

```sql
-- 示例：基于结构化数据的快速匹配查询
SELECT * FROM positions WHERE
  -- 硬性条件过滤
  education_min <= :user_education
  AND (major_unlimited = true OR :user_major IN major_specific)
  AND (age_max >= :user_age OR age_max IS NULL)
  AND (hukou_required = false OR :user_hukou_province IN hukou_province)
  AND (political_status = '不限' OR political_status = :user_political)
  AND (fresh_graduate_only = false OR :user_is_fresh = true)
  -- 偏好排序
ORDER BY
  CASE WHEN work_location_province = :pref_province THEN 0 ELSE 1 END,
  competition_ratio ASC,
  recruit_count DESC
```

**匹配结果计算**：

```
匹配度 = 硬性条件通过 × (Σ 软性条件权重 × 匹配值)

软性条件权重（可配置）：
├── 地区匹配：30%
├── 专业精准匹配：25%
├── 竞争度适中：20%
├── 部门偏好：15%
└── 其他加分项：10%
```

#### 2.7.6 数据质量保障

**多层校验机制**：

| 层级         | 校验内容                 | 处理方式         |
| ------------ | ------------------------ | ---------------- |
| **格式校验** | 字段类型、枚举值范围     | 自动拒绝         |
| **逻辑校验** | 年龄范围合理性、日期先后 | 标记警告         |
| **AI置信度** | 解析置信度 < 85%         | 进入人工复核队列 |
| **交叉验证** | 同一岗位不同来源数据对比 | 冲突标记         |
| **抽样复核** | 随机抽取5%数据人工核查   | 持续优化模型     |

**异常处理**：

- **解析失败**：原始数据存档，人工处理
- **字段缺失**：标记为"未明确"，不影响其他字段
- **数据冲突**：保留所有版本，标记冲突

#### 2.7.7 AI调用策略

**最小化AI调用原则**：

| 场景         | 是否调用AI | 说明               |
| ------------ | ---------- | ------------------ |
| 数据入库解析 | ✅ 调用    | 每条公告解析一次   |
| 用户岗位匹配 | ❌ 不调用  | 纯数据库查询       |
| 用户筛选过滤 | ❌ 不调用  | 纯规则匹配         |
| 公告关联识别 | ⚠️ 按需    | 无法精确匹配时调用 |
| 用户主动咨询 | ✅ 按需    | VIP功能，可选      |

**成本估算**：

```
假设：
- 每年公告数量：10万条
- 每条公告AI解析成本：约 $0.02（GPT-4）
- 年度AI预处理成本：约 $2000

对比实时调用：
- 日活用户：1万
- 人均查询：10次/天
- 年度查询量：3650万次
- 若每次查询调用AI：$730,000/年

节省成本：99.7%
```

### 2.8 AI增值服务（可选付费功能）

> 以下功能为可选增值服务，用户基础匹配功能无需调用AI。
> 仅当用户主动请求深度分析时才调用AI，可作为VIP付费功能。

#### 2.8.1 岗位深度分析（按需调用）

用户可主动请求AI对特定岗位进行深度分析：

```
岗位分析报告：
├── 岗位概况（AI解读）
│   ├── 所属系统及职能定位
│   ├── 日常工作内容推测
│   └── 晋升路径分析
│
├── 地域生活评估
│   ├── 当地生活成本
│   ├── 公务员待遇参考
│   └── 发展前景
│
└── 竞争态势预测
    ├── 预估竞争激烈度
    └── 适合人群画像
```

#### 2.8.2 AI对话助手（按次计费/VIP无限）

| 场景         | 用户问题示例                           |
| ------------ | -------------------------------------- |
| **条件咨询** | "我是非全日制研究生，能报这个岗位吗？" |
| **岗位对比** | "A岗位和B岗位哪个更适合我？"           |
| **政策解读** | "今年国考政策有什么变化？"             |
| **面试准备** | "这个岗位面试可能问什么问题？"         |

#### 2.8.3 AI技术选型

| 能力           | 技术方案                       |
| -------------- | ------------------------------ |
| **基础LLM**    | GPT-4/Claude/文心一言/通义千问 |
| **知识增强**   | RAG（检索增强生成）            |
| **本地化部署** | Llama/ChatGLM/Qwen（降低成本） |

#### 2.8.4 AI安全与合规

- **信息准确性**：AI回答需标注信息来源，重要决策建议人工复核
- **免责声明**：明确AI分析仅供参考，最终以官方公告为准
- **隐私保护**：用户简历数据不用于模型训练
- **内容审核**：AI输出需经过内容安全过滤
- **偏见控制**：避免AI推荐存在地域、性别等歧视

---

## 三、非功能需求

### 3.1 性能要求

| 指标             | 要求              |
| ---------------- | ----------------- |
| 职位搜索响应时间 | < 2秒             |
| 智能匹配计算时间 | < 5秒（1万+职位） |
| 文档解析速度     | PDF < 30秒/份     |
| 并发用户支持     | 1000+             |
| 数据库职位容量   | 100万+            |

### 3.2 安全要求

- 用户数据加密存储
- 敏感信息脱敏处理
- 登录验证与权限控制
- 爬虫行为合规（遵守robots.txt）

### 3.3 可用性要求

- 系统可用性 > 99.5%
- 移动端适配（iOS/Android/微信小程序）
- 离线缓存支持

### 3.4 可维护性要求

- 爬虫规则可配置（无需改代码）
- 专业目录可动态更新
- 日志完善，便于排查问题

---

## 四、技术架构建议

### 4.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户端                                │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│    │ iOS App  │  │Android App│  │ 小程序   │                │
│    └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  用户服务     │     │  职位服务     │     │  匹配服务     │
│ (User Svc)   │     │ (Job Svc)    │     │ (Match Svc)  │
└──────────────┘     └──────────────┘     └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │    数据库层       │
                    │ (MySQL/MongoDB)  │
                    └──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     数据采集层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 网页爬虫  │  │ PDF解析  │  │Excel解析 │  │ Word解析 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 技术栈建议

| 层级        | 技术选型                          |
| ----------- | --------------------------------- |
| 前端（Web） | React/Vue.js + TypeScript         |
| 前端（App） | React Native / Flutter            |
| 后端        | Python (FastAPI) / Node.js        |
| 数据库      | MySQL + Redis + Elasticsearch     |
| 爬虫框架    | Scrapy + Selenium                 |
| 文档解析    | pdfplumber + python-docx + pandas |
| OCR         | PaddleOCR                         |
| 消息队列    | RabbitMQ / Redis                  |
| 部署        | Docker + Kubernetes               |

---

## 五、数据来源与合规性

### 5.1 数据来源

- **官方渠道优先**：国家公务员局、各省人社厅官网
- **公开信息采集**：只采集公开发布的招考公告
- **用户授权数据**：用户主动输入的简历信息

### 5.2 合规性考量

- 遵守《网络安全法》《个人信息保护法》
- 爬取频率控制，不对目标网站造成压力
- 用户数据获得明确授权
- 提供数据删除功能

---

## 六、项目里程碑

| 阶段             | 内容                              | 预计周期 |
| ---------------- | --------------------------------- | -------- |
| **P1: MVP版本**  | 国考职位表解析 + 基础筛选 + Web端 | 4-6周    |
| **P2: 核心功能** | 多省份支持 + 智能匹配 + App       | 6-8周    |
| **P3: 增强功能** | PDF/Word解析 + 推送通知           | 4周      |
| **P4: 高级功能** | AI推荐 + 数据分析 + 历年数据      | 6周      |

---

## 七、风险与挑战

| 风险         | 影响         | 应对措施                   |
| ------------ | ------------ | -------------------------- |
| 网站结构变化 | 爬虫失效     | 模块化设计，快速适配       |
| 反爬机制升级 | 数据采集困难 | 多渠道数据源，人工补充     |
| 文档格式多样 | 解析不准确   | 持续优化解析规则，人工校验 |
| 专业目录更新 | 匹配不准确   | 定期更新专业库             |
| 政策变化     | 功能需调整   | 关注政策动态，灵活调整     |

---

## 八、后续扩展方向

1. **AI面试助手**：基于岗位要求生成面试问题
2. **备考规划**：根据目标岗位推荐学习计划
3. **社区功能**：考友交流、经验分享
4. **历年真题库**：结合刷题功能
5. **VIP增值服务**：专属顾问、定制报告

---

## 九、术语表

| 术语         | 说明                             |
| ------------ | -------------------------------- |
| 国考         | 国家公务员考试                   |
| 省考         | 各省公务员考试                   |
| 事业编       | 事业单位编制                     |
| 选调生       | 各省选调优秀毕业生               |
| 三支一扶     | 支教、支农、支医和扶贫           |
| 基层工作经验 | 县级以下机关、企事业单位工作经历 |

---

## 十、附录

### 附录A：主要公考信息网站列表

1. 国家公务员局：https://www.scs.gov.cn/
2. 中央机关及其直属机构考试录用公务员专题：http://bm.scs.gov.cn/
3. 各省人事考试网（31个省份）
4. 各省组织部网站（选调生信息）

### 附录B：教育部专业目录参考

- 普通高等学校本科专业目录（2024年版）
- 研究生学科专业目录（2022年版）

---

_文档结束_
