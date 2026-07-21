import { fsStorageService } from 'src/services/fsStorage.service'
import { ReportsRepository } from './reports.repository'
import { validationError, notFoundError } from '../../common/errors'
import { ObjectId } from 'mongodb'
import { buildUpdate } from '../../common/utils/buildUpdate'
import type { UserRole } from '../users/users.types'

import type {
  CreateReportPayload,
  ReportDocument,
  UpdateReportPayload,
  Report,
  CreateReportData,
  UpdateReportData,
  GetReportsQuery,
  ResponseReportList
} from './reports.types'

import type { PayloadAccess } from '../auth/auth.types'

const MAX_LIMIT = 100

export function createReportsService(repo: ReportsRepository) {
  const fsStorage = fsStorageService()

  return {
    findAll: async () => {
      return repo.findAll()
    },

    findById: async (id: string) => {
      return repo.findById(id)
    },

    
    findList: async (params: GetReportsQuery, performedBy: PayloadAccess)
      :Promise<ResponseReportList<ObjectId>> => 
    {
      const {skip, limit, title, authorName, authorEmail, userEmail, userId, userName, status} = params
      
      // if( userId !== undefined && performedBy.role !== 'admin' ){
      //   throw validationError('User id is not valid')
      // }
      const findQuery: GetReportsQuery = {
        skip: Number(skip) > 0 ? Number(skip) : 0,
        limit: Number(limit) > 0 ? Math.min(Number(limit), MAX_LIMIT) : 10,
        title: title || undefined,
        authorName: authorName || undefined,
        authorEmail: authorEmail || undefined,
        userEmail: userEmail || undefined,
        userName: userName || undefined,
        userId: userId || undefined,
        status: status || undefined
      }

      //Если admin, то можно просматривать все отчеты
      if( !['admin', 'vereficator'].includes(performedBy.role) ){ 
        findQuery.userId = performedBy._id
      }
      
      const list = await repo.findList(findQuery)
      if(!list || !list[0]) throw validationError('Error find list')
        
      return {
        count: list[0].total,
        reports: list[0].data,
      }
    },

    create: async (data: CreateReportPayload, performedBy: PayloadAccess): Promise<Report> => {
      if(performedBy.role !== 'admin' && data.userId.toString() !== performedBy._id){
        throw validationError('User id is not valid')
      }
        
      let filePath = ''
      if(data.fileAnnotation){
        const { uuidFileName, folderPath } = await fsStorage.saveFileInFs(data.fileAnnotation, 'reports')
        filePath = folderPath + '/' + uuidFileName
      }
      const createData:CreateReportData  = {
        ...data, fileAnnotation: filePath,
      }
      const createReport = await repo.create(createData)
      if(!createReport) throw validationError('Error creating report')

      return createReport
    },

    update: async (id: string, data: UpdateReportPayload, performedBy: PayloadAccess):Promise<Report> => {
      const report = await repo.findById(id)
      if(!report) throw notFoundError('Report', id)

      const chekRoles:UserRole[] = ['admin', 'vereficator']
      if( !chekRoles.includes(performedBy.role) && report.userId.toString() !== performedBy._id){
        throw validationError('User is not valid')
      }


      //Если верефикатор, то можно поменять только статус
      if(performedBy.role === 'vereficator'){
        const dataUpdate = buildUpdate<UpdateReportData>({
          status: data.status,
          title: null,
          authors:  null,
          description: null,
          section: null,
          fileAnnotation:null,
        })
        const reportUpdate = await repo.update(id, dataUpdate)
        return reportUpdate
      }
      

      const { fileAnnotation, title, authors, description, status, section } = data

      const dataUpdate = buildUpdate<UpdateReportData>({
        title: title ?? null,
        authors: authors ?? null,
        description: description ?? null,
        status: status ?? null,
        section: section ?? null,
        fileAnnotation:null,
      })
      
      const deletePath = (report.fileAnnotation || '').replace('/upload', '')
  
      //Удаление файла
      if(fileAnnotation === ''){
        if(deletePath.startsWith('/reports/')) await fsStorage.deleteFile(deletePath)
        dataUpdate.fileAnnotation = ''
      }
  
      if(fileAnnotation && typeof fileAnnotation === 'object' && 'file' in fileAnnotation && 'mimetype' in fileAnnotation){
        const { uuidFileName, folderPath } = await fsStorage.saveFileInFs(fileAnnotation, 'reports')
        dataUpdate.fileAnnotation = folderPath + '/' + uuidFileName
        if(deletePath.startsWith('/reports/')) await fsStorage.deleteFile(deletePath)
      }      

      const reportUpdate = await repo.update(id, dataUpdate)
        
      return reportUpdate
    },

    delete: async (id: string, performedBy: PayloadAccess) => {
      const report = await repo.findById(id)
      if (!report) throw notFoundError('Report', id)
      if (performedBy.role !== 'admin' && report.userId.toString() !== performedBy._id){
        throw validationError('User id is not valid')
      }

      const filePath = report.fileAnnotation?.replace('/upload', '')
      if (filePath && filePath.startsWith('/reports/')) {
        await fsStorage.deleteFile(filePath)
      }

      return repo.delete(id)
    },
  }
}

export type ReportsService = ReturnType<typeof createReportsService>
