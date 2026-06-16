<template>
  <div class="admin-users">
    <el-card>
      <template #header>
        <h2>用户管理</h2>
      </template>
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="phone" label="电话">
          <template #default="{ row }">
            {{ row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
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
defineOptions({ name: 'UsersView' })
import { onMounted, ref } from 'vue'

import { getUsers } from '@/api/admin'
import type { User } from '@/types'
import { reportError } from '@/utils/error-report'
import { formatDate } from '@/utils/format'

const users = ref<User[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

onMounted(async () => {
  await fetchUsers()
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers({
      page: currentPage.value,
      page_size: pageSize.value,
    })
    if (res.success) {
      users.value = res.data?.data || []
      total.value = res.data?.pagination?.total || 0
    }
  } catch (error) {
    reportError(error, { type: 'fetch-users' })
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchUsers()
}
</script>

<style scoped>
.admin-users h2 {
  font-size: 18px;
  color: #333;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
