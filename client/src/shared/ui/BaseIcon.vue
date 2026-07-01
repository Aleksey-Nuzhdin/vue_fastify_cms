<script setup lang="ts">
import { computed } from 'vue'

export type IconFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

/** Имена цветов из SCSS $color-map (_variables.scss) */
export type IconColor =
  | 'primary'
  | 'accent'
  | 'primary-hover'
  | 'secondary'
  | 'secondary-hover'
  | 'success'
  | 'success-hover'
  | 'warning'
  | 'warning-hover'
  | 'error'
  | 'error-hover'
  | 'white'
  | 'text'
  | 'text-secondary'
  | 'border'

export type IconName =
  | 'eye-off'
  | 'eye-show'
  | 'file'
  | 'vk'
  | 'tg'
  | 'didya_maior'
  | 'profile'
  | 'star'
  | 'location'
  | 'website'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'edit'
  | 'copy'
  | 'upload'
  | 'download'
  | 'cloud-download'
  | 'paperclip'
  | 'close'
  | 'check'
  | 'trash'
  | 'file_type/null_img'
  | 'file_type/txt_img'
  | 'folder'

/**
 * BaseIcon — отображение SVG-иконок из public/icons/ через CSS mask-image.
 * SVG используется как маска, а цвет задаётся через background-color.
 *
 * @prop name  — имя иконки из списка IconName (без расширения .svg).
 *               Поддерживает вложенность: 'file_type/txt_img'.
 *
 * @prop size  — размер иконки (ширина и высота одинаковые).
 *               number — значение в px (24 → '24px').
 *               string — любая CSS-единица ('2rem', '50%').
 *               По умолчанию: 24 (px).
 *
 * @prop color — цвет иконки. Принимает имя из IconColor ('primary', 'error', и т.д.)
 *               или любое CSS-значение цвета ('#ff0000', 'red', 'rgb(...)').
 *               Имена маппятся на CSS-переменные из SCSS $color-map (_variables.scss).
 *               Если поменять значение в SCSS — цвет иконки тоже изменится.
 *               По умолчанию: 'currentColor' (наследует цвет родителя).
 *
 * @prop fit   — как иконка вписывается в контейнер (mask-size).
 *               'contain'    — вписать целиком, сохраняя пропорции (могут быть поля).
 *               'cover'      — заполнить весь контейнер, обрезая лишнее.
 *               'fill'       — растянуть без сохранения пропорций (100% 100%).
 *               'none'       — оригинальный размер, без масштабирования.
 *               'scale-down' — как none или contain, выбирается меньший результат.
 *               По умолчанию: 'contain'.
 *
 * @example
 * <BaseIcon name="eye-show" />
 * <BaseIcon name="folder" :size="32" color="primary" />
 * <BaseIcon name="file" color="error" fit="cover" />
 * <BaseIcon name="file_type/txt_img" size="2rem" color="#00ff00" />
 */
const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
    color?: IconColor | string
    fit?: IconFit
  }>(),
  {
    size: 24,
    color: 'currentColor',
    fit: 'contain',
  },
)

/** Внутренняя карта масштабов для иконок, у которых SVG визуально меньше остальных */
const iconScaleMap: Partial<Record<IconName, number>> = {
  trash: 130,
}

const iconSrc = computed(() => `/icons/${props.name}.svg`)

const colorNames: Set<string> = new Set([
  'primary', 'primary-hover', 'accent', 'secondary', 'secondary-hover',
  'success', 'success-hover', 'warning', 'warning-hover',
  'error', 'error-hover', 'white', 'text', 'text-secondary', 'border',
])

const colorValue = computed(() =>
  colorNames.has(props.color) ? `var(--color-${props.color})` : props.color,
)

const maskSize = computed(() => {
  const scale = iconScaleMap[props.name]
  if (scale != null) return `${scale}%`
  return props.fit === 'fill' ? '100% 100%' : props.fit
})

const sizeValue = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`
  return /^\d+$/.test(props.size) ? `${props.size}px` : props.size
})
</script>

<template>
  <span
    class="base-icon"
    :style="{
      width: sizeValue,
      height: sizeValue,
      backgroundColor: colorValue,
      maskImage: `url(${iconSrc})`,
      WebkitMaskImage: `url(${iconSrc})`,
      maskSize: maskSize,
      WebkitMaskSize: maskSize,
    }"
  />
</template>

<style lang="scss" scoped>
.base-icon {
  display: inline-block;
  flex-shrink: 0;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-position: center;
}
</style>
