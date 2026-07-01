import { MongoClient, ObjectId, Db } from 'mongodb'

const COLLECTIONS: { name: string, indexes?: any[] }[] = [
  { name: 'users', indexes: [{ key: { email: 1 }, unique: true }] },
  { name: 'folders', indexes: [{ key: { parentId: 1 } }] },
  { name: 'files', indexes: [{ key: { folderId: 1 } }] },
  { name: 'reports', indexes: [{ key: { userId:1 } }] },
  { name: 'formConfigs', indexes: [{ key: { id: 1, lang: 1 } }] },
  { name: 'content', indexes: [{ key: { id: 1, lang: 1 } }] },
]

//Создаём коллекции, прописываем индексы
async function initCollections(db: Db) {
  const existing = await db.listCollections().toArray()
  const existingNames = existing.map(c => c.name)

  for (const collection of COLLECTIONS) {
    if (!existingNames.includes(collection.name)) {
      await db.createCollection(collection.name)
    }

    if( !collection.indexes ) continue
    for (const index of collection.indexes) {
      await db.collection(collection.name).createIndex(index.key, index)
    }
  }
}

const ROOT_FOLDER_ID = new ObjectId('000000000000000000000000')  // фиксированный ID

//Создаём корневую папку
async function initRootFolder(db: Db) {
  const folders = db.collection('folders')
  
  const root = await folders.findOne({ _id: ROOT_FOLDER_ID })
  
  if (!root) {

    await folders.insertOne({
      _id: ROOT_FOLDER_ID,
      name: 'Root',
      // parentId: ROOT_FOLDER_ID,  // ссылается сам на себя
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }
}

export async function mongodbInit(db: Db) {
  await initCollections(db)
  await initRootFolder(db)
}