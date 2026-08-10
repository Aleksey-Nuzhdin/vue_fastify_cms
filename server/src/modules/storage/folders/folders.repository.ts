import { Db, Collection } from 'mongodb'
import { toObjectId } from '../../../common/utils/toObjectId'

import type {FolderView, FolderDocument, CreateFolderData, UpdateFolderData } from './folders.types'

export function createFoldersRepository(db: Db) {
  const collection: Collection<FolderDocument> = db.collection('folders')

  return {
    findAll: () => collection.find().toArray(),
    findById: (id: string) => collection.findOne({ _id: toObjectId(id, 'Folder id') }),
    create: async (data: CreateFolderData) => {
      const result = await collection.insertOne({
        ...data,
        parentId: toObjectId(data.parentId, 'Parent id'),
        createdAt: +new Date,
        updatedAt: +new Date,
      })
      return collection.findOne({ _id: result.insertedId })
    },
    delete: (id: string) => collection.deleteOne({ _id: toObjectId(id, 'Folder id') }),
    update: async (id: string, data: UpdateFolderData) => {
      const _id = toObjectId(id, 'Folder id')
      const { parentId, name } = data
      

      const updateData: Record<string, unknown> = { updatedAt: +new Date }
      if (name || name === '') updateData.name = name
      if (parentId) updateData.parentId = toObjectId(parentId, 'Parent id')

      await collection.updateOne(
        { _id },
        { $set: updateData }
      )
      return collection.findOne({ _id })
    },
    getListByParentId: (parentId: string) => {
      return collection.find({ parentId: toObjectId(parentId, 'Parent id') }).toArray()
    },
    getListFoldersNameByParentId: (parentId: string) =>{
      return collection.distinct('name',{ parentId: toObjectId(parentId, 'Parent id') })
    },
    getFoldersPreview(folderId:string){
      return collection.aggregate([
        { $match: { parentId: toObjectId(folderId, 'Folder id') } },
        { $project: { name: 1, _id: 1 } }
      ]).toArray()
    },
    async getFolderView(folderId: string): Promise<FolderView | null> {
      const aggregate =[{
        $match: { _id: toObjectId(folderId, 'Folder id') }
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