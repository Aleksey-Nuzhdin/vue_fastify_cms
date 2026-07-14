import { computed, ref } from "vue";
import { useQueryClient, useQuery } from '@tanstack/vue-query'
import { adminUsersApi as api } from '../admin.users.api'
import type { UpdateUserDto } from '../admin.users.type'
import { useBuildUpdate } from '@/shared/composables/utils/useBuildUpdate'
import { useShowPopup } from "@/shared/components/Popup/useShowPopup";
import { isFetcherError, unknownError } from "@/shared/api";

export function useAdminUser(id:string){
  const { buildUpdate } = useBuildUpdate()
  const queryClient = useQueryClient()
  const currentUserId = ref(id)
  const showPopup = useShowPopup()

  const user = useQuery({
    queryKey: computed(() => ['admin-user', currentUserId.value]),
    queryFn: () => api.fetchUserItem(currentUserId.value)
  })

  const updateUser = async (id:string, data: UpdateUserDto) => {
    const updateData = buildUpdate<UpdateUserDto>({
      name: data.name ?? null,
      avatar: null,
      phone: data.phone ?? null,
      city: data.city ?? null,
      interests: data.interests ?? null,
      company: data.company ?? null,
      bio: data.bio ?? null,
      plan: data.plan ?? null,
      password: data.password ?? null,
      role: data.role ?? null,
    })

    try {
      await api.updateUser(id, updateData)
      queryClient.invalidateQueries({ queryKey: ['admin-user', currentUserId.value] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      return true
    } catch (error) {
      if (isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup(unknownError.message)
      return false
    }
  }

  const deleteUser = async (id:string) => {
    try {
      await api.deleteUser(id)
      queryClient.invalidateQueries({ queryKey: ['admin-user', currentUserId.value] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      return true
    } catch (error) {
      if (isFetcherError(error)) showPopup.addErrorPopup(error.message)
      else showPopup.addErrorPopup(unknownError.message)
      return false
    }
  }
  return { user, updateUser, deleteUser }
}
