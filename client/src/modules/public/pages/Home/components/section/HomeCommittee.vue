<script setup lang="ts">
import { ref, computed } from 'vue';

import type { CommitteePageData } from '@shared/types/form/pages/home.pageData.types.shared'
import HomeSectionLayout from '../HomeSectionLayout.vue'
import Slider from '@/shared/components/Slider.vue';


defineProps<{
  data: CommitteePageData
}>()

const slider = ref<{ goNext: () => void; goPrev: () => void; count: number } | null>(null)

const goNext = () => { slider.value?.goNext() }
const goPrev = () => { slider.value?.goPrev() }
const count = computed(() =>  slider.value?.count ?? 0)

</script>

<template>
  <HomeSectionLayout :id="data.id" theme="accent">
    <template #title>
      <span class="committee__title">{{ data.title }}</span>

    </template>
    <template #header-content>
      <div class="committee__control-buttons" v-if="count > 1">
        <BaseButton color="primary" icon="arrow-left" @click="goPrev"/>
        <BaseButton color="primary" icon="arrow-right" @click="goNext"/>
      </div>
    </template>
    <template #content>
      <Slider :list="data.members" :value="data.members[0]" ref="slider"
        noButtons
      >
        <template #listItem="{item:member}">
          <div class="committee__card base-block-md">
            <div class="committee__card-img-wrapper">
              <div class="committee__card-img">
                <BaseImg
                  :src="member.image || ''"
                  :alt="`${member.name.last} ${member.name.first}`"
                  :placeholder-src="'/images/placeholder/placeholder_person.svg'"
                  class="home-committee__image"
                />
              </div>
              <div class="committee-card__description" v-if="member.description">
                {{ member.description }}
              </div>
            </div>
            <div class="committee-card__name">
              {{ member.name.last }}
              <br/>
              {{ member.name.first }} {{ member.name.middle }}
            </div>

          </div>
        </template>
      </Slider>
    </template>
</HomeSectionLayout>
</template>
<style lang="scss" scoped>
.committee__title{
  font-family: $font-title;
  @include tablet{
    display: block;
    width: min-content;
  }
}
.committee__control-buttons{
  display: flex;
  gap: $spacing-md;
  @include tablet{
    display: none;
  }

  &>*{
    width: 44px;
    height: 44px;
  }

  @include desktop{
    &>*{
      width: 40px;
      height: 40px;
    }

  }
}
.committee__card{
  height: 100%;
  width:calc($col-width-xl * 3 + $spacing-lg * 2);
  padding: $spacing-lg;

  @include desktop{
    padding: $spacing-md;
    width:calc($col-width-lg * 3 + $spacing-md * 2);
  }

  @include laptop{
    width:calc($col-width-md * 3 + $spacing-md * 2);
  }
}
.committee__card-img-wrapper{
  width:  100%;
  padding-top: 100%;
  position: relative;

  overflow: hidden;
  margin-bottom: $spacing-md;
  border-radius: $radius-sm;
}
.committee__card-img{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.committee-card__name{
  text-align: center;
  font-family: $font-title;
  font-size: 24px;
  font-weight: 500;
  line-height: 120%;

  margin-bottom: $spacing-md;

  @include desktop{
    font-size: 20px;
  }
}
.committee-card__description{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  display: flex;
  align-items: center;

  background-color: $color-accent;
  color:$color-white;
  padding: $spacing-lg;

  transition: opacity $transition-normal;
  &:hover{
    opacity: 1;
  }
}
</style>
