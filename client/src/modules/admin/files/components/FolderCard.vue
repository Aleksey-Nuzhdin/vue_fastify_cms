<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/shared/components/Modal/BaseModal.vue';
import { useModal } from '@/shared/components/Modal/composables/useModal';
import { useAdminFolderMutations } from '../composables/useAdminFolderMutations';
import type { FolderBase } from '../admin.files.type';

type TypeProps = {
  folder: FolderBase
}
const props = defineProps<TypeProps>()
const emit = defineEmits<{
  click: [id: string]
}>()

const { deleteFolder, updateFolder } = useAdminFolderMutations()

const MODAL_EDIT_ID = 'folder-card-modal-edit_' + props.folder._id
const modalEdit = useModal(MODAL_EDIT_ID)

const MODAL_DELETE_ID = 'folder-card-modal-delete_' + props.folder._id
const modalDelete = useModal(MODAL_DELETE_ID)

const editName = ref(props.folder.name)

const heandleEdit = async () => {
  await updateFolder(props.folder._id, { name: editName.value })
  modalEdit.closeModal()
}

const heandleDelete = async () => {
  await deleteFolder(props.folder._id)
  modalDelete.closeModal()
}
</script>
<template>
  <div class="folder-card" @click="emit('click', props.folder._id)">
    <div class="folder-card__buttons-control">
      <BaseButton name="edit" color="secondary" icon="edit" radius="sm" size="sm"
        width="30" height="30"
        @click.stop="() => { editName = props.folder.name; modalEdit.openModal() }"
      />
      <BaseButton name="trash" color="error" icon="trash" radius="sm" size="sm"
        width="30" height="30"
        @click.stop="modalDelete.openModal"
      />
    </div>
    <div class="folder-card__icon" />
    <div class="folder-card__name"
      :title="folder.name"
    >
      {{ folder.name }}
    </div>
  </div>
  <BaseModal :id="MODAL_EDIT_ID" :title="$t('admin.files.editFolderTitle')">
    <div class="modal-edit">
      <label>
        <span>{{ $t('common.name') }}</span>
        <input v-model="editName" type="text" class="modal-edit__input" />
      </label>
      <div class="modal-edit__buttons">
        <BaseButton @click="heandleEdit">{{ $t('common.save') }}</BaseButton>
        <BaseButton color="secondary" @click="modalEdit.closeModal()">{{ $t('common.cancel') }}</BaseButton>
      </div>
    </div>
  </BaseModal>
  <BaseModal :id="MODAL_DELETE_ID" :title="$t('admin.files.deleteFolderTitle')">
    <div class="modal-delete">
      <p>{{ $t('common.confirmDelete') }}</p>
      <p><b>{{ folder.name }}</b>?</p>
      <div class="modal-delete__buttons">
        <BaseButton color="error" @click="heandleDelete">{{ $t('common.delete') }}</BaseButton>
        <BaseButton @click="modalDelete.closeModal()">{{ $t('common.close') }}</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
<style lang="scss" scoped>
.folder-card {
  position: relative;
  width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: $radius-md;
  padding: $spacing-sm;
  padding-top: $spacing-md;
  cursor: pointer;

  &:hover {
    background-color: $color-bg-gray-hover;
  }
}
.folder-card__buttons-control {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  padding: $spacing-xs;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.folder-card:hover .folder-card__buttons-control {
  opacity: 1;
}
.folder-card__icon {
  width: 100px;
  height: 70px;
  background-image: url("/icons/folder.svg");
  background-size: cover;
  background-position: center;
}

.folder-card__name {
  width: 100%;
  line-height: 1.3;
  @include text-clamp(3);
}

.modal-edit {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: $spacing-md;
  gap: $spacing-sm;
}
.modal-edit__input {
  width: 100%;
  padding: $spacing-xs $spacing-sm;
  border: 1px solid $color-border;
  border-radius: $radius-md;
}
.modal-edit__buttons {
  display: flex;
  gap: $spacing-sm;
  width: 100%;
  & > * { flex: 1; }
}

.modal-delete {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: $spacing-md;
  gap: $spacing-sm;
}
.modal-delete__buttons {
  display: flex;
  gap: $spacing-sm;
  width: 100%;
  & > * { flex: 1; }
}

</style>
