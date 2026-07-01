import { ObjectId, Db, Collection, WithId, Document } from 'mongodb'
import type { ReportDocument, CreateReportData, UpdateReportData, GetReportsQuery } from './reports.types'
import { validationError, notFoundError } from '../../common/errors'

export function createReportsRepository(db: Db) {
  const collection: Collection<ReportDocument> = db.collection('reports')
  type ReportItem = WithId<ReportDocument>

  return {
    findAll: () => collection.find().toArray(),

    findById: (id: string) => collection.findOne({ _id: new ObjectId(id) }),

    findList: (params:GetReportsQuery)=>{
      const { skip = 0, limit, title, authorName, authorEmail, userEmail, userName,userId, status } = params

      const aggregation: Document[] = [{
        $match: { 
          ...(userId && { userId: new ObjectId(userId) }),
          ...(title && { title: { $regex: title, $options: 'i' } }),
          ...(authorName && { 'authors.name': { $regex: ''+authorName, $options: 'i' } }),
          ...(authorEmail && { 'authors.email': { $regex: authorEmail, $options: 'i' } }),
          ...(status && { status }),
        }
      }]

      aggregation.push(...[{
          $lookup:{
            from: 'users',
            // MongoDB 5.0+ syntax (localField + foreignField + pipeline):
            // localField: 'userId',
            // foreignField: '_id',
            // pipeline: [{ $project: { name: 1, email: 1 } }],
            // MongoDB 3.6+ syntax (let + $expr):
            let: { userId: '$userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              { $project: { name: 1, email: 1 } }
            ],
            as: 'user'
          }
        },{
          $addFields: {
            user: { $arrayElemAt: ['$user', 0] }
          }
        }]
      )

      if(userEmail || userName){
        aggregation.push(...[{
          $match: { 
            ...(userEmail && {'user.email': { $regex: userEmail, $options: 'i' }} ),
            ...(userName && {'user.name': { $regex: userName, $options: 'i' }} ),
          }
        }])
      }

      const metaFacet = [{ $count: 'total' }]
      const dataFacet:Document[] = [{$skip: Number(skip)}]
      if( !isNaN(Number(limit)) ) dataFacet.push({ $limit: Number(limit) })

      aggregation.push(...[{
          $facet: { 
            meta: metaFacet, data: dataFacet 
          }
        },{
          $project: {
            data: 1,
            total: { $ifNull: [{ $arrayElemAt: ['$meta.total', 0] }, 0] },
          }
      }])

      type ReportItemAggregate = ReportItem & { user: { name: string, email: string } }
      type AggregateReturn = {
        data: ReportItemAggregate[],
        total: number
      }
      
      
      return collection.aggregate<AggregateReturn>(aggregation).toArray()
    },
    create: async (data: CreateReportData) => {
      if( !ObjectId.isValid(data.userId) ) throw validationError('User id is not valid')

      const dataCreate:ReportDocument = {
        ...data,
        userId: new ObjectId(data.userId),
        createdAt: +new Date(),
        updatedAt: +new Date(),
      }
      const result = await collection.insertOne(dataCreate)

      return collection.findOne({ _id: result.insertedId })!
    },

    update: async (id: string, data: UpdateReportData):Promise<ReportItem> => {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: +new Date() } }
      )
      const res = await collection.findOne({ _id: new ObjectId(id) })
      if(res === null) throw notFoundError('Report', id)
      return res
    },

    delete: (id: string) => collection.deleteOne({ _id: new ObjectId(id) }),
  }
}

export type ReportsRepository = ReturnType<typeof createReportsRepository>
