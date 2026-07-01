<script setup lang="ts">
import { useModal } from '@/shared/components/Modal/composables/useModal';
import BaseModal from '@/shared/components/Modal/BaseModal.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const props = defineProps<{
  id:string,
  title:string,
}>()

const emit = defineEmits<{
  close:[],
  delete:[]
}>()

const { closeModal } = useModal(props.id)

const deleteSubmit = ()=>{
  emit('delete')
  closeModal()
}

const closeSubmit = ()=>{
  emit('close')
  closeModal()
}

</script>
<template>
<BaseModal :id :title :key="id"
  @close="closeModal"
>
  <div class="modal-delete">
    <p class="modal-delete__text"><slot></slot></p>
    <div class="modal-delete__buttons">
      <slot name="buttons">
        <BaseButton color="primary" @click="deleteSubmit" size="lg">{{ t('common.delete') }}</BaseButton>
        <BaseButton @click="closeModal" color="accent" variant="outline" size="lg">{{ t('common.cancel') }}</BaseButton>
      </slot>
    </div>
  </div>
</BaseModal>
</template>
<style lang="scss" scoped>
.modal-delete{
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  width: 350px;
  align-items: center;
}
.modal-delete__text{
  text-align: center;
  margin-bottom: $spacing-lg;
  font-size: 16px;
  color: $color-text-secondary;
  @include desktop{
    font-size: 14px;
  }
}
.modal-delete__buttons{
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: $spacing-md;
  flex-direction: column;

  &>*{
    flex-grow: 1;
    width: 100%;
  }
}
</style>
