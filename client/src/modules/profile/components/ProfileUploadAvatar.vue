<script setup lang="ts">
import {ref} from 'vue'
import { useI18n } from 'vue-i18n';
import { UPLOAD_LIMITS, MB, IMAGE_MAX_SIDE } from '@shared/constants'

import { useProfile } from '../composables/useProfile';
import { useShowPopup } from '@/shared/components/Popup/useShowPopup';
import { readImageSize } from '@/shared/lib';

const { t } = useI18n()
const showPopup = useShowPopup()
const { uploadAvatar } = useProfile()

const emits = defineEmits(['close'])

const formValue = ref<File | null>(null)

// Тот же лимит, что и на сервере — предпроверка, чтобы не гнать
// заведомо большой файл по сети.
const maxSizeMb = UPLOAD_LIMITS.defaultFileSize / MB

const isLoading = ref(false)
const errorText = ref('')
const uploadAvatarHandler = async() => {
  if(isLoading.value) return
  if(formValue.value === null) return errorText.value = t('profile.avatar.selectFile')
  // accept фильтрует диалог выбора, но в нём можно переключиться на «все файлы»
  if(!formValue.value.type.startsWith('image/')){
    return errorText.value = t('profile.avatar.notImage')
  }
  if(formValue.value.size > UPLOAD_LIMITS.defaultFileSize){
    return errorText.value = t('profile.avatar.tooLarge', { size: maxSizeMb })
  }

  // Разрешение: сервер такую картинку не примет, поэтому и не отправляем
  const imageSize = await readImageSize(formValue.value)
  if(imageSize && (imageSize.width > IMAGE_MAX_SIDE || imageSize.height > IMAGE_MAX_SIDE)){
    return errorText.value = t('profile.avatar.tooLargeImage', { size: IMAGE_MAX_SIDE })
  }

  errorText.value = ""
  isLoading.value = true

  try {
    const res = await uploadAvatar(formValue.value)

    if(res === true){
      emits('close')
    }else if(res.code === 'FILE_TOO_LARGE'){
      errorText.value = t('profile.avatar.tooLarge', { size: maxSizeMb })
    }else if(res.code === 'IMAGE_TOO_LARGE'){
      errorText.value = t('profile.avatar.tooLargeImage', { size: IMAGE_MAX_SIDE })
    }else{
      showPopup.addErrorPopup(t('profile.avatar.error'))
    }
  } finally {
    isLoading.value = false
  }
}
</script>
<template>
  <div>
    <BaseInputFile v-model="formValue" :errorText="errorText" accept="image/*" />
    <BaseLoader v-if="isLoading" overlay/>
  </div>
  <BaseButton :disabled="isLoading" @click="uploadAvatarHandler">{{ t('profile.avatar.upload') }}</BaseButton>
</template>
<style lang="scss" scoped>
.error_text{
  color: $color-error;
}
</style>
