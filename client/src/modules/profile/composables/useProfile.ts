import type { Profile, ChangePasswordDto, UpdateProfileDto } from './../profile.type'
import { computed, ref, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useConfigData } from '@/shared/composables/content/useConfigData'
import { useAuthStore } from '@/modules/auth'
import { useDeepMerge } from '@/shared/composables/utils/useDeepMerge'
import { fetcher, isFetcherError, unknownError } from '@/shared/api'
import { tokenStorage } from '@/shared/lib'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'
import { profileApi } from '../profile.api'
import { useBuildUpdate } from '@/shared/composables/utils/useBuildUpdate'

export function useProfile() {
  const { t } = useI18n()
  const { buildUpdate } = useBuildUpdate()
  const config = useConfigData<Profile.InitionalValues>('profile')
  const { deepMerge } = useDeepMerge()
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)
  const showPopup = useShowPopup()

  if (!authStore.isAuth) authStore.init()

  // --- Profile data ---

  const initPersonValue = computed<Profile.InitionalValues | null>(() => {
    const initValue = config.getInitionalValues()
    const initUser = user.value !== null ? structuredClone(toRaw(user.value)) : null

    if (!initUser && !initValue) return null
    if (!initUser) return initValue
    if (!initValue) return initUser as Profile.InitionalValues

    return deepMerge<Profile.InitionalValues>(initValue, initUser)
  })

  const getInitionalValues = (): Profile.InitionalValues | null => {
    if (!initPersonValue.value) return null
    return structuredClone(toRaw(initPersonValue.value))
  }

  // --- Edit profile ---

  const startValue = ref<Profile.InitionalValues | null>(null)

  const startEdit = (value: Profile.InitionalValues) => {
    startValue.value = structuredClone(toRaw(value))
  }

  const saveEdit = async (valueUpdate: Profile.InitionalValues) => {

    const editData = buildUpdate<UpdateProfileDto>({
      name: valueUpdate.name ?? null,
      avatar: null,
      phone: valueUpdate.phone ?? null,
      city: valueUpdate.city ?? null,
      interests: valueUpdate.interests ?? null,
      company: valueUpdate.company ?? null,
      bio: valueUpdate.bio ?? null,
      plan: valueUpdate.plan ?? null
    })

    try {
      const data = await profileApi.updateProfile(editData)
      fetcher.refreshToken()
      authStore.updateUser(data)
      showPopup.addSuccessPopup(t('profile.updateSuccess'))
    } catch (error) {
      if (isFetcherError(error)) return error
      else return unknownError
    }
    return true
  }

  const canselEdit = (): Profile.InitionalValues | null => {
    const returnValue = startValue.value
    startValue.value = null
    return returnValue as Profile.InitionalValues | null
  }

  // --- Avatar ---

  const uploadAvatar = async (avatar: File) => {
    const formData = new FormData()
    formData.append('avatar', avatar)

    try {
      const res = await profileApi.uploadAvatar(formData)
      authStore.updateUser({ avatar: res })
    } catch (error) {
      if (isFetcherError(error)) return error
      else return unknownError
    }
    return true
  }

  // --- Change password ---

  const changePassword = async ({ oldPassword, newPassword }: ChangePasswordDto) => {
    try {
      const { accessToken } = await profileApi.changePassword({ oldPassword, newPassword })
      tokenStorage.clear()
      tokenStorage.set(accessToken)
    } catch (error) {
      if (isFetcherError(error)) return error
      else return unknownError
    }
    return true
  }

  return {
    initPersonValue,
    getInitionalValues,
    configData: config.configData,
    startEdit,
    saveEdit,
    canselEdit,
    uploadAvatar,
    changePassword,
  }
}
