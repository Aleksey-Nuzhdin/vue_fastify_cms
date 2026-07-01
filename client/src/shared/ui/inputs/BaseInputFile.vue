<script setup lang="ts">

import { computed, ref } from 'vue'
import type { st } from 'vue-router/dist/router-CWoNjPRp.mjs'

type TypeModelValue = File | string | null
interface Props {
  typeInputFile?: 'select' | 'upload'
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  errorText?: string
  modelValue?: TypeModelValue
  readonly?: boolean
  field?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: TypeModelValue],
  'change': [event: Event],
  'clear': [],
}>()

const inputValue = computed<TypeModelValue>({
  get: () => props.modelValue,
  set: (value:TypeModelValue) => {
    emit('update:modelValue', value)
  },
})

const inputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputValue.value = target.files?.[0] || null
  emit('change', event)
}

const inputRef = ref<HTMLInputElement | null>(null)
defineExpose({ inputRef })


const isStringValue = computed(() => typeof inputValue.value === 'string' && !!inputValue.value)

const isShowPlaceholder = computed(() =>{
  if(typeof inputValue.value === 'string' && inputValue.value) return false
  if(typeof inputValue.value !== 'string' && inputValue.value?.name) return false
  return true
})

const valueName = computed(() => {
  return typeof inputValue.value === 'string' ? inputValue.value : inputValue.value?.name
})

const clearValue = () => {
  inputValue.value = props.typeInputFile === 'select' ? '' : ''
  emit('clear')
}

const startChange = () => {
  inputRef.value?.click()
}

const handleWrapperClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest('button')) return
  if (event.target === inputRef.value) return
  if (isStringValue.value) {
    event.preventDefault()
    window.open(inputValue.value as string, '_blank')
  }
}


</script>

<template>
  <div class="base-input-file" :class="{ 'base-input-file--error': errorText }">
    <label v-if="label" class="base-input-file__label" :for="'input_file' + field"

    >
      {{ label }}
      <span v-if="required" class="base-input-file__required">*</span>
    </label>
    <label class="base-input-file__wrapper"
      :class="{['read-only']:readonly, empty:isShowPlaceholder}"
      @click="handleWrapperClick"
    >
      <div class="base-input-file__input-wrapper">
        <input
          :id="'input_file' + field"
          ref="inputRef"
          class="base-input-file__field"

          type="file"
          :placeholder
          :disabled
          :readonly
          :tabindex="readonly ? -1 : undefined"
          @change="inputChange"
          @focus="readonly && ($event.target as HTMLInputElement).blur()"
        />
        <span v-if="isShowPlaceholder" class="base-input-file__placeholder">
          {{ placeholder }}
        </span>
        <span class="base-input-file__file-name">
          {{ valueName }}
        </span>
      </div>

      <div class="base-input-file__buttons">
        <button @click.prevent.stop="startChange">
          <BaseIcon name="upload" size="24" color="accent"/>
        </button>
        <button @click.prevent.stop="clearValue" v-if="!isShowPlaceholder">
          <BaseIcon name="trash" size="26" color="error"/>
        </button>
      </div>
    </label>
    <span v-if="errorText" class="base-input-file__error">
      {{ errorText }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.base-input-file {
  display: flex;
  flex-direction: column;
}
.base-input-file__label {
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  margin-bottom: 6px;
}

.base-input-file__required {
  color: $color-error;
}

.base-input-file__wrapper {
  overflow: hidden;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm $spacing-lg;
  border: 1px solid $color-border;
  transition: border-color $transition-fast, box-shadow $transition-fast;
  font-size: 16px;
  height: 57px;

  &.empty{
    color: $color-text-secondary;
  }


  &:focus-within {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
  }

  &:disabled {
    background: $color-bg-secondary;
    // cursor: not-allowed;
  }
  &.read-only {
    cursor: default;
    border: 1px solid $color-border-readonly;

    &:focus-within{
      box-shadow: none;
      border: 1px solid $color-border-readonly;
    }
  }

  @include desktop{
    height: 49px;
    font-size: 14px;
  }
}

.base-input-file__input-wrapper{
  max-width: calc(100% - 56px);
  white-space: nowrap;
  @include text-ellipsis;
}

.base-input-file__field--textarea {
  min-height: 100px;
  resize: vertical;
}

.base-input-file__field {
  width: 0;
  height: 0;
  opacity: 0;
  z-index: -1000;
  background-color: red;


}

.base-input-file__eye {
  position: absolute;
  right: $spacing-sm;
  width: 20px;
  height: 20px;
  background: $color-primary;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity $transition-fast;

  &:hover {
    opacity: 0.8;
  }

  &--active {
    opacity: 1;
  }
}

.base-input-file--error .base-input-file__field {
  border-color: $color-error;
}

.base-input-file__error {
  font-size: 0.75rem;
  color: $color-error;
}

.base-input-file__buttons{
  display: flex;
  gap: $spacing-sm;
  margin-right: -16px;
  &>button{
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
