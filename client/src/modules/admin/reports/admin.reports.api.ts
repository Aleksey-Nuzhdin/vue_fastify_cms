import { fetcher } from '@/shared/api'
import type { ReportBase, ResponseReportList, GetReportsQuery} from './admin.reports.type'

export const adminReportsApi = {
  fetchReportItem: (id: string):Promise<ReportBase> =>
    fetcher.get('/reports/item/' + id),
  fetchReportsList: (query: GetReportsQuery) : Promise<ResponseReportList> =>
    fetcher.get('/reports/list', {query}),
  createReport: (formData: FormData):Promise<ReportBase> =>
    fetcher.post('/reports/create', formData),
  updateReport: (id: string, formData: FormData):Promise<ReportBase> =>
    fetcher.patch('/reports/update/' + id, formData),
  deleteReport: (id: string):Promise<ReportBase> =>
    fetcher.delete('/reports/delete/' + id),
}
