<script setup lang="ts">
import PaginationItem from '@/shared/components/Pagination/PaginationItem.vue'
import AdminReportCard from '../components/AdminReportCard.vue'

import { useAdminReports } from '../composables/useAdminReports'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GetReportsQuery } from '@shared/types'

const { t } = useI18n()

const filter = ref<GetReportsQuery>({
  title: '',
  userEmail: '',
  userName: '',
  userId: '',
  authorName: '',
  authorEmail: '',
  status: 'waiting',
})

const adminReports = useAdminReports(filter.value)
const pagination = computed(() => adminReports.pagination)

const setPage = (val: number) => pagination.value.goToPage(val)

const isLoading = computed(() => adminReports.list.isLoading)
const reports = computed(() => adminReports.list.data.value?.reports || [])

let updateTimer: null | ReturnType<typeof setTimeout> = null

watch(filter.value, () => {
  if (updateTimer) clearTimeout(updateTimer)
  updateTimer = setTimeout(() => {
    adminReports.setFilters(filter.value)
  }, 300)
})

const statusOptions = computed(() => [
  { value: '', title: t('admin.reports.statusFilter.all') },
  { value: 'waiting', title: t('admin.reports.statusFilter.waiting') },
  { value: 'published', title: t('admin.reports.statusFilter.published') },
  { value: 'draft', title: t('admin.reports.statusFilter.draft') },
  { value: 'rejected', title: t('admin.reports.statusFilter.rejected') },
])
</script>
<template>
  <div>
    <div class="admin-report-list__filter">
      <BaseSelect
        :options="statusOptions"
        v-model="filter.status"
        :placeholder="$t('admin.reports.statusPlaceholder')"
      />
      <BaseInput :placeholder="$t('common.name')" v-model="filter.title" />
      <BaseInput placeholder="Email пользователя" v-model="filter.userEmail" />
      <BaseInput :placeholder="$t('admin.reports.userNamePlaceholder')" v-model="filter.userName" />
      <BaseInput placeholder="Email автора" v-model="filter.authorEmail" />
      <BaseInput :placeholder="$t('admin.reports.authorNamePlaceholder')" v-model="filter.authorName" />
    </div>
    <PaginationItem :pagination="pagination" @go-to-page="(val) => setPage(val)">
      <div class="admin-report-list" v-if="isLoading">
        <AdminReportCard v-for="report in reports" :key="report._id" :report />
        <p v-if="reports.length === 0" class="admin-report-list__empty">{{ $t('common.emptyList') }}</p>
      </div>
      <div class="admin-report-list__loader" v-else>
        <BaseLoader overlay size="lg" />
      </div>
    </PaginationItem>
  </div>
</template>
<style lang="scss" scoped>
.admin-report-list__filter {
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
.admin-report-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
.admin-report-list__loader {
  height: 500px;
  background-color: transparent;
}
.admin-report-list__empty{
  color: $color-text-secondary;
  font-size: 18px;
  @include desktop{
    font-size: 16px;
  }
}
</style>
