<script setup lang="ts">
import AppHeader from '@/shared/components/Layout_Items/AppHeader.vue'
import AppFooter from '@/shared/components/Layout_Items/AppFooter.vue'
import { ref, onMounted, onUnmounted } from 'vue'

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const isShowScrollButton = ref(false)

const onScroll = () => {
  isShowScrollButton.value = window.scrollY > 100
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

</script>
<template>
  <div class="default-layout">
    <AppHeader class="default-layout__header" />
    <main class="default-layout__main">
      <slot/>
      <div class="default-layout__buttons-bottom">
        <div class="default-layout__buttons-bottom-wrapper">
          <div class="default-layout__buttons-bottom-left">
            <Transition name="scroll-btn">
              <BaseButton v-if="isShowScrollButton"
                size="lg"
                class="default-layout__button-scroll-up"
                color="primary" icon="arrow-up" @click="scrollToTop" bg-hover="#3B82F6" text-color-hover="white" border-color="transparent"
              />
            </Transition>
          </div>
          <div class="container default-layout__buttons-bottom-container"/>
          <div class="default-layout__buttons-bottom-right"></div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.default-layout__header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.default-layout__main {
  position: relative;
  z-index: 1;
  padding-top: $spacing-xxl;
  flex: 1;
  display: flex;
  flex-direction: column;
  &>*{
    flex: 1;
    &:last-child{
      margin-bottom: 0;
    }
    &:nth-last-child(2){
      margin-bottom: 0;
    }
  }

}
.default-layout__buttons-bottom{
  position: sticky;
  width: 100vw;
  z-index: 1;
  bottom: 0;
}
.default-layout__buttons-bottom-wrapper{
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 16px;
}
.default-layout__buttons-bottom-container{

  width: 100%;
  margin: 0;
  padding: 0;
}
.default-layout__buttons-bottom-left, .default-layout__buttons-bottom-right{
  width: 46px;
}
.default-layout__button-scroll-up{
  position: absolute;
  bottom: 60px;
}

.scroll-btn-enter-active,
.scroll-btn-leave-active {
  transition: opacity .3s, transform .3s;
}
.scroll-btn-enter-from,
.scroll-btn-leave-to {
  opacity: 0;
  transform: translateY(100px);
}
.scroll-btn-enter-to,
.scroll-btn-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
