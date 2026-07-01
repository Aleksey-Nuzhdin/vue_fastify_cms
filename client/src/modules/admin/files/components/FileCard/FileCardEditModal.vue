<script setup lang="ts">
import BaseModal from '@/shared/components/Modal/BaseModal.vue';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useAdminFileMutations } from '../../composables/useAdminFileMutations';
import { useModal } from '@/shared/components/Modal/composables/useModal';

import type { FileBase } from '../../admin.files.type';
import type { FileTypeResult } from './useFileType';

type TypeProps = {
  file: FileBase
  fileType: FileTypeResult
  isImage: boolean
}
const props = defineProps<TypeProps>()
const emit = defineEmits<{ updated: [] }>()

const { t } = useI18n()

const MODAL_ID = 'file-card-modal-edit_' + props.file._id
const modal = useModal(MODAL_ID)
const { updateFile } = useAdminFileMutations()

const editName = ref(props.file.name)
const editInfo = ref(props.file.info)
const editFile = ref<File | null>(null)
const editError = ref('')

const filePlaceholder = computed(() =>
  props.isImage ? t('admin.files.selectImage') : t('admin.files.selectFile', { ext: props.file.extension })
)

const handleEdit = async () => {
  editError.value = ''

  if (editFile.value) {
    if (props.isImage) {
      if (!editFile.value.type.startsWith('image/')) {
        editError.value = t('admin.files.onlyImage')
        return
      }
    } else {
      const ext = editFile.value.name.split('.').pop()?.toLowerCase()
      if (ext !== props.file.extension) {
        editError.value = t('admin.files.wrongExtension', { ext: props.file.extension })
        return
      }
    }
  }

  await updateFile(
    props.file._id,
    { name: editName.value, info: editInfo.value },
    editFile.value ?? undefined
  )
  editFile.value = null
  modal.closeModal()
  emit('updated')
}

const open = () => {
  editName.value = props.file.name
  editInfo.value = props.file.info
  editFile.value = null
  editError.value = ''
  modal.openModal()
}

defineExpose({ open })
</script>
<template>
<BaseModal :id="MODAL_ID" :title="$t('admin.files.editFileTitle')">
  <div class="flex-column">
    <BaseInput :label="$t('common.name')"
      :placeholder="$t('admin.files.namePlaceholder')"
      v-model="editName"
    />
    <BaseInput :label="$t('common.description')"
      :placeholder="$t('admin.files.descriptionPlaceholder')"
      type="textarea"
      v-model="editInfo"
    />
    <BaseInputFile :label="$t('admin.files.replaceFile')"
      :placeholder="filePlaceholder"
      v-model="editFile"
    />
    <p v-if="editError" class="text-color-error">{{ editError }}</p>
    <div class="flex-row">
      <BaseButton color="success" @click="handleEdit">{{ $t('common.save') }}</BaseButton>
      <BaseButton @click="modal.closeModal()">{{ $t('common.cancel') }}</BaseButton>
    </div>
  </div>
</BaseModal>
</template>
