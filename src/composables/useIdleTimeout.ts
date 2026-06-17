/**
 * 闲置超时检测
 *
 * 企业安全要求：用户无操作超过指定时间后自动登出，防止离开工位后信息泄露。
 *
 * 行为：
 * - 监听用户活动（鼠标、键盘、触控、滚动）
 * - 闲置超过 `idleTime` 后弹出警告
 * - 警告持续 `warningTime` 后自动登出
 * - 用户在警告期间有活动则重置计时
 * - 通过 `enabled` 响应式控制，只在已登录时激活
 */

import { ElMessageBox } from 'element-plus'
import { onMounted, onUnmounted, type Ref, ref, watch } from 'vue'

import router from '@/router'
import { useUserStore } from '@/stores/user'

/** 默认闲置时间 30 分钟 */
const DEFAULT_IDLE_MINUTES = 30

/** 默认警告时间 1 分钟 */
const DEFAULT_WARNING_SECONDS = 60

/** 用户活动事件类型 */
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'wheel',
] as const

/**
 * 闲置超时检测组合式函数。
 *
 * @param idleTimeoutMinutes 闲置超时分钟数，默认 30
 * @param warningSeconds 警告窗口秒数，默认 60
 * @param enabled 是否启用闲置检测（如 computed(() => userStore.isLoggedIn)），默认始终启用
 * @returns useIdleTimeout 控制方法
 */
export function useIdleTimeout(
  idleTimeoutMinutes = DEFAULT_IDLE_MINUTES,
  warningSeconds = DEFAULT_WARNING_SECONDS,
  enabled: Ref<boolean> | null = null,
) {
  const lastActivity = ref(Date.now())
  const idleTimer = ref<ReturnType<typeof setTimeout> | null>(null)
  const warningTimer = ref<ReturnType<typeof setInterval> | null>(null)
  const isWarningShown = ref(false)

  const idleMs = idleTimeoutMinutes * 60 * 1000
  const isEnabled = enabled !== null ? enabled : ref(true)

  function resetActivity() {
    lastActivity.value = Date.now()
    if (isWarningShown.value) {
      isWarningShown.value = false
      clearTimers()
      if (isEnabled.value) startIdleTimer()
    }
  }

  function clearTimers() {
    if (idleTimer.value) {
      clearTimeout(idleTimer.value)
      idleTimer.value = null
    }
    if (warningTimer.value) {
      clearInterval(warningTimer.value)
      warningTimer.value = null
    }
  }

  function forceLogout() {
    clearTimers()
    const userStore = useUserStore()
    userStore.forceLogout('长时间未操作，已自动退出登录')
    router.push('/login')
  }

  function showWarning() {
    isWarningShown.value = true
    let remainingSeconds = warningSeconds

    ElMessageBox.confirm(
      `您已 ${idleTimeoutMinutes} 分钟未操作，${warningSeconds} 秒后将自动退出登录。是否继续？`,
      '安全提醒',
      {
        confirmButtonText: '继续使用',
        cancelButtonText: '退出登录',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
      },
    )
      .then(() => {
        resetActivity()
      })
      .catch(() => {
        forceLogout()
      })

    warningTimer.value = setInterval(() => {
      remainingSeconds--
      if (remainingSeconds <= 0) {
        forceLogout()
      }
    }, 1000)
  }

  function startIdleTimer() {
    clearTimers()
    if (!isEnabled.value) return
    idleTimer.value = setTimeout(() => {
      const elapsed = Date.now() - lastActivity.value
      if (elapsed >= idleMs) {
        showWarning()
      }
    }, idleMs)
  }

  function bindEvents() {
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetActivity)
    })
  }

  function unbindEvents() {
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, resetActivity)
    })
  }

  function activate() {
    bindEvents()
    startIdleTimer()
  }

  function deactivate() {
    unbindEvents()
    clearTimers()
  }

  // 启用状态变化时切换
  watch(isEnabled, (val) => {
    if (val) {
      activate()
    } else {
      deactivate()
    }
  })

  onMounted(() => {
    if (isEnabled.value) {
      activate()
    }
  })

  onUnmounted(() => {
    deactivate()
  })

  return {
    /** 手动重置闲置计时（可用于页面跳转后） */
    resetActivity,
  }
}
