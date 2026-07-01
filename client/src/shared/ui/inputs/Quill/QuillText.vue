<script setup lang="ts">
import '@vueup/vue-quill/dist/vue-quill.snow.css';

import { ref, computed } from 'vue';

type TyepProps = {
  html: string
  allowLinks?: boolean
  clamp?: boolean
}
const props = defineProps<TyepProps>()

const sanitizedHtml = computed(() => {
  const html = props.html
  if (!html || props.allowLinks) return html
  return html.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
})

const heightVal = '280px'
const quillHeight = ref(props.clamp ? heightVal : 'unset')

const toggleHeight = () => {
  quillHeight.value = quillHeight.value === heightVal ? 'unset' : heightVal
}
</script>
<template>
<div class="ql-editor ql-text">
  <div v-dompurify-html="sanitizedHtml"
    ref="textCont"
    :class="quillHeight !== 'unset' && 'quill__text_clamp'"
  />
  <button v-if="clamp"
    color="primary" flat variant="text" height="20" @click="toggleHeight"
    class="btn-quill-block-show text-decoration-underline text-primary text-body-1"
  >{{ quillHeight === 'unset' ? $t('quill.collapse') : $t('quill.expand') }}
  </button>
</div>
</template>
<style lang="scss" scoped>
.quill__text_clamp {
  @include text-clamp(9)
}

.ql-text{
  padding: 0;
  font-size: 20px;

  // &>*{
  //   margin-left: 0;
  //   padding-left: 0;
  // }
  &:first-child{
    margin-top: 0;
    padding-top: 0;
  }
  &:last-child{
    margin-bottom: 0;
    padding-bottom: 0;
  }

  & :deep(a){
    color: $color-blue;
    text-decoration: underline;
  }

  @include mobile{
    font-style: 16px;
  }
}
</style>
