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
import AppHeader from '@/components/layout/AppHeader.vue'

// 需要缓存的组件名称列表（与 defineOptions 中的 name 一致）
const cachedViews = ['ArticleListView', 'SearchView', 'FavoritesView', 'LikesView']
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
