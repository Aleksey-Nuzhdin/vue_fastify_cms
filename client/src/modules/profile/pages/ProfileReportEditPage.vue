<script setup lang="ts">
import ProfileReportForm from '../components/ProfileReportForm.vue';
import ProfileReportPageWrapper from '../components/ProfileReportPageWrapper.vue';

import { ref, watch, computed } from 'vue'

import { useRoute, useRouter } from 'vue-router';
import { useReports } from '../composables/useReports';

import type { ReportAuthor, UpdateReportDto, CreateReportDto } from '../profile.type';

type ReportDataUpdate = CreateReportDto<ReportAuthor[], File | string>

const route = useRoute()
const router = useRouter()

const id = computed<string>(() => {
  const id = route.params.idReport
  if(typeof id === 'string') return id
  if(Array.isArray(id) && id[0]) return id[0]
  return ''
})

const { report, reportLoading: isLoading, reportError: isError, updateReport } = useReports({ itemId: id.value })
const formValue = ref<ReportDataUpdate | null>(null)

watch(report, async () => {
  let authors:ReportAuthor[] = []
  try {
    if( report.value?.authors) authors = JSON.parse( JSON.stringify(report.value?.authors) )
  }catch (error) {}

  formValue.value = {
    authors,
    description: report.value?.description || '',
    section: report.value?.section || '',
    status: report.value?.status || 'draft',
    title: report.value?.title || '',
    fileAnnotation: report.value?.fileAnnotation || ''
  }
}, {deep: true, immediate: true})

const updateReportHandler = async (type: 'draft' | 'waiting') => {
  if(!formValue.value) return
  if( await updateReport(id.value, formValue.value, type) ){
    router.push('/profile/reports')
  }
}

const canselCreate = () => router.push('/profile/reports?list=true')
</script>

<template>
  <ProfileReportPageWrapper
    :loading="isLoading"
    @submit="updateReportHandler('waiting')"
    @draft="updateReportHandler('draft')"
    @cancel="canselCreate"
  >
    <ProfileReportForm v-if="report" v-model="formValue"/>
  </ProfileReportPageWrapper>
</template>
