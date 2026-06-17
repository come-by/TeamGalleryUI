# 安全策略

> 本文档描述 TeamGallery 前端应用的安全策略和最佳实践。

| 项目     | 值         |
| -------- | ---------- |
| 适用     | 前端应用   |
| 最后更新 | 2026-06-08 |

## 目录

## 1. 安全漏洞报告

## 2. 前端安全

## 3. 依赖安全

## 4. 代码安全

## 5. 网络安全

## 6. 安全测试

## 7. 应急响应

## 相关文档

---

## 1. 安全漏洞报告

### 1.1 报告方式

发现安全漏洞请通过以下方式报告：

- 提交 Issue 到项目仓库（非敏感问题）
- 发送邮件至项目维护者（敏感问题）

### 1.2 响应流程

1. 收到报告后 24 小时内确认
2. 48 小时内评估风险
3. 7 天内修复并验证
4. 发布安全更新

## 2. 前端安全

### 2.1 XSS 防护

| 措施        | 实现                    | 说明                     |
| ----------- | ----------------------- | ------------------------ |
| 输入过滤    | `src/utils/sanitize.ts` | 使用 DOMPurify 过滤 HTML |
| 输出转义    | Vue 自动转义            | `{{ }}` 自动转义         |
| v-html 限制 | 必须使用 `sanitize()`   | 禁止直接使用 v-html      |

```typescript
// 正确用法
<div v-html="sanitize(userInput)" />

// 错误用法（禁止）
<div v-html="userInput" />
```

### 2.2 CSRF 防护

| 措施            | 说明                               |
| --------------- | ---------------------------------- |
| SameSite Cookie | Refresh Token 使用 SameSite=Strict |
| Token 验证      | 关键操作需要 CSRF Token            |
| 二次确认        | 删除等敏感操作需要确认             |

### 2.3 Token 安全

**存储策略：**

| 存储方式       | 项目          | 用途                | 安全性                                          |
| -------------- | ------------- | ------------------- | ----------------------------------------------- |
| `localStorage` | Access Token  | API 鉴权            | 中（XSS 可读取，但配合 CSP + XSS 防护降低风险） |
| `localStorage` | Refresh Token | 换发新 Access Token | 中（同上）                                      |

**生命周期管理：**

| 阶段         | 说明                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 签发         | 登录成功后由 `/api/login` 返回双 Token                               |
| 使用         | Access Token 通过 `Authorization: Bearer` 头传递，请求拦截器自动注入 |
| 自动续期     | Access Token 即将过期时，静默调用 `/api/auth/refresh` 换新           |
| 主动过期检测 | 路由守卫解码 JWT `exp` 字段，过期则尝试刷新或跳登录                  |
| 闲置超时     | 30 分钟无操作 → 1 分钟倒计时警告 → 自动登出                          |
| 可见性校验   | 标签页切回前台时重新校验 token 有效性                                |
| 定时校验     | 每 60 秒调用 `/api/auth/session` 服务端权威校验                      |
| 登出撤销     | 调 `/api/auth/logout` 将 Refresh Token 加入黑名单                    |
| 强制失效     | 修改密码时递增 `token_version`，所有旧 token 立即失效                |
| 泄漏防护     | 刷新 Token 时旧 Refresh Token 自动撤销（rotation）                   |

### 2.4 输入验证

- 所有用户输入必须验证
- 使用 TypeScript 类型约束
- 表单使用验证规则
- URL 参数验证和转义

## 3. 依赖安全

### 3.1 依赖扫描

| 工具                     | 用途         |
| ------------------------ | ------------ |
| `npm audit`              | 检查已知漏洞 |
| `eslint-plugin-security` | 代码安全扫描 |
| Snyk / Dependabot        | 自动漏洞检测 |

### 3.2 依赖更新

- 定期运行 `npm audit`
- 及时更新有漏洞的依赖
- 使用 `npm audit fix` 自动修复
- CI 流程包含安全检查

## 4. 代码安全

### 4.1 ESLint 安全规则

```javascript
// eslint.config.js
{
  rules: {
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-require': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'warn'
  }
}
```

### 4.2 安全编码规范

| 规则                 | 说明                     |
| -------------------- | ------------------------ |
| 禁止 `eval()`        | 使用 `JSON.parse()` 代替 |
| 禁止动态 `require()` | 使用静态导入             |
| 禁止对象注入         | 验证对象键名             |
| 禁止敏感信息硬编码   | 使用环境变量             |

## 5. 网络安全

### 5.1 HTTPS

- 生产环境必须使用 HTTPS
- 配置 HSTS 头
- 使用 TLS 1.2+

### 5.2 CORS

- 配置允许的源列表
- 禁止 `*` 通配符
- 限制允许的 HTTP 方法

### 5.3 内容安全策略

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
```

## 6. 安全测试

### 6.1 自动化检查

- CI 流程包含安全扫描
- 提交前自动 lint 检查
- 依赖漏洞自动告警

### 6.2 手动检查

- 定期代码审查
- 渗透测试（生产环境）
- 安全培训

## 7. 应急响应

### 7.1 安全事件处理

1. 立即隔离受影响的服务
2. 评估影响范围
3. 修复漏洞
4. 通知受影响用户
5. 更新安全策略

### 7.2 联系方式

- 项目维护者邮箱
- GitHub Security Advisories
- 紧急联系人列表

## 相关文档

- [架构设计](./ARCHITECTURE.md)
- [代码规范](./CODING_STANDARDS.md)
- [部署指南](./DEPLOYMENT.md)
