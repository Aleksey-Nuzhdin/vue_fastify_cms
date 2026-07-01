<script setup lang="ts">
import { ref, watch, computed } from 'vue'

import { useConfigData } from '@/shared/composables/content/useConfigData'
import { useOptionList } from '@/shared/composables/content/useOptionList'

import type { ReportCreate, CreateReportDto, ReportAuthor } from '../profile.type'
import type { FormConfig } from '@shared/types'

type ReportDataCreate = Omit<CreateReportDto<ReportAuthor[], File | string>, 'status'>

const props = defineProps<{
  modelValue: ReportDataCreate | null
}>()

const emits = defineEmits<{
  'update:modelValue': [value: ReportDataCreate | null]
}>()

const config = useConfigData<ReportCreate.InitionalValues>('reportCreate')
const sectionList = useOptionList('section')

const formValue = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value),
})

watch(
  config.initionalValues,
  () => {
    const initionalValues = config.getInitionalValues()
    if (formValue.value === null) formValue.value = initionalValues
  },
  { immediate: true },
)

const configAuthors = computed(() => {
  const configData = config?.configData
  return {
    id: 'authors' + configData.value?.id,
    fields: configData.value?.fields.filter((el) => el.field === 'authors'),
  }
})

const configReport = computed(() => {
  const newConfigData: FormConfig = JSON.parse(JSON.stringify(config?.configData.value))

  newConfigData.fields.forEach((el) => {
    if (el.type === 'select' && el.field === 'section') {
      el.options.options.push(...sectionList.options.value)
    }
  })
  return {
    id: 'authors' + newConfigData.id,
    fields: newConfigData.fields.filter((el) => el.field !== 'authors'),
  }
})

const isLoading = computed(() => config.isLoading.value)
</script>
<template>
  <div class="flex-column">
    <template v-if="!isLoading">
      <div class="profile-report-create__block base-block">
        <div>
          <FormGenerator
            v-if="formValue !== null"
            v-model="formValue"
            :form-config="configAuthors"
          />
        </div>
      </div>
      <div class="profile-report-create__block base-block">
        <h3 class="profile-report-create__title">{{ $t('reports.form.materials') }}</h3>
        <div>
          <FormGenerator
            v-if="formValue !== null"
            v-model="formValue"
            :form-config="configReport"
          />
        </div>
      </div>
    </template>
    <BaseLoader v-if="isLoading" overlay />
  </div>
</template>
<style lang="scss" scoped>
.profile-report-create__title {
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  margin-bottom: 24px;
}
</style>
