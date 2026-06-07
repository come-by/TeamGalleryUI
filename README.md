# TeamGallery UI

[![CI](https://github.com/come-by/TeamGalleryUI/actions/workflows/ci.yml/badge.svg)](https://github.com/come-by/TeamGalleryUI/actions/workflows/ci.yml)

团队协作平台前端项目，基于 Vue 3 + TypeScript + Vite 构建。

## 快速开始

### 环境要求

- Node.js >= 20
- npm >= 9

### 安装与启动

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env.development

# 启动开发服务器
npm run dev
```

访问 `http://localhost:5173`

## 项目文档

| 文档 | 说明 |
|------|------|
| [代码规范](./docs/CODING_STANDARDS.md) | 开发规范、工具配置、最佳实践 |
| [架构文档](./docs/ARCHITECTURE.md) | 技术栈、目录结构、架构设计 |
| [接口文档](./docs/API_DOCUMENTATION.md) | API 接口定义、数据模型 |
| [部署文档](./docs/DEPLOYMENT.md) | 构建配置、部署方式、监控 |
| [测试指南](./docs/TESTING.md) | 测试编写规范、示例 |
| [安全策略](./docs/SECURITY.md) | 安全措施、最佳实践 |
| [常见问题](./docs/TROUBLESHOOTING.md) | 问题排查、解决方案 |
| [开发路线图](./docs/ROADMAP.md) | 任务规划、优先级 |

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| UI 组件 | Element Plus |
| HTTP | Axios |
| 测试 | Vitest |
| 错误监控 | Sentry |

## 项目结构

```
src/
├── api/              # API 请求层
├── assets/           # 静态资源
├── components/       # 公共组件
├── composables/      # 组合式函数
├── layouts/          # 布局组件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── views/            # 页面组件
```

详见 [架构文档](./docs/ARCHITECTURE.md)

## 开发指南

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | ESLint 检查并修复 |
| `npm run lint:check` | ESLint 仅检查 |
| `npm run lint:style` | Stylelint 检查并修复 |
| `npm run format` | Prettier 格式化 |
| `npm run test` | 运行测试（监听模式） |
| `npm run test:run` | 运行测试（一次） |
| `npm run test:coverage` | 生成覆盖率报告 |
| `npm run changelog` | 生成 CHANGELOG |

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>: <subject>
```

| type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档变更 |
| `style` | 代码格式 |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试 |
| `chore` | 其他修改 |

### 代码检查

提交前自动检查（lint-staged），推送前运行 pre-push hook。

### CI/CD 流程

代码推送到 `main`/`master` 分支后触发 GitHub Actions 自动执行：

| 步骤 | 说明 | 触发条件 |
|------|------|---------|
| Type check | TypeScript 类型检查 | 所有推送到 main/master |
| Style lint | Stylelint 样式检查 | 所有推送到 main/master |
| CI check | ESLint + Prettier + 测试 + 覆盖率 + 构建 | 所有推送到 main/master |
| Deploy | 自动部署到 GitHub Pages | 仅 master 分支推送后 |

> **注意**：需在 GitHub 仓库 Settings → Pages 中配置 Source 为 **GitHub Actions**（而非 gh-pages 分支），部署由 `actions/deploy-pages@v4` 自动完成。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:8080/api` |
| `VITE_APP_TITLE` | 应用标题 | `TeamGallery` |

## 部署

详见 [部署文档](./docs/DEPLOYMENT.md)

### 快速部署

```bash
# 构建
npm run build

# 部署 dist/ 目录到服务器
```

支持 Nginx、Docker、Vercel、Netlify 等部署方式。

## 安全说明

- 所有 `v-html` 内容已使用 `DOMPurify` 清洗，防止 XSS
- Token 存储使用 `sessionStorage`（页面关闭后自动清除安全性更高）
- 后续可升级为 httpOnly Cookie（需后端配合，详见代码规范）

## License

MIT
