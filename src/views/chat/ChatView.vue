<template>
  <div class="chat-page">
    <el-card>
      <template #header>
        <div class="page-header">
          <h2>娑堟伅</h2>
        </div>
      </template>

      <!-- 浼氳瘽鍒楄〃 -->
      <div v-if="chatStore.loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="chatStore.conversations.length === 0" class="empty">
        <el-empty description="鏆傛棤娑堟伅" />
      </div>
      <div v-else class="conversation-list">
        <div
          v-for="conv in sortedConversations"
          :key="conv.conversation_id"
          class="conv-card"
          :class="{ unread: conv.unread_count > 0, muted: conv.is_muted }"
          @click="handleOpenChat(conv.conversation_id)"
        >
          <el-badge
            :value="conv.unread_count"
            :hidden="!conv.unread_count"
            :max="99"
            class="conv-badge"
          >
            <el-avatar :size="44">
              {{ conv.target_user.nickname.charAt(0) }}
            </el-avatar>
          </el-badge>
          <div class="conv-body">
            <div class="conv-top">
              <span class="conv-name">
                <span v-if="conv.is_pinned" class="pin-icon">馃搶</span>
                {{ conv.target_user.nickname }}
              </span>
              <span class="conv-time">{{ formatRelativeTime(conv.last_message_at) }}</span>
            </div>
            <div class="conv-bottom">
              <span class="conv-preview">{{ conv.last_message || '鏆傛棤娑堟伅' }}</span>
              <span v-if="conv.is_muted" class="mute-icon">馃敃</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ChatView' })
import { computed, onMounted } from 'vue'

import { useChat } from '@/composables/useChat'
import { useChatStore } from '@/stores/chat'
import { formatRelativeTime } from '@/utils/format'

const chatStore = useChatStore()
const { openChatWindow } = useChat()

onMounted(() => {
  chatStore.fetchConversations()
})

/** 鎺掑簭锛氱疆椤朵紭鍏堛€佹寜鏃堕棿鍊掑簭 */
const sortedConversations = computed(() => {
  return [...chatStore.conversations].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
    const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
    return bTime - aTime
  })
})

const handleOpenChat = (conversationId: number) => {
  openChatWindow(conversationId)
}
</script>

<style scoped>
.chat-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading {
  padding: 16px 0;
}

.empty {
  padding: 48px 0;
}

.conversation-list {
  display: flex;
  flex-direction: column;
}

.conv-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.conv-card:hover {
  background-color: var(--el-fill-color-light);
}

.conv-card.unread {
  background-color: #f0f7ff;
}

.conv-card.muted {
  opacity: 0.7;
}

.conv-badge {
  flex-shrink: 0;
}

.conv-body {
  flex: 1;
  min-width: 0;
}

.conv-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.conv-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.pin-icon {
  margin-right: 4px;
}

.conv-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  margin-left: 8px;
}

.conv-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conv-preview {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mute-icon {
  flex-shrink: 0;
  margin-left: 8px;
}
</style>
