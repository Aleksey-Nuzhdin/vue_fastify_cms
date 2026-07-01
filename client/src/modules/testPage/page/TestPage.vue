<script setup lang="ts">
import TestButtons from '../components/TestButtons.vue'
import TestInputs from '../components/TestInputs.vue'
import TestQuill from '../components/TestQuill.vue'
import TestFroms from '../components/TestFroms.vue'

import type { FormConfig } from '../test.type'
import { ref } from 'vue'
const type = ref('')



</script>
<template>
  <div class="container test_container">
    <div class="test_navbar">
      <BaseButton @click="type = 'button'">{{ $t('test.nav.buttons') }}</BaseButton>
      <BaseButton @click="type = 'input'">{{ $t('test.nav.inputs') }}</BaseButton>
      <BaseButton @click="type = 'quill'">{{ $t('test.nav.richText') }}</BaseButton>
      <BaseButton @click="type = 'form'">{{ $t('test.nav.form') }}</BaseButton>
    </div>
    <h1 class="test_title">{{ type }}</h1>
    <div>
      <TestButtons v-if="type === 'button'"/>
      <TestInputs v-if="type === 'input'"/>
      <TestQuill v-if="type === 'quill'"/>
      <TestFroms v-if="type === 'form'"/>
    </div>

  </div>
</template>
<style lang="scss" scoped>
.test_container{
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 20px;
}
.test_navbar{
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}
.test_title{
  margin-bottom: 40px;
}
</style>
