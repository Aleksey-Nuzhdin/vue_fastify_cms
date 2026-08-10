import { ObjectId } from 'mongodb'
import { validationError } from '../errors'

// Единая точка конструирования ObjectId: невалидная строка даёт 400 VALIDATION_ERROR,
// а не BSONError драйвера, которую errorHandler не узнаёт и отдаёт как 500
export function toObjectId(id: string, label = 'Id'): ObjectId {
  if (!ObjectId.isValid(id)) throw validationError(`${label} is not valid`)
  return new ObjectId(id)
}
