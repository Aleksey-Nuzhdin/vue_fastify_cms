export type { Profile, ReportCreate } from '@shared/types/form/pages';
export type {
  ChangePasswordDto,
  ResponseChangePassword,
  UpdateProfileDto,
  UpdateProfileResponse,
  ReportBase,
  ResponseReportList,
  CreateReportDto,
  UpdateReportDto,
  ReportAuthor,
} from '@shared/types';
import type { ReportBase } from '@shared/types';

export interface Report extends ReportBase<string, File | string> {
}
