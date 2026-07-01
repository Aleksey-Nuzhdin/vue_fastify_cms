<script setup lang="ts">
import ModaelDelete from '@/shared/components/modals/ModaelDelete.vue';
import { useReports } from '../composables/useReports';
import type { ReportBase } from '@shared/types';
import { useModal } from '@/shared/components/Modal/composables/useModal';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  report:ReportBase
  index:number
}>()

const { t } = useI18n()

defineEmits<{
  edit:[id:string],
  delete:[id:string]
}>()

const { deleteReport } = useReports()

const MODAL_ID = 'report-card-modal_'+props.report._id
const { openModal, closeModal } = useModal(MODAL_ID)

</script>
<template>
<div class="report-card base-block-md">
  <div class="report-card__content">
    <div class="report-card__header">
      <p class="report-card__index">{{ t('reports.card.index', { n: ("0"+(index + 1)).slice(-2) }) }}</p>
      <div class="report-card__status" :class="[report.status]">{{ t('reports.card.status.' + report.status) }}</div>
    </div>
    <div class="report-card__block">
      <p class="report-card__subtitle">{{ t('common.name') }}</p>
      <h3 class="report-card__title">«{{ report.title }}»</h3>
    </div>
    <div class="report-card__block">
      <p class="report-card__subtitle">{{ t('reports.view.authors') }}</p>
      <ul class="report-card__authors-list">
        <li class="report-card__author-item" v-for="author in report.authors">
          {{ author.name }}
        </li>
      </ul>
    </div>
  </div>
  <div class="report-card__actions">
    <div class="report-card__actions-btn-wrapper">
      <template v-if="report.status === 'published'">
        <RouterLink :to="`/profile/reports/view/${report._id}`">
          <button> <BaseIcon name="eye-show" color="white" size="28"/></button>
        </RouterLink>
      </template>
      <template v-else>
        <RouterLink :to="`/profile/reports/edit/${report._id}`">
          <button> <BaseIcon name="edit" color="white"/></button>
        </RouterLink>
        <div class="dot"></div>
        <button @click="openModal"> <BaseIcon name="trash" color="white" size="24"/></button>

      </template>

    </div>
  </div>
</div>
<ModaelDelete :id="MODAL_ID"
  :title="t('reports.card.deleteTitle')"
  @delete="deleteReport(report._id)"
  @close="closeModal"
>
  {{ t('reports.card.confirmDelete') }}
  <br/>
  <br/>
  <p class="report-carad__modal-report-title">
    «{{ report.title }}»?
  </p>
</ModaelDelete>
</template>
<style lang="scss" scoped>
.report-card{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: calc($col-width-xl * 3 + $spacing-lg * 2);
}
.report-card__content{
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
}
.report-card__header{
  display: flex;
  justify-content: space-between;
}
.report-card__index{
  text-transform: uppercase;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 1;
  font-family: $font-title;
}
.report-card__status{
  text-transform: uppercase;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 1;
  font-family: $font-title;
  color: $color-accent;

  &.draft{
    color: $color-text-gray;
  }

  &.rejected{
    color: $color-text-gray;
  }
}
.report-card__block{
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.report-card__subtitle{
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
}

.report-card__title{
  font-size: 16px;
  font-weight: 350;
}

.report-card__authors-list{
  display: flex;
  flex-direction: column;

}
.report-card__author-item{
  line-height: 1.2;
  font-size: 16px;
  font-weight: 350;
  padding-left: 20px;
  position: relative;

  &::before{
    content: '';
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: $color-black;
  }
}

.report-card__actions{
  display: flex;
  justify-content: flex-start;
}
.report-card__actions-btn-wrapper{
  background-color: $color-accent;
  border-radius: 12px;
  display: flex;
  gap: 4px;
  align-items: center;

  & button{
    width: 40px;
    height: 40px;
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .dot{
    background-color: $color-white;
  }
}
.report-carad__modal-report-title{
  font-size: 16px;
  font-weight: 700;
  color: $color-black;
  @include text-clamp
}
</style>
