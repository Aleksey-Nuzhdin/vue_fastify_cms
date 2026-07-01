<script setup lang="ts">
import { useAuthStore } from '@/modules/auth'
import { useLocale } from '@/shared/composables/useLocale'
import { useI18n } from 'vue-i18n'
const authStore = useAuthStore()
authStore.init()
const { lang, setLang } = useLocale()
const { t } = useI18n()

</script>
<template>
  <header class="header">
    <div class="header__container container">
      <div>
        <RouterLink to="/" class="header__logo"  :alt="t('common.logoAlt')"/>
      </div>
      <slot name="middle"/>
      <div class="header_controls">
        <slot name="prfoile">
          <div class="header-controls__profile">
            <RouterLink :to="authStore.isAuth ? '/profile' : '/login'" class="header__link">
              <BaseButton color="accent" arrows>{{ t('nav.account') }}</BaseButton>
            </RouterLink>
          </div>
          <div class="header-controls__profile_mobile">
            <RouterLink :to="authStore.isAuth ? '/profile' : '/login'" style="display: flex;">
              <BaseIcon name="profile" color="accent" />
            </RouterLink>
          </div>
        </slot>
        <div class="header__lang-container">
          <button
            class="header__lang-btn"
            :class="{ active: lang === 'ru' }"
            @click="setLang('ru')"
          >
            RU
          </button>
          <button
            class="header__lang-btn"
            :class="{ active: lang === 'en' }"
            @click="setLang('en')"
          >
            EN
          </button>
        </div>
        <slot name="in_after_controls"/>
      </div>
      <slot name="out_after_controls"/>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  background: $color-bg;
  border-bottom: 1px solid $color-black;
  padding: $spacing-lg 0;

  @include mobile{
    padding: $spacing-md 0;
  }
}

.header__container {
  @include flex-between;

  &>*{
    flex-grow: 1;
    flex-shrink: 0;
  }
}

.header__logo {
  display: block;
  mask-image: url('/images/logo_with_text.svg');
  mask-size: contain;
  mask-repeat: no-repeat;
  background-color: $color-accent;
  height: 88px;
  width: 184px;
  @include desktop{
    width: 134px;
    height: 64px;
  }

  @include tablet{
    &.header__logo-nav-menu{
      height: 88px;
      width: 184px;
    }
  }
}

.header_controls{
  display: flex;
  justify-content: flex-end;
  gap: $spacing-xl;
  align-items: center;
}

.header-controls__profile{
  display: flex;
  gap: $spacing-md;
  @include mobile{
    display: none;
  }
}
.header-controls__profile_mobile{
  display: none;
  @include mobile{
    display: flex;
  }
}

.header__lang-container{
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: $spacing-sm;

  @include desktop{
    gap: $spacing-xs;
  }
}
.header__lang-btn{
  color: $color-black;
  font-family: $font-title;
  font-size: $fz-text-sm;
  line-height: 1;

  &.active{
    color: $color-primary;
  }
}

</style>
