<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()

defineEmits<{
  submit: []
  draft: []
  cancel: []
}>()
</script>

<template>
<div class="profile-report-create">
  <div class="profile-report-create__info base-block">
    <h3 class="profile-report-create__info-title">{{ $t('reports.wrapper.title') }}</h3>
    <div class="profile-report-create__info-text">
      <p>
        {{ $t('reports.wrapper.intro') }}
      </p>
      <ul>
        <li>{{ $t('reports.wrapper.reqAuthors') }}</li>
        <li>{{ $t('reports.wrapper.reqTitle') }}</li>
        <li>{{ $t('reports.wrapper.reqAnnotation') }}</li>
        <li>{{ $t('reports.wrapper.reqParticipation') }}</li>
      </ul>
    </div>
  </div>
  <div>
    <slot />
    <BaseLoader v-if="loading" overlay/>
  </div>
  <div class="profile-report-create__buttons-control">
    <BaseButton color="accent" arrows size="xl"
      class="profile-report-create__base-button"
      @click="$emit('submit')"
    >{{ $t('reports.wrapper.submit') }}</BaseButton>
    <div class="profile-report-create__buttons-wrapper">
      <button class="profile-report-create__button" @click="$emit('draft')"
      >{{ $t('reports.wrapper.saveDraft') }}</button>
      <div class="dot"></div>
      <button class="profile-report-create__button gray" @click="$emit('cancel')"
      >{{ $t('common.cancel') }}</button>
    </div>
  </div>
</div>
</template>

<style lang="scss" scoped>
.profile-report-create{
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.profile-report-create__info-title{
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  margin-bottom: $spacing-md;
}

.profile-report-create__info-text{
  font-size: 16px;
  font-style: normal;
  font-weight: 350;
  p{
    margin-bottom: 8px;
  }
  li{
    line-height: 1.4;
    padding-left: 20px;
    position: relative;
    &::before{
      position: absolute;
      display: block;
      content: "";
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: $color-black;
      left: 10px;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
}

.profile-report-create__buttons-control{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.profile-report-create__buttons-wrapper{
  display: flex;
  align-items: center;
  gap: $spacing-md;
}
.profile-report-create__base-button{
  width: 346px;
}
.profile-report-create__button{
  color: $color-accent;
  font-family:$font-title;
  font-size: 24px;
  font-weight: 500;

  &.gray{
    color: $color-text-gray;
  }
}
</style>
