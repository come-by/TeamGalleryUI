<template>
  <router-view />
</template>

<script setup lang="ts">
defineOptions({ name: 'App' })
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial,
    sans-serif;
  background-color: var(--color-bg-page);
}
</style>
