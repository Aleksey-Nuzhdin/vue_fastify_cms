<script setup lang="ts">
import BaseModal from '@/shared/components/Modal/BaseModal.vue'
import ModaelDelete from '@/shared/components/modals/ModaelDelete.vue'

import FormGenerator from '@/shared/ui/form/FormGenerator.vue'
import { useModal } from '@/shared/components/Modal/composables/useModal'
import { deepMerge } from '@/shared/composables/utils/useDeepMerge'
import { useAdminUser } from '../composables/useAdminUser'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'
import { useConfigData } from '@/shared/composables/content/useConfigData'
import { useAuthStore } from '@/modules/auth'

import type { Profile } from '@shared/types/form/pages'
import type { ReturnUser } from './../admin.users.type'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'


const props = defineProps<{
  user: ReturnUser
}>()

const authStore = useAuthStore()

const { t } = useI18n()
const showPopup = useShowPopup()
const { deleteUser, updateUser } = useAdminUser(props.user._id)


const MODAL_ID_DELETE = 'admin-user-card-modal-delete__' + props.user._id
const deletModal = useModal(MODAL_ID_DELETE)
const deleteUserSubmit = async (id: string) => {
  const res = await deleteUser(id)
  if(res) showPopup.addSuccessPopup(t('admin.users.deleted'))
  else showPopup.addErrorPopup(t('admin.users.deleteError'))
  deletModal.closeModal()
}


const MODAL_ID = 'admin-user-card-modal__' + props.user._id
const editModal = useModal(MODAL_ID)

const formValue = ref<ReturnUser>(deepMerge(props.user,props.user))

const opentEditModal = () => {
  formValue.value = deepMerge(props.user,props.user)
  editModal.openModal()
}

const config = useConfigData<Profile.InitionalValues>('profile')

const formConfig = computed(() => {
  const res = deepMerge(config.configData.value, config.configData.value)
  // res.fields.push({
  //   field: 'password',
  //   label: 'Пароль',
  //   type:'input',
  //   placeholder:'Введите новый пароль',
  //   options:{ type:'password' }
  // })
  res.fields.push({
    field: 'role',
    label: t('admin.users.roleLabel'),
    type:'select',
    placeholder: t('admin.users.rolePlaceholder'),
    options:{ options: [{value:'admin', title:t('admin.users.roles.admin')}, {value:'user', title:t('admin.users.roles.user')}, {value:'vereficator', title:t('admin.users.roles.vereficator')}, ] }
  })
  return res
})

const editUser = async ()=>{
  const res = await updateUser(props.user._id, formValue.value)
  editModal.closeModal()
  if(res) showPopup.addSuccessPopup(t('admin.users.updated'))
  else showPopup.addErrorPopup(t('admin.users.updateError'))
}

</script>
<template>
<div class="admin-user-card base-block-md">
  <div class="admin-user-card__content">
    <div class="admin-user-card__name">{{ user.name }}</div>
    <div class="admin-user-card__separator">/</div>
    <div class="admin-user-card__email">{{ user.email }}</div>
    <div class="admin-user-card__separator">/</div>
    <div class="admin-user-card__plan">
      {{ $t(`admin__user-card__plan.${user.plan}`, $t('admin__user-card__plan.undefined') ) }}
    </div>
    <div class="admin-user-card__separator">/</div>
    <div class="admin-user-card__company">
      {{ user.company || $t('admin__user-card__plan.undefined') }}
    </div>
    <!-- <div class="admin-user-card__separator">/</div> -->
    <!-- <div class="admin-user-card__status">
      <div class="admin-user-card__status-icon" :class=".status"/>
      {{ $t(`admin__report-cards__status.${report.status}`) }}
    </div> -->
  </div>
  <div class="admin-user-card__actions">
    <BaseButton color="accent" icon="edit" @click="opentEditModal" />
    <!-- <BaseButton color="accent" icon="eye-show" /> -->
    <BaseButton color="error" icon="trash" @click="deletModal.openModal" v-if="authStore.checkRole(['admin','manager'])" />
  </div>
</div>
<BaseModal :id="MODAL_ID" :title="$t('admin.users.editTitle')">
  <div class="admin-user-card__form-edit container">
    <FormGenerator v-if="config.isLoading"
      :form-config="formConfig"
      v-model="formValue"
    />
    <BaseLoader v-else overlay/>
    <div class="admin-user-card__form-buttons">
      <BaseButton v-if="authStore.checkRole(['admin','manager'])"
        @click="editUser" color="accent"
      >{{ $t('common.save') }}</BaseButton>
      <BaseButton @click="editModal.closeModal" color="secondary">{{ $t('common.cancel') }}</BaseButton>
    </div>
  </div>
</BaseModal>
<ModaelDelete :id="MODAL_ID_DELETE" :title="$t('admin.users.deleteTitle')" @delete="deleteUserSubmit(user._id)">
  {{ $t('admin.users.confirmDeleteUser') }}
  <br />
  <br />
  <b>&laquo;{{ user.name }}&raquo;</b>?
</ModaelDelete>
</template>
<style lang="scss" scoped>
.admin-user-card{
  display: flex;
  gap: $spacing-lg;
  justify-content: space-between;
  align-items: center;
}
.admin-user-card__content{
  display: flex;
  gap: $spacing-md;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  @include desktop{
    font-size: 16px;
  }
  flex-grow: 1;
}
.admin-user-card__separator{
  font-size: 18px;
  color: $color-primary;
  line-height: 1;
}

.admin-user-card__name, .admin-user-card__email,
.admin-user-card__plan, .admin-user-card__company{
  font-size: 18px;
  flex: 0 0 120px;
  @include text-ellipsis;
  @include desktop{
    font-size: 16px;
  }
}
.admin-user-card__name{
  flex-basis: 300px;
}
.admin-user-card__email{
  flex-basis: 200px;
}
.admin-user-card__plan{
  flex-basis: 150px;
}
.admin-user-card__company{
  flex-basis: 150px;
}

.admin-user-card__actions{
  display: flex;
  gap: $spacing-md;
}
.admin-user-card__form-edit{
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}
</style>
