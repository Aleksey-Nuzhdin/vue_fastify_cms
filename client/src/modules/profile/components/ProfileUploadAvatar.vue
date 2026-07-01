<script setup lang="ts">
import {ref} from 'vue'
import { useI18n } from 'vue-i18n';

import { useProfile } from '../composables/useProfile';

const { t } = useI18n()
const { uploadAvatar } = useProfile()

const emits = defineEmits(['close'])

const formValue = ref<File | null>(null)

const isLoading = ref(false)
const errorText = ref('asdf')
const uploadAvatarHandler = async() => {
  if(formValue.value === null) return errorText.value = t('profile.avatar.selectFile')

  errorText.value = ""
  isLoading.value = true

  await uploadAvatar(formValue.value)

  isLoading.value = false
  emits('close')
}
</script>
<template>
  <div>
    <BaseInputFile v-model="formValue" :error="errorText" />
    <BaseLoader v-if="isLoading" overlay/>
  </div>
  <BaseButton @click="uploadAvatarHandler">{{ t('profile.avatar.upload') }}</BaseButton>
</template>
<style lang="scss" scoped>
.error_text{
  color: $color-error;
}
</style>
