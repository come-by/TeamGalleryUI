<template>
  <div class="project-comment-section">
    <div v-if="isLoggedIn" class="comment-form">
      <el-input
        v-model="commentContent"
        type="textarea"
        :rows="3"
        placeholder="发表项目评论..."
        maxlength="500"
        show-word-limit
      />
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="submitting"
        style="margin-top: 10px"
      >
        发表
      </el-button>
    </div>
    <el-alert
      v-else
      title="请先登录后再评论"
      type="warning"
      :closable="false"
      style="margin-bottom: 20px"
    />

    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="comments.length === 0" class="empty">
      <el-empty description="暂无评论，成为第一个评论的成员吧" />
    </div>
    <div v-else class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <span class="username">{{
            comment.user?.nickname || comment.user?.username || '未知'
          }}</span>
          <span class="time">{{ formatDate(comment.created_at) }}</span>
        </div>
        <div class="comment-content">{{ comment.content }}</div>
        <div class="comment-footer">
          <el-button text size="small" @click="handleLike(comment)">
            赞 {{ comment.like_count }}
          </el-button>
          <el-button text size="small" @click="showReplyInput = comment.id"> 回复 </el-button>
          <el-button text size="small" @click="handleReport(comment.id)"> 举报 </el-button>
          <el-button
            v-if="isOwner(comment)"
            text
            size="small"
            type="danger"
            @click="handleDelete(comment.id)"
          >
            删除
          </el-button>
        </div>

        <div v-if="showReplyInput === comment.id" class="reply-form">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="2"
            placeholder="回复评论..."
            maxlength="500"
          />
          <el-button
            type="primary"
            size="small"
            @click="handleReply(comment.id)"
            :loading="submitting"
          >
            回复
          </el-button>
          <el-button size="small" @click="showReplyInput = null">取消</el-button>
        </div>

        <div v-if="comment.replies?.length" class="replies">
          <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
            <div class="comment-header">
              <span class="username">{{
                reply.user?.nickname || reply.user?.username || '未知'
              }}</span>
              <span class="time">{{ formatDate(reply.created_at) }}</span>
            </div>
            <div class="comment-content">{{ reply.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ProjectCommentSection' })
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'

import {
  createProjectComment,
  deleteProjectComment,
  getProjectComments,
  likeProjectComment,
  reportProjectComment,
} from '@/api/project-comment'
import { useUserStore } from '@/stores/user'
import type { ProjectComment } from '@/types/project'
import { formatDate } from '@/utils/format'

const props = defineProps<{
  projectId: number
}>()

const userStore = useUserStore()

const comments = ref<ProjectComment[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const commentContent = ref('')
const replyContent = ref('')
const showReplyInput = ref<number | null>(null)
const submitting = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn)

onMounted(async () => {
  await fetchComments()
})

watch(
  () => props.projectId,
  async () => {
    currentPage.value = 1
    await fetchComments()
  }
)

const fetchComments = async () => {
  loading.value = true
  try {
    const res = await getProjectComments(props.projectId, {
      page: currentPage.value,
      page_size: pageSize.value,
    })
    if (res.success) {
      comments.value = res.data?.data || []
      total.value = res.data?.pagination?.total || 0
    }
  } catch (error) {
    console.error('获取项目评论失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  submitting.value = true
  try {
    await createProjectComment(props.projectId, { content: commentContent.value })
    ElMessage.success('评论发表成功，等待审核')
    commentContent.value = ''
    await fetchComments()
  } catch (error: unknown) {
    const err = error as { error?: { message?: string } }
    ElMessage.error(err.error?.message || '发表失败')
  } finally {
    submitting.value = false
  }
}

const handleReply = async (parentId: number) => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  submitting.value = true
  try {
    await createProjectComment(props.projectId, {
      content: replyContent.value,
      parent_id: parentId,
    })
    ElMessage.success('回复成功，等待审核')
    replyContent.value = ''
    showReplyInput.value = null
    await fetchComments()
  } catch (error: unknown) {
    const err = error as { error?: { message?: string } }
    ElMessage.error(err.error?.message || '回复失败')
  } finally {
    submitting.value = false
  }
}

const handleLike = async (comment: ProjectComment) => {
  try {
    await likeProjectComment(comment.id)
    comment.like_count++
    ElMessage.success('点赞成功')
  } catch (error: unknown) {
    const err = error as { error?: { message?: string } }
    ElMessage.error(err.error?.message || '操作失败')
  }
}

const handleReport = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要举报该评论吗？', '提示')
    await reportProjectComment(id)
    ElMessage.success('举报成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('举报失败')
    }
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该评论吗？', '提示', { type: 'warning' })
    await deleteProjectComment(id)
    ElMessage.success('删除成功')
    await fetchComments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchComments()
}

const isOwner = (comment: ProjectComment) => {
  return userStore.user && comment.user_id === userStore.user?.id
}
</script>

<style scoped>
.project-comment-section {
  padding: 10px 0;
}

.comment-form {
  margin-bottom: 20px;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.comment-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
}

.username {
  font-weight: bold;
  color: var(--el-color-primary);
}

.time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.comment-content {
  margin-bottom: 8px;
  line-height: 1.6;
}

.comment-footer {
  display: flex;
  gap: 8px;
}

.reply-form {
  margin-top: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.replies {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid var(--el-border-color-lighter);
}

.reply-item {
  padding: 8px 0;
}

.loading,
.empty {
  padding: 20px 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
