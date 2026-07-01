<script setup lang="ts" generic="TypeItem">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue'

type Props = {
  list:TypeItem[]
  noButtons?: boolean
  noDots?: boolean
}
const props = defineProps<Props>()

const track = ref<null | HTMLDivElement>(null)
const sliders = ref<null | HTMLDivElement[]>(null)

const visibleCountItem = ref(0)

watch(()=>sliders.value?.length, ()=>{
  if(track.value?.children.length !== props.list.length) return
  if( !sliders.value?.[0]  ) return

  const slideWith = sliders.value[0].offsetWidth
  const trackWidth = track.value.offsetWidth

  visibleCountItem.value = Math.floor(trackWidth / slideWith)

})

const count = computed(() => props.list.length - visibleCountItem.value + 1)

const currentPosition = ref(0)

let isNavigating = false

let clearNavigationTimeout: ReturnType<typeof setTimeout>

function go(i: number) {
  if (i < 0 || i >= count.value) return
  if (track.value === null) return
  const slide = track.value.children[i] as HTMLElement

  if(!slide?.offsetLeft && slide.offsetLeft !== 0 ) return

  currentPosition.value = i
  isNavigating = true

  track.value.scrollTo({ left: slide.offsetLeft - track.value.offsetLeft, behavior: 'smooth' })

  if(clearNavigationTimeout) clearTimeout(clearNavigationTimeout)
  clearNavigationTimeout = setTimeout(() => { isNavigating = false }, 400)
}

let observer: IntersectionObserver
let countSetObserver = 0

const setObserver = () => {
  countSetObserver++
  if (countSetObserver > 100) return
  if (track.value === null) return setTimeout(setObserver, 100)

  const ratios = new Map<Element, number>()

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => ratios.set(e.target, e.intersectionRatio))

      //Если идёт навигация через кнопки, не меняем currentPosition
      if (isNavigating) return

      let bestIndex = -1
      ratios.forEach((ratio, el) => {

        const idx = +(el as HTMLElement).dataset.index!
        if(ratio >= 0.5 && ( bestIndex === -1 || bestIndex > idx ) ){
          bestIndex = idx;
        }

      })
      if (bestIndex !== -1) currentPosition.value = bestIndex
    },
    { root: track.value, threshold: [0, 0.25, 0.5, 0.75, 1] }
  )

  track.value.querySelectorAll('.slider__item').forEach(el => observer.observe(el))
}

onMounted( () => nextTick(setObserver) )

onBeforeUnmount(() => observer?.disconnect())

const goNext = () => {go(currentPosition.value + 1)}
const goPrev = () => {go(currentPosition.value - 1)
}
defineExpose({ goNext, goPrev, count })

</script>
<template>
<div class="slider">
  <div class="slider__track" ref="track">
    <div ref="sliders"
      v-for="(item, i) in props.list"
      :key="i"
      class="slider__item"
      :data-index="i"
    >
      <slot name="listItem" :item="item" />
    </div>
  </div>
  <div class="slider__dots-list" v-if="count > 1 && !noDots">
    <div
      v-for="i of count"
      :key="i"
      class="slider__dots-item"
      :class="{ active: currentPosition === i-1 }"
      @click="go(i-1)"
    />
  </div>
  <div class="slider__control-buttons" v-if="!noButtons">
    <BaseButton icon="arrow-left"  @click.capture.stop="goPrev" :disabled="currentPosition === 0"         bgHover=""        />
    <BaseButton icon="arrow-right" @click.capture.stop="goNext" :disabled="currentPosition === count - 1" bgHover="#3B82F6" />
  </div>
</div>
</template>
<style lang="scss" scoped>
.slider{
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  @include desktop{
    gap: $spacing-md;
  }
}
.slider__track{
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;

  gap: $spacing-lg;
  @include desktop{
    gap: $spacing-md;
  }
}
.slider__item{
  scroll-snap-align: start;
}
.slider__dots-list{
  display: flex;
  gap: $spacing-sm;
  justify-content: center;
}
.slider__dots-item{
  // filter: brightness(80%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid $color-accent;
  outline: 1px solid white;
  cursor: pointer;

  &.active{
    background-color: $color-accent;
  }
}
.slider__control-buttons{
  display: flex;
  justify-content: center;
  gap: $spacing-md;
}

</style>
