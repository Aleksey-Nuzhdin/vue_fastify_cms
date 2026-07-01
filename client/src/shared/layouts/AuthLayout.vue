<script setup lang="ts">
import EmptyHeader from '../components/Layout_Items/EmptyHeader.vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const router = useRouter()
const isRegister = computed(() => router.currentRoute.value.meta.theme === 'primary')

</script>
<template>

  <div class="auth-layout"
    :class="{['theme-primary']: !isRegister}"
  >
    <EmptyHeader>
      <template #middle>
        <span class="auth-layout__header-title">{{ t('layout.authTitle') }}</span>
      </template>
    </EmptyHeader>
    <main class="auth-main">
      <slot name="wrapper">
        <div class="auth-layout__container container">
          <div class="auth-layout__logo-container">
            <BaseImg class="auth-layout__logo"
              :src="isRegister ?
                '/images/logo.svg' :
                '/images/logo.svg'
              "
            />
          </div>
          <slot name="form_wrapper">
            <div class="auth-layout__form">
              <slot name="default"></slot>
            </div>
          </slot>
        </div>
      </slot>
    </main>
  </div>
</template>

<style scoped lang="scss">
.auth-layout__header-title{
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: $color-primary;
  font-family: $font-title;
  font-size: 46px;
  color: transparent;

  @include mobile-only{
    display: none;
  }
}


.auth-layout{
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &.theme-primary{
    .auth-main{
      background-color: $color-primary;
    }
  }
}
.auth-main{
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: $color-accent;
}

.auth-layout__container{
  display: flex;
  gap: $spacing-lg;

  @include desktop{
    gap: $spacing-md;
  }
}
.auth-layout__logo-container{
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  @include tablet{
    width: 40%;
  }
  @include mobile{
    display: none;
  }

}


@keyframes puls-baner {
  0% {
    transform: rotate(0deg) scale(1);
  }
  100%{
    transform: rotate(20deg) scale(0.8);
  }
}

.auth-layout__logo{
  display: block;
  width: 714px;
  height: 714px;
  animation: puls-baner 2s ease-in-out infinite alternate;

  @include desktop{
    width: 527px;
    height: 527px;
  }
  @include laptop{
    width: 377px;
    height: 377px;
  }
  @include tablet{
    width: 300px;
    height: 300px;
  }
}
.auth-layout__form{
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  @include tablet{
    width: 60%;
  }

  @include mobile{
    width: 100%;
  }
}
</style>
