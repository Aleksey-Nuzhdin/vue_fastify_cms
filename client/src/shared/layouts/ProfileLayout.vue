<script setup lang="ts">
import EmptyHeader from '../components/Layout_Items/EmptyHeader.vue';
import AppFooter from '../components/Layout_Items/AppFooter.vue';
import { useAuthStore } from '@/modules/auth';
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isReportsActive = computed(() =>
  route.path.startsWith('/profile/reports')
)
const isAdminActive = computed(() => route.path.startsWith('/admin'))

const authStore = useAuthStore()

const logout = async ()=>{
  router.push({path:'/'})
  authStore.logout()
}

withDefaults(defineProps<{
  sizeButton?: 'xl' | 'lg'
}>(),{
  sizeButton: 'xl'
})

</script>
<template>

  <div class="profile-layout">
    <EmptyHeader>
      <template #middle>
        <span class="profile-layout__header-title">
          <slot name="header">
            {{ t('nav.account') }}
          </slot>
        </span>
      </template>
      <template #prfoile>
        <div class="profile-layout__header-controls">
          <BaseButton color="accent" arrows variant="outline" @click="logout">{{ t('nav.logout') }}</BaseButton>
        </div>
        <div class="profile-layout__header-controls_mobile">
          <button @click="logout">
            <BaseIcon name="profile" color="accent" />
          </button>
        </div>
      </template>
    </EmptyHeader>
    <main class="profile-main">
      <div class="container profile-main__container">
        <div class="profile-nav">
          <RouterLink to="/admin"
            v-if="authStore.isNoRoleUser"
          >
            <BaseButton
              color="primary"
              :variant=" isAdminActive ? 'filled' : 'outline'"
              :size="sizeButton"
            >{{ t('nav.admin') }}</BaseButton>
          </RouterLink>
          <RouterLink v-slot="{ isExactActive }" to="/profile">
            <BaseButton
              color="primary"
              :size="sizeButton"
              :variant=" isExactActive ? 'filled' : 'outline'"
            >{{ t('nav.profile') }}</BaseButton>
          </RouterLink>
          <RouterLink to="/profile/reports">
            <BaseButton
              color="primary"
              :size="sizeButton"
              :variant=" isReportsActive ? 'filled' : 'outline'"
            >{{ t('nav.reports') }}</BaseButton>
          </RouterLink>
        </div>
        <slot name="subNav"></slot>
        <slot>
          <RouterView />
        </slot>
      </div>
    </main>
    <!-- <AppFooter/> -->
  </div>
</template>

<style scoped lang="scss">
.profile-layout__header-title{
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: $color-primary;
  font-family: $font-title;
  font-size: 46px;
  color: transparent;
  width: 100%;
  flex-shrink: 1;
  padding: 0 $spacing-xl;

  @include mobile-only{
    display: none;
  }
}

.profile-layout__header-controls{
  display: flex;
  gap: $spacing-md;
  @include mobile{
    display: none;
  }
  width: 203px;

  &>*{
    flex-grow: 1;
    flex-shrink: 0;
  }
}
.profile-layout__header-controls_mobile{
  display: none;
  @include mobile{
    display: flex;
  }
}


.profile-layout{
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.profile-main{
  flex-grow: 1;
  display: flex;
}

.profile-layout__container{
  display: flex;
  gap: $spacing-lg;

  @include desktop{
    gap: $spacing-md;
  }
}
.profile-layout__logo-container{
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
.profile-layout__logo{
  display: block;
  width: 714px;
  height: 714px;

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
.profile-layout__form{
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

.profile-main__container{
  display: flex;
  gap: $spacing-lg;
  padding-top: $spacing-xl;
  padding-bottom: $spacing-xl;

  @include desktop{
    gap:$spacing-md;
  }

  @include laptop{
    flex-direction: column;
  }
}

.profile-nav{
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  width: calc($col-width-xl * 3 + $spacing-lg * 2);
  flex-shrink: 0;
  & button{
    width: 100%;
  }
  @include desktop{
    width: calc($col-width-lg * 3 + $spacing-md * 2);
    gap: $spacing-md;
  }

  @include laptop{
    flex-direction: row;
    width: 100%;
    & a {
      flex: 1 1 0;
    }
  }
  @include mobile-only{
    flex-direction: column;
  }
}
</style>
