export interface ReportAuthor {
  name: string,
  email: string,
  organization: string
  position: string
  city: string
  participation: string
}

export interface ReportBase<IdType = string, FileType=string> {
  _id: IdType,
  userId: IdType,
  title: string,
  description: string,
  authors: ReportAuthor[],
  fileAnnotation: FileType,
  section:string,
  status: 'draft' | 'published' | 'rejected' | 'waiting'
}

interface ReportBaseFromList<IdType=string> extends ReportBase<IdType> {
  user:{
    name: string,
    email: string
  }
}
export interface ResponseReportList<IdType = string> {
  reports: ReportBaseFromList<IdType>[],
  count: number
}

export interface GetReportsQuery{
  userId?: string,
  userEmail?: string
  userName?: string
  authorName?: string
  authorEmail?: string
  title?: string
  skip?: number,
  limit?: number
  status?: string
}

export interface CreateReportDto<TAuthors = string, TFileAnnotation = string>
  extends Omit<ReportBase, '_id' | 'userId' | 'fileAnnotation' | 'authors'> {
    authors:TAuthors
    fileAnnotation?:TFileAnnotation
  }

export interface UpdateReportDto<TAuthors = string, TFileAnnotation = string>
  extends Partial<Omit<ReportBase, '_id' | 'userId' | 'fileAnnotation' | 'authors'>> {
    authors?:TAuthors
    fileAnnotation?:TFileAnnotation
  }
