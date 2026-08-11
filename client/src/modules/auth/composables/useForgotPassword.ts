import { authApi } from '../auth.api'
import type {RequestSetPasswordWithCode } from '../auth.types'
import { isFetcherError } from '@/shared/api'

const normalizeEmail = (email?:string) => (email ?? '').trim().toLowerCase()

export function useForgotPassword(){

  async function forgotPassword(email: string){
    email = normalizeEmail(email)

    try {
      await authApi.forgotPassword({email})
      return true
    } catch (error) {
      if(isFetcherError(error)) return error

      throw error
    }
  }

  async function setNewPasswordWithCode(data:RequestSetPasswordWithCode){
    const {code, newPassword} = data
    const email = normalizeEmail(data.email)

    try {
      await authApi.setPasswordWithCode({email, code, newPassword})
      return true
    } catch (error) {
      if(isFetcherError(error)) return error

      throw error
    }
  }

  return{
    forgotPassword,
    setNewPasswordWithCode,
  }
}
