<script setup lang="ts">
import ProfileReportForm from '../components/ProfileReportForm.vue';
import ProfileReportPageWrapper from '../components/ProfileReportPageWrapper.vue';

import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useReports } from '../composables/useReports';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth';

import type { CreateReportDto, ReportAuthor } from '../profile.type';

const router = useRouter()

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

type ReportDataCreate = Omit<CreateReportDto<ReportAuthor[], File>, 'status'>

const formValue = ref<ReportDataCreate | null>(null)

const { createReport, errorText } = useReports()

watch(formValue, (newVal, oldVal) => {
  errorText.value = ''
  if (newVal && oldVal === null && newVal.authors.length === 0 && user.value) {
    const author: ReportAuthor = {
      name: user.value.name || '',
      email: user.value.email || '',
      // Модуль reports перепишут в разделе 9 плана; пока поля автора,
      // которых больше нет у пользователя, инициализируются пустыми.
      organization: '',
      position: '',
      city: user.value.city || '',
      participation: '',
    }
    newVal.authors = [author]
  }
}, {deep: true})

const createReportHandler = async (type: 'draft' | 'waiting') => {
  if(!formValue.value) return
  if( await createReport(formValue.value, type) ){
    router.push('/profile/reports?list=true')
  }
}

const canselCreate = () => router.push('/profile/reports?list=true')
</script>

<template>
  <ProfileReportPageWrapper
    @submit="createReportHandler('waiting')"
    @draft="createReportHandler('draft')"
    @cancel="canselCreate"
  >
    <ProfileReportForm v-model="formValue"/>
    <div v-if="errorText" class="text-color-error">
      {{ errorText }}
    </div>
  </ProfileReportPageWrapper>
</template>
