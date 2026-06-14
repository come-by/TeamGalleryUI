/** 里程碑状态 */
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

/** 里程碑实体 */
export interface Milestone {
  id: number
  project_id: number
  name: string
  description: string
  status: MilestoneStatus
  display_status: MilestoneStatus // 前端展示状态（含动态 overdue）
  due_date: string | null
  completed_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

/** 里程碑摘要统计 */
export interface MilestoneSummary {
  total: number
  completed: number
  in_progress: number
  pending: number
  overdue: number
  completion_rate: number
  next_due: {
    id: number
    name: string
    due_date: string | null
  } | null
}

/** 列表查询参数 */
export interface MilestoneListParams {
  status?: string // 逗号分隔多状态
  sort_by?: 'sort_order' | 'due_date' | 'created_at'
  page?: number
  page_size?: number
}

/** 创建里程碑请求 */
export interface MilestoneCreateParams {
  name: string
  description?: string
  due_date?: string | null
  sort_order?: number
}

/** 更新里程碑请求 */
export interface MilestoneUpdateParams {
  name?: string
  description?: string
  due_date?: string | null
  sort_order?: number
}

/** 调整排序请求 */
export interface MilestoneSortParams {
  sort_order?: number
  before_id?: number
}

/** 更新状态请求 */
export interface MilestoneStatusParams {
  status: MilestoneStatus
}
