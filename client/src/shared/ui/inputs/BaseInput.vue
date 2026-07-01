<script setup lang="ts">
import type { InputType } from '@/shared/types/inputs.types'
import { computed, ref } from 'vue'

interface Props {
  type?: InputType
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  errorText?: string
  modelValue?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const inputRef = ref<HTMLInputElement | null>(null)
defineExpose({ inputRef })

const showPassword = ref(false)
const effectiveType = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'text' : 'password'
  return props.type
})
</script>

<template>
  <div class="base-input" :class="{ 'base-input--error': errorText }">
    <label v-if="label" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>

    <textarea
      v-if="type === 'textarea'"
      v-model="inputValue"
      class="base-input__field base-input__field--textarea"
      :placeholder="placeholder"
      :disabled
      :readonly
      :tabindex="readonly ? -1 : undefined"
      @focus="readonly && ($event.target as HTMLTextAreaElement).blur()"
    />

    <div v-else class="base-input__wrapper">
      <input
        ref="inputRef"
        v-model="inputValue"
        class="base-input__field"
        :type="effectiveType"
        :placeholder="placeholder"
        :disabled
        :readonly
        :tabindex="readonly ? -1 : undefined"
        @focus="readonly && ($event.target as HTMLInputElement).blur()"
      />
      <button
        v-if="type === 'password' && !readonly && !disabled"
        type="button"
        class="base-input__eye"
        :class="{ 'base-input__eye--active': showPassword }"
        @click="showPassword = !showPassword"
      >
        <BaseIcon :name="showPassword ? 'eye-show' : 'eye-off'" color="accent" />
      </button>
    </div>

    <span v-if="errorText" class="base-input__error">
      {{ errorText }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.base-input {
  display: flex;
  flex-direction: column;
}
.base-input__label {
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  margin-bottom: 6px;
}

.base-input__required {
  color: $color-error;
}

.base-input__field {

  padding: $spacing-sm $spacing-lg;
  border: 1px solid $color-border;
  height: 57px;
  font-size: 16px;
  // padding: $spacing-sm $spacing-md;
  // border: 1px solid $color-border;
  // border-radius: $radius-md;
  // font-size: 1rem;
  transition: border-color $transition-fast, box-shadow $transition-fast;

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
  }

  &:disabled {
    background: $color-bg-secondary;
    // cursor: not-allowed;
  }
  &:read-only {
    cursor: default;
    border: 1px solid $color-border-readonly;

    &:focus{
      box-shadow: none;
      border: 1px solid $color-border-readonly;
    }
  }

  @include desktop{
    height: 49px;
    font-size: 14px;
  }
}

.base-input__field--textarea {
  min-height: 100px;
  resize: vertical;
}

.base-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .base-input__field {
    width: 100%;
  }
}

.base-input__eye {
  position: absolute;
  right: $spacing-md;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  flex-shrink: 0;

  transition: background-color $transition-fast;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &--active {
    opacity: 1;
  }
}

.base-input--error .base-input__field {
  border-color: $color-error;
}

.base-input__error {
  font-size: 14px;
  color: $color-error;
}

</style>
