<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { Login } from '@shared/types/form/pages'
import { usePageBandle } from '@/shared/composables/content/usePageBundle'
import { useAuthStore } from '../auth.store'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'
import { useErrorMessage } from '@/shared/composables/useErrorMessage'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { page, config } = usePageBandle<Login.PageData, Login.InitionalValues>('login')
const authStore = useAuthStore()
const { addErrorPopup } = useShowPopup()
const errorMessage = useErrorMessage()

const formValue = ref<Login.InitionalValues | null>(null)
const loginError = ref<string | null>(null)

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
const handleLogin = async () => {
  if (formValue.value === null) return
  loginError.value = null
  try {
    if (await authStore.login(formValue.value)) router.push('profile')
  } catch (error) {
    loginError.value = errorMessage(error, 'login')
    addErrorPopup(t('auth.login.popupError'))
  }
}
</script>

<template>
  <FormWrapper v-if="!isLoading"
    class="login-page__form"
  >
    <h2 class="login-page__form-title">{{ t('auth.login.title') }}</h2>
    <FormGenerator class="login-page__form-generator"
      v-model="formValue!"
      :formConfig="config.configData.value"
    />
    <div class="login-page__forgot-password">
      <RouterLink to="/forgot-password" class="login-page__forgot-link">{{ t('auth.login.forgotPassword') }}</RouterLink>
    </div>
    <div v-if="loginError" class="login-page__error">{{ loginError }}</div>
    <BaseButton arrows size="lg" color="accent"
      class="login-page__enter-button"
      @click="handleLogin"
    >{{ t('auth.login.submit') }}</BaseButton>
    <div class="login-page__register-block">
      <div class="login-page__register-dots">
        <div class="login-page__register-dot"></div>
        <div class="login-page__register-dot"></div>
        <div class="login-page__register-dot"></div>
      </div>
      <div class="login-page__register-text">{{ t('auth.login.noAccount') }}</div>
      <BaseLinkArrow routerLink to="/register">
        {{ t('auth.login.register') }}
      </BaseLinkArrow>
    </div>
  </FormWrapper>
  <BaseLoader color="accent" v-else size="lg"/>
</template>
<style lang="scss" scoped>

.login-page__form{
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
.login-page__form-title{
  color: $color-accent;
  text-align: center;
  font-family: $font-title;
  font-size: 30px;
  font-weight: 500;
  margin-bottom: $spacing-xl;
}
.login-page__forgot-password{
  margin-bottom: $spacing-xl;
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
.login-page__forgot-link{
  color: $color-accent;
  font-size: 14px;
  font-weight: 350;
  line-height: 16px;
  margin-top: -16px;

  &:hover{
    text-decoration: underline;
  }
}

.login-page__error{
  color: $color-error;
  font-size: 14px;
  font-weight: 350;
  text-align: center;
  margin-bottom: $spacing-sm;
}
.login-page__enter-button{
  margin-bottom: $spacing-lg;

  @include desktop{
    margin-bottom: $spacing-md;
  }
}

.login-page__register-block{
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
.login-page__register-dots{
  display: flex;
  gap: 8px;
}
.login-page__register-dot{
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: $color-accent;
}
.login-page__register-text{
  font-size: 18px;
  font-weight: 350;


  @include desktop{
    font-size: 16px;
  }
}
</style>

