<script setup lang="ts">

</script>

<template>
  <form class="form-wrapper" @submit.prevent="">
    <slot />
  </form>
</template>

<style scoped lang="scss">
.form-wrapper {
  padding: $spacing-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $color-white;
  border-radius: $radius-md;

  @include desktop {
    padding: $spacing-lg;
  }
}

</style>
