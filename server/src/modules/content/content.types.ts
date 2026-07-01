import type { ObjectId } from 'mongodb'

import type { PageData, FormConfig } from '@shared/types/form'
export type { PageData, FormConfig } from '@shared/types/form'



export interface PageDataDto extends Partial<PageData>{}

export interface PageDataMongoDB extends PageData {
  _id: ObjectId,
  createdAt: number,
  updatedAt: number
}

export interface FormConfigMongoDB extends FormConfig<any> {
  _id: ObjectId,
  createdAt: number,
  updatedAt: number
}