<script setup lang="ts">
import { computed } from 'vue';
import { useAdminFilesNavigation } from '../composables/useAdminFilesNavigation';
import { useModal } from '@/shared/components/Modal/composables/useModal';

import FileCard from '../components/FileCard';
import FolderCard from '../components/FolderCard.vue';
import ModalCreateFolder from '../components/ModalCreateFolder.vue';
import ModalCreateFile from '../components/ModalCreateFile.vue';

const { currentFolder, currentFolderId, goToRoot, openFolder, files, folders } = useAdminFilesNavigation()

const isLoading = computed(()=> folders.isLoading || files.isLoading || currentFolder.isLoading)
const isError = computed(()=> folders.isError || files.isError || currentFolder.isError)
const errorText = computed(()=>
  [folders.error.value?.message, files.error.value?.message, currentFolder.error.value?.message]
  .filter(Boolean).join(', ')
)

const sortedBreadCrumbs = computed(()=>{
  if(!currentFolder.data.value) return []
  return [...currentFolder.data.value.breadCrumbs]
    .sort((a,b)=> parseInt(a._id, 16) - parseInt(b._id, 16))
})


function goBack() {
  const crumbs = sortedBreadCrumbs.value
  if (crumbs.length > 0) {
    openFolder(crumbs[crumbs.length - 1]!._id)
  } else {
    goToRoot()
  }
}

const CREATE_FOLDER_MODAL_ID = 'create-folder-modal'
const folderModa = useModal(CREATE_FOLDER_MODAL_ID)

const CREATE_FILE_MODAL_ID = 'create-file-modal'
const fileModa = useModal(CREATE_FILE_MODAL_ID)


</script>
<template>
  <div class="admin-files">
    <div class="admin-files__nav">
      <BaseButton @click="folderModa.openModal()">{{ $t('admin.files.createFolderBtn') }}</BaseButton>
      <BaseButton @click="fileModa.openModal()">{{ $t('admin.files.uploadFileBtn') }}</BaseButton>
    </div>
    <div class="admin-files__content" v-if="isLoading">
      <div class="admin-files__header" v-if="currentFolder.data.value">
        <BaseButton @click="goBack()">←</BaseButton>
        <div class="admin-files__breadcrumbs">
          <template v-for="crumb of sortedBreadCrumbs">
            <span> / </span>
            <div class="admin-files__breadcrumbs-item"
              @click="openFolder(crumb._id)"
            >
              {{ crumb.name }}
            </div>
          </template>
          <span> / </span>
          <div class="admin-files__breadcrumbs-item active">
            {{ currentFolder.data.value.name}}
          </div>
          <!-- <div>
            {{ currentFolderId }}
          </div> -->
        </div>
      </div>
      <div class="admin-files__body">
        <div class="admin-files__folder-list">
          <FolderCard
            v-for="folder in folders.data.value"
            :folder
            @click="openFolder(folder._id)"
          />
        </div>
        <div class="admin-files__files-list">
          <FileCard v-for="file in files.data.value"
            :file
          />
        </div>
        <p class="admin-files__empty" v-if="!isLoading && ((files.data.value?.length ?? 0) + (folders.data.value?.length ?? 0))">
          {{ $t('admin.files.empty') }}
        </p>
        <p class="text-color-error"
          v-if="isError"
        >{{errorText}}</p>
      </div>
    </div>
    <BaseLoader v-else overlay/>
  </div>
  <ModalCreateFolder :id="CREATE_FOLDER_MODAL_ID"/>
  <ModalCreateFile :id="CREATE_FILE_MODAL_ID"/>
</template>
<style lang="scss" scoped>
.admin-files__body{
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}
.admin-files__folder-list, .admin-files__files-list{
  display:contents;
}

.admin-files__breadcrumbs{
  display: flex;
  gap: $spacing-sm;
}

.admin-files__breadcrumbs-item{
  cursor: pointer;
  &:hover{
    text-decoration: underline;
  }

  &.active{
    font-weight: bold;
    cursor: default;
    &:hover{
      text-decoration: none;
    }
  }
}
.admin-files__header{
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.admin-files__breadcrumbs{
  flex: 1;
  padding: 5px 10px;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  align-items: center;
}
</style>
