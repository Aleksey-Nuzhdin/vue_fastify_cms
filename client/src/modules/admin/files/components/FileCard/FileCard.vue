<script setup lang="ts">
import { ref } from 'vue';

import FileCardInfoModal from './FileCardInfoModal.vue';
import FileCardEditModal from './FileCardEditModal.vue';
import FileCardDeleteModal from './FileCardDeleteModal.vue';
import { useFileType } from './useFileType';

import type { FileBase } from '../../admin.files.type';

type TypeProps = {
  file: FileBase,
  class?: string
}
const props = defineProps<TypeProps>()
const emit = defineEmits(['click'])

const { fileType, isImage } = useFileType(() => props.file.extension)

const cacheBuster = ref('')

const infoModal = ref<InstanceType<typeof FileCardInfoModal>>()
const editModal = ref<InstanceType<typeof FileCardEditModal>>()
const deleteModal = ref<InstanceType<typeof FileCardDeleteModal>>()

const handleClick = ($event: Event) => {
  infoModal.value?.open()
  emit('click', $event)
}

const handleDownload = () => {
  const link = document.createElement('a')
  link.href = props.file.fullPath
  link.download = props.file.name
  link.click()
}

const onFileUpdated = () => {
  cacheBuster.value = String(Date.now())
}
</script>
<template>
<div class="file-card" @click="handleClick" :class="`${props.class}`">
  <div class="file-card__preview">
    <div class="file-card__img-container" v-if="fileType === 'img'">
      <BaseImg class="file-card__img"
        :src="props.file.fullPath + '?width=130&height=70&v=' + cacheBuster"
      />
    </div>
    <div class="file-card__icon" v-else
      :class="['file-card__icon-type_' + fileType]"
    />
    <BaseButton class="file-card__btn file-card__btn--top-left"
      name="edit" color="warning" icon="edit" radius="sm" size="sm"
      width="30" height="30"
      @click.stop="editModal?.open()"
    />
    <BaseButton class="file-card__btn file-card__btn--top-right"
      name="copy" color="secondary" icon="copy" radius="sm" size="sm"
      width="30" height="30"
      v-if="infoModal?.copyFullPath.isSupported"
      @click.stop="infoModal?.handleCopyFullPath()"
    />
    <BaseButton class="file-card__btn file-card__btn--bottom-left"
      name="download" color="primary" icon="download" radius="sm" size="sm"
      width="30" height="30"
      @click.stop="handleDownload"
    />
    <BaseButton class="file-card__btn file-card__btn--bottom-right"
      name="trash" color="error" icon="trash" radius="sm" size="sm"
      width="30" height="30"
      @click.stop="deleteModal?.open()"
    />
  </div>
  <p class="file-card__name"
    :title="file.name"
  >{{ file.name }}</p>
</div>

<FileCardInfoModal ref="infoModal"
  :file="file" :file-type="fileType" :cache-buster="cacheBuster"
/>
<FileCardEditModal ref="editModal"
  :file="file" :file-type="fileType" :is-image="isImage"
  @updated="onFileUpdated"
/>
<FileCardDeleteModal ref="deleteModal"
  :file="file"
/>
</template>
<style lang="scss" scoped>
.file-card{
  position: relative;
  width: 150px;
  max-height: 170px;
  border-radius: $radius-md;

  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-sm;
  padding-top: $spacing-md;
  gap: $spacing-xs;

  &:hover{
    background-color: $color-bg-gray-hover;
  }
}
.file-card__img-container{
  max-height: 100px;
  width: 120px;
}

.file-card__preview{
  position: relative;
  width: 120px;
  min-height: 70px;
}
.file-card__btn{
  position: absolute;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.file-card:hover .file-card__btn{
  opacity: 1;
}
.file-card__btn--top-left{
  top: -8px;
  left: -8px;
}
.file-card__btn--top-right{
  top: -8px;
  right: -8px;
}
.file-card__btn--bottom-left{
  bottom: -8px;
  left: -8px;
}
.file-card__btn--bottom-right{
  bottom: -8px;
  right: -8px;
}

.file-card__img{
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.file-card__icon{
  height: 70px;
  width: 100%;

  border-radius: $radius-md;
  position: relative;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;

  &::before{
    display: block;
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    border-radius: $radius-md;
  }

  @include file-icon-types('file-card__icon-type_');
}

.file-card__name{
  width: 100%;
  line-height: 1.3;
  @include text-clamp(3);
}
</style>
