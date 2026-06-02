<template>
  <div class="article-detail">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>
    <el-card v-else-if="article" class="detail-card">
      <template #header>
        <div class="article-header">
          <h1>{{ article.title }}</h1>
          <div class="meta">
            <span class="author">
              <el-icon><user /></el-icon>
              {{ article.user?.nickname || article.user?.username || '未知' }}
            </span>
            <span
              ><el-icon><calendar /></el-icon>
              {{ formatDate(article.published_at || article.created_at) }}</span
            >
            <span
              ><el-icon><view /></el-icon> {{ article.view_count }}</span
            >
            <span
              ><el-icon><star /></el-icon> {{ article.like_count }}</span
            >
            <span
              ><el-icon><chat-dot-round /></el-icon> {{ article.comment_count }}</span
            >
          </div>
          <div v-if="isOwner" class="article-actions">
            <el-button type="primary" @click="$router.push(`/articles/${article.id}/edit`)"
              >编辑</el-button
            >
            <el-button type="danger" @click="handleDelete">删除</el-button>
          </div>
        </div>
      </template>
      <div class="content" v-html="renderContent(article.content)"></div>
      <div class="interaction">
        <el-button :type="isLiked ? 'primary' : ''" @click="handleLike">
          <el-icon><star /></el-icon>
          {{ isLiked ? '已点赞' : '点赞' }} ({{ article.like_count }})
        </el-button>
        <el-button :type="isFavorited ? 'warning' : ''" @click="handleFavorite">
          <el-icon><collection /></el-icon>
          {{ isFavorited ? '已收藏' : '收藏' }}
        </el-button>
      </div>
    </el-card>
    <el-card v-if="!loading && article" class="comments-section">
      <template #header>
        <h3>评论 ({{ article.comment_count }})</h3>
      </template>
      <CommentSection :article-id="article.id" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Calendar, Star, ChatDotRound, Collection } from '@element-plus/icons-vue'
import { useArticleStore } from '@/stores/article'
import { useUserStore } from '@/stores/user'
import {
  likeArticle,
  unlikeArticle,
  favoriteArticle,
  unfavoriteArticle,
  getInteractionStatus,
} from '@/api/interaction'
import { deleteArticle } from '@/api/article'
import CommentSection from '@/components/comment/CommentSection.vue'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()

const isLiked = ref(false)
const isFavorited = ref(false)

const article = computed(() => articleStore.currentArticle)
const loading = computed(() => articleStore.loading)
const isOwner = computed(() => userStore.user && article.value?.user_id === userStore.user?.id)

onMounted(async () => {
  const id = Number(route.params.id)
  await articleStore.fetchArticle(id)
  if (userStore.isLoggedIn) {
    try {
      const res = await getInteractionStatus(id)
      if (res.success) {
        isLiked.value = res.data?.is_liked || false
        isFavorited.value = res.data?.is_favorited || false
      }
    } catch (error) {
      console.error('获取互动状态失败:', error)
    }
  }
})

onUnmounted(() => {
  articleStore.clearCurrent()
})

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    if (isLiked.value) {
      await unlikeArticle(article.value!.id)
      isLiked.value = false
      article.value!.like_count--
      ElMessage.success('取消点赞')
    } else {
      await likeArticle(article.value!.id)
      isLiked.value = true
      article.value!.like_count++
      ElMessage.success('点赞成功')
    }
  } catch (error: unknown) {
    const err = error as { error?: { message?: string } }
    ElMessage.error(err.error?.message || '操作失败')
  }
}

const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    if (isFavorited.value) {
      await unfavoriteArticle(article.value!.id)
      isFavorited.value = false
      ElMessage.success('取消收藏')
    } else {
      await favoriteArticle(article.value!.id)
      isFavorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (error: unknown) {
    const err = error as { error?: { message?: string } }
    ElMessage.error(err.error?.message || '操作失败')
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      type: 'warning',
    })
    await deleteArticle(article.value!.id)
    ElMessage.success('删除成功')
    router.push('/articles')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const renderContent = (content: string) => {
  return content
}
</script>

<style scoped>
.detail-card {
  margin-bottom: 20px;
}

.article-header h1 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #333;
}

.meta {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 14px;
  margin-bottom: 12px;
  align-items: center;
}

.meta .el-icon {
  margin-right: 4px;
}

.article-actions {
  margin-top: 12px;
}

.content {
  line-height: 1.8;
  font-size: 15px;
  color: #333;
  min-height: 200px;
}

.interaction {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.comments-section {
  margin-top: 20px;
}

.loading {
  padding: 40px 0;
}
</style>
