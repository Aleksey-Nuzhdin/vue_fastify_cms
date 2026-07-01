<script setup lang="ts">
import EmptyHeader from '../components/Layout_Items/EmptyHeader.vue';
import AppFooter from '../components/Layout_Items/AppFooter.vue';
import { useAuthStore } from '@/modules/auth';
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';

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
    <EmptyHeader/>
    <main class="profile-main">
      <div class="container profile-main__container">
        <slot> <RouterView /></slot>
      </div>
    </main>
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

.profile-main__container{
  display: flex;
  gap: $spacing-lg;
  padding-top: $spacing-xl;
  padding-bottom: $spacing-xl;
  align-items: center;
  justify-content: center;

  @include desktop{
    gap:$spacing-md;
  }

  @include laptop{
    flex-direction: column;
  }
}
</style>
