<script setup lang="ts">
import BaseModal from '@/shared/components/Modal/BaseModal.vue'
import ModaelDelete from '@/shared/components/modals/ModaelDelete.vue'
import ProfileReportForm from '@/modules/profile/components/ProfileReportForm.vue'
import { useModal } from '@/shared/components/Modal/composables/useModal'
import { deepMerge } from '@/shared/composables/utils/useDeepMerge'
import { useAdminReport } from '../composables/useAdminReport'
import { useShowPopup } from '@/shared/components/Popup/useShowPopup'
import { useAuthStore } from '@/modules/auth'

import type { ReportBase } from '@shared/types'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type ReportData<Id=string,File=string> = ReportBase<Id,File> & { user: { name: string; email: string } }

const props = defineProps<{
  report: ReportData
}>()

const authStore = useAuthStore()

const showPopup = useShowPopup()
const { updateReport, deleteReport } = useAdminReport(props.report._id)


const MODAL_ID_DELETE = 'admin-report-card-modal-delete__' + props.report._id
const deletModal = useModal(MODAL_ID_DELETE)
const deleteReportSubmit = async (id: string) => {
  const res = await deleteReport(id)
  if(res) showPopup.addSuccessPopup(t('admin.reports.deleted'))
  else showPopup.addErrorPopup(t('admin.reports.deleteError'))
  deletModal.closeModal()
}

const MODAL_ID = 'admin-report-card-modal__' + props.report._id
const editModal = useModal(MODAL_ID)

const formValue = ref<ReportData<string, File | string>>(deepMerge(props.report,props.report))

const editReport = async() => {
  const fileAnnotation = formValue.value.fileAnnotation
  const data = {
    ...formValue.value,
    fileAnnotation: fileAnnotation instanceof File ? fileAnnotation : undefined
  }
  const res = await updateReport(props.report._id, data)
  editModal.closeModal()
  if(res) showPopup.addSuccessPopup(t('admin.reports.statusUpdated'))
  else showPopup.addErrorPopup(t('admin.reports.statusUpdateError'))
}

const opentEditModal = () => {
  formValue.value = deepMerge(props.report,props.report)
  editModal.openModal()
}


const reportSetStatus = async (status: "draft" | "published" | "rejected" | "waiting") => {
  const res = await updateReport(props.report._id, {status})
  editModal.closeModal()
  if(res) showPopup.addSuccessPopup(t('admin.reports.statusUpdated'))
  else showPopup.addErrorPopup(t('admin.reports.statusUpdateError'))
}

</script>
<template>
  <div class="admin-report-card base-block-md">
    <div class="admin-report-card__content">
      <div class="admin-report-card__title">{{ report.title }}</div>
      <div class="admin-report-card__separator">/</div>
      <div class="admin-report-card__name">{{ report.user.name }}</div>
      <div class="admin-report-card__separator">/</div>
      <div class="admin-report-card__email">{{ report.user.email }}</div>
      <div class="admin-report-card__separator">/</div>
      <div class="admin-report-card__status">
        <div class="admin-report-card__status-icon" :class="report.status"/>
        {{ $t(`admin__report-cards__status.${report.status}`) }}
      </div>
    </div>
    <div class="admin-report-card__actions">
      <BaseButton color="accent" icon="edit" @click="opentEditModal" />
      <!-- <BaseButton color="accent" icon="eye-show" /> -->
      <BaseButton color="error" icon="trash" @click="deletModal.openModal"  v-if="authStore.checkRole(['admin','manager'])"/>
    </div>
  </div>
  <BaseModal :id="MODAL_ID" :title="$t('admin.reports.editTitle')">
    <div class="admin-report-card__form-edit container">
      <ProfileReportForm v-model="formValue" />
      <div class="admin-report-card__form-buttons">
        <BaseButton @click="reportSetStatus('published')" color="success">{{ $t('admin.reports.approve') }}</BaseButton>
        <BaseButton @click="reportSetStatus('rejected')" color="error">{{ $t('admin.reports.reject') }}</BaseButton>
        <BaseButton @click="editReport" color="accent" v-if="authStore.checkRole(['admin','manager'])">{{ $t('common.save') }}</BaseButton>
        <BaseButton @click="editModal.closeModal" color="secondary">{{ $t('common.cancel') }}</BaseButton>
      </div>
    </div>
  </BaseModal>
  <ModaelDelete :id="MODAL_ID_DELETE" :title="$t('admin.reports.deleteTitle')" @delete="deleteReportSubmit(report._id)">
    {{ $t('admin.reports.confirmDelete') }}
    <br />
    <br />
    <b>&laquo;{{ report.title }}&raquo;</b>?
  </ModaelDelete>
</template>
<style lang="scss" scoped>
.admin-report-card {
  display: flex;
  gap: $spacing-sm;
  justify-content: space-between;
}
.admin-report-card__content {
  width: 100px;
  display: flex;
  gap: $spacing-xs;
  align-items: center;
  flex-grow: 1;
}
.admin-report-card__separator{
  font-size: 18px;
  color: $color-primary;
  line-height: 1;

}
.admin-report-card__title, .admin-report-card__name,
.admin-report-card__email, .admin-report-card__status{
  font-size: 18px;
  flex: 0 0 120px;
  @include text-ellipsis;
  @include desktop{
    font-size: 16px;
  }
}
.admin-report-card__title {
  flex-grow: 1;
}
.admin-report-card__name{
  flex-basis: 270px;
}
.admin-report-card__email {
  flex-basis: 200px;
}
.admin-report-card__status{
  flex-basis: 120px;
  display: flex;
  gap: $spacing-xs;
}
.admin-report-card__status-icon{
  width: 20px;
  height: 20px;
  border-radius: 4px;
  &.draft{
    background-color: $color-secondary;
  }
  &.published{
    background-color: $color-success;
  }
  &.rejected{
    background-color: $color-error;
  }
  &.waiting{
    background-color: $color-warning;
  }
}
.admin-report-card__actions {
  flex-shrink: 0;
  display: flex;
  gap: $spacing-sm;
}

.admin-report-card__form-edit {
  width: calc(100vw - 300px);
  overflow-y: auto;
  padding: 0;

  &:deep(.profile-report-create__block){
    padding: 0;
  }
}

.admin-report-card__form-buttons{
  margin-top: $spacing-xl;
  display: flex;
  gap: $spacing-lg;
  &>*{
    flex:1;
  }
  @include desktop{
    gap: $spacing-md;
  }
}
</style>
