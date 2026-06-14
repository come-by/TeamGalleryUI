import { useUserStore } from '@/stores/user'
import type { Project, ProjectRole, ProjectStatus } from '@/types/project'
import { PROJECT_ROLE, PROJECT_STATUS } from '@/utils/constants'

/**
 * 项目权限与状态组合式函数
 * 提供项目权限判断、角色查询和状态映射功能
 *
 * @returns 项目权限判断方法和状态映射
 * @example
 * ```ts
 * const { canEdit, canDelete, statusType } = useProject()
 * if (canEdit(project)) {
 *   // 显示编辑按钮
 * }
 * ```
 */
export function useProject() {
  const userStore = useUserStore()

  /**
   * 获取当前用户在项目中的角色
   *
   * @param project - 项目对象
   * @returns 用户角色，非项目成员返回 null
   */
  function getUserRoleInProject(project: Project): ProjectRole | null {
    if (!userStore.user || !project.members) return null
    const member = project.members.find((m) => m.user_id === userStore.user!.id)
    return member?.role || null
  }

  /**
   * 判断当前用户是否为项目 owner
   *
   * @param project - 项目对象
   * @returns 是否为 owner
   */
  function isOwner(project: Project): boolean {
    return userStore.user?.id === project.owner_id
  }

  /**
   * 判断当前用户是否可编辑项目（owner 或 admin）
   *
   * @param project - 项目对象
   * @returns 是否可编辑
   */
  function canEdit(project: Project): boolean {
    if (isOwner(project)) return true
    const role = getUserRoleInProject(project)
    return role === PROJECT_ROLE.ADMIN
  }

  /**
   * 判断当前用户是否可删除项目（仅 owner）
   *
   * @param project - 项目对象
   * @returns 是否可删除
   */
  function canDelete(project: Project): boolean {
    return isOwner(project)
  }

  /**
   * 判断当前用户是否可管理项目成员（owner 或 admin）
   *
   * @param project - 项目对象
   * @returns 是否可管理成员
   */
  function canManageMembers(project: Project): boolean {
    if (isOwner(project)) return true
    const role = getUserRoleInProject(project)
    return role === PROJECT_ROLE.ADMIN
  }

  /**
   * 判断当前用户是否为项目成员
   *
   * @param project - 项目对象
   * @returns 是否为项目成员
   */
  function isProjectMember(project: Project): boolean {
    return getUserRoleInProject(project) !== null
  }

  /**
   * 获取项目状态对应的 Element Plus 标签类型
   *
   * @param status - 项目状态
   * @returns Element Plus tag type
   */
  function statusType(status: ProjectStatus): '' | 'success' | 'info' {
    return status === PROJECT_STATUS.ACTIVE ? 'success' : 'info'
  }

  return {
    getUserRoleInProject,
    isOwner,
    canEdit,
    canDelete,
    canManageMembers,
    isProjectMember,
    statusType,
  }
}
