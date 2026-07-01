<script setup lang="ts" generic="T = string">
import { computed, ref } from 'vue'

interface Option {
  value: T
  title: string
}

interface Props {
  id: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  readonly?: boolean
  options?: Option[]
  errorText?: string
  modelValue?: T[]
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  modelValue: ()=> [],
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const selectValue = computed({
  get: () => props.modelValue,
  set: (value: T) =>{ emit('update:modelValue', value) },
})

const titleValues = computed(() => {
  return props.options
    .filter((option) => selectValue.value.includes(option.value))
    .map((option) => option.title)
})

const bodyRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)


const isOpen = ref(false)
const setPosition = () => {
  const wrapperNode = wrapperRef.value
  const bodyNode = bodyRef.value

  if(!wrapperNode || !bodyNode) return
  isOpen.value = !isOpen.value

  const rect = wrapperNode.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const absoluteLeft = rect.left + window.scrollX;

  bodyNode.style.top = `${absoluteTop + wrapperNode.offsetHeight + 10}px`
  bodyNode.style.left = `${absoluteLeft}px`
  bodyNode.style.minWidth = `${wrapperNode.offsetWidth}px`
}

const popoverId = `popover-${Date.now()}-${props.id}`

</script>
<template>
<div class="base-multi-select" ref="wrapperRef"
  :class="{disabled}"
>
  <div class="base-multi-select__label">
    {{ label }}
    <span v-if="required" class="text-color-error">*</span>
  </div>
  <button class="base-multi-select__btn"
    type="button"
    :popovertarget="popoverId"
    :class="{disabled:disabled, readonly:readonly}"
    @click="setPosition"
    :disabled
  >
    <template v-if="titleValues.length">
      <p>
        <span v-for="(value, index) in titleValues">
          <span v-if="index !== 0" class="base-multi-select__vlue-separator" > / </span>
          {{ value }}
        </span>
      </p>
    </template>
    <template v-else>
      <p class="base-multi-select__placeholder">
        {{ placeholder }}
      </p>
    </template>
    <div class="base-multi-select__chevron" :class="{open:isOpen}">
      <BaseIcon name="arrow-up" color="accent"/>
    </div>
  </button>
  <div popover class="base-multi-select__content"
    v-if="!disabled"
    :id="popoverId"
    ref="bodyRef"
  >
    <ul class="base-multi-select__list">
      <li v-for="(item, index) in options">
        <BaseCheckbox v-model="selectValue"
          :label="item.title"
          :key="index"
          :value="(item.value as T)"
          :readonly="readonly"
        />
      </li>
    </ul>
  </div>
</div>
</template>
<style lang="scss" scoped>
.base-multi-select{
  position: relative;
  width: 100%;
  min-width: 200px;
}
.base-multi-select__label{
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  margin-bottom: 6px;
}
.base-multi-select__btn{
  text-align: start;
  position: relative;
  width: 100%;
  padding: $spacing-sm calc(2*$spacing-lg) $spacing-sm $spacing-lg;
  border: 1px solid $color-border;
  font-size: 16px;
  background: transparent;
  cursor: pointer;
  transition: border-color $transition-fast;
  height: 57px;

  &>p{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
  }

  &.disabled {
    cursor: default;
    background: $color-bg-secondary;
  }

  &.readonly {
    cursor: default;
    border: 1px solid $color-border-readonly;

    &:focus{
      border-color: $color-border-readonly;
      box-shadow: none;
    }
  }

  @include desktop {
    height: 49px;
    font-size: 14px;
  }
}
.base-multi-select__vlue-separator{
  color: $color-primary;
  font-family: $font-text;
  font-size: 16px;
  font-weight: 500;
}
.base-multi-select__placeholder{
  color: $color-text-secondary;
}
.base-multi-select__content{
  position: absolute;
  border: none;
  background: transparent;
  box-shadow: 0 4px 6px -4px rgba(24, 39, 75, 0.12), 0 8px 8px -4px rgba(24, 39, 75, 0.08);
}
.base-multi-select__list{
  display: flex;
  border: 1px solid $color-border;
  background: $color-bg;
  padding: $spacing-sm;
  flex-direction: column;
  gap: $spacing-sm;

}

.base-multi-select__chevron{
  position: absolute;
  right: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
  transition: transform $transition-fast;
  pointer-events: none;
  display: flex;
  align-items: center;

  &.open{
    transform: translateY(-50%) rotate(180deg);
  }
}
</style>
