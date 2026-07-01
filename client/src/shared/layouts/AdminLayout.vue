<script setup lang="ts">
import ProfileLayout from './ProfileLayout.vue';
import { useAuthStore } from '@/modules/auth';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const authStore = useAuthStore()

</script>
<template>
  <ProfileLayout :sizeButton="'lg'">
    <template #header>
      {{ t('nav.admin') }}
    </template>
    <template #subNav>
      <div class="admin-layout__nav">
        <RouterLink to="/admin/pages-data" v-slot="{isActive}"
          v-if="authStore.checkRole(['admin'])"
        >
          <BaseButton
            color="accent"
            :variant=" isActive ? 'filled' : 'outline'"
            size="lg"
          >{{ t('nav.pagesData') }}</BaseButton>
        </RouterLink>
        <RouterLink to="/admin/files"  v-slot="{isActive}"
          v-if="authStore.checkRole(['admin'])"
        >
          <BaseButton
            color="accent"
            :variant=" isActive ? 'filled' : 'outline'"
            size="lg"
          >{{ t('nav.files') }}</BaseButton>
        </RouterLink>
        <RouterLink to="/admin/reports"  v-slot="{isActive}"
          v-if="authStore.checkRole(['admin', 'vereficator'])"
        >
          <BaseButton
            color="accent"
            :variant=" isActive ? 'filled' : 'outline'"
            size="lg"
          >{{ t('nav.reports') }}</BaseButton>
        </RouterLink>
        <RouterLink to="/admin/users"  v-slot="{isActive}"
          v-if="authStore.checkRole(['admin', 'vereficator'])"
        >
          <BaseButton
            color="accent"
            :variant=" isActive ? 'filled' : 'outline'"
            size="lg"
          >{{ t('nav.users') }}</BaseButton>
        </RouterLink>
      </div>
    </template>
    <template #default>
      <RouterView />
    </template>
  </ProfileLayout>
</template>

<style scoped lang="scss">
:deep(.profile-main__container){
  flex-direction: column;
}
:deep(.profile-nav){
  flex-direction: row;
  display: flex;
  width: 100%;
  a{
    flex: 0 0 280px;
  }
}
.admin-layout__nav{
  display: flex;
  gap: $spacing-md;
}

</style>
