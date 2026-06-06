# 文档规范

## 1. JSDoc 注释规范

### 1.1 函数注释

所有导出的公共函数必须添加 JSDoc 注释。

```typescript
/**
 * 获取文章列表
 * @param params - 查询参数
 * @param params.page - 页码，默认 1
 * @param params.page_size - 每页数量，默认 10
 * @param params.keyword - 搜索关键词
 * @returns 文章列表响应
 * @throws {ApiError} 网络错误或服务器错误
 * @example
 * const articles = await getArticles({ page: 1, keyword: 'Vue' })
 */
export const getArticles = (
  params: ArticleListParams
): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/articles', { params })
}
```

### 1.2 Composable 注释

所有 composables 必须说明用途、参数和返回值。

```typescript
/**
 * 文件上传 Composable
 * @param opts - 配置选项
 * @param opts.url - 上传接口地址
 * @param opts.maxFiles - 最大文件数量，默认 1
 * @param opts.maxSize - 单个文件最大大小（字节），默认 10MB
 * @returns 上传相关状态和方法
 * @example
 * const { fileList, uploadFiles, removeFile } = useUpload({ url: '/upload' })
 */
export function useUpload(opts: UseUploadOptions) {
  // ...
}
```

### 1.3 类型定义注释

所有导出的接口和类型必须添加注释。

```typescript
/**
 * 文章数据模型
 */
export interface Article {
  /** 文章唯一标识 */
  id: number
  /** 文章标题 */
  title: string
  /** 文章内容（Markdown 格式） */
  content: string
  /** 文章摘要 */
  summary?: string
  /** 文章状态 */
  status: 'draft' | 'published' | 'archived'
  /** 作者 ID */
  user_id: number
  /** 作者信息 */
  user?: User
  /** 分类 ID */
  category_id?: number
  /** 浏览量 */
  view_count: number
  /** 点赞数 */
  like_count: number
  /** 评论数 */
  comment_count: number
  /** 创建时间 */
  created_at: string
  /** 发布时间 */
  published_at?: string
  /** 更新时间 */
  updated_at: string
}
```

## 2. Vue 组件 Props 规范

### 2.1 Props 必须添加注释

使用 `defineProps` 时，每个 prop 必须添加注释。

```vue
<script setup lang="ts">
interface Props {
  /** 上传接口地址 */
  url: string
  /** 接受的文件类型，默认 '*/*' */
  accept?: string
  /** 单个文件最大大小（字节），默认 10MB */
  maxSize?: number
  /** 最大文件数量，默认 1 */
  maxFiles?: number
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*/*',
  maxSize: 10 * 1024 * 1024,
  maxFiles: 1,
})
</script>
```

### 2.2 组件顶部注释

复杂组件应在 `<script>` 顶部添加说明。

```vue
<!--
  文件上传组件
  支持拖拽上传、多文件上传、进度显示、重试功能
  @example
  <FileUpload url="/api/upload" :maxFiles="5" @success="handleSuccess" />
-->
<script setup lang="ts">
// ...
</script>
```

## 3. API 接口命名规范

### 3.1 函数命名

- 获取列表：`getXxxList` 或 `getXxxs`
- 获取单个：`getXxx`
- 创建：`createXxx`
- 更新：`updateXxx`
- 删除：`deleteXxx`
- 批量操作：`batchXxx`

### 3.2 参数命名

- 分页参数：`page`, `page_size`
- 排序参数：`sort_by`, `order` (asc/desc)
- 搜索参数：`keyword`, `query`
- 过滤参数：`status`, `category_id`

### 3.3 响应格式

所有 API 响应必须遵循统一格式：

```typescript
interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean
  /** 响应数据 */
  data?: T
  /** 错误信息 */
  error?: ApiError
  /** 分页信息 */
  pagination?: Pagination
}
```

## 4. 代码块注释规范

### 4.1 复杂逻辑注释

```typescript
// 计算总进度：已完成文件的进度平均值
const totalProgress = computed(() => {
  if (fileList.value.length === 0) return 0
  const sum = fileList.value.reduce((acc, item) => acc + item.progress, 0)
  return Math.round(sum / fileList.value.length)
})
```

### 4.2 TODO/FIXME 注释

```typescript
// TODO: 支持断点续传
// FIXME: 大文件上传时内存占用过高
// HACK: 临时解决方案，后续需要重构
```

## 5. ESLint 规则集成

### 5.1 强制注释规则

```javascript
{
  rules: {
    // 强制函数必须有 JSDoc
    'jsdoc/require-jsdoc': ['warn', {
      publicOnly: true,
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
      },
    }],
    // 强制 JSDoc 格式正确
    'jsdoc/check-tag-names': 'error',
    'jsdoc/require-param': 'warn',
    'jsdoc/require-returns': 'warn',
  }
}
```

## 6. 文档生成

### 6.1 TypeDoc 配置

使用 TypeDoc 自动生成 API 文档：

```bash
npm install -D typedoc
```

```json
// typedoc.json
{
  "entryPoints": ["src/types/index.ts", "src/api/index.ts"],
  "out": "docs",
  "theme": "default"
}
```

### 6.2 VitePress 文档站点

对于大型项目，建议使用 VitePress 构建文档站点。
