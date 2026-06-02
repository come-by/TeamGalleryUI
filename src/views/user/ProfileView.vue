<template>
  <div class="profile">
    <el-card>
      <template #header>
        <h2>个人中心</h2>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ user?.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ user?.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user?.email }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{
          user?.role === 'admin' ? '管理员' : '普通用户'
        }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{
          formatDate(user?.created_at)
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{
          user?.status === 'active' ? '已激活' : '未激活'
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="actions">
        <el-button type="danger" @click="handleDeleteAccount">注销账号</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { deleteUser } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)

onMounted(async () => {
  await userStore.fetchProfile()
})

const handleDeleteAccount = async () => {
  try {
    await ElMessageBox.confirm('确定要注销账号吗？此操作不可恢复！', '警告', {
      type: 'warning',
    })
    await deleteUser()
    ElMessage.success('账号已注销')
    userStore.logout()
    router.push('/')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('注销失败')
    }
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
}

.profile h2 {
  font-size: 18px;
  color: #333;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
