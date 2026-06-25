/* eslint-disable no-console */
/**
 * API 类型 + 契约客户端生成脚本
 *
 * 从后端 Swagger 2.0 规范生成:
 *   1. src/types/generated/schemas.ts    — OpenAPI 3.0 TypeScript 类型（含 paths 类型）
 *   2. src/api/contract.ts               — 类型安全的 API 契约客户端（使用 paths 类型）
 *
 * 用法:
 *   npm run gen:api                          # 自动查找 ../TeamGalleryGo/docs/swagger.json
 *   npm run gen:api -- ./path/to/swagger.json # 指定路径
 *   SWAGGER_PATH=./custom.json npm run gen:api # 环境变量指定
 *
 * 前置条件:
 *   - 后端仓库已运行 `swag init` 生成 swagger.json
 *   - Node.js >= 20
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

// ============================================================
// 配置
// ============================================================

const SWAGGER_PATH =
  process.env.SWAGGER_PATH ||
  process.argv[2] ||
  join(rootDir, '..', 'TeamGalleryGo', 'docs', 'swagger.json')

const OUTPUT_DIR = join(rootDir, 'src', 'types', 'generated')
const SCHEMAS_OUTPUT = join(OUTPUT_DIR, 'schemas.ts')
const OPENAPI_3_PATH = join(OUTPUT_DIR, 'openapi3.json')
const CONTRACT_OUTPUT = join(rootDir, 'src', 'api', 'contract.ts')

// ============================================================
// 工具函数
// ============================================================

function step(msg: string): void {
  console.log(`\n  [${new Date().toLocaleTimeString()}] ${msg}`)
}

function fail(msg: string): never {
  console.error(`\n  错误: ${msg}`)
  process.exit(1)
}

// ============================================================
// 主流程
// ============================================================

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   TeamGallery API 类型 + 客户端生成     ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log(`\n  Swagger 源: ${SWAGGER_PATH}`)

  // --- 0. 检查源文件 ---
  const resolvedSwaggerPath = resolve(SWAGGER_PATH)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(resolvedSwaggerPath)) {
    fail(
      `找不到 Swagger 文件: ${resolvedSwaggerPath}\n` +
        `  请确保:\n` +
        `  1. 后端仓库已运行 swag init 生成 docs/swagger.json\n` +
        `  2. 路径正确（可通过环境变量 SWAGGER_PATH 或命令行参数指定）\n` +
        `  3. 前后端仓库位于同一父目录`,
    )
  }
  console.log(`  Swagger 文件: ${resolvedSwaggerPath} (存在)`)

  // --- 1. 确保输出目录 ---
  mkdirSync(OUTPUT_DIR, { recursive: true })

  // --- 2. Swagger 2.0 → OpenAPI 3.0 ---
  step('转换 Swagger 2.0 → OpenAPI 3.0...')
  try {
    execSync(
      `npx swagger2openapi "${resolvedSwaggerPath}" --outfile "${OPENAPI_3_PATH}" --yaml false`,
      {
        stdio: 'pipe',
        cwd: rootDir,
      },
    )
    console.log('  转换完成 → openapi3.json')
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    fail(`Swagger 2.0 → OpenAPI 3.0 转换失败:\n${errMsg}`)
  }

  // --- 3. 生成 TypeScript 类型 ---
  step('生成 TypeScript 类型...')
  try {
    execSync(
      `npx openapi-typescript "${OPENAPI_3_PATH}" --output "${SCHEMAS_OUTPUT}" --export-type`,
      { stdio: 'pipe', cwd: rootDir },
    )
    console.log('  类型生成完成 → schemas.ts')
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    fail(`openapi-typescript 生成失败:\n${errMsg}`)
  }

  // --- 4. 后处理：清理 Go 包路径前缀 ---
  step('清理类型名称（Go 包路径 → 简洁名称）...')
  cleanTypeNames(SCHEMAS_OUTPUT)

  // --- 5. 验证生成结果 ---
  step('验证生成结果...')
  validateOutput(SCHEMAS_OUTPUT)

  // --- 6. 格式化生成文件 ---
  step('格式化生成文件...')
  try {
    const formatCmd =
      `npx prettier --write` +
      ` "${SCHEMAS_OUTPUT}"` +
      ` "${CONTRACT_OUTPUT}"` +
      ` "${OPENAPI_3_PATH}"`
    execSync(formatCmd, {
      stdio: 'pipe',
      cwd: rootDir,
    })
    console.log('  Prettier 格式化完成')
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    fail(`Prettier 格式化失败:\n${errMsg}`)
  }

  console.log('\n  生成完成!')
  console.log('  生成文件:')
  console.log(`    - ${SCHEMAS_OUTPUT}`)
  console.log(`    - ${CONTRACT_OUTPUT}`)
  console.log('\n  使用方式:')
  console.log('    import type { paths, components } from "@/types/generated/schemas"')
  console.log('    import { contract } from "@/api/contract"')
  console.log('')
  console.log('    // 类型安全的 API 调用:')
  console.log('    const res = await contract.get("/articles/{id}", {')
  console.log('      params: { path: { id: 1 } }')
  console.log('    })')
  console.log('\n  运行命令: npm run gen:api')
}

// ============================================================
// 类型名称清理
// ============================================================

function cleanTypeNames(filePath: string): void {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  let content = readFileSync(filePath, 'utf-8')

  // 自动从 swagger definitions 中提取名称映射
  // 模式: GoPkgPath.TypeName → TypeName
  const nameMap = buildNameMap(content)

  for (const [oldName, newName] of Object.entries(nameMap)) {
    // 只替换类型引用，不替换字符串内容
    const escapedOld = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // 匹配模式: 引号内的类型名引用
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(`(?:\\[|,\\s*)['"]${escapedOld}['"]`, 'g')
    content = content.replace(regex, (match) => {
      return match.replace(oldName, newName)
    })
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  writeFileSync(filePath, content)
  console.log(`  清理了 ${Object.keys(nameMap).length} 个类型名称`)
}

/**
 * 从生成的 TypeScript 内容中自动提取 Go 包路径到简洁名称的映射
 *
 * @param content - 生成的 TypeScript 文件内容
 * @returns Go 包路径全名到简洁名称的映射表
 */
function buildNameMap(content: string): Record<string, string> {
  /* eslint-disable security/detect-object-injection */
  const map: Record<string, string> = {}

  // 匹配模式: components["schemas"]["GoPkgPath.TypeName"] 引用
  const refRegex = /components\["schemas"\]\["([^"]+)"\]/g
  let match: RegExpExecArray | null

  while ((match = refRegex.exec(content)) !== null) {
    const fullName = match[1]
    // 提取简短名称（最后一个点之后的部分）
    const shortName = fullName.split('.').pop() || fullName
    if (fullName !== shortName) {
      map[fullName] = shortName
    }
  }

  // 额外：匹配作为 key 的定义名称
  // 如: "GoPkgPath.TypeName": { ... }
  const defRegex = /"([^"]+\.([^".]+))":\s*\{/g
  while ((match = defRegex.exec(content)) !== null) {
    const fullName = match[1]
    const shortName = match[2]
    if (fullName !== shortName && !map[fullName]) {
      map[fullName] = shortName
    }
  }

  /* eslint-enable security/detect-object-injection */
  return map
}

// ============================================================
// 验证
// ============================================================

function validateOutput(filePath: string): void {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = readFileSync(filePath, 'utf-8')

  // 检查关键导出
  const checks = [
    { name: 'paths', pattern: /export type paths = \{/ },
    { name: 'components', pattern: /export type components = \{/ },
  ]

  for (const check of checks) {
    if (!check.pattern.test(content)) {
      console.warn(`  警告: 未找到 ${check.name} 类型导出`)
    }
  }

  // 检查残留的 Go 包路径
  const goPkgPattern = /TeamGalleryGo_/g
  const remainingMatches = content.match(goPkgPattern)
  if (remainingMatches && remainingMatches.length > 0) {
    console.warn(`  警告: 仍有 ${remainingMatches.length} 处未清理的 Go 包路径引用`)
  }

  console.log(`  文件大小: ${(content.length / 1024).toFixed(1)} KB`)
}

// ============================================================
// 入口
// ============================================================

main().catch((error) => {
  console.error('\n  未预期的错误:', error)
  process.exit(1)
})
