<script setup lang="ts">
import { computed } from 'vue';
import { usePagination } from '@/shared/composables/usePagination';

const { pagination } = defineProps<{
  pagination: ReturnType<typeof usePagination>
}>()

// const pagination = usePagination(props.chunkSize, props.listSize)

const emits = defineEmits(['goToPage'])

const goToPage = (page: number) => {
  pagination.goToPage(page)
  emits('goToPage', page)
}
const nextPage = () => goToPage(pagination.currentPage.value + 1)
const prevPage = () => goToPage(pagination.currentPage.value - 1)

const maxPage = computed(() => pagination.maxPage.value)
const currentPage = computed(() => pagination.currentPage.value)

type pageItem = number | false
const buttonsData = computed<pageItem[]>(() => {
  if(maxPage.value < 9){
    const res = []
    for(let i = 1; i <= maxPage.value; i++) res.push(i)
    return res
  }
  if(currentPage.value < 3){
    return [1, 2, 3, 4, false, maxPage.value]
  }
  if(currentPage.value > maxPage.value - 3){
    return [1, false, maxPage.value - 3, maxPage.value - 2, maxPage.value - 1, maxPage.value]
  }
  return [1, false, currentPage.value-1, currentPage.value, currentPage.value + 1, false, maxPage.value]
})

</script>
<template>
<div class="pagination">
  <div class="pagination-control" v-if="maxPage > 1">
    <BaseButton icon="arrow-left" color="accent" variant="outline" @click="prevPage"/>
    <template v-for="buttonData in buttonsData">
      <template v-if="buttonData === false">
        <span>...</span>
      </template>
      <BaseButton v-else
        color="accent"
        @click="goToPage(buttonData)"
        :variant="buttonData === currentPage ? 'filled' : 'outline'"
      >{{ buttonData }}</BaseButton>
    </template>
    <BaseButton icon="arrow-right" color="accent"  variant="outline" @click="nextPage"/>
  </div>
  <div class="pagination-content">
    <slot/>
  </div>
  <div class="pagination-control" v-if="maxPage > 1">
    <BaseButton icon="arrow-left" color="accent" variant="outline" @click="prevPage"/>
    <template v-for="buttonData in buttonsData">
      <template v-if="buttonData === false">
        <span>...</span>
      </template>
      <BaseButton v-else
        color="accent"
        @click="goToPage(buttonData)"
        :variant="buttonData === currentPage ? 'filled' : 'outline'"
      >{{ buttonData }}</BaseButton>
    </template>
    <BaseButton icon="arrow-right" color="accent"  variant="outline" @click="nextPage"/>
  </div>
</div>
</template>
<style lang="scss" scoped>
.pagination{
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  @include desktop{
    gap: $spacing-md;
  }
}
.pagination-control{
  display: flex;
  gap: $spacing-md;
}

</style>
