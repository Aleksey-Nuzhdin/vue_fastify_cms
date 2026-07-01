<script setup lang="ts">
import { computed } from 'vue';
type Props = {
  theme?: 'default' | 'primary' | 'accent' | 'transparent',
  id:string
  withoutTitle?:boolean
}
const props = withDefaults(defineProps<Props>(), {
  theme: 'default',
  withoutTitle:false,
})

const themeClass = computed(() => `home-section-layout--theme-${props.theme}`)


</script>
<template>
<section class="home-section-layout__wrapper"
  :id
  :class="themeClass"
>
  <slot name="background">
    <div class="home-section-layout__bacground">
      <slot name="background-content"></slot>
    </div>
  </slot>
  <div class="container">
    <div class="home-section-layout__container ">
      <div class="home-section-layout__header" v-if="!withoutTitle">
        <slot name="header">
          <div class="home-section-layout__title-wrapper">
            <h2 class="home-section-layout__title">
              <slot name="title">{{ $t('home.sectionTitle') }}</slot>
            </h2>
            <span class="home-section-layout__title-icon"/>
          </div>

          <div class="home-section-layout__header-content">
            <slot name="header-content"></slot>
          </div>
        </slot>
      </div>
      <div class="home-section-layout__content">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</section>
</template>
<style lang="scss" scoped>
.home-section-layout__wrapper{
  position: relative;
  margin-bottom:$section-margin-xl;

  @include desktop{
    margin-bottom: 120px;
  }
  @include laptop{
    margin-bottom: 100px;
  }
  @include mobile{
    margin-bottom: 80px;
  }
}
.home-section-layout__bacground{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: none;
  z-index: -1;
}

// .home-section-layout__container{

// }
.home-section-layout__header{
  display: flex;
  justify-content: space-between;
  margin-bottom: $spacing-xl;
  @include laptop{
    margin-bottom: $spacing-lg;
  }
  @include mobile{
    margin-bottom: $spacing-md;
  }
}
.home-section-layout__title{
  font-family: $font-title;
  text-transform: uppercase;
  min-width: 0;

  font-size: 44px;
  line-height: 1.2;

  @include laptop{
    font-size: 38px;
  }
  @include mobile{
    font-size: 32px;
  }

  &>*{
    font-family: $font-title;
  }
}
.home-section-layout__title-icon{
  display: block;
  flex-shrink: 0;
  width: 30px;
  height: 6px;
  mask-image: url('/icons/3dots.svg');
  background-color: $color-accent;
}

.home-section-layout--theme-primary{
  padding: $spacing-xxl 0;

  .home-section-layout__bacground{
    display: block;
    background-color: $color-primary;
  }
  .home-section-layout__title{
    color:$color-white;
  }
  .home-section-layout__title-icon{
    background-color: $color-white;
  }
}

.home-section-layout--theme-accent{
  padding: $spacing-xxl 0;

  .home-section-layout__bacground{
    display: block;
    background-color: $color-accent;
  }
  .home-section-layout__title{
    color:$color-white;
  }
  .home-section-layout__title-icon{
    background-color: $color-white;
  }
}

.home-section-layout--theme-transparent{
  .home-section-layout__bacground{
    display: block;
    background-color: transparent;
  }

}

.home-section-layout__title-wrapper{
  display: flex;
  align-items: center;
  gap: $spacing-md;
}
</style>
