import { ObjectId, Db, Collection } from 'mongodb'
import { validationError } from '../../../common/errors'

import type {FolderView, FolderDocument, CreateFolderData, UpdateFolderData } from './folders.types'

export function createFoldersRepository(db: Db) {
  const collection: Collection<FolderDocument> = db.collection('folders')

  return {
    findAll: () => collection.find().toArray(),
    findById: (id: string) => collection.findOne({ _id: new ObjectId(id) }),
    create: async (data: CreateFolderData) => {
      if (!ObjectId.isValid(data.parentId)) throw validationError('Parent id is not valid')
      
      const result = await collection.insertOne({
        ...data,
        parentId: new ObjectId(data.parentId),
        createdAt: +new Date,
        updatedAt: +new Date,
      })
      return collection.findOne({ _id: result.insertedId })
    },
    delete: (id: string) => collection.deleteOne({ _id: new ObjectId(id) }),
    update: async (id: string, data: UpdateFolderData) => {
      if (!ObjectId.isValid(id)) throw validationError('Folder id is not valid')
      const { parentId, name } = data
      

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { 
          ...((name || name === '') && { name }),
          ...((ObjectId.isValid(parentId+'')) && {parentId: new ObjectId(parentId)}),
          updatedAt: +new Date 
        }}
      )
      return collection.findOne({ _id: new ObjectId(id) })
    },
    getListByParentId: (parentId: string) => {
      if (!ObjectId.isValid(parentId)) throw validationError('Parent id is not valid')
      return collection.find({ parentId: new ObjectId(parentId) }).toArray()
    },
    getListFoldersNameByParentId: (parentId: string) =>{
      if (!ObjectId.isValid(parentId)) throw validationError('Parent id is not valid')
      return collection.distinct('name',{ parentId: new ObjectId(parentId) })
    },
    getFoldersPreview(folderId:string){
      if(!ObjectId.isValid(folderId)) throw validationError('Folder id is not valid')
      return collection.aggregate([
        { $match: { parentId: new ObjectId(folderId) } },
        { $project: { name: 1, _id: 1 } }
      ]).toArray()
    },
    async getFolderView(folderId: string): Promise<FolderView | null> {
      if (!ObjectId.isValid(folderId)) throw validationError('Folder id is not valid')
      const aggregate =[{
        $match: { _id:new ObjectId(folderId) }
      },{
        $graphLookup: {
          from: 'folders',
          startWith: '$parentId',
          connectFromField: 'parentId',
          connectToField: '_id',
          as: 'breadCrumbs',
        }
      },{
        $set: {
          breadCrumbs: {$map:{
            input:'$breadCrumbs',
            as:"a",
            in:{_id:'$$a._id', name:"$$a.name"}
          }}
        }
      }]
      const result = await collection.aggregate<FolderView>(aggregate).toArray()
      return result[0] ?? null
    }
  }
}

export type FoldersRepository = ReturnType<typeof createFoldersRepository>