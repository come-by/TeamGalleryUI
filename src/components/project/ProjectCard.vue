<template>
  <el-card class="project-card" shadow="hover" @click="handleClick">
    <div class="cover" v-if="project.cover_image">
      <el-image :src="project.cover_image" fit="cover" class="cover-image" />
    </div>
    <div class="content">
      <div class="header">
        <h3 class="name">{{ project.name }}</h3>
        <el-tag :type="statusType(project.status)" size="small">
          {{ PROJECT_STATUS_LABEL[project.status] }}
        </el-tag>
      </div>
      <p class="description">{{ project.description || '暂无描述' }}</p>
      <div class="meta">
        <span>创建者: {{ project.owner?.nickname || project.owner?.username || '未知' }}</span>
        <span>{{ formatDate(project.created_at) }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineOptions({ name: 'ProjectCard' })
import { useProject } from '@/composables/useProject'
import type { Project } from '@/types/project'
import { PROJECT_STATUS_LABEL } from '@/utils/constants'
import { formatDate } from '@/utils/format'

const props = defineProps<{
  project: Project
}>()

const emit = defineEmits<{
  click: [project: Project]
}>()

const { statusType } = useProject()

const handleClick = () => {
  emit('click', props.project)
}
</script>

<style scoped>
.project-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
}

.cover {
  height: 160px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 12px;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.content {
  padding: 4px 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description {
  margin: 8px 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
