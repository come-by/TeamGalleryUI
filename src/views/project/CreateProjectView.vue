<template>
  <div class="create-project">
    <el-card>
      <template #header>
        <h2>创建项目</h2>
      </template>
      <ProjectForm
        :loading="loading"
        submit-text="创建"
        @submit="handleSubmit"
        @cancel="$router.back()"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CreateProjectView' })
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import ProjectForm from '@/components/project/ProjectForm.vue'
import { useProjectStore } from '@/stores/project'
import type { ProjectCreateParams, ProjectUpdateParams } from '@/types/project'

const router = useRouter()
const projectStore = useProjectStore()
const loading = ref(false)

const handleSubmit = async (data: ProjectCreateParams | ProjectUpdateParams) => {
  loading.value = true
  try {
    const project = await projectStore.createNewProject(data as ProjectCreateParams)
    router.push(`/projects/${project.id}`)
  } catch (error: unknown) {
    const err = error as { message?: string }
    ElMessage.error(err.message || '创建失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-project {
  max-width: 800px;
  margin: 0 auto;
}
</style>
