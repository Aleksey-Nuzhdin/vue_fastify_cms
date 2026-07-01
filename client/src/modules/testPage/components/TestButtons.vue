<script setup lang="ts">
type Color = 'primary' | 'secondary' | 'success' | 'warning' | 'error'
type Size = 'sm' | 'md' | 'lg' | 'xl'
type Radius = 'sm' | 'md' | 'lg' | 'full'

const colors: Color[] = ['primary', 'secondary', 'success', 'warning', 'error']
const sizes: Size[] = ['sm', 'md', 'lg', 'xl']
const radii: Radius[] = ['sm', 'md', 'lg', 'full']
</script>
<template>
<div class="test-buttons">

  <!-- Colors -->
  <section class="test-buttons__section">
    <h3 class="test-buttons__title">{{ $t('test.buttons.colors') }}</h3>
    <div class="test-buttons__row">
      <BaseButton v-for="color in colors" :key="color" :color>{{ color }}</BaseButton>
      <BaseButton>default</BaseButton>
    </div>
  </section>

  <!-- Sizes: text vs icon vs icon+text side by side -->
  <section class="test-buttons__section">
    <h3 class="test-buttons__title">Размеры (текст | иконка+текст | иконка)</h3>
    <div v-for="size in sizes" :key="size" class="test-buttons__row">
      <BaseButton color="primary" :size>{{ size }}</BaseButton>
      <BaseButton color="primary" :size icon="edit">{{ size }}</BaseButton>
      <BaseButton color="primary" :size icon="edit" />
    </div>
  </section>

  <!-- With icon (left / right) -->
  <section class="test-buttons__section">
    <h3 class="test-buttons__title">{{ $t('test.buttons.withIcon') }}</h3>
    <div class="test-buttons__row">
      <BaseButton color="primary" icon="edit">{{ $t('test.buttons.iconLeft') }}</BaseButton>
      <BaseButton color="primary" icon="edit" icon-right>{{ $t('test.buttons.iconRight') }}</BaseButton>
      <BaseButton color="secondary" icon="trash">{{ $t('test.buttons.delete') }}</BaseButton>
      <BaseButton color="success" icon="upload">{{ $t('test.buttons.upload') }}</BaseButton>
    </div>
  </section>

  <!-- Icon-only -->
  <section class="test-buttons__section">
    <h3 class="test-buttons__title">{{ $t('test.buttons.iconOnly') }}</h3>
    <div class="test-buttons__row">
      <BaseButton v-for="size in sizes" :key="size" color="primary" icon="edit" :size />
    </div>
  </section>

  <!-- Icon + sizes (text button) -->
  <section class="test-buttons__section">
    <h3 class="test-buttons__title">Иконка + текст по размерам</h3>
    <div class="test-buttons__row">
      <BaseButton v-for="size in sizes" :key="size" color="primary" icon="edit" :size>{{ size }}</BaseButton>
    </div>
  </section>

  <!-- Disabled -->
  <section class="test-buttons__section">
    <h3 class="test-buttons__title">Disabled</h3>
    <div class="test-buttons__row">
      <BaseButton color="primary" disabled>{{ $t('test.buttons.text') }}</BaseButton>
      <BaseButton color="primary" icon="edit" disabled>{{ $t('test.buttons.withIcon') }}</BaseButton>
      <BaseButton color="primary" icon="edit" disabled />
    </div>
  </section>

  <!-- Radius -->
  <section class="test-buttons__section">
    <h3 class="test-buttons__title">{{ $t('test.buttons.radius') }}</h3>
    <div class="test-buttons__row">
      <BaseButton v-for="r in radii" :key="r" color="primary" :radius="r">{{ r }}</BaseButton>
      <BaseButton color="secondary" icon="edit" radius="full" />
    </div>
  </section>

  <!-- Outline -->
  <section class="test-buttons__section">
    <h3 class="test-buttons__title">Outline</h3>
    <div class="test-buttons__row">
      <BaseButton v-for="color in colors" :key="color" variant="outline" :color>{{ color }}</BaseButton>
    </div>
    <div class="test-buttons__row">
      <BaseButton v-for="color in colors" :key="color" variant="outline" :color icon="edit">{{ color }}</BaseButton>
    </div>
    <div class="test-buttons__row">
      <BaseButton variant="outline" color="primary" disabled>Disabled</BaseButton>
      <BaseButton variant="outline" color="primary" icon="edit" disabled />
    </div>
  </section>

  <!-- Custom styles -->
  <section class="test-buttons__section">
    <h3 class="test-buttons__title">{{ $t('test.buttons.customStyles') }}</h3>
    <div class="test-buttons__row">
      <BaseButton
        bg="linear-gradient(135deg, #f093fb, #f5576c, #fda085, #f6d365, #a8e063, #4facfe, #a18cd1)"
        bg-hover="linear-gradient(135deg, #a18cd1, #4facfe, #a8e063, #f6d365, #fda085, #f5576c, #f093fb)"
        text-color="#fff"
        border-color="transparent"
      >Rainbow</BaseButton>
      <BaseButton :width="100" :height="150" color="primary">100 x 150</BaseButton>
    </div>
  </section>

</div>
</template>
<style lang="scss" scoped>
.test-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;

  &__section {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-secondary, #666);
    margin: 0;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $spacing-sm;
  }
}
</style>
