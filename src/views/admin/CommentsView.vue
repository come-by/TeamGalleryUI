<template>
  <div class="admin-comments">
    <el-card>
      <template #header>
        <h2>待审核评论</h2>
      </template>
      <el-table :data="comments" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="评论内容" min-width="200" />
        <el-table-column label="文章" width="150">
          <template #default="{ row }">
            <router-link :to="`/articles/${row.article_id}`" target="_blank">
              文章 #{{ row.article_id }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            {{ row.user?.nickname || row.user?.username || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="handleApprove(row.id)">通过</el-button>
            <el-button type="danger" size="small" @click="handleReject(row.id)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CommentsView' })
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'

import { approveComment, getPendingComments, rejectComment } from '@/api/comment'
import type { Comment } from '@/types'
import { reportError } from '@/utils/error-report'

const comments = ref<Comment[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

onMounted(async () => {
  await fetchComments()
})

const fetchComments = async () => {
  loading.value = true
  try {
    const res = await getPendingComments({
      page: currentPage.value,
      page_size: pageSize.value,
    })
    if (res.success) {
      comments.value = res.data?.data || []
      total.value = res.data?.pagination?.total || 0
    }
  } catch (error) {
    reportError(error, { type: 'fetch-pending-comments' })
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id: number) => {
  try {
    await approveComment(id)
    ElMessage.success('审核通过')
    await fetchComments()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleReject = async (id: number) => {
  try {
    await rejectComment(id)
    ElMessage.success('已拒绝')
    await fetchComments()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchComments()
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.admin-comments h2 {
  font-size: 18px;
  color: #333;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
