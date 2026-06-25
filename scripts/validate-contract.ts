/* eslint-disable no-console */
/**
 * 契约系统自动化验证脚本
 *
 * 对生成的 schemas.ts 进行完整性校验，替代手动逐项检查。
 * 验证项：文件存在、关键导出、端点数量、名称前缀清理、HTTP 方法定义。
 *
 * 用法:
 *   npm run contract:validate
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SCHEMAS_OUTPUT = resolve(ROOT, 'src', 'types', 'generated', 'schemas.ts')

let errors = 0

function check(desc: string, fn: () => boolean): void {
  try {
    if (fn()) {
      console.log(`  \u2713 ${desc}`)
    } else {
      console.log(`  \u2717 ${desc}`)
      errors++
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.log(`  \u2717 ${desc} (\u5F02\u5E38: ${msg})`)
    errors++
  }
}

// --- 基础检查 ---
check('schemas.ts 文件存在', () => existsSync(SCHEMAS_OUTPUT))

if (!existsSync(SCHEMAS_OUTPUT)) {
  console.error('\n  schemas.ts 不存在，请先运行 npm run gen:api')
  process.exit(1)
}

const content = readFileSync(SCHEMAS_OUTPUT, 'utf-8')

// --- 关键导出检查 ---
check('包含 export type paths = {', () => /export\s+type\s+paths\s*=\s*\{/.test(content))
check('包含 export type components = {', () => /export\s+type\s+components\s*=\s*\{/.test(content))

// --- 端点数量检查（动态，替代硬编码数字）---
const pathMatches = content.match(/(?<=paths\[")\/[^"]+/g)
const pathCount = pathMatches ? pathMatches.length : 0
check(`端点数量 > 0（当前: ${pathCount}）`, () => pathCount > 0)
console.log(`  \u2139  当前端点数: ${pathCount}`)

// --- 名称清理检查 ---
const goPrefixPatterns = [/TeamGalleryGo_/, /GoVueBlog_/]
for (const pattern of goPrefixPatterns) {
  check(`无 "${pattern.source}" 前缀残留`, () => !pattern.test(content))
}

// --- 完整性检查 ---
check('包含 HTTP 方法定义 (get/post/put/delete)', () => {
  const methodPattern = /"(get|post|put|delete)"\s*:\s*\{/
  return methodPattern.test(content)
})

console.log(
  `\n  \u7ED3\u679C: ${errors === 0 ? '\u5168\u90E8\u901A\u8FC7 \u2713' : `${errors} \u9879\u5931\u8D25 \u2717`}`,
)
process.exit(errors > 0 ? 1 : 0)
