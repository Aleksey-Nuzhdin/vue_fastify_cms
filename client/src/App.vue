<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import DefaultLayout from '@/shared/layouts/DefaultLayout.vue'
import AuthLayout from '@/shared/layouts/AuthLayout.vue'
import ProfileLayout from './shared/layouts/ProfileLayout.vue'
import AdminLayout from './shared/layouts/AdminLayout.vue'
import EmptyLayout from './shared/layouts/EmptyLayout.vue'

import ShowPopup from './shared/components/Popup/ShowPopup.vue'

const route = useRoute()

const layoutsMap: Record<string, any> = {
  default: DefaultLayout,
  auth: AuthLayout,
  profile:ProfileLayout,
  admin:AdminLayout,
  empty:EmptyLayout,
}

const layout = computed(() => {
  const name = (route.meta.layout as string) || 'default'
  return layoutsMap[name] || DefaultLayout
})
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <ShowPopup/>
</template>
<style lang="scss">
</style>
