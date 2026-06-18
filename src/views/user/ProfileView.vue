<template>
  <div class="profile">
    <!-- 展示模式 -->
    <el-card v-if="!isEditing">
      <template #header>
        <div class="card-header">
          <h2>个人中心</h2>
          <el-button type="primary" @click="startEdit">编辑资料</el-button>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ user?.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ user?.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user?.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ user?.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="个人简介">{{ user?.bio || '-' }}</el-descriptions-item>
        <el-descriptions-item label="个人网站">{{ user?.website || '-' }}</el-descriptions-item>
        <el-descriptions-item label="GitHub">{{ user?.github || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Twitter">{{ user?.twitter || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所在地">{{ user?.location || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{
          formatDate(user?.created_at ?? '')
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="actions">
        <el-button type="danger" @click="handleDeleteAccount">注销账号</el-button>
      </div>
    </el-card>

    <!-- 编辑模式 -->
    <el-card v-else-if="isEditing">
      <template #header>
        <div class="card-header">
          <h2>编辑资料</h2>
          <el-button @click="cancelEdit">取消</el-button>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="edit-form">
        <el-form-item label="用户名">
          <el-input :model-value="user?.username" disabled />
          <span class="form-tip">用户名不可修改</span>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="form.nickname"
            placeholder="请输入昵称"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="3"
            placeholder="介绍一下自己"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="个人网站" prop="website">
          <el-input v-model="form.website" placeholder="https://example.com" />
        </el-form-item>
        <el-form-item label="GitHub" prop="github">
          <el-input v-model="form.github" placeholder="GitHub 用户名" />
        </el-form-item>
        <el-form-item label="Twitter" prop="twitter">
          <el-input v-model="form.twitter" placeholder="Twitter 用户名" />
        </el-form-item>
        <el-form-item label="所在地" prop="location">
          <el-input v-model="form.location" placeholder="所在城市" maxlength="100" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 隐私设置 -->
    <el-card v-if="!isEditing" class="privacy-card">
      <template #header>
        <div class="card-header">
          <h2>隐私设置</h2>
        </div>
      </template>
      <el-form label-width="160px" class="privacy-form">
        <el-form-item label="允许被拉入项目">
          <el-switch
            v-model="allowProjectInvite"
            :loading="privacySaving"
            @change="handlePrivacyChange"
          />
          <span class="form-tip">关闭后，其他用户无法将你添加到项目中</span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ProfileView' })
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { deleteUser, updatePrivacy } from '@/api/user'
import { useUserStore } from '@/stores/user'
import type { ProfileUpdateParams } from '@/types'
import { formatDate } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)
const isEditing = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()

// 隐私设置
const allowProjectInvite = ref(true)
const privacySaving = ref(false)

const phonePattern = /^1[3-9]\d{9}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 表单数据（所有字段为 string 以兼容 v-model）
interface ProfileFormData {
  nickname: string
  email: string
  phone: string
  bio: string
  website: string
  github: string
  twitter: string
  location: string
  birthday: string
}

const form = reactive<ProfileFormData>({
  nickname: '',
  email: '',
  phone: '',
  bio: '',
  website: '',
  github: '',
  twitter: '',
  location: '',
  birthday: '',
})

const rules: FormRules<ProfileFormData> = {
  nickname: [{ max: 30, message: '昵称不能超过30个字符', trigger: 'blur' }],
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { pattern: emailPattern, message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator(_rule: any, value: any, callback: any) {
        if (!value) return callback()
        if (!phonePattern.test(value)) {
          callback(new Error('请输入有效的中国大陆手机号'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  bio: [{ max: 500, message: '个人简介不能超过500个字符', trigger: 'blur' }],
  website: [
    {
      pattern: /^$|^https?:\/\/.+/,
      message: '请输入有效的URL（以http://或https://开头）',
      trigger: 'blur',
    },
  ],
  github: [{ max: 39, message: 'GitHub用户名不能超过39个字符', trigger: 'blur' }],
  twitter: [{ max: 15, message: 'Twitter用户名不能超过15个字符', trigger: 'blur' }],
  location: [{ max: 100, message: '所在地不能超过100个字符', trigger: 'blur' }],
}

const bindForm = () => {
  if (user.value) {
    form.nickname = user.value.nickname || ''
    form.email = user.value.email || ''
    form.phone = user.value.phone || ''
    form.bio = user.value.bio || ''
    form.website = user.value.website || ''
    form.github = user.value.github || ''
    form.twitter = user.value.twitter || ''
    form.location = user.value.location || ''
  }
}

const startEdit = () => {
  bindForm()
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  formRef.value?.resetFields()
}

const handleSave = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    const updateData: ProfileUpdateParams = {
      nickname: form.nickname || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      bio: form.bio || undefined,
      website: form.website || undefined,
      github: form.github || undefined,
      twitter: form.twitter || undefined,
      location: form.location || undefined,
      birthday: form.birthday || undefined,
    }
    await userStore.updateProfile(updateData)
    isEditing.value = false
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await userStore.fetchProfile()
  // 初始化隐私设置
  if (user.value?.allow_project_invite !== undefined) {
    allowProjectInvite.value = user.value.allow_project_invite
  }
})

/**
 * 处理隐私设置变更
 *
 * @param value - 新的隐私设置值
 */
const handlePrivacyChange = async (value: boolean) => {
  privacySaving.value = true
  try {
    const res = await updatePrivacy({ allow_project_invite: value })
    if (res.success) {
      ElMessage.success('隐私设置已更新')
      // 更新本地用户状态
      await userStore.fetchProfile()
    } else {
      ElMessage.error(res.error?.message || '更新失败')
      // 恢复原值
      allowProjectInvite.value = !value
    }
  } catch (error) {
    ElMessage.error('更新失败')
    // 恢复原值
    allowProjectInvite.value = !value
  } finally {
    privacySaving.value = false
  }
}

const handleDeleteAccount = async () => {
  try {
    await ElMessageBox.confirm('确定要注销账号吗？此操作不可恢复！', '警告', {
      type: 'warning',
    })
    await deleteUser()
    ElMessage.success('账号已注销')
    userStore.logout()
    router.push('/')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('注销失败')
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.edit-form {
  max-width: 500px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.privacy-card {
  margin-top: 24px;
}

.privacy-form {
  max-width: 500px;
}
</style>
