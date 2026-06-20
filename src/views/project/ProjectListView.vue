<template>
  <div class="projects-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>项目列表</h2>
          <div class="actions">
            <el-input
              v-model="keyword"
              placeholder="搜索项目"
              style="width: 200px; margin-right: 10px"
              @keyup.enter="handleSearch"
            />
            <el-button @click="handleSearch">搜索</el-button>
          </div>
        </div>
        <div class="tabs">
          <el-radio-group v-model="statusFilter">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="active">进行中</el-radio-button>
            <el-radio-button value="archived">已归档</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="projects.length === 0" class="empty">
        <el-empty description="暂无项目" />
      </div>
      <div v-else class="project-list">
        <div class="grid">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            @click="goToProject"
          />
        </div>
      </div>

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
defineOptions({ name: 'ProjectListView' })
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import ProjectCard from '@/components/project/ProjectCard.vue'
import { useProjectStore } from '@/stores/project'
import type { Project, ProjectStatus } from '@/types/project'

const router = useRouter()
const projectStore = useProjectStore()

const currentPage = ref(1)
const pageSize = ref(12)
const keyword = ref('')
const statusFilter = ref<ProjectStatus | ''>('')

const projects = computed(() => projectStore.projects)
const total = computed(() => projectStore.total)
const loading = computed(() => projectStore.loading)

onMounted(async () => {
  await fetchProjects()
})

// 监听 statusFilter 变化，自动重新搜索
watch(statusFilter, () => {
  handleSearch()
})

const fetchProjects = async () => {
  await projectStore.fetchProjects({
    page: currentPage.value,
    page_size: pageSize.value,
    keyword: keyword.value || undefined,
    status: statusFilter.value || undefined,
  })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchProjects()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchProjects()
}

const goToProject = (project: Project) => {
  router.push(`/projects/${project.id}`)
}
</script>

<style scoped>
.projects-page {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header h2 {
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
}

.tabs {
  margin-top: 12px;
}

.loading {
  padding: 16px 0;
}

.empty {
  padding: 40px 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
