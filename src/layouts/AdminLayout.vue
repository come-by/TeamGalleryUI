<template>
  <div class="admin-layout">
    <el-container>
      <el-header class="admin-header">
        <router-link to="/" class="logo">TeamGallery</router-link>
        <span class="admin-title">管理后台</span>
        <el-button text @click="$router.push('/')">返回前台</el-button>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu :default-active="currentRoute" router>
            <el-menu-item index="/admin/comments">
              <el-icon><ChatDotRound /></el-icon>
              <span>评论管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/users">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view v-slot="{ Component }">
            <keep-alive :include="cachedViews">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AdminLayout' })
import { ChatDotRound, User } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRoute = computed(() => route.path as string)

// 需要缓存的组件名称列表（与 defineOptions 中的 name 一致）
const cachedViews = ['UsersView', 'CommentsView']
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.admin-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  background-color: var(--color-bg-white);
  box-shadow: var(--shadow-light);
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  text-decoration: none;
}

.admin-title {
  font-size: 16px;
  color: var(--color-text-regular);
}

.el-aside {
  background-color: var(--color-bg-white);
  border-right: 1px solid var(--color-border-light);
  min-height: calc(100vh - 60px);
}

.el-main {
  padding: 24px;
  background-color: var(--color-bg-page);
}
</style>
