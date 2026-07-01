<template>
  <div class="quill_item"
    :class="[`size_${size}`, `detalis_${detalis}`]"
  >
    <label class="quill_block__label" v-if="label"
      :class="[readonly && 'quill_block__label--readonly']"
    >
      {{label}}
    </label>
    <div class="quill-block-edit"
      v-if="!readonly"
      :style="`height:${quillHeight}`"
    >
      <div style="height:calc(100% - 43.85px)" ref="qlEditor">
        <QuillEditor :key="keyUpdate"
          v-model:content="modelValue[field]"
          contentType="html"
          :placeholder="placeholderDef"
          :id="id"
          :quillHeight="quillHeight"
          :isOverHeight="isOverHeight"
          @toggleHeight="toggleHeight"
          @clearValue="clearValue"
        />
      </div>
    </div>
    <!-- :style="`height:${quillHeight};`" -->
    <QuillText class="quill-readonly-container"
      v-else
      :html="modelValue[field]"
      :allowLinks="allowLinks"
    />
  </div>
</template>

<script setup>
import '@vueup/vue-quill/dist/vue-quill.snow.css';

import QuillEditor from './QuillEditor.vue';
import { ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const props = defineProps({
  modelValue:Object,
  id:String,
  readonly:Boolean,
  field:String,
  label:String,
  placeholder:String,
  size: { type: String, default: 'l' },
  detalis: { type: String, default: 'm' },
  allowLinks: { type: Boolean, default: false },
})

const placeholderDef = computed(_=>{
  return props.placeholder || t('quill.placeholder')
})

const sanitizedHtml = computed(() => {
  const html = props.modelValue[props.field]
  if (!html || props.allowLinks) return html
  return html.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
})

const textCont = ref(null)
const qlEditor = ref(null)
const isOverHeight = ref(false)

const heightVal = '280px'
const quillHeight = ref(heightVal)
const toggleHeight = _=>{
  if(quillHeight.value === heightVal){
    // const nodeQlEdit = qlEditor.value.querySelector('.ql-editor')
    // if(nodeQlEdit.scrollHeight < 236 ) return;
    quillHeight.value = 'unset'
  }else{
    quillHeight.value= heightVal
  }
}

watch(()=> props.modelValue[props.field], val => {
  let nodeItem
  if(qlEditor.value) nodeItem = qlEditor.value.querySelector('.ql-editor');
  else nodeItem = textCont.value
  isOverHeight.value = !( nodeItem.scrollHeight < 236 )

  if( props.modelValue[props.field] === '' ) keyUpdate.value++;
})
const firstSetHeight = ()=>{
  let nodeItem
  if(qlEditor.value) nodeItem = qlEditor.value.querySelector('.ql-editor');
  else nodeItem = textCont.value

  if(nodeItem) isOverHeight.value = !( nodeItem.scrollHeight < 236 );
  else setTimeout(()=>{ firstSetHeight() }, 1000)
}

const keyUpdate = ref(0)
const clearValue = _=>{
  props.modelValue[props.field] = ''
  keyUpdate.value++
}

onMounted(_=>{
  firstSetHeight()
})
</script>

<style lang="scss">

.quill_block__label{
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  margin-bottom: 6px;

}
.quill_block__label--readonly.quill_block__label--readonly.quill_block__label--readonly.quill_block__label--readonly{
  margin-bottom: 5px;
  margin-left: 0;
}

.quill-block-edit{
  position: relative;
  // background-color: v.$colors-white;
  &>*>.ql-toolbar{
    // border-top-left-radius: $radius-lg;
    // border-top-right-radius: $radius-lg;
    border: 1px solid $color-border;
  }
  &>*>.ql-container{
    // border-bottom-left-radius: $radius-lg;
    // border-bottom-right-radius: $radius-lg;
    border: 1px solid $color-border;
  }
}
.btn-quill-block-edit{
  background-color: rgba( 255, 255, 255, .7 );
  position: absolute;
  right: 12px;
  bottom: 16px;
}
.btn-quill-block-show{
  position: absolute;
  right: 12px;
  bottom: 12px;
}
.ql-container{
  font-size: 16px;
  @include desktop{
    font-size: 14px;
  }
}
.quill_item.detalis_m{

}
.quill-readonly-container{
  overflow: hidden;
  position: relative;
}
.quill__text_clamp{
  @include text-clamp(9)
}

.btn-quill-block-show {
  position: absolute;
  right: 12px;
  bottom: 12px
}
</style>
