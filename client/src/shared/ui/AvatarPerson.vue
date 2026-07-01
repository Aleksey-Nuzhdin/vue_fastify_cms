<script setup lang="ts">
import { ref, computed, watch } from 'vue'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const PLACEHOLDER = '/images/placeholder/no_profile_images.svg'

interface Props {
  src?: string
  alt?: string
  size?: AvatarSize
  initials?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const mapSize = {
  'xs': {width: 24, height:24},
  'sm': {width: 50, height:50},
  'md': {width: 100, height:100},
  'lg': {width: 200, height:200},
  'xl': {width: 400, height:400},
}
const getQuerySize = (size: AvatarSize) => `width=${mapSize[size].width}&height=${mapSize[size].height}`

const hasError = ref(false)

const imageSrc = computed(() =>
  props.src && !hasError.value ? props.src + `?${getQuerySize(props.size)}` : PLACEHOLDER,
)

watch(() => props.src, () => {
  hasError.value = false
})

function onError() {
  hasError.value = true
}
</script>

<template>
  <div class="avatar" :class="`avatar__${size}`">
    <BaseImg
      class="avatar__img"
      :src="imageSrc"
      :alt="alt"
      :title="alt || initials"
      loading="lazy"
      @error="onError"
    />
  </div>
</template>

<style scoped lang="scss">
@use "sass:map";

$avatar-sizes: (
  'xs': (size: 24px, font: 16px),
  'sm': (size: 50px, font: 16px),
  'md': (size: 100px, font: 16px),
  'lg': (size: 200px, font: 16px),
  'xl': (size: 400px, font: 16px),
);

.avatar {
  display: inline-flex;

  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: $color-bg-secondary;
  border: 1px solid $color-border;
  flex-shrink: 0;
}

@each $name, $values in $avatar-sizes {
  .avatar__#{$name} {
    width: map.get($values, size);
    height: map.get($values, size);
  }
}

.avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
