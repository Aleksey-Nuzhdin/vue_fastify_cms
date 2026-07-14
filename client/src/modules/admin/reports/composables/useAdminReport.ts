import { computed, ref } from "vue";
import { useQueryClient, useQuery } from '@tanstack/vue-query'
import { adminReportsApi as api } from '../admin.reports.api'
import type { UpdateReportDto,ReportAuthor } from '../admin.reports.type'
import { useBuildReportFormData } from '@/shared/composables/utils/useBuildReportFormData'
import { useShowPopup } from "@/shared/components/Popup/useShowPopup";
import { isFetcherError, unknownError } from "@/shared/api";

export function useAdminReport(id:string){
  const { buildReportFormData } = useBuildReportFormData()
  const queryClient = useQueryClient()
  const currentReportId = ref(id)
  const showPopup = useShowPopup()

  const report = useQuery({
    queryKey: computed(() => ['admin-report', currentReportId.value]),
    queryFn: () => api.fetchReportItem(currentReportId.value)
  })

  const updateReport = async (id:string, data: UpdateReportDto<ReportAuthor[], File | ''>) => {
    const formData = buildReportFormData.update(data)

    try {
      await api.updateReport(id, formData)
      queryClient.invalidateQueries({ queryKey: ['admin-report', currentReportId.value] })
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      return true
    } catch (error) {
      if (isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup(unknownError.message)
      return false
    }
  }

  const deleteReport = async (id:string) => {
    try {
      await api.deleteReport(id)
      queryClient.invalidateQueries({ queryKey: ['admin-report', currentReportId.value] })
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      return true
    } catch (error) {
      if (isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup(unknownError.message)
      return false
    }
  }
  return { report, updateReport, deleteReport }
}
