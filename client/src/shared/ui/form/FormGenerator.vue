<script setup lang="ts">
import type { FormConfig, FormValues } from '@/shared/types/form.types'
import BaseInput from '../inputs/BaseInput.vue'
import BaseSelect from '../inputs/BaseSelect.vue'
import BaseMultiSelect from '../inputs/BaseMultiSelect.vue'
import BaseCheckbox from '../inputs/BaseCheckbox.vue'
import BaseInputFile from '../inputs/BaseInputFile.vue'
import BaseSelectFile from '../inputs/BaseSelectFile'

interface Props {
  formConfig: Omit<FormConfig, 'initionalValues' | 'name'>
  modelValue: FormValues
  errors?: Record<string, string>
  onFieldUpdate?: (field: string, value: unknown) => void
  even?: boolean
  deepIndex?: number
  readonly?: boolean
  itemIndex?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: FormValues]
}>()

const componentMap: Record<string, any> = {
  input: BaseInput,
  select: BaseSelect,
  file: BaseInputFile,
  checkbox: BaseCheckbox,
  'multi-select': BaseMultiSelect,
  'select-file': BaseSelectFile,
}

const updateField = (name: string, value: any) => {
  props.onFieldUpdate?.(name, value)
  emit('update:modelValue', {
    ...props.modelValue,
    [name]: value,
  })
}


const addArrayItem = (field: string) => {
  if(Array.isArray(props.modelValue[field]) === false){
    props.modelValue[field] = []
  }
  props.modelValue[field].push({})
}

const upArrayItem = (field: string, index: number) => {
  if(index === 0) return
  const item = props.modelValue[field][index]
  props.modelValue[field].splice(index, 1)
  props.modelValue[field].splice(index - 1, 0, item)
}
const downArrayItem = (field: string, index: number) => {
  if(index === props.modelValue[field].length - 1) return
  const item = props.modelValue[field][index]
  props.modelValue[field].splice(index, 1)
  props.modelValue[field].splice(index + 1, 0, item)
}
const removeArrayItem = (field: string, index: number) => {
  props.modelValue[field].splice(index, 1)
}

const generateId = ()=>{
  return (''+ Math.random() + Date.now()).replace('.', '_')
}
</script>

<template>
  <div class="form-generator"
    :class="{
      'form-generator__deep': (deepIndex || 0) > 0
    }"
  >
    <template v-for="(field, index) of formConfig.fields" :key="formConfig.id + field.field">
      <template v-if="field.type === 'object'">
        <div class="form-generator__object-block form-generator__even">
          <div class="form-generator__object-label form-generator__label">
            {{ field.label }}
          </div>
          <FormGenerator
            :model-value="modelValue[field.field] || {}"
            @update:model-value="updateField(field.field, $event)"
            :formConfig="{
              id: formConfig.id,
              fields: field.fieldsList
            }"
            :even="!even"
            :deepIndex="(deepIndex || 0) + 1"
            :readonly
            :itemIndex="index"
          />
        </div>
      </template>
      <template v-else-if="field.type === 'array'">
        <div class="from-generator__array-block form-generator__even"
        >
          <div class="from-generator__array-header">
            <div class="from-generator__array-label form-generator__label">
              {{ field.label }}
            </div>
            <div class="from-generator__array-controll" v-if="!readonly">
              <BaseLinkArrow class="from-generator__array-add" @click="addArrayItem(field.field)">
                {{ $t('common.add') }}
              </BaseLinkArrow>
            </div>
          </div>
          <div class="from-generator__array-generator">
            <template v-for="(arrayItem, index) in modelValue[field.field]">
                <div class="from-generator__array-item">
                <FormGenerator
                  v-model="modelValue[field.field][index]"
                  :formConfig="{
                    id:formConfig.id,
                    fields:field.arrayItem
                  }"
                  :even="!even"
                  :deepIndex="(deepIndex || 0) + 1"
                  :readonly
                  :itemIndex="+index"
                />

                <div class="from-generator__array-item-controll" v-if="!readonly">
                  <BaseButton size="sm" color="accent" icon="arrow-up"
                    @click="upArrayItem(field.field, +index)"
                  />
                  <BaseButton size="sm" color="accent" icon="arrow-down"
                    @click="downArrayItem(field.field, +index)"
                  ></BaseButton>
                  <BaseButton size="sm" color="error" icon="trash"
                    @click="removeArrayItem(field.field, +index)"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
      <template v-else-if="field.type === 'quill'">
        <QuillItem
          v-model="props.modelValue"
          :field="field.field"
          :id="'form-generator-quill_' + generateId() + field.field"
          :label="field.label"
          :placeholder="field.placeholder"
        />
      </template>
      <template v-else>
        <div :style="{gridColumn: field.cols ? `span ${field.cols}` : 'span 12'}">
          <component
            :is="componentMap[field.type]"
            :id="field.field"
            :type="field.type"
            :label="field.label"
            :placeholder="field.placeholder"
            :model-value="modelValue[field.field]"
            :errorText="errors?.[field.field]"
            :readonly
            @update:model-value="updateField(field.field, $event)"
            v-bind="{...field.options}"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">
.form-generator {
  display: grid;
  gap: $spacing-md;
  grid-template-columns: repeat(12, 1fr);
  align-items:flex-end;
  &>*{
    grid-column: 1/-1;
  }
}
.form-generator__even{
  // background-color: rgb(235, 234, 234);
  // border-right: 1px solid $color-black;
}
.from-generator__array-add{
  cursor: pointer;
}
.form-generator__label{
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
}
.from-generator__array-block{
  // margin-left: 20px;
  // padding-left: 20px;
  // padding-right: 5px;
  // padding-top: 5px;
}
.form-generator__deep{
  // padding-left: 10px;
  // padding-right: 5px;
  // padding-top: 10px;
}
.from-generator__array-label{
  padding-left: 0px;
}
.from-generator__array-item{
  position: relative;
  border-bottom: 1px solid  $color-black;
  padding: 16px 0;
  &:last-child{
    border-bottom: none;
    padding-bottom: 0;
  }
}
.from-generator__array-generator{
  border-right: 1px solid $color-black;
  padding-right: 16px;
}
.from-generator__array-header{
  display: flex;
  justify-content: space-between;
}
.form-generator__object-block{
  // margin-left: 20px;
  // padding-left: 20px;
  // padding-right: 5px;
  // padding-top: 5px;
  padding-right: 16px;
  border-right: 1px solid $color-black;
}

.from-generator__array-item-controll{
  display: flex;
  gap: 5px;
  justify-content: end;
  width: 100%;
  margin-top: $spacing-md;
}

.form-generator__cols-item{
  grid-column: 1/-1;
}
</style>
