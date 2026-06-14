<template>
  <div class="project-detail">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>
    <el-card v-else-if="project" class="detail-card">
      <template #header>
        <div class="project-header">
          <div class="title-section">
            <h1>{{ project.name }}</h1>
            <el-tag :type="statusType(project.status)" size="large">
              {{ PROJECT_STATUS_LABEL[project.status] }}
            </el-tag>
          </div>
          <div v-if="canEdit(project) || canDelete(project)" class="project-actions">
            <el-button
              v-if="canEdit(project)"
              type="primary"
              @click="$router.push(`/projects/${project.id}/edit`)"
            >
              编辑
            </el-button>
            <el-button v-if="canDelete(project)" type="danger" @click="handleDelete">
              删除
            </el-button>
          </div>
        </div>
      </template>

      <div class="info-section">
        <div v-if="project.cover_image" class="cover">
          <el-image :src="project.cover_image" fit="contain" class="cover-image" />
        </div>
        <div class="description">
          <h3>项目描述</h3>
          <p>{{ project.description || '暂无描述' }}</p>
        </div>
        <div class="meta-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="创建者">
              {{ project.owner?.nickname || project.owner?.username || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(project.created_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDate(project.updated_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              {{ PROJECT_STATUS_LABEL[project.status] }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <MemberManager :project="project" />

      <!-- 项目里程碑 -->
      <el-divider />
      <div class="project-milestones">
        <h3>项目里程碑</h3>
        <MilestoneTimeline :project-id="project.id" :editable="canEdit(project)" />
      </div>

      <!-- 项目评论区 — 仅项目成员可见 -->
      <el-divider />
      <div v-if="isProjectMember(project)" class="project-comments-section">
        <h3>项目评论</h3>
        <ProjectCommentSection :project-id="project.id" />
      </div>
      <el-alert
        v-else-if="userStore.isLoggedIn"
        title="仅项目成员可查看和发表评论"
        type="info"
        :closable="false"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ProjectDetailView' })

import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MilestoneTimeline from '@/components/milestone/MilestoneTimeline.vue'
import MemberManager from '@/components/project/MemberManager.vue'
import ProjectCommentSection from '@/components/project/ProjectCommentSection.vue'
import { useProject } from '@/composables/useProject'
import { useProjectStore } from '@/stores/project'
import { useUserStore } from '@/stores/user'
import { PROJECT_STATUS_LABEL } from '@/utils/constants'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const userStore = useUserStore()
const { canEdit, canDelete, isProjectMember, statusType } = useProject()

const project = computed(() => projectStore.currentProject)
const loading = computed(() => projectStore.loading)

onMounted(async () => {
  const id = Number(route.params.id)
  await projectStore.fetchProject(id)
})

onUnmounted(() => {
  projectStore.clearCurrent()
})

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该项目吗？此操作不可撤销。', '确认删除', {
      type: 'warning',
    })
    await projectStore.removeProject(project.value!.id)
    router.push('/projects')
  } catch (error: unknown) {
    if ((error as { reason?: string })?.reason !== 'cancel') {
      const err = error as { message?: string }
      ElMessage.error(err.message || '删除失败')
    }
  }
}
</script>

<style scoped>
.project-detail {
  max-width: 900px;
  margin: 0 auto;
}

.loading {
  padding: 16px 0;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-section h1 {
  margin: 0;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.info-section {
  padding: 8px 0;
}

.cover {
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  max-height: 400px;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.description h3 {
  margin: 0 0 8px;
}

.description p {
  color: var(--el-text-color-regular);
  line-height: 1.6;
  white-space: pre-wrap;
}

.meta-info {
  margin-top: 24px;
}

.project-comments-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
}
</style>
