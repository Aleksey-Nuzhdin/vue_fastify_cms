<script setup lang="ts">
import {ref} from 'vue'
const formValue = ref({quill:''})

</script>
<template>
<div class="flex-column">
  <div>
    <QuillItem
      v-model="formValue"
      id="test_quill"
      field="quill"
      :label="$t('test.quill.titleLabel')"
      :placeholder="$t('test.quill.placeholder')"
    />
  </div>
  <div>
    <QuillItem
      v-model="formValue"
      id="test_quill_disabled"
      field="quill"
      label="Заголовок Readonlu"
      :placeholder="$t('test.quill.placeholder')"
      readonly
    />
  </div>
</div>
</template>
<style lang="scss" scoped>

</style>
