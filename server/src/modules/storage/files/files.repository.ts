import { Db, Collection } from 'mongodb'

import type { FileDocument, CreateFileData, UpdateFileData } from './files.types'
import { toObjectId } from '../../../common/utils/toObjectId'

export function createFilesRepository(db: Db) {
  const collection: Collection<FileDocument> = db.collection('files')

  return {
    findAll: () => collection.find().toArray(),
    findById: (id: string) => collection.findOne({ _id: toObjectId(id, 'File id') }),
    create: async (data: CreateFileData) => {
      const { folderId } = data
        
      const result = await collection.insertOne({
        ...data,
        folderId: toObjectId(folderId, 'Folder id'),
        createdAt: +new Date,
        updatedAt: +new Date,
      })
      return collection.findOne({ _id: result.insertedId })
    },
    delete: (id: string) => collection.deleteOne({ _id: toObjectId(id, 'File id') }),
    update: async (id: string, data: UpdateFileData) => {
      const _id = toObjectId(id, 'File id')

      const updateData: Record<string, unknown> = { ...data, updatedAt: +new Date }

      if(data.folderId) updateData.folderId = toObjectId(data.folderId, 'Folder id')

      await collection.updateOne(
        { _id },
        { $set: updateData }
      )
      return collection.findOne({ _id })
    },
    getListByFolderId: (folderId: string) => {
      return collection.find({ folderId: toObjectId(folderId, 'Folder id') }).toArray()
    },
    getListFilesNameByFolderId: (folderId: string) =>{
      return collection.distinct('name',{ folderId: toObjectId(folderId, 'Folder id') })
    },
    getFilesPreview(folderId:string){
      return collection.aggregate([{ 
        $match: { folderId: toObjectId(folderId, 'Folder id') } 
      },{
        $project: {
          _id:1,
          name: 1,
          fullPath: 1,
          info: 1,
        }
      }]).toArray()
    }
  }
}

export type FilesRepository = ReturnType<typeof createFilesRepository>