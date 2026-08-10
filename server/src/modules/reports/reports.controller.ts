import { FastifyRequest, FastifyReply } from 'fastify'
import { ReportsService } from './reports.service'
import { Readable } from 'stream'
import { validationError } from '../../common/errors'

import type { 
  CreateReportDto,
  UpdateReportDto,
  ReportAuthor,
  CreateReportPayload,
  UpdateReportPayload,
  GetReportsQuery
} from './reports.types'
import type { MultipartFile } from '@fastify/multipart'
interface IdParam {
  id: string
}

const parseAuthors = (authorsString: string):ReportAuthor[] => {
  const authors:ReportAuthor[] = [] 
  let authorsJson: unknown

  try {
    authorsJson = JSON.parse(authorsString)
  } catch {
    throw validationError('Authors must be a valid JSON array')
  }

  if (!Array.isArray(authorsJson)) throw validationError('Authors must be an array')
    
  authorsJson.forEach((author:ReportAuthor) => {
    const { name, email, organization, city, position, participation } = author
    authors.push({ 
      name: name || '', 
      email: email || '', 
      organization: organization || '', 
      city:city || '',
      position:position || '',
      participation:participation || '',
    })
  })
  
  return authors
}

export function createReportsController(service: ReportsService) {
  return {
    findAll: async () => {
      return service.findAll()
    },

    findById: async (request: FastifyRequest<{ Params: IdParam }>) => {
      return service.findById(request.params.id)
    },

    findList: async (request: FastifyRequest<{Querystring:GetReportsQuery}>)=>{
      const {skip, limit, title, authorName, authorEmail, userEmail, userId, userName, status} = request.query
      return service.findList({skip, limit, title, authorName, authorEmail, userEmail,userName, userId, status}, request.user)
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user._id
      function isBodyKey(key: string): key is keyof CreateReportDto {
        return ['section','title', 'description'].includes(key)
      }

      const parts = request.parts()
      
      let file: MultipartFile | undefined
      const payload:CreateReportPayload = {
        userId: userId,
        title: "",
        section: "",
        description: "",
        status:"draft",
        authors:[],
      }

      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer()
          file = part
          file.file = Readable.from(buffer) as typeof file.file
        } else {
          const key = part.fieldname as keyof CreateReportPayload
          if( key === 'fileAnnotation') continue
          if( key === 'authors'){
            payload.authors = parseAuthors(part.value+"")
            continue
          }
          if( key === 'status'){
            payload.status = part.value === 'waiting' ? 'waiting' : 'draft'
            continue
          }
          
          if (isBodyKey(key)) payload[key] = part.value+""
        }
      }
      
      return service.create({...payload, fileAnnotation: file}, request.user)
    },

    update: async (request: FastifyRequest<{ Params: IdParam }>) => {

      const userId = request.user._id
      const id = request.params.id
      function isBodyKey(key: string): key is keyof UpdateReportDto {
        return ['section','title', 'description', 'fileAnnotation'].includes(key)
      }

      const parts = request.parts()
      
      let file: MultipartFile | undefined
      const payload:UpdateReportPayload = {
        userId: userId,
      }

      for await (const part of parts) {
        if (part.type === 'file') {
          if(part.fieldname !== 'fileAnnotation') continue

          const buffer = await part.toBuffer()
          file = part
          file.file = Readable.from(buffer) as typeof file.file

          payload.fileAnnotation = file
          continue
        } 
        
        const key = part.fieldname as keyof UpdateReportDto
        if( key === 'authors'){
          payload.authors = parseAuthors( String(part.value) )
          continue
        }
        if( key === 'status'){
          if(part.value === 'draft') payload.status = 'draft'
          if(part.value === 'published') payload.status = 'published'
          if(part.value === 'rejected') payload.status = 'rejected'
          if(part.value === 'waiting') payload.status = 'waiting'
          continue
        }
        if(key === 'fileAnnotation'){
          if(part.value === '') payload.fileAnnotation = ''
          continue
        }
        if ( !isBodyKey(key) || typeof part.value !== 'string' ) continue

        payload[key] = part.value
      }

      return service.update(id, {...payload}, request.user)
    },

    delete: async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      await service.delete(request.params.id, request.user)
      return reply.status(204).send()
    },
  }
}

export type ReportsController = ReturnType<typeof createReportsController>
