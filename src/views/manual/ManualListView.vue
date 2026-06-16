<template>
  <div class="manuals-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>操作手册</h2>
        </div>
      </template>
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="manuals.length === 0" class="empty">
        <el-empty description="暂无操作手册" />
      </div>
      <div v-else class="manual-list">
        <RecycleScroller
          class="scroller"
          :items="manuals"
          :item-size="100"
          key-field="id"
          v-slot="{ item: manual }"
        >
          <el-card class="manual-item" shadow="hover" @click="goToManual(manual.id)">
            <h3>{{ manual.title }}</h3>
            <p class="summary">{{ manual.summary || '暂无摘要' }}</p>
            <div class="meta">
              <span>作者: {{ manual.user?.nickname || manual.user?.username || '未知' }}</span>
              <span>
                <el-icon><view /></el-icon> {{ manual.view_count }}
              </span>
              <span>{{ formatDate(manual.published_at || manual.created_at) }}</span>
            </div>
          </el-card>
        </RecycleScroller>
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
defineOptions({ name: 'ManualListView' })
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getManuals } from '@/api/manual'
import type { Article } from '@/types'
import { formatDate } from '@/utils/format'

const router = useRouter()

const manuals = ref<Article[]>([])
const total = ref(0)
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(() => {
  fetchManuals()
})

const fetchManuals = async () => {
  loading.value = true
  try {
    const res = await getManuals(currentPage.value, pageSize.value)
    if (res.success && res.data) {
      manuals.value = res.data.data || []
      total.value = res.data.pagination?.total || 0
    }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchManuals()
}

const goToManual = (id: number) => {
  router.push(`/manuals/${id}`)
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.manual-item {
  margin-bottom: 12px;
  cursor: pointer;
}

.manual-item h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.summary {
  color: var(--color-text-secondary);
  margin: 0 0 8px;
}

.meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
