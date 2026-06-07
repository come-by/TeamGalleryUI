<template>
  <div class="edit-article">
    <el-card>
      <template #header>
        <h2>编辑文章</h2>
      </template>
      <div v-if="loading" class="loading">
        <el-skeleton :rows="10" animated />
      </div>
      <el-form v-else :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入文章标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="15"
            placeholder="请输入文章内容（支持 Markdown）"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">发布</el-radio>
            <el-radio label="archived">归档</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'EditArticleView' })
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useArticleStore } from '@/stores/article'
import type { Article } from '@/types'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

const form = reactive<Partial<Article>>({
  title: '',
  content: '',
  summary: '',
  status: 'draft',
  category_id: undefined,
})

const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }],
}

onMounted(async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    await articleStore.fetchArticle(id)
    const article = articleStore.currentArticle
    if (article) {
      form.title = article.title
      form.content = article.content
      form.summary = article.summary || ''
      form.status = article.status
      form.category_id = article.category_id
    }
  } catch (error) {
    ElMessage.error('获取文章失败')
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const id = Number(route.params.id)
    await articleStore.updateExistingArticle(id, form)
    ElMessage.success('文章更新成功')
    router.push(`/articles/${id}`)
  } catch (error: unknown) {
    const err = error as { message?: string }
    ElMessage.error(err.message || '更新失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.edit-article {
  max-width: 800px;
  margin: 0 auto;
}

.edit-article h2 {
  font-size: 18px;
  color: #333;
}

.loading {
  padding: 20px 0;
}
</style>
