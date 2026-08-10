import { Db, Collection, Document, WithId } from 'mongodb'

import type { GetUsersQuery, UserDocument, CreateUserData, UpdateUserDto, ReturnUserList} from './users.types'
import { toObjectId } from '../../common/utils/toObjectId'


export function createUsersRepository(db: Db) {
  const collection: Collection<UserDocument> = db.collection('users')

  return {
    findAll: () => collection.find().toArray(),

    findById: (id: string) => collection.findOne({ _id: toObjectId(id, 'User id') }),

    findByEmail: (email: string) => collection.findOne({ email }),

    findList: (params: GetUsersQuery) =>{
      const { skip = 0, limit, name, email, phone, plan } = params

      const aggregation: Document[] = [{
        $match: {
          ...(name && { name: { $regex: name, $options: 'i' } }),
          ...(email && { email: { $regex: email, $options: 'i' } }),
          ...(phone && { phone: { $regex: phone, $options: 'i' } }),
          ...(plan && { plan: { $regex: plan, $options: 'i' } }),
        }
      },{
        $unset: ['password', 'createdAt', 'updatedAt']
      }]

      const metaFacet = [{ $count: 'count' }]

      const dataFacet:Document[] = [{ $skip: Number(skip) }]
      if( !isNaN(Number(limit)) ) dataFacet.push({ $limit: Number(limit) })

      aggregation.push(...[{
          $facet: { 
            meta: metaFacet, list: dataFacet 
          }
        },{
          $project: {
            list: 1,
            count: { $ifNull: [{ $arrayElemAt: ['$meta.count', 0] }, 0] },
          }
      }])

      type AggregationUser = Omit<WithId<UserDocument>, 'password' | 'createdAt' | 'updatedAt'>
      return collection.aggregate<ReturnUserList<AggregationUser>>(aggregation).toArray()
    },

    create: async (data: CreateUserData) => {
      const result = await collection.insertOne({
        ...data,
        avatar:'',
        role: data.role || 'user',
        createdAt: +new Date(),
        updatedAt: +new Date(),
      })
      return collection.findOne({ _id: result.insertedId })
    },

    update: async (id: string, data: UpdateUserDto) => {
      const _id = toObjectId(id, 'User id')
      await collection.updateOne(
        { _id },
        { $set: { ...data, updatedAt: +new Date() } }
      )
      return collection.findOne({ _id })
    },

    delete: (id: string) => collection.deleteOne({ _id: toObjectId(id, 'User id') }),
  }
}

export type UsersRepository = ReturnType<typeof createUsersRepository>