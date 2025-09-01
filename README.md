# education-manner
 学习进度管理系统
# 学习进度管理系统

一个面向家长、老师与学生的轻量级学习进度管理系统。用“像玩游戏一样”的方式管理学习：学生→科目→章节→任务→步骤，全流程可视、可配置、可追踪。前端纯静态页面，后端提供 REST API 存储与读取数据。

> 特点：多学生、多科目、任务步骤化、依赖关系、可视化进度、管理面板、响应式 UI。

---

## 目录

- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [前端说明](#前端说明)
- [后端 API 约定](#后端-api-约定)
- [数据结构](#数据结构)
- [使用指南](#使用指南)
- [常见问题](#常见问题)
- [开发与构建](#开发与构建)
- [Roadmap](#roadmap)
- [许可证](#许可证)

---

## 功能特性

- **学生管理**
  - 添加、编辑、删除学生
  - 配置学生参与的科目
  - 查看学生总体进度与最近学习活动

- **科目与章节**
  - 添加、编辑、删除科目
  - 章节分级：支持“年级/Level → 章节 → 任务”的层级结构
  - 章节增删改与跨级移动

- **任务系统**
  - 任务包含：名称、类型、难度、预计用时、步骤、前置任务
  - 支持添加、编辑、删除、复制任务
  - 步骤完全自定义（已取消默认“符号灌输/现实意义/题目训练/测试”的固定四步）
  - 可标记步骤完成/跳过/取消完成，自动汇总任务完成状态

- **进度可视化**
  - 学生总体进度条
  - 科目进度（完成任务数/总任务数、进度条）
  - 章节进度
  - 最近学习活动摘要

- **管理面板**
  - 总体统计（学生数、科目数、任务数、平均进度）
  - 学生管理、科目管理
  - 科目任务管理（章节/任务增改删）

- **UX/UI**
  - 响应式布局
  - 清晰的返回按钮与 CTA
  - 模态表单、消息提示、加载与错误覆盖层

---

## 项目结构

```text
project/
├─ app.py                      # Flask 后端入口（示例）
├─ models.py                   # 数据读写与业务方法（示例）
├─ templates/
│  └─ index.html               # 主页面
├─ static/
│  ├─ css/
│  │  └─ style.css             # 样式表（含返回按钮修复）
│  └─ js/
│     └─ app.js                # 前端逻辑（完整增强版）
├─ data/
│  ├─ students.json            # 学生数据（示例/运行时生成）
│  ├─ subjects.json            # 科目数据（示例/运行时生成）
│  └─ progress/                # 学生进度数据（按学生ID分文件）
└─ README.md
```

> 注意：后端实现可按需调整。本文档默认使用 Flask + JSON 文件存储的简单实现。

---

## 快速开始

### 环境要求

- Python 3.9+
- Flask（或你自选的 Web 框架）
- 浏览器（现代版 Chrome/Edge/Safari/Firefox）

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://your.repo.url.git
cd project

# 2. 安装依赖
pip install -r requirements.txt
# 若无requirements.txt，请至少安装 Flask
pip install flask

# 3. 启动后端
python app.py

# 4. 打开浏览器访问
http://127.0.0.1:5000
```

---

## 前端说明

- 入口：`templates/index.html`
- 样式：`static/css/style.css`
  - 已修复返回按钮样式（`back-btn`），确保在深色背景上可见
- 脚本：`static/js/app.js`
  - 包含：状态管理、API 封装、页面导航、渲染、模态、管理面板、任务/章节增改删、进度保存等
  - 步骤显示为“第 N 步”，已移除固定四步模式

---

## 后端 API 约定

前端依赖以下 REST API（路径可在后端自由实现，只需保持约定的响应结构）：

- 学生
  - `GET /api/students` → 学生数组
  - `GET /api/students/{id}` → 学生详情
  - `POST /api/students` → 新增学生
  - `PUT /api/students/{id}` → 更新学生
  - `DELETE /api/students/{id}` → 删除学生
  - `GET /api/students/{id}/progress` → 学生进度对象
  - `POST /api/students/{id}/progress` → 保存学生进度对象

- 科目
  - `GET /api/subjects` → 科目数组
  - `GET /api/subjects/{id}` → 科目详情
  - `POST /api/subjects` → 新增科目
  - `PUT /api/subjects/{id}` → 更新科目（含 levels/chapters/tasks）
  - `DELETE /api/subjects/{id}` → 删除科目

- 统计
  - `GET /api/stats/overall` → 总览统计信息

> 返回内容需为 `application/json`。错误应返回 `{ "error": "message" }` 且状态码为 4xx/5xx。

---

## 数据结构

### 学生 Student

```json
{
  "id": "student_1719999999999",
  "name": "张小明",
  "avatar": "👦",
  "grade": "一年级",
  "notes": "专注度好",
  "subjects": ["math", "chinese"],
  "createdAt": "2025-09-01T10:00:00Z",
  "overallProgress": 42
}
```

### 科目 Subject

```json
{
  "id": "math",
  "name": "数学",
  "icon": "🧮",
  "color": "#667eea",
  "description": "数学基础与拓展",
  "levels": [
    {
      "id": "grade_1",
      "name": "一年级",
      "chapters": [
        {
          "id": "chapter_001",
          "name": "基础入门",
          "description": "基础学习内容",
          "tasks": [
            {
              "id": "task_demo_001",
              "name": "示例任务",
              "type": "concept",
              "difficulty": 1,
              "estimatedTime": 20,
              "steps": [
                "了解基本概念和定义",
                "观看相关教学材料",
                "完成基础练习",
                "自我检测理解程度"
              ],
              "prerequisites": []
            }
          ]
        }
      ]
    }
  ]
}
```

### 学生进度 StudentProgress

```json
{
  "studentId": "student_1719999999999",
  "subjects": {
    "math": {
      "currentLevel": "grade_1",
      "totalProgress": 30,
      "tasks": {
        "task_demo_001": {
          "status": "in_progress",
          "startedAt": "2025-09-01T10:20:00Z",
          "completedAt": null,
          "currentStep": 2,
          "stepProgress": [
            { "completed": true, "completedAt": "..." },
            { "completed": true, "completedAt": "..." },
            { "completed": false },
            { "completed": false }
          ]
        }
      }
    }
  }
}
```

- `status` ∈ { `pending`, `in_progress`, `completed` }
- 章节进度与科目进度由任务完成度实时计算。

---

## 使用指南

### 1. 学生主页

- 首页展示所有学生卡片，点击某位学生进入“学生仪表盘”
- 仪表盘包含：
  - 基本信息（头像、姓名）
  - 总体进度条
  - 该学生拥有的科目卡片（点击进入科目任务）
  - 最近活动列表

### 2. 科目任务页

- 科目头部显示图标与名称
- 下方为按“章节”分组的任务列表：
  - 任务条目展示状态图标（⏳/🔄/✅）、难度、预计用时、步骤进度
  - 前置任务未完成时，任务显示“🔒 需要完成前置任务”

### 3. 任务详情页

- 展示任务进度条、预计用时、难度
- 步骤列表（第 N 步）：
  - 支持“✅ 标记完成 / ⏭️ 跳过 / ↩️ 取消完成”
- 底部操作：保存进度、重置任务、返回

> 步骤内容完全由你在任务中配置的文本决定，不再默认四步模板。

### 4. 管理面板

- 总览统计
- 学生管理
  - 添加、编辑、删除，配置科目
- 科目管理
  - 添加、删除
  - 管理任务：新增章节、编辑章节（含跨级移动）、删除章节
  - 在章节内新增/编辑/复制/删除任务

---

## 常见问题

- **Q: 返回按钮不明显？**
  - 已修复。`style.css` 中的 `.back-btn` 使用浅色背景与阴影，深色Header上对比明显。

- **Q: 添加/编辑/删除无反应？**
  - 请确认后端 API 正常返回 2xx
  - 前端控制台（F12）查看网络请求与错误信息
  - `models.py` 中删除科目应使用 `self.get_all_subjects()`，避免 `'function' object has no attribute 'findAllBest'` 的拼写错误

- **Q: 四步学习模式如何取消？**
  - 已默认取消。`app.js` 中 `getStepTypeText` 仅返回“步骤 N”，步骤内容由你自定义。

- **Q: 数据存在哪里？**
  - 示例后端为 JSON 文件（`data/`），可替换为数据库。

---

## 开发与构建

### 前端开发

- 修改 `static/js/app.js`、`static/css/style.css`、`templates/index.html`
- 推荐在浏览器开启设备模式测试移动端效果

### 后端开发

- Flask 参考（示意）：
  - 路由返回 JSON
  - CORS 视情况开启
  - 读写 `data/students.json`、`data/subjects.json`，进度按学生分文件存储
- 异常处理统一返回 `{ "error": "..." }`

### 代码规范

- 前端：模块化函数 + 语义化命名
- 后端：分层（路由/服务/存储）与单元测试

---

## Roadmap

- [ ] 拖拽排序章节与任务
- [ ] 批量为学生分配科目
- [ ] 导入/导出（CSV/JSON）
- [ ] 多用户/权限（教师/家长/学生）
- [ ] 富文本与附件支持（步骤/任务说明）
- [ ] 国际化 i18n
- [ ] 渲染性能优化（虚拟列表）

---

## 许可证

MIT License

你可以自由使用、修改与分发本项目。若在教学或家庭场景落地，欢迎反馈实践经验与改进建议！🎓