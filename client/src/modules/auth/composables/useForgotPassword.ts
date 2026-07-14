import { authApi } from '../auth.api'
import type {RequestSetPasswordWithCode } from '../auth.types'
import { isFetcherError } from '@/shared/api'

export function useForgotPassword(){

  async function forgotPassword(email: string){
    try {
      await authApi.forgotPassword({email})
      return true
    } catch (error) {
      if(isFetcherError(error)) return error

      throw error
    }
  }

  async function setNewPasswordWithCode(data:RequestSetPasswordWithCode){
    const {email, code, newPassword} = data
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
