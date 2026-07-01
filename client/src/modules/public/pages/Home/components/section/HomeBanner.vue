<script setup lang="ts">
import type { BannerPageData } from '@shared/types/form/pages/home.pageData.types.shared'
import HomeSectionLayout from '../HomeSectionLayout.vue';

defineProps<{
  data: BannerPageData
}>()
</script>

<template>
  <HomeSectionLayout :id="data.id" withoutTitle>
    <template #content>
      <div class="base-block home-baner__container">
        <div class="home-baner__content">
          <div class="home-baner__text">
            <h1 class="home-banner__title">{{ data.title }}</h1>
            <p class="home-banner__date">{{ data.title_date }}</p>
            <p class="home-banner__subtitle">{{ data.sumbtitle }}</p>
          </div>

          <div class="home-banner__buttons">
            <RouterLink v-for="btn in data.buttons.filter(btn => !btn.isHide)" :key="btn.url" :to="btn.url"

            >
              <BaseButton :color="btn.color" :variant="btn.type" arrows size="xl"
                 class="home-baner__button-item"
              >
                {{ btn.title }}
              </BaseButton>
            </RouterLink>
          </div>
          <div class="home-baner__content_footer-wrapper">
            <div class="home-baner__content_footer">
              <div class="home-baner__info-tips">
                <BaseIcon name="location" class="icon"/>
                <span>{{ data.place }}</span>
              </div>
              <div class="home-baner__info-tips" >
                <BaseIcon name="website" class="icon"/>
                <span>{{ data.type }}</span>
              </div>
              <div class="dot home-baner__dot"/>
              <a :href="data.archive" class="home-banner__archive">
                <div class="home-banner__archive-text">
                  {{ $t('home.archive') }}
                </div>
              </a>
            </div>
          </div>
        </div>
        <div class="home-baner__logo">
          <BaseImg
            :src="data.baner_img || '/images/logoaccent/origin.webp'"
            :sizeMap="{
              ultra:{width:714, height:714},
              desktop:{width:527, height:527},
              laptop:{width:527, height:527},
              tablet:{width:337, height:337},
              mobile:{width:230, height:230},
            }"
            :placeholderSrc="'/images/logo.svg'"
          />
        </div>
      </div>
    </template>
  </HomeSectionLayout>
</template>

<style lang="scss" scoped>
.home-baner__container{
  display: flex;
  justify-content: space-between;

  @include laptop{
    flex-direction: column;
    align-items: center;
  }
}
.home-baner__text{
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
  @include laptop{
    align-items:  center;
  }
}
.home-banner__title{
  font-family: $font-title;
  font-size: $fz-title-xxl;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 1.84px;
  color: $color-primary;
  width: 500px;

  @include desktop{
    font-size: $fz-title-xl;
    letter-spacing: 1.44px;
    width: 350px;
  }
  @include laptop{
    text-align: center;
  }
  @include mobile{
    font-size: 52px;
    letter-spacing: 1.04px;
    width: 260px;
  }
}
.home-banner__date{
  font-family: $font-title;
  font-size: $fz-title-xl;
  line-height: 1;
  letter-spacing: 1.04px;

  @include desktop{
    font-size: $fz-title-lg;
    letter-spacing: 0.84px;
  }
  @include mobile{
    font-size: 30px;
    letter-spacing: 0.6px;
  }
}
.home-banner__subtitle{
  font-size: $fz-text-xxl;
  font-weight: 350;
  line-height: 1.4;
  letter-spacing: 0.48px;

  @include desktop{
    font-size: $fz-text-md;
    letter-spacing: 0.32px;
  }
  @include mobile{
    font-size: 14px;
    letter-spacing: 0.28px;
    width: 270px;
    text-align: center;
  }
}
.home-banner__buttons{
  display: flex;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
  flex-wrap: wrap;

  @include laptop{
    justify-content: center;
  }

  @include mobile{
    flex-direction: column;
    width: 100%;
    align-items: center;
    &>a{ display: contents;}
  }
}
.home-baner__button-item{
  width: 340px;
  @include desktop{
    width: 240px;
  }
  @include mobile{
    width: 100%;
    max-width: 340px;
  }
}

.home-baner__content{
  display: flex;
  flex-direction: column;
  flex-shrink: 1;
  @include mobile{
    width: 100%;
  }
}
.home-baner__content_footer-wrapper{
  flex-grow: 1;
  align-content: end;
}
.home-baner__content_footer{
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-md;
  align-items: center;
  @include tablet{
    flex-direction: column;
  }
}
.home-baner__info-tips{
  font-weight: 400;
  padding: $spacing-sm $spacing-md;
  height: 48px;
  background-color: $color-gray;
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 16px;
  letter-spacing: 0.32px;
  &>.icon{
    @include tablet{
      width: 18px !important;
      height: 18px !important;
    };
  }
  &>span{
    font-family: $font-title;
  }
  @include tablet{
    font-size: 16px;
    padding: 0;
    background-color: transparent;
    height: 18px;
  }
}
.home-baner__dot{
  @include tablet{ display: none;}
}

.home-banner__archive{
  display: flex;
  gap: 6px;
  align-items: center;
}

.home-banner__archive-text{
  font-size: $fz-text-sm;
  text-transform: uppercase;
  color:$color-blue;
  font-family: $font-title;
  letter-spacing: 0.32px;
}

@keyframes puls-baner {
  0% {
    transform: rotate(0deg) scale(1);
  }
  100%{
    transform: rotate(20deg) scale(0.8);
  }
}
.home-baner__logo{
  width: 714px;
  height: 714px;
  margin-left: 0;
  flex-shrink: 0;

  animation: puls-baner 2s ease-in-out infinite alternate;

  @include desktop{
    width: 527px;
    height: 527px;
    margin-top: 0;
    margin-bottom: 0;
  }
  @include laptop{
    width: 377px;
    height: 377px;
    order: -1;
  }
  @include tablet{
  }
  @include mobile{

    width: 40%;
    min-width: 140px;
    height: 40%;
    min-height: 140px;
  }
}
</style>

