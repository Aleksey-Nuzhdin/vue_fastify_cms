<script setup lang="ts">

defineProps<{
  routerLink?: boolean
  direction?: 'left' | 'right'
}>()
</script>
<template>
  <component class="base__link_arrow"
    :class="{ 'base__link_arrow--left': direction === 'left' }"
    :is="routerLink ? 'RouterLink' : 'a'"
    v-bind="$attrs"
    rel="noopener noreferrer"
  >
    <slot></slot>
    <BaseIcon :name="direction === 'left' ? 'arrow-left' : 'arrow-right'" size="18"/>
  </component>
</template>
<style lang="scss" scoped>
.base__link_arrow{
  display: flex;
  align-items: center;
  color: $color-accent;
  font-family: $font-title;
  font-size: 16px;
  font-weight: 500;
  gap: $spacing-sm;

  @include underline-hover;

  @include mobile-only{
    font-size: 14px;
    height: 100%;
    gap: 0;
  }

  &--left {
    flex-direction: row-reverse;
  }
}
</style>
