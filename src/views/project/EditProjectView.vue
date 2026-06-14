<template>
  <div class="edit-project">
    <el-card>
      <template #header>
        <h2>编辑项目</h2>
      </template>
      <div v-if="loading" class="loading">
        <el-skeleton :rows="10" animated />
      </div>
      <ProjectForm
        v-else
        :initial-data="project"
        :loading="submitting"
        :show-status="true"
        submit-text="保存"
        @submit="handleSubmit"
        @cancel="$router.back()"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'EditProjectView' })
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ProjectForm from '@/components/project/ProjectForm.vue'
import { useProjectStore } from '@/stores/project'
import type { ProjectUpdateParams } from '@/types/project'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const loading = ref(false)
const submitting = ref(false)

const project = computed(() => projectStore.currentProject)

onMounted(async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    await projectStore.fetchProject(id)
  } catch (error) {
    ElMessage.error('获取项目失败')
  } finally {
    loading.value = false
  }
})

const handleSubmit = async (data: ProjectUpdateParams) => {
  submitting.value = true
  try {
    const updated = await projectStore.updateExistingProject(project.value!.id, data)
    router.push(`/projects/${updated.id}`)
  } catch (error: unknown) {
    const err = error as { message?: string }
    ElMessage.error(err.message || '更新失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.edit-project {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  padding: 16px 0;
}
</style>
