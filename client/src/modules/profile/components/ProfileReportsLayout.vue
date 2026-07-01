<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isReportsActive = computed(() => route.path === '/profile/reports')
const isCreateActive = computed(() => route.path === '/profile/reports/create')
</script>
<template>
  <div class="profile-reports">
    <div class="profile-reports__links-list">
      <RouterLink to="/profile/reports?list=true">
        <span class="profile-reports__links"
          :class="{primary: isReportsActive}"
        >
          {{ $t('reports.nav.myReports') }}
        </span>
      </RouterLink>
      <div class="dot"></div>
      <RouterLink to="/profile/reports/create">
        <span class="profile-reports__links"
          :class="{primary: isCreateActive}"
        >
          {{ $t('reports.nav.submit') }}
        </span>

      </RouterLink>
    </div>
    <RouterView />
  </div>
</template>
<style lang="scss" scoped>
.profile-reports{
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}
.profile-reports__links-list{
  gap: $spacing-md;
  display: flex;
  align-items: center;
}
.profile-reports__links{
  color: $color-text-gray;
  font-family: $font-title;
  font-size: 36px;
  font-style: normal;
  font-weight: 500;
  transition: color $transition-normal;
  &.primary{
    color: $color-primary;
  }
}

</style>
