<script setup lang="ts">
import { computed, ref } from 'vue'

interface Option {
  value: string | number
  title: string
}

interface Props {
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  readonly?: boolean
  options?: Option[]
  errorText?: string
  modelValue?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isOpen = ref(false)
const selectRef = ref<HTMLSelectElement>()

</script>

<template>
  <div class="base-select" :class="{ 'base-select--error': errorText }">
    <label v-if="label" class="base-select__label">
      {{ label }}
      <span v-if="required" class="base-select__required">*</span>
    </label>
    <div class="base-select__wrapepr">
      <select
        v-model="selectValue"
        class="base-select__field"
        :class="{
          'base-select__field--readonly': readonly ,
          empty: !selectValue,
        }"
        :disabled
        ref="selectRef"
        @click="isOpen = !isOpen"
        @blur="isOpen = false"
        @change="selectRef?.blur()"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option class="base-select__option-item"
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="readonly"
        >
          {{ option.title }}
        </option>
      </select>
      <div class="base-select__icon" :class="{ 'open': isOpen }">
        <BaseIcon name="arrow-up" color="accent"/>
      </div>
    </div>
    <span v-if="errorText" class="base-select__error">
      {{ errorText }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.base-select {
  width: 100%;

}

.base-select__label {
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  margin-bottom: 6px;
}

.base-select__required {
  color: $color-error;
}

.base-select__wrapepr{
  position: relative;
  width: 100%;
}
.base-select__field {
  appearance: none;
  height: 57px;
  padding: $spacing-sm $spacing-lg ;
  display: flex;
  align-items: center;
  border: 1px solid $color-border;
  transition: border-color $transition-fast, box-shadow $transition-fast;
  background-color: $color-white;
  width: 100%;
  font-size: 16px;

  &.empty{
    color: $color-text-secondary;
  }

   &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
  }

  &:disabled {
    cursor: default;
    background: $color-bg-secondary;
  }

  // & ::picker(select) {
  //   appearance: base-select;
  //   background-color: red;
  // }

  @include desktop{
    height: 49px;
    font-size: 14px;
  }
}

.base-select__icon{
  position: absolute;
  right: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
  transition: transform $transition-fast;
  pointer-events: none;
  display: flex;
  align-items: center;


  &.open {
    transform: translateY(-50%) rotate(-180deg);
  }
}

.base-select__option-item{
  color: $color-black;
}
.base-select__field--readonly{
  border-color: $color-border-readonly;
  &:focus{
    border-color: $color-border-readonly;
    box-shadow: none;
  }
}

.base-select--error .base-select__field {
  border-color: $color-error;
}

.base-select__error {
  font-size: 16px;
  color: $color-error;
}

</style>
