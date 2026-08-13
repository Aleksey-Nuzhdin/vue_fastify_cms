import { fetcher } from '@/shared/api'
import type { ReturnUser, ReturnUserList, GetUsersQuery, UpdateUserDto} from './admin.users.type'

export const adminUsersApi = {
  fetchUserItem: (id: string):Promise<ReturnUser<string>> =>
    fetcher.get('/users/item/' + id),
  fetchUsersList: (query: GetUsersQuery) : Promise<ReturnUserList<ReturnUser>> =>
    fetcher.get('/users/list', {query}),
  createUser: (formData: FormData):Promise<ReturnUser<string>> =>
    fetcher.post('/users/create', formData),
  updateUser: (id: string, bodyUpdate: UpdateUserDto):Promise<ReturnUser> =>
    fetcher.patch('/users/update/' + id, bodyUpdate),
  deleteUser: (id: string):Promise<void> =>
    fetcher.delete('/users/delete/' + id),
}
