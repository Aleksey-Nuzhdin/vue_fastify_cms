<script setup lang="ts">
import PaginationItem from '@/shared/components/Pagination/PaginationItem.vue'
// import AdminReportCard from '../components/AdminReportCard.vue'
import AdminUserCard from '../components/AdminUserCard.vue'

import { useAdminUsers } from '../composables/useAdminUsers'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GetUsersQuery } from './../admin.users.type'

const { t } = useI18n()

const filter = ref<GetUsersQuery>({
  name: '',
  email: '',
  phone: '',
  plan: '',
})

const adminUsers = useAdminUsers(filter.value)
const pagination = computed(() => adminUsers.pagination)

const setPage = (val: number) => pagination.value.goToPage(val)

const isLoading = computed(() => adminUsers.list.isLoading)
const usersList = computed(() => adminUsers.list.data.value?.list || [])

let updateTimer: null | ReturnType<typeof setTimeout> = null

watch(filter.value, () => {
  if (updateTimer) clearTimeout(updateTimer)
  updateTimer = setTimeout(() => {
    adminUsers.setFilters(filter.value)
  }, 300)
})

// Нейтральные демо-опции тарифа: «Все» + значения select из формы регистрации.
// Title берутся из общих ключей admin__user-card__plan.* (переиспользование с карточкой).
const planOptions = computed(() => [
  { value: '', title: t('admin.users.planAll') },
  { value: 'basic', title: t('admin__user-card__plan.basic') },
  { value: 'pro', title: t('admin__user-card__plan.pro') },
  { value: 'enterprise', title: t('admin__user-card__plan.enterprise') },
])
</script>
<template>
  <div>
    <div class="admin-user-list__filter">
      <BaseInput :placeholder="$t('admin.users.namePlaceholder')" v-model="filter.name" />
      <BaseInput :placeholder="$t('admin.users.emailPlaceholder')" v-model="filter.email" />
      <BaseInput :placeholder="$t('admin.users.phonePlaceholder')" v-model="filter.phone" />
      <BaseSelect
        :options="planOptions"
        v-model="filter.plan"
        :placeholder="$t('admin.users.planPlaceholder')"
      />
    </div>
    <PaginationItem :pagination="pagination" @go-to-page="(val) => setPage(val)">
      <div class="admin-user-list" v-if="isLoading">
        <AdminUserCard v-for="user in usersList" :key="user._id" :user />
        <p v-if="usersList.length === 0" class="admin-user-list__empty">{{ $t('admin.users.empty') }}</p>
      </div>
      <div class="admin-user-list__loader" v-else>
        <BaseLoader overlay size="lg" />
      </div>
    </PaginationItem>
  </div>
</template>
<style lang="scss" scoped>
.admin-user-list__filter {
  display: flex;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
  &>*{
    flex: 1;
  }
  @include desktop{
    gap: $spacing-md;
    margin-bottom: $spacing-md;
  }
}
.admin-user-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
.admin-user-list__loader {
  height: 500px;
  background-color: transparent;
}
.admin-user-list__empty{
  color: $color-text-secondary;
  font-size: 18px;
  @include desktop{
    font-size: 16px;
  }
}
</style>
