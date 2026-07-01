import { ObjectId } from 'mongodb'
import type { ReportBase } from '@shared/types'
export type { ReportAuthor, GetReportsQuery, ResponseReportList} from '@shared/types'
import type { MultipartFile } from '@fastify/multipart'

export interface Report extends Omit<ReportBase<ObjectId>, '_id'> {
}

export interface ReportDocument extends Report {
  createdAt: number
  updatedAt: number
}

interface ReportWritable extends ExplicitPick<Report, 
  'title' | 'description' | 'authors' | 'fileAnnotation' | 'section' | 'status' | 'userId'
> {}

//create
export type { CreateReportDto } from '@shared/types'
export interface CreateReportPayload extends Omit<ReportWritable, 'fileAnnotation' | 'userId'> {
  userId: string
  fileAnnotation?: MultipartFile
}
export interface CreateReportData extends Omit<ReportWritable, 'fileAnnotation' | 'userId'> {
  userId: string
  fileAnnotation: string
}


//update
export type { UpdateReportDto } from '@shared/types'
export interface UpdateReportPayload 
  extends  Partial<Omit<ReportWritable, 'fileAnnotation' | 'userId'| '_id' | 'updatedAt' | 'createdAt'>> {
    fileAnnotation?: MultipartFile | ''
    userId:string
}
export interface UpdateReportData extends Partial<Omit<ReportWritable, 'userId'>> {

}
