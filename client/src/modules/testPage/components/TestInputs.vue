<script setup lang="ts">
import type { InputType } from './../test.type'
import { ref } from 'vue'

const inputTypes:InputType[] = ['text' , 'email' , 'password', 'textarea']
const selectBind = {
  options: [
    {title:'option1',value:'value1'},
    {title:'option2',value:'value2'},
    {title:'option3',value:'value3'},
  ],
  placeholder:'Placeholder'
}
const checkboxBind = {
  label:'Checkbox Label',
  value:'checkboxValue'
}

const modelValue:any = ref({
  input:{},
  select:"",
  checkbox:'',
  multiSelect:[]
})

const statusList = ref([
  {label:'Default', required:true, id:'default'},
  {readonly:true, label:'Readonly', id:'readonly'},
  {disabled:true, label:'Disabled', id:'disabled'},
])

</script>
<template>
<div class="flex-column">
  <div>
    <h2>Multi Select</h2>
    <p>{{ modelValue.multiSelect }}</p>
    <div class="flex-row" style="flex-wrap: nowrap; width: 60vw;">
      <template v-for="status in statusList" :key="'input_status_' + status">
        <BaseMultiSelect v-model="modelValue.multiSelect" v-bind="{...selectBind, ...status}"/>
      </template>
    </div>
  </div>
  <div class="flex-column" >
    <template v-for="type in inputTypes" :key="'input_' + type">
      <h3>{{ type }}</h3>
      <div class="flex-row">
        <template v-for="status in statusList" :key="'input_status_' + status">
          <BaseInput :type v-bind="status"
            v-model="modelValue.input[type]"
          />
        </template>
      </div>
    </template>
  </div>
  <div class="flex-column">
    <h2>Select</h2>
    <div class="flex-row" >
      <template v-for="status in statusList" :key="'select_status_' + status">

        <BaseSelect v-model="modelValue.select"  v-bind="{...selectBind, ...status}"/>
      </template>
    </div>
  </div>
  <div class="flex-column">
    <h2>Checkbox</h2>
    <div class="flex-row" >
      <template v-for="status in statusList" :key="'checkbox_status_' + status">
        <BaseCheckbox v-model="modelValue.checkbox"  v-bind="{...checkboxBind, ...status}"/>
      </template>
    </div>
  </div>
</div>
</template>
<style lang="scss" scoped>

</style>
