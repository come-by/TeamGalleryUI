<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/" class="logo">TeamGallery</router-link>
      <router-link to="/articles" class="nav-link">文章</router-link>
      <router-link to="/projects" class="nav-link">项目</router-link>
    </div>
    <div class="nav-center">
      <el-select
        v-model="searchQuery"
        filterable
        remote
        reserve-keyword
        placeholder="搜索文章"
        :remote-method="handleSearch"
        :loading="searchLoading"
        class="search-select"
        @keyup.enter="goToSearch"
        @change="goToSearch"
      >
        <el-option v-for="item in suggestions" :key="item" :label="item" :value="item" />
      </el-select>
    </div>
    <div class="nav-right">
      <template v-if="!isLoggedIn">
        <router-link to="/login" class="nav-link">登录</router-link>
        <el-button type="primary" size="small" @click="$router.push('/register')"> 注册 </el-button>
      </template>
      <template v-else>
        <el-dropdown @command="handleCommand">
          <span class="user-dropdown">
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useSearch } from '@/composables/useSearch'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const { searchQuery, suggestions, searchLoading, handleSearch } = useSearch()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAdmin = computed(() => userStore.isAdmin)
const nickname = computed(() => userStore.nickname)

onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchProfile()
  }
})

const goToSearch = () => {
  if (searchQuery.value) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
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
  color: #409eff;
  text-decoration: none;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-primary);
  font-size: 14px;
}

.nav-link:hover {
  color: #409eff;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.search-select {
  width: 300px;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-primary);
}
</style>
