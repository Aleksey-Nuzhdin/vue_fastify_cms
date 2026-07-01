<script setup lang="ts">
import { usePageData } from '@/shared/composables/content/usePageData'
import type { Footer } from '@shared/types/form/pages'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { pageData } = usePageData<Footer.PageData>('footer')


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

</script>

<template>
  <footer class="footer">
    <div class="footer__container container">
      <div class="footer__content">
        <div class="footer__logo-wrapper">
          <RouterLink to="/" class="footer__logo"  :alt="t('common.logoAlt')"/>
        </div>
        <div class="footer__nav">
          <div class="footer__block-title">{{ pageData?.data.nav.title }}</div>
          <div v-for="link in pageData?.data.nav.links" :key="link.url">
            <a  class="footer__nav-link"
              @click="scrollToSection"
              :href="link.url"
            >{{ link.title }}</a>
          </div>
        </div>
        <div class="footer__contacts">
          <div class="footer__block-title">{{ pageData?.data.contacts.title}}</div>
          <span
            v-for="(item, i) in pageData?.data.contacts.items"
            :key="i"
            class="footer__contact-item"
          >{{ item.value }}</span>
        </div>
        <div class="footer__social">
          <a class="footer__social-link" v-for="s in pageData?.data.social"
            :key="s.icon"
            :href="s.url"
          >
            <BaseIcon :name="s.icon" color="white"/>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  border-top: 1px solid $color-border;
  padding: $spacing-xxl 0;
  background-color: $color-white;
}
.footer__container {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  font-size: 16px;
}
.footer__content{
  display: flex;
  justify-content: space-between;
  @include tablet{
    flex-wrap: wrap;
    gap: $spacing-lg;
    &>*{
      flex-basis: 35%;
    }
  }
  @include mobile-only{
    flex-direction: column;
    align-items: center;
  }
}
.footer__logo-wrapper{
  @include tablet{
    order:-2;
    min-width: 35%;
  }
}
.footer__logo {
  display: block;
  mask-image: url('/images/logo_with_text.svg');
  mask-size: contain;
  mask-repeat: no-repeat;
  background-color: $color-accent;
  height: 88px;
  width: 184px;
  @include desktop{
    width: 134px;
    height: 64px;
  }
}

.footer__copy{
  display: flex;
  justify-content: center;
  color:$color-text-secondary;
}

.footer__block-title{
  font-size: 18px;
  font-family: $font-title;
  text-transform: uppercase;
}

.footer__nav, .footer__contacts{
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  @include mobile-only{
    align-items: center;
  }
}
.footer__nav-link{
  font-size: 16px;
  padding-bottom: 4px;
  transition: color $transition-fast;

  &:hover{
    color: $color-primary;
  }
  @include underline-hover
}

.footer__social{
  display: flex;
  gap: 20px;
  @include tablet{
    order: -1;
  }
}
.footer__social-link{
  height: 40px;
  width: 40px;
  border-radius: 50%;
  background-color: $color-accent;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
