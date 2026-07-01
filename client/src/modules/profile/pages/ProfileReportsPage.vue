<script setup lang="ts">
import ReportCard from '../components/ReportCard.vue';
import { computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useReports } from '../composables/useReports'

const router = useRouter()
const route = useRoute()
const { reports: data, reportsLoading: isLoading, reportsError: isError } = useReports()
const reports = computed(() => data.value?.reports || [])

let checked = false
watch(
  [data, isLoading],
  ([val, loading]) => {
    if (loading || checked) return
    checked = true
    if (val && val.reports.length === 0 && !route.query.list) {
      router.replace('/profile/reports/create')
    }
  },
  { immediate: true }
)

</script>
<template>
<div class="profile-reports__reports-list">
  <template v-if="!isLoading">
    <ReportCard v-for="report, index in reports" :key="report._id"
      :report :index
    />
    <p v-if="isError">
      {{ $t('common.loadError') }}
    </p>
    <p class="profile-reports__empty-list" v-else-if="reports.length === 0">
      {{ $t('reports.list.empty') }}
      <br/>
      {{ $t('reports.list.emptyHint') }}
    </p>
  </template>
  <BaseLoader v-else overlay/>
</div>
</template>
<style lang="scss" scoped>
.profile-reports__reports-list{
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}
.profile-reports__empty-list{
  font-size: 18px;
  font-weight: 350;
}
</style>
