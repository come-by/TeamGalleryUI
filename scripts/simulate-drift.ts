/* eslint-disable no-console, security/detect-non-literal-fs-filename, security/detect-object-injection */
/**
 * 契约漂移模拟测试
 *
 * 通过临时修改 swagger 副本模拟后端 API 变更，
 * 验证整套系统能否正确检测到漂移。
 *
 * 用法:
 *   npm run contract:drift-sim
 *
 * 注意: 此脚本创建 swagger 临时副本，不修改原始 swagger.json，执行后自动清理。
 */
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { copyFileSync, existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ORIGINAL_SWAGGER = resolve(ROOT, '..', 'TeamGalleryGo', 'docs', 'swagger.json')
const DRIFT_SWAGGER = resolve(
  ROOT,
  '..',
  'TeamGalleryGo',
  'docs',
  `swagger_drift_test_${randomUUID().slice(0, 8)}.json`,
)

function fail(msg: string): never {
  console.error(`\n  \u5931\u8D25: ${msg}`)
  process.exit(1)
}

async function main(): Promise<void> {
  console.log(
    '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557',
  )
  console.log(
    '\u2551   \u5951\u7EA6\u6F02\u79FB\u6A21\u62DF\u6D4B\u8BD5                       \u2551',
  )
  console.log(
    '\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n',
  )

  // 1. 检查原始文件
  if (!existsSync(ORIGINAL_SWAGGER)) {
    fail(`\u627E\u4E0D\u5230 swagger.json: ${ORIGINAL_SWAGGER}`)
  }
  console.log('  [1/5] \u521B\u5EFA swagger \u526F\u672C...')
  copyFileSync(ORIGINAL_SWAGGER, DRIFT_SWAGGER)

  // 2. 模拟：移除一个端点（从 paths 中删除第一条路径）
  console.log(
    '  [2/5] \u6A21\u62DF API \u53D8\u66F4\uFF08\u79FB\u9664\u4E00\u4E2A\u8DEF\u5F84\uFF09...',
  )
  const swaggerContent = JSON.parse(readFileSync(DRIFT_SWAGGER, 'utf-8'))
  const pathKeys = Object.keys(swaggerContent.paths || {})
  if (pathKeys.length === 0) fail('swagger \u4E2D\u6CA1\u6709 paths')
  const removedPath = pathKeys[0]
  delete swaggerContent.paths[removedPath]
  writeFileSync(DRIFT_SWAGGER, JSON.stringify(swaggerContent, null, 2))
  console.log(`    \u5DF2\u79FB\u9664: ${removedPath}`)

  // 3. 用修改后的 swagger 重新生成
  console.log('  [3/5] \u91CD\u65B0\u751F\u6210 schemas.ts...')
  try {
    execSync(`npx tsx scripts/gen-api.ts`, {
      cwd: ROOT,
      env: { ...process.env, SWAGGER_PATH: DRIFT_SWAGGER },
      stdio: 'pipe',
    })
    console.log('    \u751F\u6210\u5B8C\u6210')
  } catch {
    unlinkSync(DRIFT_SWAGGER)
    fail('gen:api \u6267\u884C\u5931\u8D25')
  }

  // 4. 检查 git diff — 应该有差异（检测到漂移）
  console.log('  [4/5] \u68C0\u67E5\u6F02\u79FB\u68C0\u6D4B...')
  try {
    const diff = execSync('git diff --stat src/types/generated/schemas.ts', {
      cwd: ROOT,
      encoding: 'utf-8',
    })
    if (diff.trim()) {
      console.log(
        '    \u2713 \u68C0\u6D4B\u5230 API \u53D8\u66F4\uFF08\u6F02\u79FB\u6A21\u62DF\u6210\u529F\uFF09',
      )
    } else {
      console.log(
        '    \u2717 \u672A\u68C0\u6D4B\u5230\u53D8\u66F4 \u2014 \u6F02\u79FB\u68C0\u6D4B\u53EF\u80FD\u5931\u6548',
      )
    }
  } catch {
    console.log(
      '    \u2717 \u672A\u68C0\u6D4B\u5230\u53D8\u66F4 \u2014 \u6F02\u79FB\u68C0\u6D4B\u53EF\u80FD\u5931\u6548',
    )
  }

  // 5. 恢复：重新用原始 swagger 生成
  console.log('  [5/5] \u6062\u590D\u539F\u59CB\u72B6\u6001...')
  try {
    execSync(`npx tsx scripts/gen-api.ts`, {
      cwd: ROOT,
      env: { ...process.env, SWAGGER_PATH: ORIGINAL_SWAGGER },
      stdio: 'pipe',
    })
    console.log('    \u5DF2\u6062\u590D')
  } catch {
    console.log(
      '    \u26A0 \u6062\u590D\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u8FD0\u884C npm run gen:api',
    )
  }

  // 清理临时文件
  try {
    unlinkSync(DRIFT_SWAGGER)
  } catch {
    // 忽略清理错误
  }

  console.log(
    '\n  \u6F02\u79FB\u6A21\u62DF\u5B8C\u6210 \u2014 \u68C0\u67E5\u7ED3\u679C\u662F\u5426\u7B26\u5408\u9884\u671F',
  )
}

main()
