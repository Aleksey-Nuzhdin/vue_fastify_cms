<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/shared/components/Modal/BaseModal.vue';
import { useModal } from '@/shared/components/Modal/composables/useModal';
import { useAdminFileMutations } from '../composables/useAdminFileMutations';

type TypeProps = {
  id:string
}

const props = defineProps<TypeProps>()


const {closeModal} = useModal(props.id)
const { createFile } = useAdminFileMutations()


interface FormValue {
  file:null| File
  name?:string
  info?:string
}
const formValue = ref<FormValue>({
  file:null,
  name:'',
  info:''
})

const isLoading = ref(false)

const createFolder = async () => {
  isLoading.value = true
  const file = formValue.value.file
  if(file === null) return

  await createFile({ ...formValue.value, file })
  isLoading.value = false
  closeModal()
}
</script>
<template>
<BaseModal :id :title="$t('admin.files.uploadFileTitle')">
  <div class="flex-column">
    <BaseInputFile :label="$t('admin.files.fileLabel')"
      :placeholder="$t('admin.files.filePlaceholder')"
      v-model="formValue.file"
    />
    <BaseInput :label="$t('admin.files.fileNameLabel')"
      :placeholder="$t('admin.files.fileNamePlaceholder')"
      v-model="formValue.name"
    />
    <BaseInput :label="$t('common.description')"
      :placeholder="$t('admin.files.descriptionPlaceholder')"
      type="textarea"
      v-model="formValue.info"
    />
    <div class="flex-row">
      <BaseButton color="success"
        @click="createFolder"
      >{{ $t('common.create') }}</BaseButton>
      <BaseButton @click="closeModal()"
      >{{ $t('common.close') }}</BaseButton>
    </div>

    <BaseLoader v-if="isLoading" overlay/>
  </div>
</BaseModal>
</template>
<style lang="scss" scoped>

</style>
