<script setup lang="ts">
import type { Profile } from './../profile.type';
import BaseModal from '@/shared/components/Modal/BaseModal.vue';
import ProfileChangePassword from '../components/ProfileChangePassword.vue';

import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProfile } from '../composables/useProfile';
import { useModal } from '@/shared/components/Modal/composables/useModal';
import { useShowPopup } from '@/shared/components/Popup/useShowPopup';


const { t } = useI18n()
const profile = useProfile()
const {initPersonValue, getInitionalValues, configData} = profile

const formValue = ref<Profile.InitionalValues | null>(null)
watchEffect(()=>{
  if(initPersonValue.value === null) return
  formValue.value = getInitionalValues()
})

const MODAL_ID_EDIT = 'profile-edit'
const { openModal, closeModal } = useModal(MODAL_ID_EDIT)

const showPopup = useShowPopup()
const isEditing = ref(false)
const isLoading = ref(false)
const startEdit = ()=>{
  if(formValue.value === null) return
  profile.startEdit(formValue.value)
  isEditing.value = true
}

const canselEdit = ()=>{
  isEditing.value = false
  const res = profile.canselEdit()
  if(res === null) return
  formValue.value = res
}

const saveEdit = async ()=>{
  if(formValue.value === null) return

  isLoading.value = true
  try {
    const res = await profile.saveEdit(formValue.value)
    if(res !== true) {
      showPopup.addErrorPopup(res.message)
      return
    }
    isEditing.value = false
  } finally {
    isLoading.value = false
  }
}

</script>
<template>
  <div class="profile-content">
    <div class="profile-info base-block">
      <FormGenerator v-if="formValue !== null"
        class="profile__form-generator"
        v-model="formValue"
        :form-config="configData"
        :readonly="!isEditing"
      />
      <BaseLoader v-if="isLoading" overlay/>
    </div>
    <div class="profile__buttons-container">
      <template v-if="!isEditing">
        <BaseButton @click="startEdit" color="accent" size="lg">{{ t('profile.actions.edit') }}</BaseButton>
        <BaseButton @click="openModal" size="lg" color="accent" variant="outline">{{ t('profile.actions.changePassword') }}</BaseButton>
      </template>
      <template v-else>
        <div class="profile__edit__buttons-container">
          <BaseButton color="accent"
            @click="saveEdit"
            :disabled="isLoading"
            size="lg"
          >{{ t('profile.actions.save') }}</BaseButton>
          <button class="profile__cancel-edit-button gray" @click="canselEdit" :disabled="isLoading"
          >{{ t('profile.actions.cancel') }}</button>
          <!-- <BaseButton color="secondary"
            :disabled="isLoading"
            @click="canselEdit"
            size="lg"
          >{{ t('profile.actions.cancel') }}</BaseButton> -->
        </div>
      </template>

    </div>
  </div>
  <BaseModal :id="MODAL_ID_EDIT" :title="t('profile.actions.changePassword')">
    <ProfileChangePassword @close="closeModal"/>
  </BaseModal>
</template>
<style lang="scss" scoped>
.profile-content{
  display: flex;
  gap: $spacing-lg;
  flex-grow: 1;
  height: min-content;
  flex-direction: column;
  @include desktop{
    gap: $spacing-md;
  }
  margin-bottom: $spacing-xxl;
}
.profile-info{
  flex-grow: 1;
  @include laptop{
    flex-grow: 0;
  }
}
.profile__buttons-container{
  display: flex;
  gap: $spacing-lg;

  button{
    width: 200px;
  }
  @include desktop{
    gap: $spacing-md;
  }

  @include laptop{
    button{
      width: 100%;
      flex:1 1 0;
    }
  }
  @include mobile-only{
    flex-direction: column;
    width: 100%;
  }
}

.profile__form-generator{
  @include laptop{
    grid-template-columns: repeat(8, 1fr);
  }
  @include mobile{
    grid-template-columns: repeat(2, 1fr);
  }
}

.profile__edit__buttons-container{
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.profile__cancel-edit-button{
  color: $color-accent;
  font-family:$font-title;
  font-size: 24px;
  font-weight: 500;
  white-space: nowrap;
  width: max-content !important;

  &.gray{
    color: $color-text-gray;
  }
}
</style>
