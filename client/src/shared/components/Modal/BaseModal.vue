<script setup lang="ts">
import { ref, computed } from 'vue'
import { useModal } from './composables/useModal'

const props = defineProps<{
  id: string
  title?: string
  class?: string
  width?: string
}>()

const emits = defineEmits<{
  close: [id: string]
}>()

const modal = useModal(props.id)

const dialog = ref<HTMLDialogElement | null>(null)

modal.setNode(dialog)

let closeModal = () => {
  emits('close', props.id)
  modal.closeModal()
}

const classesFade = computed(() => modal.statusClass.value)

const isActive = computed(() => classesFade.value !== '')
</script>
<template>
  <Teleport to="body">
    <dialog
      v-if="isActive"
      class="base-modal"
      :class="`${classesFade} ${props.class ?? ''}`"
      :style="{ maxWidth: props.width }"
      ref="dialog"
      @click.self="closeModal"
    >
      <slot name="full_content">
        <div class="base-modal__header">
          <h3 class="base-modal__title">
            <slot name="title">{{ title }}</slot>
          </h3>
          <slot name="header"></slot>
        </div>
        <div class="base-modal__body">
          <slot></slot>
        </div>
      </slot>
      <button class="base-modal__close-button" @click="closeModal">
        <BaseIcon color="secondary" size="30" name="close"></BaseIcon>
      </button>
    </dialog>
  </Teleport>
</template>
<style lang="scss" scoped>
@mixin stylesHide {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);

  &::backdrop {
    background: rgba(0, 0, 0, 0);
  }
}

@mixin stylesOpen {
  opacity: 1;
  transform: translateY(0) scale(1);

  &::backdrop {
    background: rgba(0, 0, 0, 0.8);
  }
}

.base-modal {
  border: none;
  outline: none;
  border-radius: 12px;
  padding: 24px;
  // max-width: 500px;
  min-width: 360px;
  width: max-content;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  position: fixed;
  inset: 0;
  margin: auto;
  overflow: visible;
  display: flex;
  flex-direction: column;

  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;

  &::backdrop {
    background: rgba(0, 0, 0, 0);

    transition:
      background 0.3s ease,
      overlay 0.3s ease allow-discrete,
      display 0.3s ease allow-discrete;
  }

  @include stylesHide;

  &.open-start {
    @include stylesHide;
  }
  &.open-process {
    @include stylesOpen;
  }
  &.open-end {
    @include stylesOpen;
  }
  &.close-start {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease,
      overlay 0.15s ease allow-discrete,
      display 0.15s ease allow-discrete;

    &::backdrop {
      background: rgba(0, 0, 0, 0);

      transition:
        background 0.15s ease,
        overlay 0.15s ease allow-discrete,
        display 0.15s ease allow-discrete;
    }
    @include stylesOpen;
  }
  &.close-process {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease,
      overlay 0.15s ease allow-discrete,
      display 0.15s ease allow-discrete;

    &::backdrop {
      background: rgba(0, 0, 0, 0);

      transition:
        background 0.15s ease,
        overlay 0.15s ease allow-discrete,
        display 0.15s ease allow-discrete;
    }
    @include stylesHide;
  }
  &.close-end {
    @include stylesHide;
  }
}
.base-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}
.base-modal__title {
  line-height: 1;
  width: 100%;
  text-align: center;
  color: $color-accent;
  font-family: $font-title;
  font-size: 26px;
  font-weight: 500;
}
.base-modal__close-button {
  position: absolute;
  cursor: pointer;
  top: 0;
  right: -40px;

  @include tablet {
    right: 0;
    top: -40px;
  }
}
.base-modal__body {
  overflow-y: auto;
}
</style>
