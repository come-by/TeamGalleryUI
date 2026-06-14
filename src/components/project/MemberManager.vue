<template>
  <div class="member-manager">
    <div class="header">
      <h3>成员管理</h3>
      <el-button v-if="canManage" type="primary" size="small" @click="showAddDialog = true">
        添加成员
      </el-button>
    </div>

    <div v-if="memberLoading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <el-table v-else :data="members" stripe style="width: 100%">
      <el-table-column prop="user.nickname" label="昵称" min-width="120">
        <template #default="{ row }">
          {{ row.user?.nickname || row.user?.username || '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="user.username" label="用户名" min-width="120" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag
            :type="row.role === 'owner' ? 'danger' : row.role === 'admin' ? 'warning' : ''"
            size="small"
          >
            {{ PROJECT_ROLE_LABEL[row.role] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" v-if="canManage">
        <template #default="{ row }">
          <el-select
            v-if="row.role !== 'owner'"
            v-model="row.role"
            size="small"
            style="width: 100px; margin-right: 8px"
            @change="handleRoleChange(row)"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="成员" value="member" />
          </el-select>
          <el-button
            v-if="row.role !== 'owner' && row.user_id !== currentUserId"
            type="danger"
            size="small"
            @click="handleRemove(row)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加成员对话框 -->
    <el-dialog v-model="showAddDialog" title="添加成员" width="400px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="用户ID">
          <el-input-number v-model="addForm.user_id" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="addForm.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="成员" value="member" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd" :loading="adding">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MemberManager' })
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

import { useProject } from '@/composables/useProject'
import { useProjectStore } from '@/stores/project'
import { useUserStore } from '@/stores/user'
import type { Project, ProjectMember } from '@/types/project'
import { PROJECT_ROLE_LABEL } from '@/utils/constants'

const props = defineProps<{
  project: Project
}>()

const projectStore = useProjectStore()
const userStore = useUserStore()
const { canManageMembers } = useProject()

const members = computed(() => projectStore.members)
const memberLoading = computed(() => projectStore.memberLoading)
const canManage = computed(() => canManageMembers(props.project))
const currentUserId = computed(() => userStore.user?.id)

const showAddDialog = ref(false)
const adding = ref(false)
const addForm = reactive({
  user_id: 1,
  role: 'member' as 'admin' | 'member',
})

onMounted(async () => {
  await projectStore.fetchMembers(props.project.id)
})

const handleRoleChange = async (row: ProjectMember) => {
  try {
    await projectStore.updateMemberRole(props.project.id, row.user_id, { role: row.role })
    await projectStore.fetchMembers(props.project.id)
  } catch (error: unknown) {
    const err = error as { message?: string }
    ElMessage.error(err.message || '更新角色失败')
    await projectStore.fetchMembers(props.project.id)
  }
}

const handleRemove = async (row: ProjectMember) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除成员 "${row.user?.nickname || row.user?.username}" 吗？`,
      '确认移除',
      { type: 'warning' }
    )
    await projectStore.removeMember(props.project.id, row.user_id)
    await projectStore.fetchMembers(props.project.id)
  } catch (error: unknown) {
    if ((error as { reason?: string })?.reason !== 'cancel') {
      const err = error as { message?: string }
      ElMessage.error(err.message || '移除成员失败')
    }
  }
}

const handleAdd = async () => {
  if (!addForm.user_id) {
    ElMessage.warning('请输入用户ID')
    return
  }
  adding.value = true
  try {
    await projectStore.addMember(props.project.id, {
      user_id: addForm.user_id,
      role: addForm.role,
    })
    showAddDialog.value = false
    addForm.user_id = 1
    addForm.role = 'member'
    await projectStore.fetchMembers(props.project.id)
  } catch (error: unknown) {
    const err = error as { message?: string }
    ElMessage.error(err.message || '添加成员失败')
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
.member-manager {
  margin-top: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header h3 {
  margin: 0;
}

.loading {
  padding: 16px 0;
}
</style>
