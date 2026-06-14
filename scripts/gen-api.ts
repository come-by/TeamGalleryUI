/* eslint-disable no-console, security/detect-non-literal-regexp */
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

const SWAGGER_PATH = join(rootDir, '..', 'TeamGalleryGo', 'docs', 'swagger.json')
const OUTPUT_DIR = join(rootDir, 'src', 'types', 'generated')
const SCHEMAS_OUTPUT = join(OUTPUT_DIR, 'schemas.ts')
const OPENAPI_3_PATH = join(OUTPUT_DIR, 'openapi3.json')

console.log(' 从 swagger.json 生成 TypeScript 类型...\n')

// 1. 确保输出目录存在
mkdirSync(OUTPUT_DIR, { recursive: true })

// 2. 用 swagger2openapi 转换 Swagger 2.0 → OpenAPI 3.0
console.log(' 转换 Swagger 2.0 → OpenAPI 3.0...')
try {
  execSync(`npx swagger2openapi "${SWAGGER_PATH}" --outfile "${OPENAPI_3_PATH}" --yaml false`, {
    stdio: 'inherit',
    cwd: rootDir,
  })
  console.log(' 转换完成\n')
} catch (error) {
  console.error(' 转换失败:', error)
  process.exit(1)
}

// 3. 生成 TypeScript 类型
console.log(' 生成 TypeScript 类型...')
try {
  execSync(
    `npx openapi-typescript "${OPENAPI_3_PATH}" --output "${SCHEMAS_OUTPUT}" --export-type`,
    { stdio: 'inherit', cwd: rootDir }
  )
  console.log(' 类型生成完成\n')
} catch (error) {
  console.error(' 类型生成失败:', error)
  process.exit(1)
}

// 4. 后处理：清理 Go 包路径前缀
console.log(' 清理类型名称...')
let content = readFileSync(SCHEMAS_OUTPUT, 'utf-8')

// 名称映射：Go 包路径 → 简洁名称
const nameMap: Record<string, string> = {
  'GoVueBlog_pkg_utils.PaginatedResponse': 'PaginatedResponse',
  'GoVueBlog_pkg_errors.APIResponse': 'APIResponse',
  'GoVueBlog_pkg_errors.APIError': 'APIError',
  'GoVueBlog_internal_model.Article': 'Article',
  'GoVueBlog_internal_model.User': 'User',
  'GoVueBlog_internal_model.Comment': 'Comment',
  'GoVueBlog_internal_model.Category': 'Category',
  'GoVueBlog_internal_model.Tag': 'Tag',
  'GoVueBlog_internal_model.UserProfile': 'UserProfile',
  'TeamGalleryGo_pkg_utils.PaginatedResponse': 'PaginatedResponse',
  'TeamGalleryGo_pkg_errors.APIResponse': 'APIResponse',
  'TeamGalleryGo_pkg_errors.APIError': 'APIError',
  'TeamGalleryGo_internal_model.Article': 'Article',
  'TeamGalleryGo_internal_model.User': 'User',
  'TeamGalleryGo_internal_model.Comment': 'Comment',
  'TeamGalleryGo_internal_model.Category': 'Category',
  'TeamGalleryGo_internal_model.Tag': 'Tag',
  'TeamGalleryGo_internal_model.UserProfile': 'UserProfile',
  'TeamGalleryGo_internal_model.Project': 'Project',
  'TeamGalleryGo_internal_model.ProjectMember': 'ProjectMember',
  'TeamGalleryGo_internal_model.Team': 'Team',
  'internal_domain_article.CreateRequest': 'CreateArticleRequest',
  'internal_domain_user.RegisterRequest': 'RegisterRequest',
  'internal_domain_user.LoginRequest': 'LoginRequest',
  'internal_domain_comment.CreateRequest': 'CreateCommentRequest',
  'internal_domain_project.CreateRequest': 'CreateProjectRequest',
  'internal_domain_project.UpdateRequest': 'UpdateProjectRequest',
  'internal_domain_project.AddMemberRequest': 'AddProjectMemberRequest',
  'internal_domain_project.UpdateMemberRoleRequest': 'UpdateProjectMemberRoleRequest',
}

// 替换类型名称
for (const [oldName, newName] of Object.entries(nameMap)) {
  const escapedOld = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escapedOld, 'g')
  content = content.replace(regex, newName)
}

writeFileSync(SCHEMAS_OUTPUT, content)
console.log(' 清理完成\n')

console.log(' 代码生成完成！')
console.log('\n使用方式:')
console.log('  import type { components } from "@/types/generated/schemas"')
console.log('  type User = components["schemas"]["User"]')
console.log('\n运行命令: npm run gen:api')
