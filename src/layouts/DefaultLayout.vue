<template>
  <div class="default-layout">
    <el-container>
      <el-header>
        <AppHeader />
      </el-header>
      <el-main>
        <slot />
      </el-main>
      <el-footer>
        <p>TeamGallery &copy; 2026</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
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
  color: #999;
  font-size: 12px;
  padding: 16px;
}
</style>
