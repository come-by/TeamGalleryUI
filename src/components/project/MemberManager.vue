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
    <el-dialog v-model="showAddDialog" title="添加成员" width="500px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="用户">
          <el-autocomplete
            v-model="searchKeyword"
            :fetch-suggestions="handleSearch"
            placeholder="输入用户名或昵称搜索"
            clearable
            @select="handleSelectUser"
            style="width: 100%"
          >
            <template #default="{ item }">
              <div class="user-option">
                <el-avatar v-if="item.avatar" :src="item.avatar" :size="24" />
                <el-avatar v-else :size="24">
                  {{ (item.nickname || item.username || '?')[0] }}
                </el-avatar>
                <span class="user-info">
                  <span class="user-nickname">{{ item.nickname || item.username }}</span>
                  <span class="user-username">@{{ item.username }}</span>
                </span>
              </div>
            </template>
          </el-autocomplete>
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

import { searchUsers } from '@/api/user'
import { useProject } from '@/composables/useProject'
import { useProjectStore } from '@/stores/project'
import { useUserStore } from '@/stores/user'
import type { ApiError } from '@/types'
import type { UserBrief } from '@/types/chat'
import type { Project, ProjectMember } from '@/types/project'
import { PROJECT_ROLE_LABEL } from '@/utils/constants'
import { getErrorMessage } from '@/utils/error'

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
  user_id: 0,
  role: 'member' as 'admin' | 'member',
})

// 用户搜索相关
const searchKeyword = ref('')
const searchResults = ref<UserBrief[]>([])
const searchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  await projectStore.fetchMembers(props.project.id)
})

/**
 * 搜索用户（防抖）
 *
 * @param keyword - 搜索关键词
 */
const handleSearch = (keyword: string) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (!keyword.trim()) {
    searchResults.value = []
    return
  }

  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      const res = await searchUsers(keyword, 1, 10)
      if (res.success && res.data) {
        searchResults.value = res.data.data
      }
    } catch (error) {
      console.error('搜索用户失败:', error)
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

/**
 * 选择用户
 *
 * @param user - 选中的用户信息
 */
const handleSelectUser = (user: UserBrief) => {
  addForm.user_id = user.id
  searchKeyword.value = user.nickname || user.username
  searchResults.value = []
}

const handleRoleChange = async (row: ProjectMember) => {
  try {
    await projectStore.updateMemberRole(props.project.id, row.user_id, { role: row.role })
    await projectStore.fetchMembers(props.project.id)
  } catch (error: unknown) {
    const apiError = error as ApiError
    ElMessage.error(getErrorMessage(apiError))
    await projectStore.fetchMembers(props.project.id)
  }
}

const handleRemove = async (row: ProjectMember) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除成员 "${row.user?.nickname || row.user?.username}" 吗？`,
      '确认移除',
      { type: 'warning' },
    )
    await projectStore.removeMember(props.project.id, row.user_id)
    await projectStore.fetchMembers(props.project.id)
  } catch (error: unknown) {
    if ((error as { reason?: string })?.reason !== 'cancel') {
      const apiError = error as ApiError
      ElMessage.error(getErrorMessage(apiError))
    }
  }
}

const handleAdd = async () => {
  if (!addForm.user_id) {
    ElMessage.warning('请选择用户')
    return
  }
  adding.value = true
  try {
    await projectStore.addMember(props.project.id, {
      user_id: addForm.user_id,
      role: addForm.role,
    })
    showAddDialog.value = false
    addForm.user_id = 0
    addForm.role = 'member'
    searchKeyword.value = ''
    searchResults.value = []
    await projectStore.fetchMembers(props.project.id)
  } catch (error: unknown) {
    const apiError = error as ApiError
    ElMessage.error(getErrorMessage(apiError))
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

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.user-nickname {
  font-size: 14px;
  color: #303133;
}

.user-username {
  font-size: 12px;
  color: #909399;
}
</style>
