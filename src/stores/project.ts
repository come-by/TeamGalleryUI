import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  addProjectMember,
  createProject,
  deleteProject,
  getProject,
  getProjectMembers,
  getProjects,
  removeProjectMember,
  updateProject,
  updateProjectMemberRole,
} from '@/api/project'
import type {
  AddMemberParams,
  MemberListParams,
  Project,
  ProjectCreateParams,
  ProjectListParams,
  ProjectMember,
  ProjectUpdateParams,
  UpdateMemberRoleParams,
} from '@/types/project'
import { handleApiError } from '@/utils/error'

export const useProjectStore = defineStore('project', () => {
  // 列表状态
  const projects = ref<Project[]>([])
  const total = ref(0)
  const loading = ref(false)

  // 详情状态
  const currentProject = ref<Project | null>(null)

  // 成员状态
  const members = ref<ProjectMember[]>([])
  const memberTotal = ref(0)
  const memberLoading = ref(false)

  // ===== 项目 CRUD =====

  const fetchProjects = async (params: ProjectListParams = {}) => {
    loading.value = true
    try {
      const res = await getProjects(params)
      if (res.success) {
        projects.value = res.data?.data || []
        total.value = res.data?.pagination?.total || 0
      } else {
        handleApiError(res.error)
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      loading.value = false
    }
  }

  const fetchProject = async (id: number) => {
    loading.value = true
    try {
      const res = await getProject(id)
      if (res.success) {
        currentProject.value = res.data || null
      } else {
        handleApiError(res.error)
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      loading.value = false
    }
  }

  const createNewProject = async (data: ProjectCreateParams): Promise<Project> => {
    const res = await createProject(data)
    if (res.success && res.data) {
      ElMessage.success('项目创建成功')
      return res.data
    }
    handleApiError(res.error)
    throw new Error(res.error?.message || '创建失败')
  }

  const updateExistingProject = async (id: number, data: ProjectUpdateParams): Promise<Project> => {
    const res = await updateProject(id, data)
    if (res.success && res.data) {
      ElMessage.success('项目更新成功')
      return res.data
    }
    handleApiError(res.error)
    throw new Error(res.error?.message || '更新失败')
  }

  const removeProject = async (id: number) => {
    const res = await deleteProject(id)
    if (res.success) {
      ElMessage.success('项目已删除')
      return
    }
    handleApiError(res.error)
    throw new Error(res.error?.message || '删除失败')
  }

  // ===== 成员管理 =====

  const fetchMembers = async (
    projectId: number,
    params: MemberListParams = { page: 1, page_size: 20 }
  ) => {
    memberLoading.value = true
    try {
      const res = await getProjectMembers(projectId, params)
      if (res.success) {
        members.value = res.data?.data || []
        memberTotal.value = res.data?.pagination?.total || 0
      } else {
        handleApiError(res.error)
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      memberLoading.value = false
    }
  }

  const addMember = async (projectId: number, data: AddMemberParams) => {
    const res = await addProjectMember(projectId, data)
    if (res.success) {
      ElMessage.success('成员添加成功')
      return res.data
    }
    handleApiError(res.error)
    throw new Error(res.error?.message || '添加成员失败')
  }

  const removeMember = async (projectId: number, userId: number) => {
    const res = await removeProjectMember(projectId, userId)
    if (res.success) {
      ElMessage.success('成员已移除')
      return
    }
    handleApiError(res.error)
    throw new Error(res.error?.message || '移除成员失败')
  }

  const updateMemberRole = async (
    projectId: number,
    userId: number,
    data: UpdateMemberRoleParams
  ) => {
    const res = await updateProjectMemberRole(projectId, userId, data)
    if (res.success) {
      ElMessage.success('角色更新成功')
      return res.data
    }
    handleApiError(res.error)
    throw new Error(res.error?.message || '更新角色失败')
  }

  // 清理
  const clearCurrent = () => {
    currentProject.value = null
  }

  return {
    projects,
    total,
    loading,
    currentProject,
    members,
    memberTotal,
    memberLoading,
    fetchProjects,
    fetchProject,
    createNewProject,
    updateExistingProject,
    removeProject,
    fetchMembers,
    addMember,
    removeMember,
    updateMemberRole,
    clearCurrent,
  }
})
