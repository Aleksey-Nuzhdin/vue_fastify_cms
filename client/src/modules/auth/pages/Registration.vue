<script setup lang="ts">
import { ref, computed, watchEffect, watch } from 'vue'
import type { Register } from '../auth.types'
import { useAuthStore } from '../auth.store'
import { useRouter } from 'vue-router'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'
import { usePageData } from '@/shared/composables/content/usePageData'
import { useConfigData } from '@/shared/composables/content/useConfigData'
import { useFormErrors } from '@/shared/composables/useFormErrors'
import { useErrorMessage } from '@/shared/composables/useErrorMessage'
import { authApi } from '../auth.api'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const page = usePageData<Register.PageData>('page-register')
const config = useConfigData<Register.InitionalValues>('register')

const authStore = useAuthStore()
const showPopup = useShowPopup()
const errorMessage = useErrorMessage()

const formValue = ref<Register.InitionalValues | null>(null)

watchEffect(() => {
  if (config.initionalValues) {
    formValue.value = config.getInitionalValues()
  }
})

const isLoading = computed(() => !(
  page.isLoading &&
  config.isLoading &&
  formValue.value !== null
))

const router = useRouter()

const registerUser = async ()=>{
  if(formValue.value === null) return
  const {status, error, emailSent} = await authStore.register(formValue.value)
  if( status ){
    // Регистрация прошла, но приветственное письмо не ушло. Попапы живут вне
    // страницы (ShowPopup смонтирован в App.vue), поэтому предупреждение
    // переживёт переход и покажется уже на профиле
    if( emailSent === false ) showPopup.addWarningPopup(t('auth.register.popupMailNotSent'))
    router.push('/profile')
  }else{
    showPopup.addPopup({
      title: t('auth.register.popupErrorTitle'),
      text: errorMessage(error, 'register'),
      type: 'error'
    })
  }
}

type ConfigType = typeof config.configData.value
const setStep = (fields: string[]):ConfigType => {
  return {
    id: config.configData.value.id,
    fields: config.configData.value.fields.filter(el=> fields.includes(el.field))
  }
}
const step = ref(0)
const stepMap = ref<ConfigType[]>([])

watch(config.configData, ()=>{
  stepMap.value[0] = setStep(['email', 'password','name'])
  stepMap.value[1] = setStep(['phone', 'plan', 'interests'])
  stepMap.value[2] = setStep(['company', 'bio', 'city', 'consent'])
},{immediate: true})

const configFormValue = computed<ConfigType | undefined>(() => stepMap.value[step.value])

const { errors, addValidator, validateFields, onFieldUpdate } = useFormErrors(
  () => formValue.value
)

//Проверка что email не занят
const validateEmailTaken = ref('loading')
const timeoutEmailValidate = ref<ReturnType<typeof setTimeout> | null>(null)
const msTimeout = 200
const isDirtyEmailValid = ref(false)


watch(()=> formValue.value?.email, () => {
  if (formValue.value?.email) {
    validateEmailTaken.value = 'loading'
    if(timeoutEmailValidate.value) clearTimeout(timeoutEmailValidate.value)
    timeoutEmailValidate.value = setTimeout( async () => {
      const {available} = await authApi.checkEmail(formValue?.value?.email || '')
      validateEmailTaken.value = available === true ? "" : 'exists'
      if(isDirtyEmailValid.value) validateFields('email')
    }, msTimeout)
  }
})

const emailRegular = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
addValidator('email', (v) => {
  isDirtyEmailValid.value = true
  if (!v) return t('validation.required')
  if(typeof v !== 'string') return t('validation.email.invalid')
  if(!emailRegular.test(v)) return t('validation.email.invalid')
  if(validateEmailTaken.value === 'loading') return t('validation.email.checking')
  if(validateEmailTaken.value === 'exists') return t('validation.email.taken')
  return true
})

addValidator('name', (v) => {
  if (!v) return t('validation.required')
  if(typeof v !== 'string') return t('validation.invalidValue')
  if(v.split(' ').length < 2) return t('validation.fullName')
  return true
})

const passwordRegular = /^[!-~]+$/
addValidator('password', (v) => {
  if (!v) return t('validation.required')
  if(typeof v !== 'string') return t('validation.invalidValue')
  if(v.length < 8) return t('validation.minLength', { n: 8 })
  if(v.length > 64) return t('validation.maxLength', { n: 64 })
  if(!passwordRegular.test(v)) return t('validation.passwordPattern')
  return true
})

addValidator('phone', (v) => {
  if (!v) return t('validation.required')
  if(typeof v !== 'string') return t('validation.invalidValue')
  if(v.replace(/\D/g, '').length < 11) return t('validation.phoneIncomplete')
  return true
})


const consent = ref(false)
const consentErrorText = ref('')
const idConsentValidation = ref(false)
watchEffect(() => {
  if(!idConsentValidation.value) return
  consentErrorText.value = consent.value ? '' : t('validation.consentRequired')
})

const hendleFormNextStep = () => {
  if(step.value === 0){
    if(!validateFields('email','password','name')) return
    step.value = 1
    return
  }
  if(step.value === 1){
    if(!validateFields('phone')) return
    step.value = 2
    return
  }
  if(step.value === 2){
    if(!consent.value){
      idConsentValidation.value = true
      consentErrorText.value = t('validation.consentRequired')
      return
    }
    registerUser()
  }
}

const hendleFormBeforeStep = () => {
  step.value--
  if( step.value < 0 ) step.value = 0
}

const pageData = computed(() => page.pageData.value?.data || null)

</script>
<template>
<FormWrapper v-if="!isLoading && pageData?.isShow"
  class="register-page__form"
>
  <div class="register-page__form-title-block">
    <div class="register-page__button-berore-step-block">
      <BaseLinkArrow class="register-page__button-berore-step" direction="left"
        v-if="step > 0"
        @click="hendleFormBeforeStep">{{ t('auth.register.back') }}</BaseLinkArrow>
    </div>
    <h2 class="register-page__form-title">{{pageData.title}}</h2>
    <p class="register-page__form-steps">
      {{ step + 1 }} / {{ stepMap.length }}
    </p>
  </div>
  <FormGenerator v-if="configFormValue"
    class="register-page__form-generator"
    v-model="formValue!"
    :formConfig="configFormValue"
    :errors="errors"
    :onFieldUpdate="onFieldUpdate"
  />
  <div class="register-page__consent-wrapper" v-if="step === 2">
    <div class="register-page__consent">
      <BaseCheckbox v-model="consent" value >{{ t('auth.register.consentPrefix') }}&nbsp;</BaseCheckbox>
      <a :href="pageData.consentLink" target="_blank">
        {{ t('auth.register.consentLink') }}
      </a>
    </div>
    <div class="register-page__consent-error" v-if="consentErrorText">{{ consentErrorText }}</div>
  </div>
  <div>

  </div>
  <BaseButton arrows size="lg" color="primary"
    class="register-page__enter-button"
    @click="hendleFormNextStep"
  >
    {{ step === 2 ? pageData.submitButton : t('auth.register.continue') }}
  </BaseButton>
  <div class="register-page__register-block">
    <div class="register-page__register-dots">
      <div class="register-page__register-dot"></div>
      <div class="register-page__register-dot"></div>
      <div class="register-page__register-dot"></div>
    </div>
    <div class="register-page__register-text">{{ t('auth.register.hasAccount') }}</div>
    <BaseLinkArrow routerLink to="/login">
      {{ t('auth.register.signIn') }}
    </BaseLinkArrow>
  </div>
</FormWrapper>
<FormWrapper v-else-if="!isLoading && !pageData?.isShow">
  <h2 class="register-page__form-title">{{ t('auth.register.closed') }}</h2>
  <p><br></p>
  <div class="register-page__register-block">
    <div class="register-page__register-dots">
      <div class="register-page__register-dot"></div>
      <div class="register-page__register-dot"></div>
      <div class="register-page__register-dot"></div>
    </div>
    <div class="register-page__register-text">{{ t('auth.register.hasAccount') }}</div>
    <BaseLinkArrow routerLink to="/login">
      {{ t('auth.register.signIn') }}
    </BaseLinkArrow>
  </div>
</FormWrapper>
<div v-else>{{ t('auth.register.loading') }}</div>
</template>
<style lang="scss" scoped>

.register-page__form{
  width: calc($col-width-xl * 4 + $spacing-lg * 3);
  &>*{ width: 100%; }

  @include desktop{
    width: calc($col-width-lg * 4 + $spacing-md * 3);
  }

  @include mobile{
    width: 100%;
    max-width: calc($col-width-lg * 4 + $spacing-md * 3);
  }
}
.register-page__form-title-block{
  display: flex;
  justify-content: space-between;
  margin-bottom: $spacing-xl;
  align-items: center;
  &>*{
    width: 100%;
  }
}
.register-page__button-berore-step-block{
  display: flex;
  justify-content: flex-start;
}
.register-page__button-berore-step{
  cursor: pointer;
}
.register-page__form-title{
  color: $color-primary;
  text-align: center;
  font-family: $font-title;
  font-size: 30px;
  font-weight: 500;
}
.register-page__form-steps{
  text-align: right;
  color: $color-accent;
  font-family: $font-title;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
}

.register-page__form-generator{
  margin-bottom: $spacing-lg;
}
.register-page__enter-button{
  margin-bottom: $spacing-lg;

  @include desktop{
    margin-bottom: $spacing-md;
  }
}

.register-page__register-block{
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  align-items: center;
  @include desktop{
    gap: $spacing-md;
  }

  @include laptop{
    gap: $spacing-sm;
  }
}


.register-page__consent-wrapper{
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  margin-bottom: $spacing-lg;
}
.register-page__consent{

  display: flex;
  align-items: center;

  &>a{
    color: $color-blue;
    text-decoration: underline;
    margin-left: 5px;
  }
}

.register-page__consent-error{
  font-size: 12px;
  color: $color-error;
}

.register-page__register-dots{
  display: flex;
  gap: 8px;
}
.register-page__register-dot{
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: $color-accent;
}
.register-page__register-text{
  font-size: 18px;
  font-weight: 350;


  @include desktop{
    font-size: 16px;
  }
}

</style>
