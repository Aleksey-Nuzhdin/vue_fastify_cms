<script setup lang="ts">
import BaseModal from '@/shared/components/Modal/BaseModal.vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useClipboard } from '@vueuse/core';
import { useModal } from '@/shared/components/Modal/composables/useModal';
import { useShowPopup } from '@/shared/components/Popup/useShowPopup';

import type { FileBase } from '../../admin.files.type';
import type { FileTypeResult } from './useFileType';

type TypeProps = {
  file: FileBase
  fileType: FileTypeResult
  cacheBuster: string
}
const props = defineProps<TypeProps>()

const { t } = useI18n()

const MODAL_ID = 'file-card-modal_' + props.file._id
const modal = useModal(MODAL_ID)

const showPopup = useShowPopup()
const fullPath = computed(() => props.file.fullPath)
const copyFullPath = useClipboard({ source: fullPath, copiedDuring: 10000 })

const handleCopyFullPath = () => {
  copyFullPath.copy(props.file.fullPath)
  showPopup.addPopup({ text: t('admin.files.linkCopiedPopup'), type: 'success' })
}

const handleDownload = () => {
  const link = document.createElement('a')
  link.href = props.file.fullPath
  link.download = props.file.name
  link.click()
}

defineExpose({ open: modal.openModal, copyFullPath, handleCopyFullPath })
</script>
<template>
<BaseModal :id="MODAL_ID" :title="$t('admin.files.fileInfoTitle')" width="525px">
  <div class="modal-info">
    <div class="modal-info__img-container">
      <BaseImg class="modal-info__img" v-if="fileType === 'img'"
        :src="props.file.fullPath + '?width=500&height=500&v=' + cacheBuster"
      />
      <div class="modal-info__file-icon" v-else
        :class="'modal-info__file-icon-type_' + (fileType ?? 'notfund')"
      />
    </div>
    <div class="modal-info__field">
      <span class="modal-info__label">{{ $t('common.name') }}</span>
      <span class="modal-info__title">{{ file.name }}</span>
    </div>
    <div class="modal-info__field" v-if="file.extension">
      <span class="modal-info__label">{{ $t('admin.files.extension') }}</span>
      <span class="modal-info__extension">{{ file.extension }}</span>
    </div>
    <div class="modal-info__field" v-if="file.info">
      <span class="modal-info__label">{{ $t('common.description') }}</span>
      <span class="modal-info__description">{{ file.info }}</span>
    </div>
    <div class="modal-info__field" v-if="!copyFullPath.isSupported.value">
      <span class="modal-info__label">{{ $t('admin.files.link') }}</span>
      <span class="modal-info__full-path">{{ file.fullPath }}</span>
    </div>
    <div v-if="copyFullPath.copied.value" class="modal-info__copied">
      {{ $t('admin.files.linkCopied') }}
    </div>
    <div class="modal-info__actions">
      <BaseButton v-if="copyFullPath.isSupported"
        icon="copy" color="secondary"
        @click="handleCopyFullPath"
      >{{ $t('admin.files.copyLink') }}</BaseButton>
      <BaseButton icon="download" color="primary"
        @click="handleDownload"
      >{{ $t('admin.files.download') }}</BaseButton>
      <BaseButton
        @click="modal.closeModal()"
      >{{ $t('common.close') }}</BaseButton>
    </div>
  </div>
</BaseModal>
</template>
<style lang="scss" scoped>
.modal-info{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: $spacing-md;
  gap: $spacing-sm;
}
.modal-info__img-container{
  max-height: 500px;
}
.modal-info__img{
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.modal-info__file-icon{
  width: 150px;
  height: 150px;
  border-radius: $radius-md;
  background-position: center;
  background-size: contain;
  position: relative;

  &::before{
    display: block;
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    border-radius: $radius-md
  }

  @include file-icon-types('modal-info__file-icon-type_');
}
.modal-info__field{
  display: flex;
  align-items: baseline;
  gap: $spacing-sm;
  width: 100%;
}
.modal-info__label{
  font-size: 12px;
  color: $color-text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  min-width: 90px;
}
.modal-info__title{
  font-weight: bold;
  word-break: break-word;
}
.modal-info__extension{
  background-color: $color-bg-gray-hover;
  padding: 2px 10px;
  border-radius: $radius-sm;
}
.modal-info__full-path{
  word-break: break-all;
  font-size: 13px;
}
.modal-info__actions{
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: $spacing-sm;
}
.modal-info__copied{
  color: $color-success;
  font-weight: bold;
}
</style>
