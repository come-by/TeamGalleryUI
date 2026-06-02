import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// 配置 Vue Test Utils 全局插件
config.global.plugins = [createPinia()]

// 在每个测试前设置 Pinia
beforeEach(() => {
  setActivePinia(createPinia())
})
