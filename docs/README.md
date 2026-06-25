# TeamGallery 前端文档索引

> 所有文档按 [Diátaxis 框架](https://diataxis.fr/) 分为四类：操作指南、参考、项目、归档。

## 文档导航

### 操作指南（How-to）

解决特定问题的步骤说明。

| 文档                                          | 说明                                     |
| --------------------------------------------- | ---------------------------------------- |
| [开发指南](guides/DEVELOPMENT.md)             | 本地开发环境搭建、项目结构、新增功能流程 |
| [API 契约管理](guides/CONTRACT_MANAGEMENT.md) | Swagger 驱动的 API 类型生成与防漂移机制  |
| [部署指南](guides/DEPLOYMENT.md)              | 构建、Nginx、Docker 部署与 CI/CD         |
| [测试指南](guides/TESTING.md)                 | 测试框架、组件测试、API Mock 与最佳实践  |
| [常见问题排查](guides/TROUBLESHOOTING.md)     | 开发/构建/运行时常见错误与解决方案       |

### 参考文档（Reference）

技术规范和配置参考。

| 文档                                   | 说明                                                        |
| -------------------------------------- | ----------------------------------------------------------- |
| [API 接口](reference/API.md)           | API 通用说明、认证方式、数据格式（端点以后端 swagger 为准） |
| [错误码字典](reference/ERROR_CODES.md) | 所有业务错误码及前端处理建议                                |
| [安全策略](reference/SECURITY.md)      | 认证、Token 管理、XSS/CSRF 防护                             |

### 项目文档（Project）

架构设计与项目管理。

| 文档                                    | 说明                                        |
| --------------------------------------- | ------------------------------------------- |
| [架构设计](project/ARCHITECTURE.md)     | 整体架构、技术栈、分层设计与数据流          |
| [代码规范](project/CODING_STANDARDS.md) | 工具链配置、命名规范、组件规范、Commit 规范 |
| [变更日志](project/CHANGELOG.md)        | 版本变更记录                                |
| [路线图](project/ROADMAP.md)            | 版本规划与功能列表                          |

### 归档

已完成或过期的临时文档。

| 文档                                                   | 说明                             |
| ------------------------------------------------------ | -------------------------------- |
| [契约验证执行清单](archive/CONTRACT_CHECKLIST.md)      | API 契约防漂移验证方案（已实施） |
| [覆盖率提升计划](archive/COVERAGE_IMPROVEMENT_PLAN.md) | 前端代码覆盖率分步实施任务书     |

## 文档维护

- **API 接口**：后端 swagger.json 是唯一真理源，运行 `npm run gen:api` 同步类型
- **错误码**：以后端 `pkg/resp/errors.go` 为准，前端 `reference/ERROR_CODES.md` 同步更新
- **变更日志**：每次发版时更新 `project/CHANGELOG.md`
- **路线图**：每完成一个里程碑后更新 `project/ROADMAP.md`
