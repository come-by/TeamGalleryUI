import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  deleteMessage as deleteMessageApi,
  getConversationDetail,
  getConversations,
  getMessages,
  markConversationRead,
  recallMessage as recallMessageApi,
  sendMessage as sendMessageApi,
  updateConversationSettings,
} from '@/api/chat'
import type {
  ConversationDetail,
  ConversationItem,
  MessageItem,
  UpdateSettingsParams,
} from '@/types/chat'
import { handleApiError } from '@/utils/error'

/**
 * 聊天状态管理 Store
 * 管理会话列表、活跃聊天窗口、消息记录和未读计数
 */
export const useChatStore = defineStore('chat', () => {
  // ===== 会话列表 =====
  const conversations = ref<ConversationItem[]>([])
  const loading = ref(false)

  // ===== 活跃会话 =====
  const activeConversationId = ref<number | null>(null)
  const activeConversation = ref<ConversationDetail | null>(null)

  // ===== 消息 =====
  const messages = ref<MessageItem[]>([])
  const messageTotal = ref(0)
  const messageLoading = ref(false)
  const isSending = ref(false)

  /** 全局未读消息总数（铃铛红点数） */
  const totalUnreadCount = computed(() => {
    return conversations.value.reduce((sum, c) => sum + (c.unread_count || 0), 0)
  })

  // ===== 会话列表 CRUD =====

  /**
   * 获取会话列表
   *
   * @param page
   * @param pageSize
   */
  const fetchConversations = async (page = 1, pageSize = 20) => {
    loading.value = true
    try {
      const res = await getConversations(page, pageSize)
      if (res.success && res.data) {
        conversations.value = res.data.conversations || []
      } else {
        handleApiError(res.error)
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      loading.value = false
    }
  }

  /** 获取活跃会话详情 */
  const fetchActiveConversation = async () => {
    if (!activeConversationId.value) return
    try {
      const res = await getConversationDetail(activeConversationId.value)
      if (res.success && res.data) {
        activeConversation.value = res.data
      }
    } catch {
      // 静默失败
    }
  }

  /**
   * 打开聊天窗口
   *
   * @param conversationId
   */
  const openChat = async (conversationId: number) => {
    activeConversationId.value = conversationId
    await fetchActiveConversation()
    await fetchMessages(conversationId)
    // 标记已读
    try {
      await markConversationRead(conversationId)
      await fetchConversations() // 刷新未读数
    } catch {
      // 静默失败
    }
  }

  /** 关闭聊天窗口 */
  const closeChat = () => {
    activeConversationId.value = null
    activeConversation.value = null
    messages.value = []
  }

  // ===== 消息 CRUD =====

  /**
   * 加载消息列表
   *
   * @param conversationId
   * @param page
   * @param pageSize
   */
  const fetchMessages = async (conversationId?: number, page = 1, pageSize = 30) => {
    const convId = conversationId || activeConversationId.value
    if (!convId) return

    messageLoading.value = true
    try {
      const res = await getMessages(convId, page, pageSize)
      if (res.success && res.data) {
        // 消息接口返回倒序（最新在前），前端反转为正序展示
        messages.value = (res.data.messages || []).reverse()
        messageTotal.value = res.data.total || 0
      } else {
        handleApiError(res.error)
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      messageLoading.value = false
    }
  }

  /** 加载更多历史消息 */
  const loadMoreMessages = async () => {
    const convId = activeConversationId.value
    if (!convId || messages.value.length >= messageTotal.value) return

    const nextPage = Math.floor(messages.value.length / 30) + 2
    messageLoading.value = true
    try {
      const res = await getMessages(convId, nextPage)
      if (res.success && res.data) {
        const older = (res.data.messages || []).reverse()
        messages.value = [...older, ...messages.value]
        messageTotal.value = res.data.total || 0
      }
    } catch {
      // 静默失败
    } finally {
      messageLoading.value = false
    }
  }

  /**
   * 发送消息
   *
   * @param content
   */
  const sendMessage = async (content: string) => {
    const convId = activeConversationId.value
    if (!convId || !content.trim()) return false

    isSending.value = true
    try {
      const res = await sendMessageApi(convId, { content: content.trim() })
      if (res.success && res.data) {
        messages.value.push(res.data)
        await fetchConversations() // 刷新会话列表以更新 last_message
        return true
      }
      handleApiError(res.error)
    } catch (error) {
      handleApiError(error)
    } finally {
      isSending.value = false
    }
    return false
  }

  /**
   * 撤回消息
   *
   * @param messageId
   */
  const recallMessage = async (messageId: number) => {
    try {
      const res = await recallMessageApi(messageId)
      if (res.success) {
        const idx = messages.value.findIndex((m) => m.id === messageId)
        if (idx !== -1) {
          messages.value[idx].is_recalled = true
          messages.value[idx].content = ''
        }
        ElMessage.success('消息已撤回')
        return true
      }
      handleApiError(res.error)
    } catch (error) {
      handleApiError(error)
    }
    return false
  }

  /**
   * 删除本地消息
   *
   * @param messageId
   */
  const deleteLocalMessage = async (messageId: number) => {
    try {
      const res = await deleteMessageApi(messageId)
      if (res.success) {
        messages.value = messages.value.filter((m) => m.id !== messageId)
        ElMessage.success('消息已删除')
        return true
      }
      handleApiError(res.error)
    } catch (error) {
      handleApiError(error)
    }
    return false
  }

  // ===== 会话设置 =====

  /**
   * 更新会话设置
   *
   * @param conversationId
   * @param params
   */
  const updateSettings = async (conversationId: number, params: UpdateSettingsParams) => {
    try {
      const res = await updateConversationSettings(conversationId, params)
      if (res.success && res.data) {
        const conv = conversations.value.find((c) => c.conversation_id === conversationId)
        if (conv) {
          if (params.is_pinned !== undefined) conv.is_pinned = params.is_pinned
          if (params.is_muted !== undefined) conv.is_muted = params.is_muted
        }
        ElMessage.success('设置已更新')
        return true
      }
      handleApiError(res.error)
    } catch (error) {
      handleApiError(error)
    }
    return false
  }

  return {
    conversations,
    loading,
    activeConversationId,
    activeConversation,
    messages,
    messageTotal,
    messageLoading,
    isSending,
    totalUnreadCount,
    fetchConversations,
    openChat,
    closeChat,
    fetchMessages,
    loadMoreMessages,
    sendMessage,
    recallMessage,
    deleteLocalMessage,
    updateSettings,
  }
})
