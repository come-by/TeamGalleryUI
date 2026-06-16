import type { ApiResponse, PaginatedResponse } from '@/types'
import type {
  Milestone,
  MilestoneCreateParams,
  MilestoneListParams,
  MilestoneSortParams,
  MilestoneStatusParams,
  MilestoneSummary,
  MilestoneUpdateParams,
} from '@/types/milestone'

import request from './request'

/**
 * 获取里程碑列表
 *
 * @param projectId - 项目 ID
 * @param params - 查询参数
 * @returns 里程碑分页数据
 */
export const getMilestones = (
  projectId: number,
  params: MilestoneListParams,
): Promise<ApiResponse<PaginatedResponse<Milestone>>> => {
  return request.get(`/projects/${projectId}/milestones`, { params })
}

/**
 * 获取里程碑详情
 *
 * @param projectId - 项目 ID
 * @param id - 里程碑 ID
 * @returns 里程碑数据
 */
export const getMilestone = (projectId: number, id: number): Promise<ApiResponse<Milestone>> => {
  return request.get(`/projects/${projectId}/milestones/${id}`)
}

/**
 * 创建里程碑
 *
 * @param projectId - 项目 ID
 * @param data - 创建参数
 * @returns 创建的里程碑数据
 */
export const createMilestone = (
  projectId: number,
  data: MilestoneCreateParams,
): Promise<ApiResponse<Milestone>> => {
  return request.post(`/projects/${projectId}/milestones`, data)
}

/**
 * 更新里程碑
 *
 * @param projectId - 项目 ID
 * @param id - 里程碑 ID
 * @param data - 更新参数
 * @returns 更新后的里程碑数据
 */
export const updateMilestone = (
  projectId: number,
  id: number,
  data: MilestoneUpdateParams,
): Promise<ApiResponse<Milestone>> => {
  return request.put(`/projects/${projectId}/milestones/${id}`, data)
}

/**
 * 删除里程碑
 *
 * @param projectId - 项目 ID
 * @param id - 里程碑 ID
 * @returns 操作结果
 */
export const deleteMilestone = (projectId: number, id: number): Promise<ApiResponse> => {
  return request.delete(`/projects/${projectId}/milestones/${id}`)
}

/**
 * 调整里程碑排序
 *
 * @param projectId - 项目 ID
 * @param id - 里程碑 ID
 * @param data - 排序参数
 * @returns 操作结果
 */
export const updateMilestoneSort = (
  projectId: number,
  id: number,
  data: MilestoneSortParams,
): Promise<ApiResponse> => {
  return request.put(`/projects/${projectId}/milestones/${id}/sort`, data)
}

/**
 * 更新里程碑状态
 *
 * @param projectId - 项目 ID
 * @param id - 里程碑 ID
 * @param data - 状态参数
 * @returns 更新后的里程碑数据
 */
export const updateMilestoneStatus = (
  projectId: number,
  id: number,
  data: MilestoneStatusParams,
): Promise<ApiResponse<Milestone>> => {
  return request.put(`/projects/${projectId}/milestones/${id}/status`, data)
}

/**
 * 获取里程碑摘要统计
 *
 * @param projectId - 项目 ID
 * @returns 里程碑摘要数据
 */
export const getMilestoneSummary = (projectId: number): Promise<ApiResponse<MilestoneSummary>> => {
  return request.get(`/projects/${projectId}/milestones/summary`)
}
