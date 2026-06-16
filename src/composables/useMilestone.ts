import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'

import {
  createMilestone,
  deleteMilestone,
  getMilestone,
  getMilestones,
  getMilestoneSummary,
  updateMilestone,
  updateMilestoneSort,
  updateMilestoneStatus,
} from '@/api/milestone'
import type {
  Milestone,
  MilestoneCreateParams,
  MilestoneListParams,
  MilestoneSortParams,
  MilestoneStatus,
  MilestoneSummary,
  MilestoneUpdateParams,
} from '@/types/milestone'

/**
 * 里程碑组合式函数
 * 提供里程碑列表、详情、CRUD 等操作
 *
 * @returns 里程碑操作方法和状态
 */
export function useMilestone() {
  const milestones = ref<Milestone[]>([])
  const currentMilestone = ref<Milestone | null>(null)
  const summary = ref<MilestoneSummary | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(100)

  /**
   * 获取里程碑摘要
   *
   * @param projectId - 项目 ID
   * @returns 无返回值
   */
  async function fetchSummary(projectId: number) {
    try {
      const res = await getMilestoneSummary(projectId)
      if (res.success && res.data) {
        summary.value = res.data
      }
    } catch {
      // 静默失败
    }
  }

  /**
   * 获取里程碑列表
   *
   * @param projectId - 项目 ID
   * @param params - 查询参数（可选）
   */
  async function fetchMilestones(projectId: number, params?: Partial<MilestoneListParams>) {
    loading.value = true
    try {
      const res = await getMilestones(projectId, {
        page: page.value,
        page_size: pageSize.value,
        ...params,
      })
      if (res.success && res.data) {
        milestones.value = res.data.data
        total.value = res.data.pagination.total
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取里程碑详情
   *
   * @param projectId - 项目 ID
   * @param id - 里程碑 ID
   * @returns 里程碑数据
   */
  async function fetchMilestone(projectId: number, id: number) {
    loading.value = true
    try {
      const res = await getMilestone(projectId, id)
      if (res.success && res.data) {
        currentMilestone.value = res.data
      }
      return res.data
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建里程碑
   *
   * @param projectId - 项目 ID
   * @param data - 创建参数
   * @returns 创建的里程碑数据，失败时返回 null
   */
  async function create(projectId: number, data: MilestoneCreateParams): Promise<Milestone | null> {
    loading.value = true
    try {
      const res = await createMilestone(projectId, data)
      if (res.success && res.data) {
        ElMessage.success('里程碑创建成功')
        await fetchMilestones(projectId)
        await fetchSummary(projectId)
        return res.data
      }
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新里程碑
   *
   * @param projectId - 项目 ID
   * @param id - 里程碑 ID
   * @param data - 更新参数
   * @returns 更新后的里程碑数据，失败时返回 null
   */
  async function update(
    projectId: number,
    id: number,
    data: MilestoneUpdateParams,
  ): Promise<Milestone | null> {
    loading.value = true
    try {
      const res = await updateMilestone(projectId, id, data)
      if (res.success && res.data) {
        ElMessage.success('里程碑已更新')
        await fetchMilestones(projectId)
        await fetchSummary(projectId)
        return res.data
      }
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除里程碑
   *
   * @param projectId - 项目 ID
   * @param id - 里程碑 ID
   * @returns 是否删除成功
   */
  async function remove(projectId: number, id: number): Promise<boolean> {
    loading.value = true
    try {
      const res = await deleteMilestone(projectId, id)
      if (res.success) {
        ElMessage.success('里程碑已删除')
        await fetchMilestones(projectId)
        await fetchSummary(projectId)
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 调整里程碑排序
   *
   * @param projectId - 项目 ID
   * @param id - 里程碑 ID
   * @param data - 排序参数
   * @returns 是否更新成功
   */
  async function updateSort(
    projectId: number,
    id: number,
    data: MilestoneSortParams,
  ): Promise<boolean> {
    loading.value = true
    try {
      const res = await updateMilestoneSort(projectId, id, data)
      if (res.success) {
        await fetchMilestones(projectId)
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新里程碑状态
   *
   * @param projectId - 项目 ID
   * @param id - 里程碑 ID
   * @param status - 新状态
   * @returns 更新后的里程碑数据，失败时返回 null
   */
  async function updateStatus(
    projectId: number,
    id: number,
    status: MilestoneStatus,
  ): Promise<Milestone | null> {
    loading.value = true
    try {
      const res = await updateMilestoneStatus(projectId, id, { status })
      if (res.success && res.data) {
        await fetchMilestones(projectId)
        await fetchSummary(projectId)
        return res.data
      }
      return null
    } finally {
      loading.value = false
    }
  }

  /** 完成率 */
  const completionRate = computed(() => {
    return summary.value?.completion_rate || 0
  })

  /** 逾期里程碑数 */
  const overdueCount = computed(() => {
    return summary.value?.overdue || 0
  })

  /** 下一个截止日 */
  const nextDueMilestone = computed(() => {
    return summary.value?.next_due || null
  })

  return {
    milestones,
    currentMilestone,
    summary,
    loading,
    total,
    completionRate,
    overdueCount,
    nextDueMilestone,
    fetchMilestones,
    fetchMilestone,
    fetchSummary,
    create,
    update,
    remove,
    updateSort,
    updateStatus,
  }
}
