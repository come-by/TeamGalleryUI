<template>
  <div class="default-layout">
    <el-container>
      <el-header>
        <AppHeader />
      </el-header>
      <el-main>
        <router-view v-slot="{ Component }">
          <keep-alive :include="cachedViews">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
      <el-footer>
        <p>TeamGallery &copy; 2026</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DefaultLayout' })
import { computed } from 'vue'

import AppHeader from '@/components/layout/AppHeader.vue'
import { useIdleTimeout } from '@/composables/useIdleTimeout'
import { useSessionMonitor } from '@/composables/useSessionMonitor'
import { useUserStore } from '@/stores/user'

// 需要缓存的组件名称列表（与 defineOptions 中的 name 一致）
const cachedViews = ['ArticleListView', 'SearchView', 'FavoritesView', 'LikesView']

// 企业安全：会话监控始终运行（内部跳过未登录状态）
const userStore = useUserStore()
useSessionMonitor()

// 闲置超时仅在已登录时启用
useIdleTimeout(
  30, // 30 分钟无操作
  60, // 1 分钟警告时间
  computed(() => userStore.isLoggedIn), // 仅在已登录时启用
)
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
}

.el-header {
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.el-main {
  min-height: calc(100vh - 120px);
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.el-footer {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 12px;
  padding: 16px;
}
</style>
