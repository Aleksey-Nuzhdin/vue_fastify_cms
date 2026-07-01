<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/shared/components/Modal/BaseModal.vue';
import { useModal } from '@/shared/components/Modal/composables/useModal';
import { useAdminFolderMutations } from '../composables/useAdminFolderMutations';

type TypeProps = {
  id:string
}

const props = defineProps<TypeProps>()


const {closeModal} = useModal(props.id)
const { createFolder } = useAdminFolderMutations()

const folderName = ref('')


const handleCreateFolder = async () => {
  if(!folderName.value) return
  await createFolder({name:folderName.value})
  closeModal()
}
</script>
<template>
<BaseModal :id :title="$t('admin.files.createFolderTitle')">
  <div class="flex-column">
    <BaseInput :label="$t('admin.files.folderNameLabel')"
      :placeholder="$t('admin.files.folderNamePlaceholder')"
      v-model="folderName"
    />
    <div class="flex-row">
      <BaseButton color="success"
        @click="handleCreateFolder"
      >{{ $t('common.create') }}</BaseButton>
      <BaseButton @click="closeModal()"
      >{{ $t('common.close') }}</BaseButton>
    </div>
  </div>
</BaseModal>
</template>
<style lang="scss" scoped>

</style>
