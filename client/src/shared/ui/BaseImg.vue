<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGetBreakpointVariables } from '@/shared/composables/useGetBreakpointVariables'
const {breakpointsMap, sizeNameList} = useGetBreakpointVariables()


type NameBreakpoints = (typeof sizeNameList)[number]

type SizeItem = {
  width?:number
  height?:number
}

const props = defineProps<{
  src:string
  alt?:string
  loading?:'lazy'| 'eager'
  placeholderSrc?:string
  sizeMap?:Partial<Record<NameBreakpoints,SizeItem>>
}>()

const isError = ref(false)

const onError = () => {
  isError.value = true
}

// reset error state when the source changes
watch(() => props.src, () => {
  isError.value = false
})

//example
// size-map={
//   ultra:{width:1000, height:1000},
//   desktop:{width:800, height:800},
//   laptop:{width:500, height:500},
//   tablet:{width:500, height:500},
//   mobile:{width:200, height:200},
//   mobileOnly:{width:200, height:200},
// }

const getStrSizeValue = (sizeItem:SizeItem):string => {
  const { width, height } = sizeItem
  const parts: string[] = []
  for(let i = 1; i <= 2; i++){

    const widthQuery = width ? `width=${width * i}` : ''
    const heightQuery = height ? `height=${height * i}` : ''
    const res = [widthQuery, heightQuery].filter(Boolean).join('&')
    parts.push(`${props.src}?${res} ${i}x`)
  }
  const result = parts.join(', ')

  return result
}

</script>
<template>
<picture>
  <template v-if="sizeMap && !isError">
    <source v-if="sizeMap['ultra']"
      :srcset="getStrSizeValue(sizeMap['ultra'])"
      :media="`(min-width: ${breakpointsMap['ultra']}px)`"
    />
    <template v-for="sizeName in sizeNameList" :key="'BaseImg'+sizeName">
      <source v-if="sizeMap[sizeName] && sizeName !== 'ultra'"
        :srcset="getStrSizeValue(sizeMap[sizeName])"
        :media="`(max-width: ${breakpointsMap[sizeName]}px)`"
      />
    </template>

  </template>
  <img class="base-img__img"
    :src="isError && placeholderSrc ? placeholderSrc : src"
    :alt
    :loading="loading || 'lazy'"
    @error="onError"
  >
</picture>

</template>
<style lang="scss" scoped>
.base-img__img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
