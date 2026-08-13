import { fetcher } from '@/shared/api'
import type {
  ReportBase,
  ResponseReportList,
  ResponseChangePassword,
  ChangePasswordDto,
  UpdateProfileDto,
  UpdateProfileResponse,
} from './profile.type'

export const profileApi = {
  getReports: (userId: string) =>
    fetcher.get<ResponseReportList>('/reports/list', { query: { userId } }),

  getReportItem: (id: string) =>
    fetcher.get<ReportBase>('/reports/item/' + id),

  createReport: (formData: FormData) =>
    fetcher.post<ReportBase>('/reports/create', formData),

  updateReport: (id: string, formData: FormData) =>
    fetcher.patch<ReportBase>('/reports/update/' + id, formData),

  deleteReport: (id: string) =>
    fetcher.delete<void>('/reports/delete/' + id),

  updateProfile: (data: UpdateProfileDto) =>
    fetcher.patch<UpdateProfileResponse>('/profile/update', data),

  uploadAvatar: (formData: FormData) =>
    fetcher.patch<string>('/profile/upload/avatar', formData),

  changePassword: (data: ChangePasswordDto) =>
    fetcher.patch<ResponseChangePassword>('/auth/change-password', data),
}
