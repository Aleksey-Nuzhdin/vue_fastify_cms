<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useShowPopup } from './useShowPopup';
const { popups } = useShowPopup()

const popoverRef = ref<HTMLElement | null>(null)

watchEffect(() => {
  const el = popoverRef.value
  if (!el) return

  if (popups.value.length > 0) {
    if (!el.matches(':popover-open')) {
      el.showPopover()
    }
  } else {
    if (el.matches(':popover-open')) {
      el.hidePopover()
    }
  }
})
</script>
<template>
<Teleport to="body">
  <div ref="popoverRef" popover="manual" class="popup_container">
    <TransitionGroup name="popup" tag="div">
      <div
        v-for="popup in popups"
        :key="popup.id"
        class="popup"
        :class="`popup--${popup.type}`"
      >
        {{ popup.text }}
      </div>
    </TransitionGroup>
  </div>
</Teleport>
</template>
<style lang="scss" scoped>

.popup_container{
  // popover reset
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  overflow: visible;
  inset: unset;

  left: 0;
  bottom: 0;
  width: 0;
  height: 0;
  position: fixed;
}

.popup{
  position: absolute;
  top: calc(100% - min(130px, 15vh));
  right: 100%;
  padding: 10px 14px;
  border-radius: 6px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: #888;
    border-radius: 4px 0 0 4px;
  }
  transform: translateX( calc(100% + 20px) );
  width: max-content;
  max-width: 320px;
  z-index: 100000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.popup--success {
  background-color: #f0fdf4;
  &::before { background-color: #22c55e; }
}

.popup--error {
  background-color: #fef2f2;
  &::before { background-color: #ef4444; }
}

.popup--warning {
  background-color: #fefce8;
  &::before { background-color: #eab308; }
}

.popup--info {
  background-color: #eff6ff;
  &::before { background-color: #3b82f6; }
}

.popup-enter-from {
  opacity: 0;
  transform: translateX(0);
}

.popup-enter-to {
  transform: translateX( calc(100% + 20px) );
  opacity: 1;
}

.popup-enter-active {
  transition: all $transition-normal;
}

.popup-leave-from {
  opacity: 1;
  transform: translateX( calc(100% + 20px) );
}

.popup-leave-to {
  opacity: 0;
  transform: translateX(0);
}

.popup-leave-active {
  transition: all $transition-normal;
  position: absolute; /* важно для корректного удаления */
}
</style>
