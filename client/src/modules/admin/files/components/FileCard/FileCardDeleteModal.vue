<script setup lang="ts">
import BaseModal from '@/shared/components/Modal/BaseModal.vue';

import { useAdminFileMutations } from '../../composables/useAdminFileMutations';
import { useModal } from '@/shared/components/Modal/composables/useModal';

import type { FileBase } from '../../admin.files.type';

const props = defineProps<{ file: FileBase }>()

const MODAL_ID = 'file-card-modal-delete_' + props.file._id
const modal = useModal(MODAL_ID)

const { deleteFile } = useAdminFileMutations()

const handleDelete = async () => {
  await deleteFile(props.file._id)
  modal.closeModal()
}

defineExpose({ open: modal.openModal })
</script>
<template>
<BaseModal :id="MODAL_ID" :title="$t('admin.files.deleteFileTitle')">
  <div class="modal-delete">
    <p>{{ $t('common.confirmDelete') }}</p>
    <p><b>{{ file.name }}</b>?</p>
    <div class="modal-delete__buttons">
      <BaseButton color="error" @click="handleDelete">{{ $t('common.delete') }}</BaseButton>
      <BaseButton @click="modal.closeModal()">{{ $t('common.close') }}</BaseButton>
    </div>
  </div>
</BaseModal>
</template>
<style lang="scss" scoped>
.modal-delete{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: $spacing-md;
  gap: $spacing-sm;
}
.modal-delete__buttons{
  display: flex;
  gap: $spacing-sm;
  width: 100%;
  & > * { flex: 1; }
}
</style>
