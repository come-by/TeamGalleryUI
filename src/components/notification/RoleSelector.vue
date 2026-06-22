<template>
  <div class="role-selector">
    <el-checkbox-group
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <el-checkbox value="admin">管理员 (admin)</el-checkbox>
      <el-checkbox value="user">普通用户 (user)</el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'RoleSelector' })

defineProps<{
  modelValue: string[]
}>()

defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()
</script>

<style scoped>
.role-selector {
  width: 100%;
}
</style>
