<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProfile } from '../composables/useProfile';
import { useShowPopup } from '@/shared/components/Popup/useShowPopup';

const emits = defineEmits(['close'])

const { t } = useI18n()
const showPopup = useShowPopup()
const { changePassword } = useProfile()

const formValue = ref({
  oldPassword: '',
  newPassword: ''
})

const cansel = () => {
  emits('close')
}

const errorText = ref('')
const loading = ref(false)

const sumbitChangePassword = async() => {
  errorText.value = ''
  const { oldPassword, newPassword } = formValue.value
  if(oldPassword === '' || newPassword === ''){
    errorText.value = t('profile.password.fillAllFields')
    return
  }
  if(oldPassword === newPassword){
    errorText.value = t('profile.password.samePassword')
    return
  }
  if(newPassword.length < 6){
    errorText.value = t('validation.minLength', { n: 6 })
    return
  }

  try {
    loading.value = true
    const res = await changePassword(formValue.value)

    if(res === true){
      loading.value = false
      showPopup.addSuccessPopup(t('profile.password.success'))
      cansel()
    }else{
      if(res.statusCode === 400){
        showPopup.addErrorPopup(
          t('profile.password.errorTitle'),
          t('profile.password.wrongOldPassword')
        )
      }else{
        showPopup.addErrorPopup(t('profile.password.errorTitle'))
      }
    }
  } catch (error) {
    showPopup.addErrorPopup(t('profile.password.errorTitle'))
  } finally{
    loading.value = false
  }
}
watch(formValue.value,()=>{
  errorText.value = ''
})

</script>
<template>
  <div class="profile-change-password">
    <p class="profile-change-password__info">{{ t('profile.password.info') }}</p>
    <div class="profile-change-password__form">
      <BaseInput type="password" :placeholder="t('profile.password.oldPlaceholder')"
        v-model="formValue.oldPassword"
      />
      <BaseInput type="password" :placeholder="t('profile.password.newPlaceholder')"
        v-model="formValue.newPassword"
      />
      <BaseLoader v-if="loading" overlay/>
    </div>
    <div v-if="errorText">
      <p class="error_text">
        {{ errorText }}
      </p>
    </div>
    <!-- <div class="profile-change-password__forgot-password">
      <RouterLink to="/forgot-password" class="base-link">{{ t('auth.login.forgotPassword') }}</RouterLink>
    </div> -->
    <div class="profile-change-password__buttons">
      <BaseButton color="accent" size="xl"
        :disabled="loading || !!errorText"
        @click="sumbitChangePassword"
      >{{ t('profile.actions.save') }}</BaseButton>
      <!-- <BaseButton color="secondary"
        :disabled="loading"
        @click="cansel"
      >{{ t('profile.actions.cancel') }}</BaseButton> -->
    </div>
  </div>
</template>
<style lang="scss" scoped>
.profile-change-password{
  width: 420px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  @include desktop{
    gap: $spacing-md;
  }
}
.error_text{
  color: red;
  font-size: 16px;
}
.profile-change-password__buttons{
  display: flex;
  width: 100%;
  gap: $spacing-lg;
  @include desktop{
    gap: $spacing-md;
  }
  &>*{
    flex-grow: 1;
  }
}
.profile-change-password__info{
  font-size: 14px;
  text-align: center;
  color: $color-text-secondary;
}
.profile-change-password__form{
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  @include desktop{
    gap: $spacing-md;
  }
}
.profile-change-password__forgot-password{
  text-align: right;
  font-size: 14px;
}
</style>
