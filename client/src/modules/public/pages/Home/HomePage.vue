<script setup lang="ts">
import { computed } from 'vue'
import { usePageSections } from '@/shared/composables/content/usePageSections'
import type { Home } from '@shared/types/form/pages'
import type { PageData } from '@shared/types/form'
import HomeBanner from './components/section/HomeBanner.vue'
import HomeProgram from './components/section/HomeProgram.vue'
import HomeCommittee from './components/section/HomeCommittee.vue'


const { sections, isLoading } = usePageSections<PageData>('home')

const banner = computed(() => {
  return sections.value?.find(s => s.id === 'baner') as Home.BannerData | undefined
})

const program = computed(() => {
  return sections.value?.find(s => s.id === 'program') as Home.ProgramData | undefined
})

const committee = computed(() => {
  return sections.value?.find(s => s.id === 'committee') as Home.CommitteeData | undefined
})
</script>

<template>
  <BaseLoader v-if="isLoading" size="lg" />
  <template v-else>
    <HomeBanner v-if="banner" :data="banner.data" />
    <HomeProgram v-if="program && program.data.isShow" :data="program.data" />
    <HomeCommittee v-if="committee && committee.data.isShow" :data="committee.data" />
  </template>
</template>
