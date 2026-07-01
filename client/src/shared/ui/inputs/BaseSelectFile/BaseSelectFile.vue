<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import BaseSelectFileModal from './BaseSelectFileModal.vue'
import type { FileBase } from '@/modules/admin/files/admin.files.type'

interface Props {
  id: string
  type:string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  errorText?: string
  modelValue?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectFileModal = ref<InstanceType<typeof BaseSelectFileModal>>()
const previewUrl = ref<string | null>(null)

const hasValue = computed(() => !!props.modelValue)

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'webp']

const imageCache = new Set<string>()
let skipNextWatch = false

function openModal() {
  if (props.disabled || props.readonly) return
  selectFileModal.value?.open()
}

function tryLoadImage(url: string) {
  const img = new Image()
  img.onload = () => {
    imageCache.add(url)
    previewUrl.value = url
  }
  img.onerror = () => { previewUrl.value = null }
  img.src = url
}

function onFileSelected(file: FileBase) {
  skipNextWatch = true
  emit('update:modelValue', file.fullPath)
  if (IMAGE_EXTENSIONS.includes(file.extension)) {
    imageCache.add(file.fullPath)
    previewUrl.value = file.fullPath
  } else {
    previewUrl.value = null
  }
}

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  skipNextWatch = true
  emit('update:modelValue', val)
  previewUrl.value = imageCache.has(val) ? val : null
}

function clearValue() {
  previewUrl.value = null
  skipNextWatch = true
  emit('update:modelValue', '')
}

onMounted(() => {
  if (props.modelValue) {
    tryLoadImage(props.modelValue)
  }
})

watch(() => props.modelValue, (newVal) => {
  if (skipNextWatch) {
    skipNextWatch = false
    return
  }
  if (newVal) {
    tryLoadImage(newVal)
  } else {
    previewUrl.value = null
  }
})

const MODAL_ID = `base-select-file-modal-${props.id}_${Date.now()}_${Math.random()}`
</script>
<template>
  <div class="base-select-file" :class="{ 'base-select-file--error': errorText }">
    <label v-if="label" :for="id" class="base-select-file__label">
      {{ label }}
      <span v-if="required" class="base-select-file__required">*</span>
    </label>

    <div class="base-select-file__wrapper" :class="{ 'base-select-file__wrapper--readonly': readonly }">
      <div v-if="previewUrl" class="base-select-file__thumb">
        <img :src="previewUrl" alt="" class="base-select-file__thumb-img" />
        <div class="base-select-file__thumb-popup">
          <img :src="previewUrl" alt="" class="base-select-file__thumb-popup-img" />
        </div>
      </div>

      <input
        :id="id"
        class="base-select-file__input"
        type="text"
        :value="modelValue"
        :placeholder="placeholder || $t('fileSelect.inputPlaceholder')"
        :disabled="disabled"
        :readonly="readonly"
        @input="onInput"
      />

      <div class="base-select-file__buttons">
        <BaseButton v-if="!readonly" color="accent" icon="cloud-download" size="sm"
          @click="openModal"
        />
        <a v-if="hasValue" :href="modelValue" target="_blank" class="base-select-file__link">
          <BaseButton color="primary" icon="download" size="sm"/>
        </a>
        <BaseButton v-if="hasValue && !readonly" color="error" icon="trash" size="sm"
          @click="clearValue"
        />
      </div>
    </div>

    <span v-if="errorText" class="base-select-file__error">
      {{ errorText }}
    </span>
  </div>

  <BaseSelectFileModal
    ref="selectFileModal"
    :id="MODAL_ID"
    :selected-value="modelValue"
    @select="onFileSelected"
  />
</template>
<style lang="scss" scoped>
.base-select-file {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.base-select-file__label {
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
}

.base-select-file__required {
  color: $color-error;
}

.base-select-file__wrapper {
  height: 57px;
  padding: 0 $spacing-sm 0 $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  border: 1px solid $color-border;
  transition: border-color $transition-fast;
  background-color: $color-white;
  width: 100%;
  position: relative;

  &:focus-within {
    border-color: $color-primary;
  }

  &--readonly {
    border-color: $color-border-readonly;
    &:focus-within {
      border-color: $color-border-readonly;
    }
  }

  @include desktop {
    height: 49px;
  }
}

.base-select-file__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: $color-text;
  min-width: 0;

  &::placeholder {
    color: $color-text-secondary;
  }

  &:disabled {
    background: transparent;
    color: $color-text-secondary;
    cursor: not-allowed;
  }

  @include desktop {
    font-size: 14px;
  }
}

.base-select-file--error .base-select-file__wrapper {
  border-color: $color-error;
}

.base-select-file__error {
  font-size: 0.75rem;
  color: $color-error;
}

.base-select-file__buttons {
  display: flex;
  gap: $spacing-xs;
  flex-shrink: 0;
}

.base-select-file__thumb {
  position: relative;
  flex-shrink: 0;
  z-index: 1;
  margin-left: -16px;

  &:hover .base-select-file__thumb-popup {
    display: flex;
  }
}

.base-select-file__thumb-img {
  width: 28px;
  height: 28px;
  object-fit: cover;
  display: block;
}

.base-select-file__thumb-popup {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 100;
  background: $color-white;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 150px;
  background-color: #dddcdc;
}

.base-select-file__thumb-popup-img {
  width: 150px;
  height: 150px;
  object-fit: contain;
  display: block;
}
</style>
