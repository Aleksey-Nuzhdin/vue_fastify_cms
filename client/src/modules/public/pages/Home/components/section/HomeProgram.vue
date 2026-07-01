<script setup lang="ts">
import type { ProgramPageData } from '@shared/types/form/pages/home.pageData.types.shared'
import HomeSectionLayout from '../HomeSectionLayout.vue';

import { computed, ref } from 'vue';

const props = defineProps<{
  data: ProgramPageData
}>()

const currentDayIndex = ref(0)
const currentDay = computed(() => props.data.days[currentDayIndex.value])

</script>
<template>
<HomeSectionLayout :id="data.id">
  <template #title>{{data.title}}</template>
  <template #header-content>
    <a class="home-program__prgram-link"
      :href="data.link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ $t('home.program_to_pdf')}}
      <BaseIcon name="arrow-right" size="18"/>
    </a>
  </template>
  <template #content>
    <div class="home-program__container">
      <div class="home-program__nav">
        <BaseButton v-for="days, index of data.days"
          class="home-program__nav-button"
          size="xl"
          color="primary"
          :variant="currentDayIndex === index ? 'filled' : 'outline' "
          @click="currentDayIndex = index"
        >{{ days.day }}</BaseButton>
      </div>
      <div class="home-program__content base-block">
        <h3 class="home-program__day-title">{{currentDay?.day}}</h3>
        <div class="home-program__event-list">
          <div class="home-program__event-item" v-for="(event, index) of currentDay?.events"
            :key="'event-' + currentDay?.day + index"
          >
            <div class="home-program__event-time">{{event.time}}</div>

            <div class="home-program__event-content">
              <QuillText
                :html="event.description"
                :allow-links="true"
              />
            </div>
            <div class="home-program__hr"/>
          </div>
        </div>
        <div class="home-program__footer">
          <RouterLink to="/register">
            <BaseButton color="primary" arrows size="xl" class="home-program__footer-button">{{ $t('home.register') }}</BaseButton>
          </RouterLink>
        </div>
      </div>
    </div>
  </template>
</HomeSectionLayout>
</template>
<style lang="scss" scoped>
.home-program__prgram-link{
  display: flex;
  align-items: center;
  color: $color-accent;
  font-family: $font-title;
  font-size: 16px;
  font-weight: 500;
  gap: $spacing-sm;

  @include underline-hover;

  @include mobile-only{
    font-size: 14px;
    height: 100%;
    gap: 0;
  }
}
.home-program__container{
  display: grid;
  gap: $spacing-lg;
  grid-template-columns: repeat(12, 1fr);
  grid-template-areas: "n n n c c c c c c c c c";

  @include desktop{
    display: flex;
    flex-direction: column;
  }
}
.home-program__nav{
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  grid-area: n;

  overflow-y: auto;
  padding-bottom: 15px;

  @include desktop{
    flex-direction: row;
    gap: $spacing-md;
  }

  @include tablet{
    overflow-x: scroll;
    padding-bottom: 15px;
  }
}
.home-program__nav-button{
  width: 100%;

  @include laptop{
    min-width: 246px;
  }
}
.home-program__content{
  grid-area: c;
  width: 100%;
}
.home-program__hr{
  grid-column: 1 / -1;  /* растянуть на все колонки */
  height: 1px;
  background: $color-black;
  margin: 0;
}

.home-program__day-title{
  font-size: 36px;
  color: $color-primary;
  font-family: $font-title;
  margin-bottom: $spacing-xl;
  line-height: 1;

  @include laptop{
    font-size: 30px;
  }
  @include tablet{
    margin-bottom: $spacing-lg;
  }
  @include mobile{
    margin-bottom: $spacing-md;
  }
}

.home-program__event-list{
  display: grid;
  grid-template-columns: auto 1fr;
  gap: $spacing-xl;
  margin-bottom: $spacing-xl;

  @include laptop{
    gap:$spacing-lg;
  }
  @include tablet{
    grid-template-columns: 1fr;
    gap: $spacing-md;
  }
}
.home-program__event-item{
  display: contents;
}

.home-program__event-time{
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  color: $color-accent;
  @include mobile{
    font-size: 20px;
  }
}

.home-program__footer{
  display: flex;
  justify-content: center;


}
.home-program__footer-button{
  width: 340px;
}
</style>
