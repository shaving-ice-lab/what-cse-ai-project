# 公考内容制作任务清单 - 索引

> 更新时间：2026-01-29
> 版本：v3.0
> 
> ⚠️ 本文档已拆分为独立的科目文件，便于分别管理和生成。

---

## 文件目录结构

```
docs/
├── content-creation-todolist.md   # 本索引文件
├── courses/                        # 课程内容
│   ├── course-xingce-todolist.md   # 行测课程（约280课时）
│   ├── course-shenlun-todolist.md  # 申论课程（约120课时）
│   ├── course-mianshi-todolist.md  # 面试课程（约100课时）
│   └── course-gongji-todolist.md   # 公基课程（约80课时）
└── questions/                      # 题库内容
    ├── questions-xingce-todolist.md   # 行测题库（约15000题）
    ├── questions-shenlun-todolist.md  # 申论题库（约500题）
    ├── questions-mianshi-todolist.md  # 面试题库（约1500题）
    ├── questions-gongji-todolist.md   # 公基题库（约6000题）
    └── questions-exams-todolist.md    # 试卷内容（约230套）
```

---

## 课程内容文件

### 1. 行测课程 - [course-xingce-todolist.md](./courses/course-xingce-todolist.md)

- **总课时**：约280课时
- **涵盖模块**：言语理解、数量关系、判断推理、资料分析、常识判断
- **教学形式**：视频精讲 + 图文教材 + 配套练习 + 技巧总结

### 2. 申论课程 - [course-shenlun-todolist.md](./courses/course-shenlun-todolist.md)

- **总课时**：约120课时
- **涵盖题型**：归纳概括、提出对策、综合分析、贯彻执行、文章写作
- **教学形式**：方法精讲 + 真题演练 + 范文赏析 + 批改点评

### 3. 面试课程 - [course-mianshi-todolist.md](./courses/course-mianshi-todolist.md)

- **总课时**：约100课时
- **涵盖内容**：结构化面试、无领导小组讨论、面试礼仪
- **教学形式**：理论精讲 + 真题演练 + 模拟实战 + 点评指导

### 4. 公基课程 - [course-gongji-todolist.md](./courses/course-gongji-todolist.md)

- **总课时**：约80课时
- **涵盖内容**：政治理论、法律知识、公文写作、经济管理、人文科技
- **适用考试**：事业单位、三支一扶等

---

## 题库内容文件

### 1. 行测题库 - [questions-xingce-todolist.md](./questions/questions-xingce-todolist.md)

- **预计总量**：约15000题
- **标签体系**：模块 > 题型 > 知识点 > 难度 > 来源年份

### 2. 申论题库 - [questions-shenlun-todolist.md](./questions/questions-shenlun-todolist.md)

- **预计总量**：约500题（含完整材料）
- **标签体系**：题型 > 考试类型 > 年份 > 难度 > 热点领域

### 3. 面试题库 - [questions-mianshi-todolist.md](./questions/questions-mianshi-todolist.md)

- **预计总量**：约1500题
- **标签体系**：面试形式 > 题型 > 难度 > 岗位类型 > 热点领域

### 4. 公基题库 - [questions-gongji-todolist.md](./questions/questions-gongji-todolist.md)

- **预计总量**：约6000题
- **适用考试**：事业单位、三支一扶、社区工作者等

### 5. 试卷内容 - [questions-exams-todolist.md](./questions/questions-exams-todolist.md)

- **真题试卷**：约150套
- **模拟试卷**：约80套

---

## 内容生成器使用说明

### 切换任务文件

```bash
# 生成行测课程
公考:切换文件 docs/courses/course-xingce-todolist.md

# 生成申论课程
公考:切换文件 docs/courses/course-shenlun-todolist.md

# 生成面试课程
公考:切换文件 docs/courses/course-mianshi-todolist.md

# 生成公基课程
公考:切换文件 docs/courses/course-gongji-todolist.md

# 生成题库内容
公考:切换文件 docs/questions/questions-xingce-todolist.md
公考:切换文件 docs/questions/questions-shenlun-todolist.md
公考:切换文件 docs/questions/questions-mianshi-todolist.md
公考:切换文件 docs/questions/questions-gongji-todolist.md
```

### 常用命令

| 命令 | 说明 |
|-----|------|
| `公考:开始生成` | 开启持续模式，自动连续生成 |
| `公考:继续` | 继续生成下一个任务 |
| `公考:停止` | 停止持续生成 |
| `公考:查看进度` | 显示当前文件的完成进度 |
| `公考:列出任务` | 列出待完成任务 |
| `公考:查看配置` | 显示当前配置 |

---

## 质量标准

### 课程内容质量要求

| 内容类型 | 最低字数 | 必须包含 |
|----|----|-----|
| 课程内容 | 15000字 | 13个模块、8道例题、12道练习题 |

### 题目内容质量要求

| 内容类型 | 最低字数 | 必须包含 |
|----|----|-----|
| 单道题目 | 700字 | 题干120字+、解析500字+ |

### 素材内容质量要求

| 内容类型 | 最低字数 | 必须包含 |
|----|----|-----|
| 单条素材 | 1000字 | 金句+背景解读+使用场景+范文片段 |

---

## 总体进度统计

| 科目 | 课程内容 | 题库内容 |
|-----|---------|---------|
| 行测 | 约280课时 | 约15000题 |
| 申论 | 约120课时 | 约500题 |
| 面试 | 约100课时 | 约1500题 |
| 公基 | 约80课时 | 约6000题 |
| 试卷 | - | 约230套 |
| **总计** | **约580课时** | **约23000题 + 230套试卷** |

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-01-28 | v1.0 | 创建初始文档 |
| 2026-01-28 | v2.0 | 全面丰富内容制作任务清单 |
| 2026-01-29 | v3.0 | 拆分为独立科目文件，本文件改为索引 |
