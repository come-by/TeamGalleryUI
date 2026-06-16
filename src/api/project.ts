import type { ApiResponse, PaginatedResponse } from '@/types'
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

import request from './request'

// ==================== 项目 CRUD ====================

/**
 * 获取项目列表
 *
 * @param params - 查询参数
 * @returns 项目分页数据
 */
export const getProjects = (
  params: ProjectListParams,
): Promise<ApiResponse<PaginatedResponse<Project>>> => {
  return request.get('/projects', params)
}

/**
 * 获取项目详情
 *
 * @param id - 项目 ID
 * @returns 项目数据
 */
export const getProject = (id: number): Promise<ApiResponse<Project>> => {
  return request.get(`/projects/${id}`)
}

/**
 * 创建项目
 *
 * @param data - 项目创建参数
 * @returns 创建的项目数据
 */
export const createProject = (data: ProjectCreateParams): Promise<ApiResponse<Project>> => {
  return request.post('/projects', data)
}

/**
 * 更新项目
 *
 * @param id - 项目 ID
 * @param data - 项目更新参数
 * @returns 更新后的项目数据
 */
export const updateProject = (
  id: number,
  data: ProjectUpdateParams,
): Promise<ApiResponse<Project>> => {
  return request.put(`/projects/${id}`, data)
}

/**
 * 删除项目
 *
 * @param id - 项目 ID
 * @returns 操作结果
 */
export const deleteProject = (id: number): Promise<ApiResponse> => {
  return request.delete(`/projects/${id}`)
}

// ==================== 成员管理 ====================

/**
 * 获取项目成员列表
 *
 * @param projectId - 项目 ID
 * @param params - 查询参数
 * @returns 成员分页数据
 */
export const getProjectMembers = (
  projectId: number,
  params: MemberListParams,
): Promise<ApiResponse<PaginatedResponse<ProjectMember>>> => {
  return request.get(`/projects/${projectId}/members`, { params })
}

/**
 * 添加项目成员
 *
 * @param projectId - 项目 ID
 * @param data - 成员添加参数
 * @returns 新成员数据
 */
export const addProjectMember = (
  projectId: number,
  data: AddMemberParams,
): Promise<ApiResponse<ProjectMember>> => {
  return request.post(`/projects/${projectId}/members`, data)
}

/**
 * 移除项目成员
 *
 * @param projectId - 项目 ID
 * @param userId - 用户 ID
 * @returns 操作结果
 */
export const removeProjectMember = (projectId: number, userId: number): Promise<ApiResponse> => {
  return request.delete(`/projects/${projectId}/members/${userId}`)
}

/**
 * 更新项目成员角色
 *
 * @param projectId - 项目 ID
 * @param userId - 用户 ID
 * @param data - 角色更新参数
 * @returns 更新后的成员数据
 */
export const updateProjectMemberRole = (
  projectId: number,
  userId: number,
  data: UpdateMemberRoleParams,
): Promise<ApiResponse<ProjectMember>> => {
  return request.put(`/projects/${projectId}/members/${userId}/role`, data)
}
