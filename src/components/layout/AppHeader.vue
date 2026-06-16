<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/projects" class="logo">TeamGallery</router-link>
      <router-link to="/projects" class="nav-link">项目</router-link>
      <router-link to="/manuals" class="nav-link">手册</router-link>
    </div>
    <div class="nav-right">
      <template v-if="!isLoggedIn">
        <router-link to="/login" class="nav-link">登录</router-link>
        <el-button type="primary" size="small" @click="$router.push('/register')"> 注册 </el-button>
      </template>
      <template v-else>
        <!-- 通知铃铛 -->
        <div class="notification-bell" @click="handleBellClick">
          <el-badge
            :value="notificationStore.unreadCount"
            :hidden="!notificationStore.hasUnread"
            :max="99"
          >
            <el-icon :size="22"><Bell /></el-icon>
          </el-badge>
        </div>
        <el-dropdown @command="handleCommand">
          <span class="user-dropdown">
            <el-avatar :size="28" :src="avatar" class="user-avatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
            {{ nickname }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="favorites">我的收藏</el-dropdown-item>
              <el-dropdown-item command="likes">我的点赞</el-dropdown-item>
              <el-dropdown-item v-if="isAdmin" divided command="admin"> 管理后台 </el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppHeader' })
import { ArrowDown, Bell, UserFilled } from '@element-plus/icons-vue'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useNotification } from '@/composables/useNotification'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const { goToNotifications } = useNotification()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAdmin = computed(() => userStore.isAdmin)
const nickname = computed(() => userStore.nickname)
const avatar = computed(() => userStore.avatar)

onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchProfile()
    notificationStore.fetchUnreadCount()
  }
})

const handleBellClick = () => {
  goToNotifications()
}

type DropdownCommand = 'profile' | 'favorites' | 'likes' | 'admin' | 'logout'

const handleCommand = (command: DropdownCommand) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'likes':
      router.push('/likes')
      break
    case 'admin':
      router.push('/admin/comments')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 24px;
  background-color: var(--color-bg-white);
  box-shadow: var(--shadow-light);
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-primary);
  text-decoration: none;
  margin-right: 8px;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-primary);
  font-size: 14px;
}

.nav-link:hover {
  color: #409eff;
}

.notification-bell {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  color: var(--color-text-primary);
}

.notification-bell:hover {
  color: #409eff;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-primary);
}
</style>
