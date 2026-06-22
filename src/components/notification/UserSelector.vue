<template>
  <div class="user-selector">
    <el-select
      :model-value="modelValue"
      multiple
      filterable
      remote
      reserve-keyword
      placeholder="搜索并选择用户"
      :remote-method="searchUsers"
      :loading="searching"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <el-option
        v-for="user in options"
        :key="user.id"
        :label="user.nickname || user.username"
        :value="user.id"
      >
        <span>{{ user.nickname || user.username }}</span>
        <span class="user-username">{{ user.username }}</span>
      </el-option>
    </el-select>
    <div v-if="selectedUsers.length > 0" class="selected-tags">
      <el-tag
        v-for="user in selectedUsers"
        :key="user.id"
        closable
        class="user-tag"
        @close="removeUser(user.id)"
      >
        {{ user.nickname || user.username }}
      </el-tag>
    </div>
    <div v-if="modelValue.length > 0" class="count-info">已选择 {{ modelValue.length }} 位用户</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'UserSelector' })
import { computed, ref } from 'vue'

import { searchUsers as apiSearchUsers } from '@/api/user'

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const options = ref<{ id: number; username: string; nickname: string }[]>([])
const searching = ref(false)

const searchUsers = async (query: string) => {
  if (!query) {
    options.value = []
    return
  }
  searching.value = true
  try {
    const res = await apiSearchUsers(query, 1, 20)
    if (res.success && res.data) {
      options.value = res.data.data || []
    }
  } catch {
    // 静默处理
  } finally {
    searching.value = false
  }
}

const selectedUsers = computed(() => {
  return options.value.filter((u) => props.modelValue.includes(u.id))
})

const removeUser = (id: number) => {
  emit(
    'update:modelValue',
    props.modelValue.filter((uid) => uid !== id),
  )
}
</script>

<style scoped>
.user-selector {
  width: 100%;
}

.user-selector .el-select {
  width: 100%;
}

.user-username {
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

.user-tag {
  cursor: pointer;
}

.count-info {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
