# TeamGallery UI

[![CI](https://github.com/come-by/TeamGalleryUI/actions/workflows/ci.yml/badge.svg)](https://github.com/come-by/TeamGalleryUI/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

团队协作平台前端项目，基于 **Vue 3 + TypeScript + Vite** 构建，提供项目管理、文章浏览、团队协作、聊天消息、通知推送、用户管理等功能。

## 功能特性

- ✅ 用户系统 — 注册、登录、Token 自动刷新、会话监控
- ✅ 文章浏览 — 列表分页、详情渲染、Markdown 展示、创建/编辑/删除
- ✅ 操作手册 — 管理员发布手册，列表浏览与详情查看
- ✅ 评论互动 — 嵌套回复、点赞举报、评论统计
- ✅ 文章互动 — 点赞收藏、状态同步
- ✅ 全文搜索 — 关键词搜索、搜索建议、高亮展示
- ✅ 文件上传 — 图片上传、进度显示
- ✅ 项目管理 — 列表、详情、创建/编辑/删除、成员管理、里程碑
- ✅ 项目评论 — 项目评论、点赞收藏
- ✅ 团队管理 — 团队列表、成员管理、邀请流程
- ✅ 聊天消息 — 群聊消息发送、历史消息拉取、轮询更新
- ✅ 通知系统 — 通知列表、未读红点、已读标记
- ✅ 管理后台 — 用户管理、评论审核
- ✅ 安全防护 — XSS 清洗（DOMPurify）、Token 安全、错误上报（Sentry）

## 技术栈

| 组件     | 技术                                      |
| -------- | ----------------------------------------- |
| 框架     | [Vue 3](https://vuejs.org/) + TypeScript  |
| 构建     | [Vite](https://vitejs.dev/)               |
| 状态管理 | [Pinia](https://pinia.vuejs.org/)         |
| 路由     | [Vue Router](https://router.vuejs.org/)   |
| UI 组件  | [Element Plus](https://element-plus.org/) |
| HTTP     | [Axios](https://axios-http.com/)          |
| 测试     | [Vitest](https://vitest.dev/)             |
| 错误监控 | [Sentry](https://sentry.io/)              |

## 快速开始

### 环境要求

| 工具    | 版本  | 说明                                      |
| ------- | ----- | ----------------------------------------- |
| Node.js | >= 20 | 从 [nodejs.org](https://nodejs.org/) 安装 |
| npm     | >= 9  | 随 Node.js 一起安装                       |

### 安装与运行

```bash
# 1. 克隆仓库
git clone <repo-url>
cd TeamGalleryUI

# 2. 安装依赖
npm install

# 3. 复制环境变量
cp .env.example .env.development

# 4. 启动开发服务器
npm run dev
```

访问 `http://localhost:5173`

## 文档索引

| 文档                                 | 说明                                           |
| ------------------------------------ | ---------------------------------------------- |
| [架构设计](docs/ARCHITECTURE.md)     | 技术栈、目录结构、架构分层、数据流             |
| [API 参考](docs/API.md)              | API 接口定义、数据模型、前后端对齐             |
| [开发指南](docs/DEVELOPMENT.md)      | 环境搭建、启动调试、新增功能流程               |
| [代码规范](docs/CODING_STANDARDS.md) | 工具链配置、代码风格、提交规范                 |
| [测试指南](docs/TESTING.md)          | 测试框架、Mock 策略、覆盖率                    |
| [安全策略](docs/SECURITY.md)         | XSS 防护、Token 安全、依赖安全                 |
| [部署运维](docs/DEPLOYMENT.md)       | 构建配置、Nginx、Docker、CI/CD、前后端联合部署 |
| [错误码字典](docs/ERROR_CODES.md)    | 后端错误码、前端处理建议                       |
| [常见问题](docs/TROUBLESHOOTING.md)  | 环境/构建/运行时问题排查                       |
| [更新日志](docs/CHANGELOG.md)        | 版本变更记录                                   |
| [开发路线图](docs/ROADMAP.md)        | 任务规划、优先级                               |

## 项目结构

```
src/
├── api/              # API 请求层（Axios 封装）
├── assets/           # 静态资源（样式、图片）
├── components/       # 公共组件
├── composables/      # 组合式函数（业务逻辑）
├── layouts/          # 布局组件
├── mocks/            # Mock 数据（MSW）
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── views/            # 页面组件
```

详见 [架构设计](docs/ARCHITECTURE.md)

## 配置

环境变量文件 `.env.development`：

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=TeamGallery
VITE_SENTRY_DSN=
```

| 变量                | 说明                | 默认值                      |
| ------------------- | ------------------- | --------------------------- |
| `VITE_API_BASE_URL` | 后端 API 地址       | `http://localhost:8080/api` |
| `VITE_APP_TITLE`    | 应用标题            | `TeamGallery`               |
| `VITE_SENTRY_DSN`   | Sentry 错误监控 DSN | 空（不启用）                |

## CI/CD

项目通过 GitHub Actions 自动进行代码检查和部署：

```bash
# 本地运行 CI 检查
npm run lint:check       # ESLint 代码规范
npm run format:check     # Prettier 格式检查
npx vue-tsc --noEmit     # TypeScript 类型检查
npm run test:run         # 单元测试
npm run build            # 构建验证
```

详见 [.github/workflows/ci.yml](.github/workflows/ci.yml)

## 相关项目

- [TeamGalleryGo](https://github.com/come-by/TeamGalleryGo) — 后端项目（Go + Hertz）

## License

MIT
