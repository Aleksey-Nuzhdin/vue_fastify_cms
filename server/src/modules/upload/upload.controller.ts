import { FastifyRequest, FastifyReply } from 'fastify'
import path from 'path'
import { UploadService } from './upload.service'

const getFullPath = ( request:FastifyRequest<{ Params: { '*': string } }>, reply: FastifyReply) =>{
  const routePrefix = (request.routeOptions.url ?? '').replace('/*', '')
  const filePath = path.normalize(
    path.join(routePrefix.slice(1), request.params['*'])
  )

  if (filePath.startsWith('..') || path.isAbsolute(filePath)) {
    reply.code(403).send({ error: 'Forbidden' })
    return false
  }

  return filePath.replace(/\\/g, '/').replace('upload', '')
}

export function createUploadController(serivice:UploadService) {
  return {
    async getFile(request: FastifyRequest<{ Params: { '*': string } }>, reply: FastifyReply) {
      const fullPath = getFullPath(request, reply)
      if(!fullPath) return
      
      return reply.sendFile(fullPath)
    },

    async getImage(request: FastifyRequest<{ 
        Params: { '*': string }, 
        Querystring: { width?: string; height?: string }
      }>, 
      reply: FastifyReply
    ){
      const fullPath = getFullPath(request, reply)
      if(!fullPath) return

      const { width, height } = request.query

      let w = isNaN(Number(width)) ? undefined : Number(width)
      let h = isNaN(Number(height)) ? undefined : Number(height)
     
      const imagePath = await serivice.getImage(fullPath, w, h)
      if(!imagePath) return reply.sendFile(fullPath)
      
      return reply.sendFile(imagePath)
    }
  }
}
