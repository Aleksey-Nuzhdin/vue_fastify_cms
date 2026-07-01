<script setup lang="ts">
import { computed } from 'vue';
import { useReports } from '../composables/useReports';
import { useRoute } from 'vue-router';

const route = useRoute()

const id = computed<string>(() => {
  const id = route.params.idReport
  if(typeof id === 'string') return id
  if(Array.isArray(id) && id[0]) return id[0]
  return ''
})

const { report, reportLoading: isLoading, reportError: isError } = useReports({ itemId: id.value })

</script>
<template>
<div class="profile-report-view flex-column">
  <div class="profile-report-view__controls">
    <RouterLink to="/profile/reports" class="profile-report-view__link">{{ $t('common.back') }}</RouterLink>
    <div class="dot"></div>
    <h3 class="profile-report-view__title">{{ $t('reports.view.title') }}</h3>
  </div>
  <div class="profile-report-view__content base-block">
    <template v-if="!isLoading && report">
      <h3 class="profile-report-view__report-title">{{ report.title }}</h3>
      <hr/>
      <div class="profile-report-view__section">
        <h4 class="profile-report-view__section-title">{{ $t('reports.view.authors') }}</h4>
        <ul v-if="report.authors.length" class="profile-report-view__authors-list">
          <li v-for="author in report.authors" class="profile-report-view__authors-item profile-report-view__section-text">
            <BaseIcon name="profile" size="20" color="accent"/>
            <template v-for="authorItem, index in [author.name,  author.position,  author.organization, author.city].filter(Boolean)">
              <span class="profile-report-view__authors-separator" v-if="index !== 0">/</span>
              {{ authorItem }}
            </template>
          </li>
        </ul>
      </div>
      <hr>
      <div class="profile-report-view__section">
        <h4 class="profile-report-view__section-title">{{ $t('reports.view.section') }}</h4>
        <p v-if="report.section" class="profile-report-view__section-text">
          {{ report.section }}
        </p>
      </div>
      <hr v-if="report.authors.length"/>
      <div>
        <h4 class="profile-report-view__section-title">{{ $t('reports.view.annotation') }}</h4>
        <QuillText class="profile-report-view__section-text"
          :html="report.description"
        />
      </div>
      <hr>
      <div class="profile-report-view__section">
        <template v-if="report.fileAnnotation">
          <h4 class="profile-report-view__section-title">{{ $t('reports.view.additionalMaterials') }}</h4>
          <a class="base-link" :href="report.fileAnnotation" target="_blank">{{ $t('reports.view.file') }}</a>
        </template>
      </div>


    </template>
    <BaseLoader v-if="isLoading" overlay/>
    <p v-else-if="isError" class="text-color-error">{{ $t('common.loadError') }}</p>
  </div>
</div>
</template>
<style lang="scss" scoped>
.profile-report-view{
  flex-grow: 1;
}
.profile-report-view__link{
  color: $color-text-gray;
  font-family: $font-title;
  font-size: 24px;
  font-weight: 500;
}
.profile-report-view__controls{
  display: flex;
  gap: $spacing-md;
  align-items: center;
}
.profile-report-view__title{
  color: $color-primary;
  font-family: $font-title;
  font-size: 36px;
  font-weight: 500;
  line-height: 1;
}
.profile-report-view__content{
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

}
.profile-report-view__report-title{
  font-size: 24px;
  font-weight: 600;
}
.profile-report-view__section-title{
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 120%;
}
.profile-report-view__section-text{
  font-size: 14px
}
.profile-report-view__authors-list{
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.profile-report-view__authors-item{
  display: flex;
  align-items: center;
  gap: 8px;
}
.profile-report-view__authors-separator{
  color: $color-primary;
  font-size: 14px;
  font-weight: 700;
}
</style>
