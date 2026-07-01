<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from './BaseIcon.vue'
import type { IconName, IconColor } from './BaseIcon.vue'

const props = withDefaults(defineProps<{
  disabled?: boolean,
  readonly?: boolean,
  variant?: 'filled' | 'outline',
  color?: 'primary' | 'accent' | 'secondary'| 'success' | 'warning' | 'error' | 'light-gray',
  bg?: string,
  bgHover?: string,
  textColor?: string,
  textColorHover?: string,
  borderColor?: string,
  size?: 'sm' | 'md' | 'lg' | 'xl',
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full',
  width?: number | string,
  height?: number | string,
  icon?: IconName,
  iconColor?: IconColor | string,
  iconSize?: number | string,
  iconRight?: boolean,
  arrows?: boolean
}>(), {
  size: 'md',
  radius: 'none',
})

const toCss = (v: number | string | undefined) => {
  if (v == null) return undefined
  return isNaN(Number(v)) ? v : `${v}px`
}

const resolvedIconSize = computed(() => props.iconSize ?? 'var(--_icon-size)')

const buttonStyle = computed(() => ({
  ...(props.width || props.height) && { padding:0, display:'flex', alignItems:'center', justifyContent:'center' },
  width: toCss(props.width),
  height: toCss(props.height),
  '--_bg': props.bg,
  '--_bg-hover': props.bgHover,
  '--_text': props.textColor,
  '--_text-hover': props.textColorHover,
  '--_border': props.borderColor,
}))

</script>
<template>
  <button class="base_button"
    :class="[
      readonly && 'base_button--readonly',
      arrows && 'base_button--arrows',
      color && `base_button--color-${color}`,
      variant === 'outline' && 'base_button--outline',
      size && `base_button--size-${size}`,
      radius && `base_button--radius-${radius}`,
      { 'base_button--icon-only': icon && !$slots.default }
    ]"
    :style="buttonStyle"
    :disabled
  >
    <div class="base_button--arrows-prew" v-if="arrows" />
    <BaseIcon v-if="icon && !iconRight" :name="icon" :color="iconColor" :size="resolvedIconSize" class="base_button__icon" />
    <slot />
    <BaseIcon v-if="icon && iconRight" :name="icon" :color="iconColor" :size="resolvedIconSize" class="base_button__icon" />
    <div class="base_button--arrows-next" v-if="arrows"/>
  </button>
</template>
<style lang="scss" scoped>
.base_button{
  --_icon-size: 20px;

  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-lg;
  transition: all $transition-normal;
  line-height: var(--_icon-size);
  background: var(--_bg, transparent);
  color: var(--_text, inherit);
  border: 1px solid var(--_border, black);
  align-self: center;
  justify-content: center;
  text-transform: uppercase;
  font-weight: 500;
  font-family: $font-title;

  &:hover{
    background: var(--_bg-hover, #c2bfbf);
    color: var(--_text-hover, var(--_text, inherit));
  }

  &:disabled{
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.base_button--readonly{
    opacity: 1;
    cursor: default;
    &:hover{
      background: var(--_bg, transparent);
      color: var(--_text, inherit);
    }
  }

  &--radius-none { border-radius: 0; }
  &--radius-sm { border-radius: $radius-sm; }
  &--radius-md { border-radius: $radius-md; }
  &--radius-lg { border-radius: $radius-lg; }
  &--radius-full { border-radius: 9999px; }

  --_button-height:40px;
  height: var(--_button-height, 40px);
  // sizes
  &--size-sm {  --_button-height: 34px; --_icon-size: 16px; padding: $spacing-xs $spacing-sm; font-size: 14px;
    @include desktop{--_button-height: 30px;  }
  }
  &--size-md {
    --_icon-size: 20px;
    padding: $spacing-md $spacing-lg;
    font-size: 18px;
    --_button-height: 48px;
    @include desktop{
      --_icon-size: 18px;
      --_button-height: 40px;
      // padding: $spacing-sm $spacing-md;
      padding: $spacing-sm $spacing-md;
      font-size: 16px;
      // letter-spacing: 0.28px;
    }
  }
  &--size-lg {
    --_button-height: 54px;
    --_icon-size: 24px;
    padding: $spacing-sm $spacing-md;
    font-size: 18px;
    // letter-spacing: 0.32px;
    @include desktop{
      --_button-height: 46px;
      --_icon-size: 22px;
      padding: $spacing-sm $spacing-md;
      font-size: 16px;
      // letter-spacing: 0.28px;
      // height: 46px;
    }


  }
  &--size-xl {
    --_icon-size: 30px; padding: $spacing-md $spacing-xl; font-size: 24px; height: 80px;
    @include desktop{
      font-size: 20px; padding: 12px; --_icon-size: 28px; height: 60px;
    }
  }

  // icon-only: square padding
  &--icon-only {
    padding: $spacing-sm;
    &.base_button--size-sm { padding: calc( ((var(--_button-height) - var(--_icon-size))/2) - 2px); }
    &.base_button--size-md { padding: calc( ((var(--_button-height) - var(--_icon-size))/2) - 2px); }
    &.base_button--size-lg { padding: calc( ((var(--_button-height) - var(--_icon-size))/2) - 2px); }
    &.base_button--size-xl { padding: calc( ((var(--_button-height) - var(--_icon-size))/2) - 2px); }
  }

  // colors
  &--color-primary {
    --_bg: var(--color-primary);
    --_bg-hover: transparent;
    --_text: var(--color-white);
    --_text-hover: var(--color-primary);
    --_border: var(--color-primary);
  }
  &--color-accent {
    --_bg: var(--color-accent);
    --_bg-hover: transparent;
    --_text: var(--color-white);
    --_text-hover: var(--color-accent);
    --_border: var(--color-accent);
  }
  &--color-secondary {
    --_bg: var(--color-secondary);
    --_bg-hover: transparent;
    --_text: var(--color-white);
    --_text-hover: var(--color-secondary);
    --_border: var(--color-secondary);
  }
  &--color-success {
    --_bg: var(--color-success);
    --_bg-hover: transparent;
    --_text: var(--color-white);
    --_text-hover: var(--color-success);
    --_border: var(--color-success);
  }
  &--color-warning {
    --_bg: var(--color-warning);
    --_bg-hover: transparent;
    --_text: var(--color-white);
    --_text-hover: var(--color-warning);
    --_border: var(--color-warning);
  }
  &--color-error {
    --_bg: var(--color-error);
    --_bg-hover: transparent;
    --_text: var(--color-white);
    --_text-hover: var(--color-error);
    --_border: var(--color-error);
  }
  &--color-light-gray {
    --_bg: var(--color-gray);
    --_bg-hover: transparent;
    --_text: var(--color-black);
    --_text-hover: var(--color-black);
    --_border: var(--color-gray);
  }

  // outline variant
  &--outline {
    --_bg: transparent;
    --_bg-hover: transparent;

    &.base_button--color-primary {
      --_text: var(--color-primary);
      --_border: var(--color-primary);
      --_bg-hover: var(--color-primary);
      --_text-hover: var(--color-white);
    }
    &.base_button--color-accent {
      --_text: var(--color-accent);
      --_border: var(--color-accent);
      --_bg-hover: var(--color-accent);
      --_text-hover: var(--color-white);
    }
    &.base_button--color-secondary {
      --_text: var(--color-secondary);
      --_border: var(--color-secondary);
      --_bg-hover: var(--color-secondary);
      --_text-hover: var(--color-white);
    }
    &.base_button--color-success {
      --_text: var(--color-success);
      --_border: var(--color-success);
      --_bg-hover: var(--color-success);
      --_text-hover: var(--color-white);
    }
    &.base_button--color-warning {
      --_text: var(--color-warning);
      --_border: var(--color-warning);
      --_bg-hover: var(--color-warning);
      --_text-hover: var(--color-white);
    }
    &.base_button--color-error {
      --_text: var(--color-error);
      --_border: var(--color-error);
      --_bg-hover: var(--color-error);
      --_text-hover: var(--color-white);
    }
  }

  &.base_button--arrows{
    gap:0;
    line-height: 1;
    .base_button--arrows-prew{
      margin-bottom: 1px;
      background-color: var( --_text, #000);
      height: var( --_icon-size);
      mask-image: url('/icons/btn-arrow-3.svg');
      mask-position: center left;

      transition: all $transition-normal;

      width: 0px;
      opacity: 0;
      transform: scaleY(0);
      transform-origin: right center;
    }
    .base_button--arrows-next{
      margin-bottom: 1px;
      background-color: var( --_text, #000);
      height: var( --_icon-size);
      mask-image: url('/icons/btn-arrow-1.svg');
      mask-position: center;

      transition: all  $transition-normal;

      width: 36px;
      opacity: 1;
      transform: scaleY(1);
      transform-origin: center center;
    }

    &:hover{
      .base_button--arrows-prew{
        background-color: var( --_text-hover, #000);
        opacity: 1;
        transform: scaleZ(1);
        width: 36px;
      }
      .base_button--arrows-next{
        background-color: var( --_text-hover, #000);
        opacity: 0;
        transform: scaleZ(0);
        width: 0;
      }
    }
  }
}


</style>
