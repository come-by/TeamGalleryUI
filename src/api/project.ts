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

// 项目 CRUD
export const getProjects = (
  params: ProjectListParams
): Promise<ApiResponse<PaginatedResponse<Project>>> => {
  return request.get('/projects', { params })
}

export const getProject = (id: number): Promise<ApiResponse<Project>> => {
  return request.get(`/projects/${id}`)
}

export const createProject = (data: ProjectCreateParams): Promise<ApiResponse<Project>> => {
  return request.post('/projects', data)
}

export const updateProject = (
  id: number,
  data: ProjectUpdateParams
): Promise<ApiResponse<Project>> => {
  return request.put(`/projects/${id}`, data)
}

export const deleteProject = (id: number): Promise<ApiResponse> => {
  return request.delete(`/projects/${id}`)
}

// 成员管理
export const getProjectMembers = (
  projectId: number,
  params: MemberListParams
): Promise<ApiResponse<PaginatedResponse<ProjectMember>>> => {
  return request.get(`/projects/${projectId}/members`, { params })
}

export const addProjectMember = (
  projectId: number,
  data: AddMemberParams
): Promise<ApiResponse<ProjectMember>> => {
  return request.post(`/projects/${projectId}/members`, data)
}

export const removeProjectMember = (projectId: number, userId: number): Promise<ApiResponse> => {
  return request.delete(`/projects/${projectId}/members/${userId}`)
}

export const updateProjectMemberRole = (
  projectId: number,
  userId: number,
  data: UpdateMemberRoleParams
): Promise<ApiResponse<ProjectMember>> => {
  return request.put(`/projects/${projectId}/members/${userId}/role`, data)
}
