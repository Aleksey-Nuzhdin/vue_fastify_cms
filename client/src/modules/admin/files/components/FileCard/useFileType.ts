import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export type FileTypeResult = 'img' | 'pdf' | 'txt' | 'docx' | 'xlsx' | null

export function useFileType(extension: MaybeRefOrGetter<string>) {
  const fileType = computed<FileTypeResult>(() => {
    const ext = toValue(extension)
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) return 'img'
    if (['pdf', 'txt', 'docx'].includes(ext)) return ext as FileTypeResult
    if (ext === 'xlsx' || ext === 'csv') return 'xlsx'
    return null
  })

  const isImage = computed(() => fileType.value === 'img')

  return { fileType, isImage }
}
