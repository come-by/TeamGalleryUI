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
          <slot />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChatDotRound, User } from '@element-plus/icons-vue'

const route = useRoute()
const currentRoute = computed(() => route.path as string)
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
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  text-decoration: none;
}

.admin-title {
  font-size: 16px;
  color: #666;
}

.el-aside {
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  min-height: calc(100vh - 60px);
}

.el-main {
  padding: 24px;
  background-color: #f5f7fa;
}
</style>
