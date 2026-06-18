# 部署指南

> 本文档描述 TeamGallery 前端应用的部署流程和配置。

| 项目     | 值         |
| -------- | ---------- |
| 适用     | 前端应用   |
| 最后更新 | 2026-06-19 |

## 目录

## 1. 环境变量

## 2. 构建

## 3. Nginx 部署

## 4. Docker 部署

## 5. CI/CD

## 6. 前后端联合部署

## 7. 监控

## 8. 回滚策略

## 相关文档

---

## 1. 环境变量

### 1.1 环境变量文件

| 文件               | 环境   | 说明         |
| ------------------ | ------ | ------------ |
| `.env.development` | 开发   | 本地开发环境 |
| `.env.staging`     | 预发布 | 测试环境     |
| `.env.production`  | 生产   | 生产环境     |

### 1.2 环境变量列表

| 变量                | 说明                   | 示例                        |
| ------------------- | ---------------------- | --------------------------- |
| `VITE_API_BASE_URL` | 后端 API 地址          | `https://api.example.com`   |
| `VITE_SENTRY_DSN`   | Sentry DSN（错误监控） | `https://xxx@sentry.io/xxx` |
| `VITE_APP_TITLE`    | 应用标题               | `TeamGallery`               |

## 2. 构建

### 2.1 本地构建

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 2.2 构建输出

- 输出目录：`dist/`
- 包含文件：HTML、CSS、JS、静态资源
- 支持 SPA 路由：需要服务器配置 fallback

## 3. Nginx 部署

### 3.1 基础配置

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/teamgallery/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # SPA 路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（开发环境）
    location /v1/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3.2 HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 其他配置同上
}
```

## 4. Docker 部署

### 4.1 Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4.2 docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - '80:80'
    restart: always
    environment:
      - VITE_API_BASE_URL=https://api.example.com

  backend:
    image: teamgallery-backend:latest
    ports:
      - '8080:8080'
    restart: always
    environment:
      - DATABASE_URL=mysql://user:pass@db:3306/teamgallery
    depends_on:
      - db

  db:
    image: mysql:8
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=teamgallery
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 5. CI/CD

### 5.1 GitHub Actions CI 检查

**CI 工作流**（`.github/workflows/ci.yml`）：

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint:check # ESLint 代码规范检查
      - run: npm run format:check # Prettier 格式检查
      - run: npx vue-tsc --noEmit # TypeScript 类型检查
      - run: npm run test:run # 单元测试
      - run: npm run build # 构建验证

  deploy:
    needs: check
    if: github.ref == 'refs/heads/master' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

### 5.2 前后端联合部署

```yaml
# docker-compose.yml（前后端联合部署）
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - '80:80'
    restart: always
    environment:
      - VITE_API_BASE_URL=https://api.example.com
    depends_on:
      - backend

  backend:
    image: teamgallery-backend:latest
    ports:
      - '8080:8080'
    restart: always
    environment:
      - APP_ENV=production
      - DATABASE_URL=mysql://user:pass@db:3306/teamgallery
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db

  db:
    image: mysql:8
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=teamgallery
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### 5.3 GitHub Pages 部署

```bash
# 安装部署插件
npm install -D gh-pages

# package.json 添加脚本
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

**环境要求：**

- GitHub Pages 需要启用 `Settings > Pages > Source: GitHub Actions`
- 构建产物 `dist/` 通过 `actions/upload-pages-artifact` 上传
- 通过 `actions/deploy-pages` 部署到 GitHub Pages

## 6. 前后端联合部署

### 6.1 部署架构

```
┌─────────────────────────────────────┐
│           Nginx (80/443)            │
│  ┌──────────┐    ┌───────────────┐  │
│  │ 前端 SPA  │    │ /api → 后端   │  │
│  │ (静态文件) │    │ (反向代理)    │  │
│  └──────────┘    └───────────────┘  │
└─────────────────────────────────────┘
         │                  │
         ▼                  ▼
   dist/ 静态资源    Go 后端 :8080
                           │
                           ▼
                      MySQL :3306
```

### 6.2 Nginx 配置（前后端同域）

```nginx
server {
    listen 80;
    server_name example.com;

    # 前端静态文件
    location / {
        root /var/www/teamgallery/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 环境变量

| 变量                | 说明         | 前端 | 后端 |
| ------------------- | ------------ | ---- | ---- |
| `VITE_API_BASE_URL` | API 地址     | ✅   | -    |
| `VITE_SENTRY_DSN`   | Sentry DSN   | ✅   | -    |
| `APP_ENV`           | 运行环境     | -    | ✅   |
| `DATABASE_URL`      | 数据库连接   | -    | ✅   |
| `JWT_SECRET`        | JWT 签名密钥 | -    | ✅   |

## 7. 监控

### 7.1 错误监控

- 集成 Sentry 错误上报
- 配置 Source Map 上传
- 设置错误告警规则

### 7.2 性能监控

- 使用 Web Vitals 监控核心指标
- 配置 Lighthouse CI 自动化检查
- 监控 API 响应时间

### 7.3 日志收集

- Nginx 访问日志
- 应用错误日志
- 用户行为日志（可选）

## 8. 回滚策略

### 8.1 快速回滚

```bash
# Docker 回滚
docker-compose down
docker-compose up -d teamgallery-backend:previous

# Nginx 回滚
ln -sfn /var/www/teamgallery/dist-previous /var/www/current
nginx -s reload
```

### 8.2 数据库回滚

- 使用迁移工具管理数据库版本
- 每次部署前备份数据库
- 回滚时执行反向迁移

## 相关文档

- [架构设计](./ARCHITECTURE.md)
- [安全策略](./SECURITY.md)
- [常见问题](./TROUBLESHOOTING.md)
