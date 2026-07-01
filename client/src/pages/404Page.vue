<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-code"/>
      <h1 class="not-found-title">{{ t('notFound.title') }}</h1>
      <p class="not-found-text">{{ t('notFound.text') }}</p>
      <RouterLink to="/">
        <BaseButton color="accent" size="xl" arrows class="not-found__button">{{ t('common.home') }}</BaseButton>
      </RouterLink>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  text-align: center;
  justify-content: center;
  height: 100%;
}

.not-found-code {
  flex-shrink: 1;
  height: 40vh;
  width: 90vw;
  background: url('/images/404.svg') center / contain no-repeat;
}

.not-found-title {
  font-size: 44px;
  font-family: $font-title;

  @include desktop{
    font-size: 42px;
  }
  @include laptop{
    font-size: 38px;
  }
  @include mobile{
    font-size: 32px;
  }
}

.not-found-text {
  font-size: 18px;
   @include desktop{
    font-size: 16px;
  }
}

.not-found__button{
  width: 340px;
  max-width: 90vw;
}
</style>
