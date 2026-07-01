<script setup lang="ts">
import { usePageData } from '@/shared/composables/content/usePageData'
import type { Header } from '@shared/types/form/pages'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import EmptyHeader from './EmptyHeader.vue'

const { t } = useI18n()

function scrollToSection(event: Event) {
  event.preventDefault()
  const target = event.currentTarget as HTMLAnchorElement
  const id = target.getAttribute('href')
  if (!id) return
  const el = document.querySelector(id)
  if (!el) return
  const header = document.querySelector('.default-layout__header') as HTMLElement | null
  const headerHeight = header?.offsetHeight ?? 0
  const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 30
  window.scrollTo({ top, behavior: 'smooth' })
}

const {pageData, isLoading} = usePageData<Header.PageData>('header')

const isOpenHum = ref(false)
const humTouched = ref(false)
function toggleHum() {
  isOpenHum.value = !isOpenHum.value
  humTouched.value = true
}

</script>

<template>
  <EmptyHeader>
    <template #middle>
      <nav class="header__nav" v-if="!isLoading">
        <a class="header-nav__link" v-for="section in pageData?.data.sections " :key="section.link"
          :href="section.link"
          @click="scrollToSection"
        >{{ section.title }}</a>
      </nav>
    </template>
    <template #in_after_controls>
      <div class="dot header-dot"/>
      <div class="header__hum">
        <button class="header-hum__btn" @click="toggleHum">
          <div class="header-hum__btn-line" :class="{ open: isOpenHum, close: !isOpenHum && humTouched }"></div>
          <div class="header-hum__btn-line" :class="{ open: isOpenHum, close: !isOpenHum && humTouched }"></div>
        </button>
        <div class="header-hum__nav" :class="{ open: isOpenHum }">
          <div  v-for="section in pageData?.data.sections " :key="section.link">
            <a class="header-nav__link"
              href="#about"
              @click="scrollToSection"
            >{{ section.title }}</a>
          </div>
        </div>
      </div>
      <Transition name="hum-bg">
        <div class="header__hum-bg" v-show="isOpenHum">
          <div class="header-hum__nav-mobile"
            :class="{open: isOpenHum}"
          >
            <div class="header-hum__nav-mobile-header">
              <div>
                <RouterLink to="/" class="header__logo header__logo-nav-menu"  :alt="t('common.logoAlt')"/>
              </div>
              <button class="header-hum__btn header-hum__btn_mobile" @click="toggleHum">
                <div class="header-hum__btn-line" :class="{ open: isOpenHum, close: !isOpenHum && humTouched }"></div>
                <div class="header-hum__btn-line" :class="{ open: isOpenHum, close: !isOpenHum && humTouched }"></div>
              </button>
            </div>
            <div class="header-hav__nam-list">
              <div  v-for="section in pageData?.data.sections " :key="section.link"
              >
                <a class="header-nav__link"
                  href="#about"
                  @click="scrollToSection"
                >{{ section.title }}</a>
              </div>
            </div>
            <div class="header-hum__nav-mobile-footer">

            </div>
          </div>
        </div>
      </Transition>
    </template>
  </EmptyHeader>
</template>

<style scoped lang="scss">
.header__logo {
  display: block;
  mask-image: url('/images/logo_with_tex.svg');
  mask-size: contain;
  mask-repeat: no-repeat;
  background-color: $color-accent;
  height: 88px;
  width: 184px;
  @include desktop{
    width: 134px;
    height: 64px;
  }

  @include tablet{
    &.header__logo-nav-menu{
      height: 88px;
      width: 184px;
    }
  }
}

.header__nav{
  display: flex;
  justify-content: center;
  gap: $spacing-lg;
  @include desktop{
    gap: $spacing-md;
  }
  @include laptop{
    display: none;
  }
}
.header-nav__link{
  color: $color-black;
  font-family: $font-title;
  font-size: 16px;
  letter-spacing: 0.32px;
  text-transform: uppercase;
  text-decoration: none;
  position: relative;
  transition: $transition-normal;

  &:hover{
    color: $color-primary;
  }

  @include underline-hover;

  @include desktop{
    font-size: 14px;
  }
  @include laptop{
    font-size: 16px;
  }
}

.header-dot{
  display: none;
  @include laptop{
    display: block;
  }
}

.header__hum{
  position: relative;
  display: none;
  align-items: center;
  @include laptop{
    display: flex;
  }
}
.header-hum__btn{
  width: 44px;
  height: 44px;
  position: relative;

}
.header-hum__btn_mobile{
  @include mobile{
    margin-top: $spacing-sm;
  }
}



.header-hum__btn-line{
  position: absolute;
  width: 28px;
  height: 3px;
  border-radius: 100px;
  background-color: $color-primary;

  &:nth-child(1){
    top: calc(50% - 6px);
    left: 50%;
    transform: translate(-50%, -50%) rotate(0);
  }
  &:nth-child(2){
    top: calc(50% + 6px);
    left: 50%;
    transform: translate(-50%, -50%) rotate(0);
  }

  &.open{
    animation-duration: $transition-normal;
    animation-fill-mode: forwards;
    animation-timing-function: ease;

    &:nth-child(1){
      animation-name: hum-top-open;
    }
    &:nth-child(2){
      animation-name: hum-bottom-open;
    }
  }

  &.close{
    animation-duration: $transition-normal;
    animation-fill-mode: forwards;
    animation-timing-function: ease;

    &:nth-child(1){
      animation-name: hum-top-close;
    }
    &:nth-child(2){
      animation-name: hum-bottom-close;
    }
  }
}

@keyframes hum-top-open {
  0% {
    top: calc(50% - 6px);
    transform: translate(-50%, -50%) rotate(0);
  }
  50% {
    top: 50%;
    transform: translate(-50%, -50%) rotate(0);
    background-color: $color-primary;
  }
  100% {
    top: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    background-color: $color-black;
  }
}

@keyframes hum-bottom-open {
  0% {
    top: calc(50% + 6px);
    transform: translate(-50%, -50%) rotate(0);
  }
  50% {
    top: 50%;
    transform: translate(-50%, -50%) rotate(0);
    background-color: $color-primary;
  }
  100% {
    top: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    background-color: $color-black;
  }
}

@keyframes hum-top-close {
  0% {
    top: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    background-color: $color-black;
  }
  50% {
    top: 50%;
    transform: translate(-50%, -50%) rotate(0);
    background-color: $color-black;
  }
  100% {
    top: calc(50% - 6px);
    transform: translate(-50%, -50%) rotate(0);
    background-color: $color-primary;
  }
}

@keyframes hum-bottom-close {
  0% {
    top: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    background-color: $color-black;
  }
  50% {
    top: 50%;
    transform: translate(-50%, -50%) rotate(0);
     background-color: $color-black;
  }
  100% {
    top: calc(50% + 6px);
    transform: translate(-50%, -50%) rotate(0);
     background-color: $color-primary;
  }
}

.header-hum__nav{
  width: max-content;
  position: absolute;
  top: calc(100% + 48px);
  right: 0;
  flex-direction: column;
  gap: $spacing-md;
  background-color: $color-white;
  padding: $spacing-md;
  border: 1px solid $color-black;


  transform: scaleY(0) translateY(-100%);
  opacity: 0;
  transform-origin: top;
  transition: all $transition-normal;

  &.open{
    // display: block;
    transform: scaleY(1) translateY(0);
    opacity: 1;
  }
  display: none;

  @include laptop{
    display: flex;
  }
  @include tablet{
    display: none;
  }
}



.hum-bg-enter-active,
.hum-bg-leave-active {
  // transition: opacity 2s ease;
  transition: opacity $transition-normal ease;
}

.hum-bg-enter-from,
.hum-bg-leave-to {
  opacity: 0;
}

.header__hum-bg{
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba($color-black, 0.85);

  display: none;
  @include tablet{
    display: block;
  }
}

@keyframes slide-menu {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0%);
  }
}

@keyframes slide-menu-r {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
.header-hum__nav-mobile{
  position: fixed;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  right: 0;
  top:0;
  bottom: 0;
  width: 400px;
  max-width: 100vw;
  background-color: $color-white;
  padding: $spacing-xl;
  padding-right: $spacing-lg;
  background: $color-white;

  animation-duration: $transition-normal;
  animation-fill-mode: forwards;
  animation-timing-function: ease;
  animation-name: slide-menu-r;

  &.open{
    transform: translateX(0%);
    animation-direction: normal;
    animation-name: slide-menu;
  }

  @include mobile{
    width: 100vw;
    padding:$spacing-md;
  }
}
.header-hum__nav-mobile-header{
  display: flex;
  justify-content: space-between;


}

.header-hav__nam-list{
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}
</style>
