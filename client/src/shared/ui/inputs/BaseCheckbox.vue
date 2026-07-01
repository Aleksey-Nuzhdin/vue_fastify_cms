<script setup lang="ts" generic="T = boolean">
import { computed } from 'vue'

type BooleanValue = {
  modelValue: boolean
}
type ArrayValue<T> = {
  modelValue: T[]
  value: T
}
type BaseProps = {
  label?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  errorText?: string
}

type Props = BaseProps & (BooleanValue | ArrayValue<T>)

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean | T[]]
}>()

const isArrayMode = computed(() => Array.isArray(props.modelValue))

const valueCheckbox = computed({
  get: () => {
    if (isArrayMode.value) {
      return (props.modelValue as T[]).includes((props as ArrayValue<T>).value)
    }
    return props.modelValue as boolean
  },
  set: (val: boolean) => {
    if (isArrayMode.value) {
      const arr = [...(props.modelValue as T[])]
      const item = (props as ArrayValue<T>).value
      if (val) {
        if (!arr.includes(item)) arr.push(item)
      } else {
        const idx = arr.indexOf(item)
        if (idx !== -1) arr.splice(idx, 1)
      }
      emit('update:modelValue', arr)
    } else {
      emit('update:modelValue', val)
    }
  },
})
</script>

<template>
  <div class="base-checkbox-wrapper" :class="{ 'base-checkbox-wrapper--error': errorText }">
    <label class="base-checkbox"
      :class="{
        'base-checkbox--disabled': disabled,
        'base-checkbox--readonly': readonly,
      }"
    >
      <input
        v-model="valueCheckbox"
        type="checkbox"
        class="base-checkbox__input"
        :disabled="disabled || readonly"
        :readonly
      />
      <span class="base-checkbox__box" />
      <slot>
        <span v-if="label" class="base-checkbox__label">
          {{ label }}
        </span>
      </slot>
      <span v-if="required" class="base-checkbox__required">*</span>
    </label>
    <span v-if="errorText" class="base-checkbox__error">
      {{ errorText }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.base-checkbox {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: pointer;
  user-select: none;
}
.base-checkbox--disabled {
  cursor: default;
  opacity: 0.6;
}
.base-checkbox--readonly{
  cursor: default;
  opacity: 1;
  user-select: unset;
  &> .base-checkbox__box{
    opacity: 0.6;
  }
}

.base-checkbox__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.base-checkbox__box {
  width: 24px;
  height: 24px;
  background: url('/icons/checkbox_empty.svg') center / 120% no-repeat ;
  border-radius: 8px;
}

.base-checkbox__input:checked + .base-checkbox__box {
  background: url('/icons/checkbox_select.svg') center / 120% no-repeat ;
}

.base-checkbox__input:focus + .base-checkbox__box {
  box-shadow: 0 0 0 2px rgba($color-accent, 0.2);
}

.base-checkbox__label {
  font-size: 16px;
  color: $color-text;
}

.base-checkbox__required {
  margin-left: -6px;
  color: $color-error;
}

.base-checkbox__error {
  font-size: 12px;
  color: $color-error;
}


</style>
