<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForgotPassword } from '../composables/useForgotPassword'
import BaseInput from '@/shared/ui/inputs/BaseInput.vue'
import { useFormErrors } from '@/shared/composables/useFormErrors'
import { useErrorMessage } from '@/shared/composables/useErrorMessage'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const {forgotPassword, setNewPasswordWithCode} = useForgotPassword()
const errorMessage = useErrorMessage()

const formValue = ref({
  email: '',
  code: '',
  newPassword: ''
})

const passwordRegular = /^[!-~]+$/

const { errors, addValidator, validateFields, onFieldUpdate, clearAll } = useFormErrors(() => formValue.value)

addValidator('newPassword', (v) => {
  if (!v) return t('validation.required')
  if (typeof v !== 'string') return t('validation.invalidValue')
  if (v.length < 8) return t('validation.minLength', { n: 8 })
  if (v.length > 64) return t('validation.maxLength', { n: 64 })
  if (!passwordRegular.test(v)) return t('validation.passwordPattern')
  return true
})

type Status = 'init' | 'code' | 'success' | 'error'

const status = ref<Status>('init')


const inputEmail = ref<InstanceType<typeof BaseInput> | null>(null)
const isLoading = ref(false)
const errorText = ref('')

watch(status, () => { errorText.value = ''; clearAll() })

watch(formValue.value, () => errorText.value = '')

watch(() => formValue.value.newPassword, (v) => onFieldUpdate('newPassword', v))

const sendCode = async () => {
  if(!formValue.value.email){
    errorText.value = t('validation.email.required')
    return
  }
  const input = inputEmail.value?.inputRef

  if (input && !input.reportValidity()){
    errorText.value = t('validation.email.invalidShort')
    return
  }
  isLoading.value = true

  const res = await forgotPassword(formValue.value.email)
  isLoading.value = false

  if(res === true){
    status.value = 'code'
    return
  }
  errorText.value = errorMessage(res, 'forgotPassword')
}

const setNewPassword = async () => {
  if (!validateFields('newPassword')) return
  isLoading.value = true
  const res = await setNewPasswordWithCode(formValue.value)
  isLoading.value = false

  if(res === true){
    status.value = 'success'
    return
  }

  status.value = 'error'
  errorText.value = errorMessage(res, 'resetPassword')
}



</script>
<template>
  <FormWrapper class="forgot-password">
    <template v-if="status === 'init'">
      <h2 class="forgot-password__title">{{ t('auth.forgot.title') }}</h2>
      <p class="forgot-password__info">
        {{ t('auth.forgot.info') }}
      </p>
      <div>
        <BaseInput type="email"
          v-model="formValue.email"
          ref="inputEmail"
          placeholder="Email"
        />
        <div class="error_text" v-if="errorText">{{ errorText }}</div>
        <BaseLoader v-if="isLoading" overlay/>
      </div>
      <div class="forgot-password__link-container">
        <RouterLink to="/login" class="base-link">{{ t('auth.forgot.login') }}</RouterLink>
        -
        <RouterLink to="/register" class="base-link">{{ t('auth.forgot.register') }}</RouterLink>
      </div>
      <div class="forgot-password__buttons">
        <BaseButton @click="sendCode" color="accent" arrows
          :disabled="isLoading"
        >{{ t('auth.forgot.sendCode') }}</BaseButton>
        <BaseButton @click="status = 'code'" color="accent" variant="outline" arrows
          :disabled="isLoading"
        >{{ t('auth.forgot.enterCode') }}</BaseButton>
      </div>
      <div class="forgot-password__dots">
        <div class="forgot-password__dot"/>
        <div class="forgot-password__dot"/>
        <div class="forgot-password__dot"/>
      </div>
      <p class="forgot-password__info">
        {{ t('auth.forgot.spamHint') }}
      </p>
    </template>
    <template v-if="status === 'code'">
      <h2 class="forgot-password__title">{{ t('auth.forgot.confirmTitle') }}</h2>
      <BaseInput type="email"
        v-model="formValue.email"
        ref="inputEmail"
        placeholder="Email"
      />
      <BaseInput type="text"
        v-model="formValue.code"
        :placeholder="t('auth.forgot.codePlaceholder')"
      />
      <div>
        <BaseInput type="password"
          v-model="formValue.newPassword"
          :placeholder="t('auth.forgot.newPasswordPlaceholder')"
        />
        <div class="error_text" v-if="errors.newPassword">{{ errors.newPassword }}</div>
      </div>
      <div class="error_text" v-if="errorText">{{ errorText }}</div>
      <BaseLoader v-if="isLoading" overlay/>
      <div class="forgot-password__buttons">
        <BaseButton @click="setNewPassword"
          :disabled="isLoading" color="accent"
        >{{ t('auth.forgot.apply') }}</BaseButton>
        <BaseButton @click="status = 'init'"
          :disabled="isLoading" color="accent"
        >{{ t('auth.forgot.back') }}</BaseButton>
      </div>
    </template>
    <template v-if="status === 'success'">
      <h2 class="forgot-password__title">{{ t('auth.forgot.successTitle') }}</h2>
      <div class="forgot-password__buttons">
        <RouterLink to="/login" >
          <BaseButton width="100%" color="accent">{{ t('auth.forgot.signIn') }}</BaseButton>
        </RouterLink>
      </div>
    </template>
    <template v-if="status === 'error'">
      <h2 class="forgot-password__title">{{ t('auth.forgot.errorTitle') }}</h2>
      <div class="forgot-password__buttons">
        <BaseButton @click="status = 'init'" color="accent"
          :disabled="isLoading"
        >{{ t('auth.forgot.sendCode') }}</BaseButton>
        <BaseButton @click="status = 'code'" color="accent"
          :disabled="isLoading"
        >{{ t('auth.forgot.enterCode') }}</BaseButton>
      </div>
    </template>
  </FormWrapper>
</template>
<style lang="scss" scoped>
.forgot-password{
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  width: 430px;
  align-items: stretch;
}
.forgot-password__info{
  text-align: center;
  font-size: 14px;
  color: $color-text-secondary;
}

.error_text{
  color: $color-error;
}

.forgot-password__link-container{
  display: flex;
  flex-direction: row;
  line-height: 1;
  gap: $spacing-sm;
  justify-content: center;
  align-items: center;
}

.forgot-password__title{
  color: $color-accent;
  text-align: center;
  font-family: $font-title;
  font-size: 30px;
  font-weight: 500;
  line-height: 1;
}
.forgot-password__buttons{
  display: flex;
  gap: $spacing-md;
  flex-direction: column;
  width: 100%;
  &>*{
    flex: 1 1 100%;
    width: 100%;
  }
}


.forgot-password__dots{
  display: flex;
  gap: 8px;
  margin: 0 auto;
}
.forgot-password__dot{
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: $color-accent;
}
</style>
