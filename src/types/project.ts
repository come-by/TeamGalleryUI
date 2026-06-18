import type { User } from './user'

/** 项目状态 */
export type ProjectStatus = 'active' | 'archived'

/** 成员角色 */
export type ProjectRole = 'owner' | 'admin' | 'member'

/** 项目实体 */
export interface Project {
  id: number
  name: string
  description: string
  cover_image: string
  status: ProjectStatus
  owner_id: number
  team_id?: number
  created_at: string
  updated_at: string
  owner?: User
  members?: ProjectMember[]
  team?: {
    id: number
    name: string
    description: string
    avatar: string
  }
}

/** 项目成员 */
export interface ProjectMember {
  id?: number
  project_id: number
  user_id: number
  role: ProjectRole
  created_at: string
  user?: User
}

/** 列表查询参数 */
export interface ProjectListParams {
  page?: number
  page_size?: number
  status?: ProjectStatus
  keyword?: string
  team_id?: number
}

/** 成员输入（不包含 project_id，由后端自动填入） */
export interface MemberInput {
  user_id: number
  role?: ProjectRole
}

/** 创建请求 */
export interface ProjectCreateParams {
  name: string
  description?: string
  cover_image?: string
  team_id?: number
  members?: MemberInput[]
}

/** 更新请求 */
export interface ProjectUpdateParams {
  name?: string
  description?: string
  cover_image?: string
  status?: ProjectStatus
}

/** 添加成员请求 */
export interface AddMemberParams {
  user_id: number
  role?: ProjectRole
}

/** 更新角色请求 */
export interface UpdateMemberRoleParams {
  role: ProjectRole
}

/** 成员列表查询参数 */
export interface MemberListParams {
  page?: number
  page_size?: number
}

// ===== 项目评论 =====

/** 项目评论实体 */
export interface ProjectComment {
  id: number
  content: string
  project_id: number
  user_id: number
  user?: User
  parent_id?: number
  like_count: number
  report_count: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  replies?: ProjectComment[]
}

/** 创建项目评论请求 */
export interface ProjectCommentCreateParams {
  content: string
  parent_id?: number
}

/** 项目评论列表查询参数 */
export interface ProjectCommentListParams {
  page?: number
  page_size?: number
}
