import { computed, ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { isFetcherError, unknownError } from '@/shared/api'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'
import { useBuildReportFormData } from '@/shared/composables/utils/useBuildReportFormData'
import type { CreateReportDto, UpdateReportDto, ResponseReportList, ReportAuthor } from '../profile.type'
import { profileApi } from '../profile.api'

import { useAuthStore } from '@/modules/auth'

interface UseReportsOptions {
  itemId?: string
}

export function useReports(options?: UseReportsOptions) {
  const authStore = useAuthStore()
  const showPopup = useShowPopup()
  const queryClient = useQueryClient()
  const { buildReportFormData } = useBuildReportFormData()

  // --- List ---

  const list = useQuery({
    queryKey: ['profile-reports'],
    queryFn: () => profileApi.getReports(authStore.user?._id || ''),
    enabled: computed(() => !!authStore.user?._id),
  })

  // --- Item (only if itemId provided) ---

  const item = options?.itemId
    ? useQuery({
        queryKey: ['profile-report-item', options.itemId],
        queryFn: () => profileApi.getReportItem(options.itemId!),
      })
    : null

  // --- Create ---

  const errorText = ref('')

  type TypeCreateReport = Omit<CreateReportDto<ReportAuthor[], File>, 'status'>
  const createReport = async (report:TypeCreateReport, status: 'draft' | 'waiting'): Promise<boolean | void> => {
    errorText.value = ''
    if (!report.authors.length) {
      errorText.value = 'Укажите хотя бы одного докладчика'
    }
    if (!report.section) {
      errorText.value = 'Выберите секцию'
    }
    if (!report.title) {
      errorText.value = 'Укажите навзание доклада'
    }
    if (errorText.value) {
      showPopup.addErrorPopup(errorText.value)
      return
    }

    const formData = buildReportFormData.create({...report, status}, status)

    try {
      await profileApi.createReport(formData)
      queryClient.invalidateQueries({ queryKey: ['profile-reports'] })
      showPopup.addSuccessPopup('Доклад успешно создан')
      return true
    } catch (error) {
      if (isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup(unknownError.message)
      return false
    }
  }

  // --- Update ---
  type TypeUpdateReport = UpdateReportDto<ReportAuthor[], File | string>
  const updateReport = async (id: string, data: TypeUpdateReport, status: 'draft' | 'waiting'): Promise<boolean> => {
    const formData = buildReportFormData.update({...data, status})
    try {
      await profileApi.updateReport(id, formData)
      queryClient.invalidateQueries({ queryKey: ['profile-reports'] })
      queryClient.invalidateQueries({ queryKey: ['profile-report-item', id] })
      return true
    } catch (error) {
      if (isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup(unknownError.message)
      return false
    }
  }

  // --- Delete ---

  const deleteReport = async (id: string) => {
    const res = await profileApi.deleteReport(id)
    if (isFetcherError(res)) throw unknownError

    queryClient.setQueryData(['profile-reports'], (old: ResponseReportList) => ({
      ...old,
      reports: old.reports.filter(r => r._id !== id),
    }))
  }

  return {
    // List
    reports: list.data,
    reportsLoading: list.isLoading,
    reportsError: list.isError,

    // Item
    report: item?.data ?? ref(null),
    reportLoading: item?.isLoading ?? ref(false),
    reportError: item?.isError ?? ref(false),

    // Mutations
    createReport,
    updateReport,
    deleteReport,
    errorText,
  }
}
