import { onMounted, onUnmounted, ref } from 'vue'

import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'

let pollTimer: ReturnType<typeof setInterval> | null = null

/**
 * 聊天组合式函数
 * 提供聊天轮询、弹窗控制和未读计数
 *
 * @returns 聊天相关状态和方法
 */
export function useChat() {
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const chatWindowVisible = ref(false)

  /**
   * 开始轮询拉取会话列表和未读数
   *
   * @param intervalMs
   */
  const startPolling = (intervalMs = 15000) => {
    stopPolling()
    if (userStore.isLoggedIn) {
      chatStore.fetchConversations()
      pollTimer = setInterval(() => {
        chatStore.fetchConversations()
      }, intervalMs)
    }
  }

  /** 停止轮询 */
  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  /**
   * 打开聊天窗口
   *
   * @param conversationId
   */
  const openChatWindow = async (conversationId: number) => {
    await chatStore.openChat(conversationId)
    chatWindowVisible.value = true
  }

  /** 关闭聊天窗口 */
  const closeChatWindow = () => {
    chatStore.closeChat()
    chatWindowVisible.value = false
  }

  onMounted(() => {
    if (userStore.isLoggedIn) {
      startPolling()
    }
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    chatWindowVisible,
    openChatWindow,
    closeChatWindow,
    startPolling,
    stopPolling,
    chatStore,
  }
}
