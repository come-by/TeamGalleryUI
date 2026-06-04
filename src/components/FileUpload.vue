<template>
  <div class="file-upload">
    <!-- 拖拽上传区域 -->
    <div
      class="upload-dropzone"
      :class="{ 'is-dragover': isDragOver, 'is-disabled': uploading }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="onDrop"
      @click="inputRef?.click()"
    >
      <input
        ref="inputRef"
        type="file"
        :accept="accept"
        :multiple="maxFiles !== 1"
        style="display: none"
        @change="onInputChange"
      />

      <div class="upload-placeholder">
        <el-icon class="upload-icon" :size="48"><UploadFilled /></el-icon>
        <p class="upload-text">
          <span v-if="uploading">上传中...</span>
          <span v-else>拖拽文件到此处，或<em>点击选择</em></span>
        </p>
        <p class="upload-hint">
          支持 {{ acceptHint }}，单个文件不超过 {{ maxSizeHint }}
          <template v-if="maxFiles">，最多 {{ maxFiles }} 个文件</template>
        </p>
      </div>
    </div>

    <!-- 总进度条 -->
    <div v-if="fileList.length > 0 && uploading" class="total-progress">
      <span class="total-progress-label">总进度</span>
      <el-progress
        :percentage="totalProgress"
        :status="totalProgress === 100 ? 'success' : undefined"
        :stroke-width="16"
        :text-inside="true"
      />
    </div>

    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="file-list">
      <div v-for="item in fileList" :key="item.uid" class="file-item" :class="`is-${item.status}`">
        <!-- 文件缩略图 -->
        <div class="file-thumb">
          <img v-if="item.thumbUrl" :src="item.thumbUrl" :alt="item.name" />
          <el-icon v-else :size="28"><Document /></el-icon>
        </div>

        <!-- 文件信息 -->
        <div class="file-info">
          <div class="file-name" :title="item.name">{{ item.name }}</div>
          <div class="file-size">{{ formatSize(item.size) }}</div>
        </div>

        <!-- 进度条 -->
        <div class="file-progress">
          <el-progress
            v-if="item.status === 'uploading'"
            :percentage="item.progress"
            :stroke-width="12"
          />
          <el-progress
            v-else-if="item.status === 'success'"
            :percentage="100"
            :stroke-width="12"
            status="success"
          />
          <el-progress
            v-else-if="item.status === 'error'"
            :percentage="0"
            :stroke-width="12"
            status="exception"
          />
        </div>

        <!-- 状态文字 -->
        <div class="file-status">
          <el-tag v-if="item.status === 'success'" type="success" size="small">成功</el-tag>
          <el-tag
            v-else-if="item.status === 'error'"
            type="danger"
            size="small"
            :title="item.error"
          >
            失败
          </el-tag>
          <el-tag v-else-if="item.status === 'cancelled'" size="small">已取消</el-tag>
          <span v-else-if="item.status === 'uploading'">{{ item.progress }}%</span>
        </div>

        <!-- 操作按钮 -->
        <div class="file-actions">
          <el-button
            v-if="item.status === 'error' || item.status === 'cancelled'"
            type="primary"
            link
            size="small"
            @click="retryFile(item.uid)"
          >
            重试
          </el-button>
          <el-button
            v-if="item.status === 'uploading'"
            type="warning"
            link
            size="small"
            @click="cancelFile(item.uid)"
          >
            取消
          </el-button>
          <el-button type="danger" link size="small" @click="removeFile(item.uid)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div v-if="fileList.length > 0" class="upload-actions">
      <el-button :disabled="uploading || pendingCount === 0" type="primary" @click="startUpload">
        开始上传
      </el-button>
      <el-button v-if="uploading" type="warning" @click="cancelAllUploads"> 取消全部 </el-button>
      <el-button v-if="hasError" type="primary" @click="retryAll"> 重试全部 </el-button>
      <el-button @click="clearAll">清空列表</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { useUpload, type UploadOptions } from '@/composables/useUpload'

const props = withDefaults(
  defineProps<{
    accept?: string
    maxSize?: number
    maxFiles?: number
    url?: string
    concurrency?: number
    retries?: number
    autoUpload?: boolean
  }>(),
  {
    accept: '.jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.doc,.docx,.zip',
    maxSize: 100 * 1024 * 1024,
    maxFiles: 0,
    url: '/upload/file',
    concurrency: 3,
    retries: 3,
    autoUpload: false,
  }
)

const _emit = defineEmits<{
  success: [files: Array<{ url: string; filename: string }>]
  error: [file: { name: string; error: string }]
  complete: []
}>()

const inputRef = ref<HTMLInputElement>()
const isDragOver = ref(false)

const uploadOptions: UploadOptions = {
  url: props.url,
  accept: props.accept,
  maxSize: props.maxSize,
  maxFiles: props.maxFiles,
  concurrency: props.concurrency,
  retries: props.retries,
  autoUpload: props.autoUpload,
}

const {
  fileList,
  uploading,
  totalProgress,
  addFiles,
  removeFile,
  upload,
  cancelAll,
  retry,
  clearFiles,
} = useUpload(uploadOptions)

const acceptHint = computed(() => {
  return props.accept
    .split(',')
    .map((t) => t.trim())
    .join('、')
})

const maxSizeHint = computed(() => {
  if (!props.maxSize) return '无限制'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = props.maxSize
  let i = 0
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(0)} ${units[i]}`
})

const pendingCount = computed(
  () => fileList.filter((f) => f.status === 'pending' || f.status === 'error').length
)
const hasError = computed(() =>
  fileList.some((f) => f.status === 'error' || f.status === 'cancelled')
)

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  if (e.dataTransfer?.files) {
    addFiles(e.dataTransfer.files)
  }
}

function onInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    addFiles(target.files)
  }
  target.value = ''
}

function retryFile(uid: string) {
  retry(uid)
}

function cancelFile(uid: string) {
  // 直接通过 AbortController 取消
  removeFile(uid)
}

function cancelAllUploads() {
  cancelAll()
}

function startUpload() {
  upload()
}

function retryAll() {
  retry()
}

function clearAll() {
  clearFiles()
  isDragOver.value = false
}
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-dropzone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-dropzone:hover,
.upload-dropzone.is-dragover {
  border-color: #409eff;
  background: #ecf5ff;
}

.upload-dropzone.is-disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-icon {
  color: #c0c4cc;
  margin-bottom: 12px;
}

.upload-dropzone:hover .upload-icon,
.upload-dropzone.is-dragover .upload-icon {
  color: #409eff;
}

.upload-text {
  margin: 0 0 8px;
  font-size: 14px;
  color: #606266;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-hint {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.total-progress {
  margin-top: 16px;
}

.total-progress-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  display: block;
}

.file-list {
  margin-top: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.file-item:hover {
  border-color: #c0c4cc;
  background: #f5f7fa;
}

.file-item.is-error {
  border-color: #f56c6c;
  background: #fef0f0;
}

.file-thumb {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}

.file-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.file-progress {
  width: 160px;
  flex-shrink: 0;
}

.file-status {
  width: 50px;
  flex-shrink: 0;
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.file-actions {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

.upload-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>
