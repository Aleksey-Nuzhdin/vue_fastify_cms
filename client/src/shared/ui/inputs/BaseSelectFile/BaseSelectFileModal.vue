<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/shared/components/Modal/BaseModal.vue'
import { useModal } from '@/shared/components/Modal/composables/useModal'
import { useStorageNavigation } from './useStorageNavigation'
import { useFileType } from '@/modules/admin/files/components/FileCard/useFileType'
import type { FileBase } from '@/modules/admin/files/admin.files.type'

const props = defineProps<{
  id: string
  selectedValue?: string
}>()

const emit = defineEmits<{
  select: [file: FileBase]
}>()

const modal = useModal(props.id)

const {
  currentFolder,
  folders,
  files,
  isLoading,
  isError,
  errorText,
  sortedBreadCrumbs,
  openFolder,
  goToRoot,
  goBack,
} = useStorageNavigation()

const selectedFile = ref<FileBase | null>(null)

function selectFile(file: FileBase) {
  selectedFile.value = file
}

function confirmSelection() {
  if (selectedFile.value) {
    emit('select', selectedFile.value)
    modal.closeModal()
  }
}

function isSelected(file: FileBase) {
  return selectedFile.value?._id === file._id
}

function getFileType(extension: string) {
  return useFileType(extension)
}

defineExpose({
  open() {
    selectedFile.value = null
    modal.openModal()
  },
})


</script>
<template>
  <BaseModal :id="props.id" :title="$t('fileSelect.modalTitle')" width="700px">
    <div class="select-file-modal">
      <div class="select-file-modal__header" v-if="currentFolder.data.value">
        <BaseButton size="sm" @click="goBack()">&#8592;</BaseButton>
        <div class="select-file-modal__breadcrumbs">
          <span class="select-file-modal__breadcrumb-item" @click="goToRoot()">
            /
          </span>
          <template v-for="crumb of sortedBreadCrumbs" :key="crumb._id">
            <span class="select-file-modal__breadcrumb-item"
              @click="openFolder(crumb._id)"
            >
              {{ crumb.name }}
            </span>
            <span> / </span>
          </template>
          <span class="select-file-modal__breadcrumb-item active">
            {{ currentFolder.data.value.name }}
          </span>
        </div>
      </div>
      <div class="select-file-modal__preview" v-if="selectedFile">
        <div class="select-file-modal__preview-icon">
          <BaseImg v-if="useFileType(selectedFile.extension).isImage.value"
            :src="selectedFile.fullPath + '?width=150&height=150&'"
            :alt="selectedFile.name"
          />
          <div class="select-file-modal__preview-icon-placeholder"
            :class="'select-file-modal__preview-icon-type_' + getFileType(selectedFile.extension).fileType.value"
            v-else
          />

        </div>
        <div class="select-file-modal__preview-data">
          <p><b>{{ $t('fileSelect.selectedFile') }}</b></p>
          <div class="select-file-modal__preview-name">
            {{ $t('common.name') }}: {{ selectedFile?.name }}
          </div>
          <div class="select-file-modal__preview-name"
            v-if="selectedFile?.info"
          >
            {{ $t('common.description') }}: {{ selectedFile?.info }}
          </div>
          <div class="select-file-modal__preview-name">
            {{ $t('fileSelect.extension') }}: {{ selectedFile?.extension }}
          </div>


        </div>
      </div>
      <div class="select-file-modal__body" v-if="!isLoading">
        <div class="select-file-modal__items">
          <div
            v-for="folder in folders.data.value"
            :key="folder._id"
            class="select-file-modal__item select-file-modal__item--folder"
            @click="openFolder(folder._id)"
          >
            <div class="select-file-modal__item-icon--folder" />
            <span class="select-file-modal__item-name">{{ folder.name }}</span>
          </div>

          <div
            v-for="file in files.data.value"
            :key="file._id"
            class="select-file-modal__item select-file-modal__item--file"
            :class="{ 'select-file-modal__item--selected': isSelected(file) }"
            @click="selectFile(file)"
          >

            <div class="select-file-modal__item-icon_wrapper">
              <BaseImg v-if="useFileType(file.extension).isImage.value"

                :src="file.fullPath + '?width=24&height=24&'"
                :alt="file.name"
              />
              <div class="select-file-modal__item-icon"
                :class="'select-file-modal__item-icon--' + getFileType(file.extension).fileType.value"
                v-else
              />
            </div>
            <span class="select-file-modal__item-name">{{ file.name }}</span>
            <span class="select-file-modal__item-ext">.{{ file.extension }}</span>
          </div>
        </div>

        <p class="select-file-modal__empty"
          v-if="!isLoading && ((files.data.value?.length ?? 0) + (folders.data.value?.length ?? 0)) === 0"
        >
          {{ $t('fileSelect.empty') }}
        </p>

        <p class="text-color-error" v-if="isError">{{ errorText }}</p>
      </div>
      <BaseLoader v-else overlay />

      <div class="select-file-modal__footer">
        <BaseButton @click="confirmSelection" :disabled="!selectedFile">
          {{ $t('common.select') }}
        </BaseButton>
        <BaseButton color="secondary" @click="modal.closeModal()">
          {{ $t('common.cancel') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
<style lang="scss" scoped>
.select-file-modal {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  min-height: 300px;
  width: 650px;
}

.select-file-modal__header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.select-file-modal__breadcrumbs {
  flex: 1;
  display: flex;
  gap: $spacing-xs;
  padding: 5px 10px;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  align-items: center;
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.select-file-modal__breadcrumb-item {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  &.active {
    font-weight: bold;
    cursor: default;
    &:hover {
      text-decoration: none;
    }
  }
}

.select-file-modal__body {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.select-file-modal__items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.select-file-modal__item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xs $spacing-sm;
  cursor: pointer;
  margin-bottom: 2px;

  &:hover {
    background-color: $color-bg-gray-hover;
  }

  &--selected {
    background-color: rgba($color-primary, 0.1);
    outline: 2px solid $color-primary;
  }
}

.select-file-modal__item-icon_wrapper {
  width: 24px;
  height: 24px;
}

.select-file-modal__item-icon--folder{
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url("/icons/folder.svg");
}
.select-file-modal__item-icon {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;

  @include file-icon-types('select-file-modal__item-icon--');
}

.select-file-modal__item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-file-modal__item-ext {
  color: $color-text-secondary;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.select-file-modal__empty {
  text-align: center;
  color: $color-text-secondary;
  padding: $spacing-lg;
}

.select-file-modal__footer {
  display: flex;
  gap: $spacing-sm;
  justify-content: flex-end;
}

.select-file-modal__preview{
  display: flex;
  gap: $spacing-md;
}
.select-file-modal__preview-icon{
  width: 150px;
  height: 150px;
  border-radius: $radius-md;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: $radius-md;
  overflow: hidden;
  flex-shrink: 0;
}
.select-file-modal__preview-icon-placeholder{
  width: 150px;
  height: 150px;
  border-radius: $radius-md;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: $radius-md;
  overflow: hidden;
  @include file-icon-types('select-file-modal__preview-icon-type_');
}
</style>
