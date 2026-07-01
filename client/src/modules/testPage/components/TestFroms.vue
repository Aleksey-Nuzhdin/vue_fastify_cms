<script setup lang="ts">

import type { FormConfig, FormField } from '../test.type'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const formValue = ref({})
const formConfig = ref<FormConfig>({
  id: 'test',
  name:t('test.form.name'),
  initionalValues:{},
  fields: [{
      type: "input",
      label: t('test.form.textLabel'),
      placeholder: t('test.form.enterText'),
      field: "text",
      options: {
        type:'text',

      }
    },{
      type: "input",
      label: "Email",
      placeholder: "Введите свой email",
      field: "email",
      options: {
        type: "email",
        required: true
      }
    },{
      type: "select-file",
      label: t('test.form.fileSelectLabel'),
      placeholder: t('test.form.fileSelectPlaceholder'),
      field: "selectFile",
      options: {
      }
    },{
      type: "input",
      label: t('test.form.passwordLabel'),
      placeholder: t('test.form.passwordPlaceholder'),
      field: "password",
      options: {
        type: "password",
        required: true
      }
    },{
      type: "select",
      label: t('test.form.selectLabel'),
      placeholder: t('test.form.selectPlaceholder'),
      field: "select",
      options: {
        options: [{title: 'Option', value: 'option'}, {title: 'var1', value: 'var 1'}],
      }
    },{
      type: "multi-select",
      label: t('test.form.multiSelectLabel'),
      placeholder: t('test.form.selectPlaceholder'),
      field: "multiSelect",
      options: {
        options: [{title: 'Option', value: 'option'}, {title: 'var1', value: 'var 1'}],
      }
    }
  ]
})


const arrayItem1 = ref<FormField[]>([{
  type: "input",
  label: "Текст A1-1",
  placeholder: t('test.form.enterText'),
  field: "text",
  options: {
    type:'text',
  }
},{
  type: "input",
  label: "Текст A1-2",
  placeholder: t('test.form.enterText'),
  field: "text",
  options: {
    type:'text',
  }
}])
const arrayItem2 = ref<FormField[]>([{
  type: "input",
  label: "Текст A2-1",
  placeholder: t('test.form.enterText'),
  field: "text",
  options: {
    type:'text',
  }
},{
  type: "input",
  label: "Текст A2-2",
  placeholder: t('test.form.enterText'),
  field: "text",
  options: {
    type:'text',
  }
},{
  type:'array',
  label:'Array',
  field:'array1',
  arrayItem:arrayItem1.value
}])
const arrayItem3 = ref<FormField[]>([{
  type: "input",
  label: "Текст A3-1",
  placeholder: t('test.form.enterText'),
  field: "text",
  options: {
    type:'text',
  }
},{
  type: "input",
  label: "Текст A3-2",
  placeholder: t('test.form.enterText'),
  field: "text",
  options: {
    type:'text',
  }
},{
  type:'array',
  label:'Array',
  field:'array2',
  arrayItem:arrayItem2.value
}])

const generatorConfig = ref<FormConfig>({
  id: 'test',
  name:t('test.form.name'),
  initionalValues:{},
  fields: [{
      type: "input",
      label: t('test.form.textLabel'),
      placeholder: t('test.form.enterText'),
      field: "text",
      options: {
        type:'text',

      }
    },{
      type:'array',
      label:t('test.form.arrayListLabel'),
      field:'array1',
      arrayItem:arrayItem3.value
    }
  ]
})

const generatorValue = ref({
  text:'text',
  array1:[{
    text:'text',
    array2:[{
      text:'text',
      array1:[{
        text:'text',
      }]
    }]
  }]
})
</script>
<template>
<div class="flex-row test-form__container">
  <div class="test-form__item">
    <FormGenerator
      v-model="generatorValue"
      :formConfig="generatorConfig"
    />
    <div>
      <pre>{{ generatorValue }}</pre>
    </div>
  </div>
  <div class="test-form__item">
    <FormWrapper
      :title="t('test.form.title')"
      :submitText="t('test.form.button')"
      @submit="()=>{}"
    >
      <FormGenerator
        v-model="formValue"
        :formConfig="formConfig"
      />
    </FormWrapper>
    <div>
      <pre>{{ formValue }}</pre>
    </div>
  </div>
</div>
</template>
<style lang="scss" scoped>
.test-form__container{

}
.test-form__item{
  width: calc(50% - 12px);
  display: flex;
  flex-direction: column;
}

</style>
