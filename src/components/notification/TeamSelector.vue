<template>
  <div class="team-selector">
    <el-select
      :model-value="modelValue"
      multiple
      filterable
      placeholder="选择团队"
      :loading="loading"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <el-option v-for="team in teams" :key="team.id" :label="team.name" :value="team.id">
        <span>{{ team.name }}</span>
        <span class="member-count">{{ team.member_count || 0 }} 人</span>
      </el-option>
    </el-select>
    <div v-if="selectedTeams.length > 0" class="selected-tags">
      <el-tag
        v-for="team in selectedTeams"
        :key="team.id"
        closable
        class="team-tag"
        @close="removeTeam(team.id)"
      >
        {{ team.name }}
      </el-tag>
    </div>
    <div v-if="modelValue.length > 0" class="count-info">已选择 {{ modelValue.length }} 个团队</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'TeamSelector' })
import { computed, onMounted, ref } from 'vue'

import request from '@/api/request'
import type { ApiResponse, PaginatedResponse } from '@/types'

// API 返回的团队类型
interface TeamItem {
  id: number
  name: string
  member_count?: number
}

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const teams = ref<TeamItem[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = (await request.get('/teams', { page_size: 100 })) as ApiResponse<
      PaginatedResponse<TeamItem>
    >
    if (res.success && res.data) {
      teams.value = res.data.data || []
    }
  } catch {
    // 静默处理
  } finally {
    loading.value = false
  }
})

const selectedTeams = computed(() => {
  return teams.value.filter((t) => props.modelValue.includes(t.id))
})

const removeTeam = (id: number) => {
  emit(
    'update:modelValue',
    props.modelValue.filter((tid) => tid !== id),
  )
}
</script>

<style scoped>
.team-selector {
  width: 100%;
}

.team-selector .el-select {
  width: 100%;
}

.member-count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-left: 8px;
}

.selected-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.team-tag {
  cursor: pointer;
}

.count-info {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
