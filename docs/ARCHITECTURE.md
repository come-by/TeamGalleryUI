# 架构设计

> 本文档描述 TeamGallery 前端应用的整体架构设计和技术选型。

| 项目     | 值         |
| -------- | ---------- |
| 适用     | 前端应用   |
| 最后更新 | 2026-06-16 |

## 目录

## 1. 技术栈

## 2. 目录结构

## 3. 架构分层

## 4. 数据流

## 5. 安全设计

## 6. 性能优化

## 相关文档

---

## 1. 技术栈

| 技术         | 版本  | 用途       |
| ------------ | ----- | ---------- |
| Vue 3        | 3.5.x | 前端框架   |
| TypeScript   | 5.x   | 类型系统   |
| Vite         | 6.x   | 构建工具   |
| Vue Router   | 4.x   | 路由管理   |
| Pinia        | 2.x   | 状态管理   |
| Axios        | 1.x   | HTTP 请求  |
| Element Plus | 2.x   | UI 组件库  |
| Vitest       | 3.x   | 单元测试   |
| MSW          | 2.x   | API Mock   |
| ESLint       | 9.x   | 代码检查   |
| Prettier     | 3.x   | 代码格式化 |
| Stylelint    | 16.x  | 样式检查   |

## 2. 目录结构

```
src/
├── api/              # API 请求层
│   ├── request.ts    # Axios 实例、拦截器、重试机制
│   ├── article.ts    # 文章相关 API
│   ├── user.ts       # 用户相关 API
│   ├── comment.ts    # 评论相关 API
│   ├── interaction.ts # 互动相关 API
│   ├── search.ts     # 搜索相关 API
│   ├── upload.ts     # 上传相关 API
│   └── admin.ts      # 管理相关 API
├── assets/           # 静态资源
│   ├── styles/       # 全局样式
│   │   └── variables.css  # CSS 变量定义
│   ├── hero.png
│   ├── vite.svg
│   └── vue.svg
├── components/       # 公共组件
│   ├── comment/
│   │   └── CommentSection.vue # 评论区
│   ├── layout/
│   │   └── AppHeader.vue     # 顶部导航
│   ├── ErrorBoundary.vue # 错误边界
│   └── FileUpload.vue    # 文件上传
├── composables/      # 组合式函数
│   ├── index.ts          # 统一导出
│   ├── useAuth.ts        # 认证逻辑
│   ├── useDebounce.ts    # 防抖
│   ├── useErrorHandler.ts # 错误处理
│   ├── usePagination.ts  # 分页逻辑
│   ├── useSearch.ts      # 搜索逻辑
│   └── useUpload.ts      # 上传逻辑
├── layouts/          # 布局组件
│   ├── DefaultLayout.vue # 默认布局
│   └── AdminLayout.vue   # 管理后台布局
├── mocks/            # Mock 数据（开发环境）
│   ├── handlers/     # MSW 请求处理
│   │   ├── article.ts
│   │   ├── auth.ts
│   │   ├── index.ts
│   │   ├── search.ts
│   │   ├── upload.ts
│   │   └── user.ts
│   ├── browser.ts    # 浏览器 Mock
│   ├── server.ts     # 服务端 Mock
│   └── utils.ts      # Mock 工具
├── router/           # 路由配置
│   └── index.ts      # 路由定义、守卫
├── stores/           # Pinia 状态管理
│   ├── user.ts       # 用户状态
│   └── article.ts    # 文章状态
├── test/             # 测试配置
│   └── setup.ts      # 测试环境初始化
├── types/            # TypeScript 类型定义
│   ├── api.ts        # API 相关类型
│   ├── article.ts    # 文章类型
│   ├── comment.ts    # 评论类型
│   ├── index.ts      # 统一导出
│   ├── interaction.ts # 互动类型
│   └── user.ts       # 用户类型
├── utils/            # 工具函数
│   ├── constants.ts  # 常量定义
│   ├── error.ts      # 错误处理
│   ├── error-report.ts # Sentry 上报
│   ├── format.ts     # 格式化工具
│   ├── index.ts      # 统一导出
│   ├── sanitize.ts   # XSS 防护
│   └── storage.ts    # 本地存储
├── views/            # 页面组件
│   ├── admin/        # 管理页面
│   │   ├── CommentsView.vue
│   │   └── UsersView.vue
│   ├── article/      # 文章页面
│   │   ├── ArticleDetailView.vue
│   │   ├── ArticleListView.vue
│   │   ├── CreateArticleView.vue
│   │   └── EditArticleView.vue
│   ├── auth/         # 认证页面
│   │   ├── LoginView.vue
│   │   └── RegisterView.vue
│   ├── error/        # 错误页面
│   │   └── ErrorView.vue
│   ├── home/         # 首页
│   │   └── HomeView.vue
│   ├── manual/       # 操作手册页面（v1.6.0 新增）
│   │   ├── ManualListView.vue
│   │   └── ManualDetailView.vue
│   ├── notification/ # 通知页面（v1.6.0 新增）
│   │   ├── NotificationListView.vue
│   │   └── NotificationDetailView.vue
│   ├── search/       # 搜索页面
│   │   └── SearchView.vue
│   └── user/         # 用户页面
│       ├── FavoritesView.vue
│       ├── LikesView.vue
│       └── ProfileView.vue
├── App.vue           # 根组件
├── main.ts           # 应用入口
└── style.css         # 全局样式
```

## 3. 架构分层

```
┌─────────────────────────────────────────────────┐
│                   Views (页面层)                  │
│  负责页面布局、用户交互、组合组件和 composables     │
├─────────────────────────────────────────────────┤
│               Components (组件层)                 │
│  可复用的 UI 组件，接收 props，触发 events         │
├─────────────────────────────────────────────────┤
│             Composables (逻辑层)                  │
│  业务逻辑封装，状态管理，副作用处理                │
├─────────────────────────────────────────────────┤
│                  API (数据层)                     │
│  HTTP 请求封装，数据转换，错误处理                 │
├─────────────────────────────────────────────────┤
│                 Utils (工具层)                    │
│  通用工具函数，格式化，存储，安全处理              │
└─────────────────────────────────────────────────┘
```

## 4. 数据流

```
用户操作 → View 组件 → Composable → API 请求 → 后端
                                      ↓
用户界面 ← View 更新 ← Composable 状态 ← API 响应
```

### 4.1 请求流程

1. 用户触发操作
2. View 调用 Composable 方法
3. Composable 调用 API 层
4. API 层通过 Axios 发送请求
5. 请求拦截器添加 Token
6. 后端处理请求
7. 响应拦截器处理错误
8. 返回数据到 Composable
9. 更新响应式状态
10. View 自动更新

### 4.2 状态管理

| 状态类型 | 存储位置           | 说明           |
| -------- | ------------------ | -------------- |
| 用户信息 | Pinia `user` store | 登录后持久化   |
| 文章列表 | 组件本地状态       | 分页加载       |
| 表单数据 | 组件本地状态       | 表单提交       |
| UI 状态  | 组件本地状态       | 加载、错误状态 |

## 5. 安全设计

### 5.1 认证流程

```
登录 → 获取 Token → 存储到 sessionStorage → 请求头添加 Authorization
                                              ↓
                                      后端验证 Token
                                              ↓
                                      401 → 清除 Token → 跳转登录
```

### 5.2 XSS 防护

- 用户输入通过 `DOMPurify` 过滤
- `v-html` 必须使用 `sanitize()` 函数
- URL 参数验证和转义

### 5.3 CSRF 防护

- 使用 SameSite Cookie
- 关键操作需要二次确认

## 6. 性能优化

### 6.1 构建优化

| 优化项     | 配置                   | 说明             |
| ---------- | ---------------------- | ---------------- |
| 代码分割   | `vite.config.ts`       | 按路由分割 chunk |
| 依赖预构建 | Vite 默认              | 加速开发启动     |
| 图片压缩   | `vite-plugin-imagemin` | 减少资源体积     |
| Gzip 压缩  | Nginx 配置             | 减少传输大小     |

### 6.2 运行时优化

| 优化项     | 实现            | 说明         |
| ---------- | --------------- | ------------ |
| 虚拟滚动   | `usePagination` | 列表性能     |
| 懒加载     | 动态导入        | 按需加载组件 |
| Keep-Alive | 路由配置        | 缓存页面状态 |
| 防抖/节流  | `useDebounce`   | 减少请求频率 |

## 相关文档

- [API 接口](./API.md)
- [开发指南](./DEVELOPMENT.md)
- [安全策略](./SECURITY.md)
- [代码规范](./CODING_STANDARDS.md)
