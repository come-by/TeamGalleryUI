<template>
  <Teleport to="body">
    <transition name="chat-fade">
      <div v-if="visible" class="chat-window-overlay" @click.self="handleClose">
        <div class="chat-window">
          <!-- 头部 -->
          <div class="chat-header">
            <div class="header-left">
              <el-avatar :size="32">{{ peerName.charAt(0) }}</el-avatar>
              <span class="peer-name">{{ peerName }}</span>
            </div>
            <div class="header-right">
              <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
            </div>
          </div>

          <!-- 消息列表 -->
          <div class="chat-body" ref="messageListRef" @scroll="handleScroll">
            <div
              v-if="chatStore.messageLoading && messagesToShow.length === 0"
              class="body-loading"
            >
              <el-skeleton :rows="4" animated />
            </div>
            <div
              v-for="msg in messagesToShow"
              :key="msg.id"
              class="message-item"
              :class="{ 'is-self': msg.sender_id === userId }"
            >
              <div v-if="msg.is_recalled" class="message-recalled">
                {{ msg.sender_id === userId ? '你' : '' }}撤回了一条消息
              </div>
              <template v-else>
                <el-avatar v-if="msg.sender_id !== userId" :size="28" class="msg-avatar">
                  {{ msg.sender?.nickname?.charAt(0) || '?' }}
                </el-avatar>
                <div class="msg-bubble" :class="{ self: msg.sender_id === userId }">
                  <div class="msg-content">{{ msg.content }}</div>
                  <div class="msg-time">{{ formatMsgTime(msg.created_at) }}</div>
                </div>
                <div v-if="msg.sender_id === userId && canRecall(msg)" class="msg-actions">
                  <el-tooltip content="撤回" placement="top">
                    <el-icon class="action-icon" @click="handleRecall(msg.id)"
                      ><RefreshLeft
                    /></el-icon>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-icon class="action-icon" @click="handleDelete(msg.id)"><Delete /></el-icon>
                  </el-tooltip>
                </div>
              </template>
            </div>
          </div>

          <!-- 输入区 -->
          <div class="chat-footer">
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="2"
              placeholder="输入消息，Enter 发送"
              :disabled="chatStore.isSending"
              resize="none"
              @keydown.enter.exact.prevent="handleSend"
            />
            <el-button
              type="primary"
              size="small"
              :loading="chatStore.isSending"
              :disabled="!inputText.trim()"
              @click="handleSend"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Close, Delete, RefreshLeft } from '@element-plus/icons-vue'
import { computed, nextTick, ref, watch } from 'vue'

import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import type { MessageItem } from '@/types/chat'

defineOptions({ name: 'ChatWindow' })

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const chatStore = useChatStore()
const userStore = useUserStore()
const inputText = ref('')
const messageListRef = ref<HTMLElement | null>(null)

const userId = computed(() => userStore.user?.id)

/** 对方用户昵称 */
const peerName = computed(() => {
  if (!chatStore.activeConversation || !userStore.user) return '加载中...'
  const { user1, user2 } = chatStore.activeConversation
  const peer = user1.id === userStore.user.id ? user2 : user1
  return peer.nickname || peer.username
})

/** 展示的消息 */
const messagesToShow = computed(() => chatStore.messages)

/**
 * 判断消息是否在 5 分钟撤回窗口内
 *
 * @param msg - 消息对象
 * @returns 是否可撤回
 */
function canRecall(msg: MessageItem): boolean {
  if (!msg.created_at) return false
  const diff = Date.now() - new Date(msg.created_at).getTime()
  return diff < 5 * 60 * 1000
}

/**
 * 格式化消息时间显示
 *
 * @param dateStr - ISO 时间字符串
 * @returns 格式化后的时间文本
 */
function formatMsgTime(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return (
    date.toLocaleDateString('zh-CN') +
    ' ' +
    date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const handleScroll = () => {
  if (!messageListRef.value) return
  if (messageListRef.value.scrollTop === 0 && !chatStore.messageLoading) {
    chatStore.loadMoreMessages()
  }
}

const handleSend = async () => {
  if (!inputText.value.trim()) return
  const ok = await chatStore.sendMessage(inputText.value)
  if (ok) {
    inputText.value = ''
    scrollToBottom()
  }
}

const handleRecall = async (messageId: number) => {
  await chatStore.recallMessage(messageId)
}

const handleDelete = async (messageId: number) => {
  await chatStore.deleteLocalMessage(messageId)
}

const handleClose = () => {
  emit('close')
}

watch(
  () => props.visible,
  (val) => {
    if (val) scrollToBottom()
  },
)
watch(
  () => chatStore.messages.length,
  () => {
    scrollToBottom()
  },
)
</script>

<style scoped>
.chat-window-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 0 24px 24px 0;
  pointer-events: none;
}

.chat-window {
  width: 420px;
  height: 520px;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-white);
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  pointer-events: auto;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: #409eff;
  color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.peer-name {
  font-size: 15px;
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 8px;
}

.close-icon {
  cursor: pointer;
  font-size: 18px;
}

.close-icon:hover {
  opacity: 0.8;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  background-color: #f5f6f7;
}

.body-loading {
  padding: 16px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.message-item.is-self {
  flex-direction: row-reverse;
}

.msg-avatar {
  flex-shrink: 0;
}

.msg-bubble {
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  position: relative;
}

.msg-bubble.self {
  background-color: #95ec69;
}

.msg-content {
  font-size: 14px;
  color: var(--color-text-primary);
  word-break: break-word;
  line-height: 1.5;
}

.msg-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.message-recalled {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 4px 0;
}

.msg-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.message-item:hover .msg-actions {
  opacity: 1;
}

.action-icon {
  cursor: pointer;
  font-size: 14px;
  color: #999;
  padding: 2px;
}

.action-icon:hover {
  color: #409eff;
}

.chat-footer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--color-bg-white);
}

.chat-footer :deep(.el-textarea) {
  flex: 1;
}

.chat-footer :deep(.el-textarea__inner) {
  font-size: 14px;
}
</style>
