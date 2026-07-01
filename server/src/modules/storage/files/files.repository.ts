import { ObjectId, Db, Collection } from 'mongodb'

import type { FileDocument, CreateFileData, UpdateFileData } from './files.types'
import { validationError } from "./../../../common/errors"

export function createFilesRepository(db: Db) {
  const collection: Collection<FileDocument> = db.collection('files')

  return {
    findAll: () => collection.find().toArray(),
    findById: (id: string) => collection.findOne({ _id: new ObjectId(id) }),
    create: async (data: CreateFileData) => {
      if (!ObjectId.isValid(data.folderId)) throw validationError('Folder id is not valid')
      const { folderId } = data
        
      const result = await collection.insertOne({
        ...data,
        folderId: new ObjectId(folderId),
        createdAt: +new Date,
        updatedAt: +new Date,
      })
      return collection.findOne({ _id: result.insertedId })
    },
    delete: (id: string) => collection.deleteOne({ _id: new ObjectId(id) }),
    update: async (id: string, data: UpdateFileData) => {
      if(!ObjectId.isValid(id)) throw validationError('File id is not valid')

      const updateData: Record<string, unknown> = { ...data, updatedAt: +new Date }

      if(data.folderId) {
        if(!ObjectId.isValid(data.folderId)) throw validationError('Folder id is not valid')
        updateData.folderId = new ObjectId(data.folderId)
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )
      return collection.findOne({ _id: new ObjectId(id) })
    },
    getListByFolderId: (folderId: string) => {
      if(!ObjectId.isValid(folderId)) throw validationError('Folder id is not valid')
      return collection.find({ folderId: new ObjectId(folderId) }).toArray()
    },
    getListFilesNameByFolderId: (folderId: string) =>{
      if(!ObjectId.isValid(folderId)) throw validationError('Folder id is not valid')
      return collection.distinct('name',{ folderId: new ObjectId(folderId) })
    },
    getFilesPreview(folderId:string){
      if(!ObjectId.isValid(folderId)) throw validationError('Folder id is not valid')
      return collection.aggregate([{ 
        $match: { folderId: new ObjectId(folderId) } 
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