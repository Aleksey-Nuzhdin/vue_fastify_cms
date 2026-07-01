<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  size?: 'sm' | 'md' | 'lg'
  overlay?: boolean
  color?: 'primary' | 'accent'
}>()

const wrapper = ref<HTMLDivElement | null>(null)
onMounted(()=>{
  if(props.overlay && wrapper.value){
    const parent = wrapper.value.parentElement
    if(!parent) return
    parent.style.position = 'relative'
  }
})

</script>
<template>
  <div v-if="overlay" class="loader_wrapper" ref="wrapper">
    <div class="loader" :class="`loader--${size ?? 'md'}`">
      <span class="loader__spinner" :class="'loader__color-'+color" />
    </div>
  </div>
  <div v-else class="loader" :class="`loader--${size ?? 'md'}`">
    <span class="loader__spinner" :class="'loader__color-'+color" />
  </div>
</template>
<style lang="scss" scoped>
.loader_wrapper{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  // background-color: #ffffff99;
  z-index: 1;
}
.loader {
  display: flex;
  align-items: center;
  justify-content: center;
}
.loader--sm .loader__spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.loader--md .loader__spinner {
  width: 36px;
  height: 36px;
  border-width: 3px;
}

.loader--lg .loader__spinner {
  width: 52px;
  height: 52px;
  border-width: 4px;
}


.loader__spinner {
  display: block;
  border-radius: 50%;
  border-style: solid;
  border-color: $color-primary transparent $color-primary transparent;
  animation: spin 0.8s linear infinite;

  &.loader__color-accent{
    border-color: $color-accent transparent $color-accent transparent;
  }
  &.loader__color-primary{
    border-color: $color-primary transparent $color-primary transparent;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
