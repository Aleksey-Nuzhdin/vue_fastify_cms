import type { MultipartFile } from "@fastify/multipart"

export function parseFileName(fullName: string) {
  const lastDotIndex = fullName.lastIndexOf('.')
  
  // Нет точки или точка в начале (.gitignore)
  if (lastDotIndex <= 0) {
    return { name: fullName, extension: '' }
  }
  
  return {
    name: fullName.slice(0, lastDotIndex),
    extension: fullName.slice(lastDotIndex + 1)
  }
}

const RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
])

export function sanitizeFileName(name: string): string {
  let cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')   // Запрещённые символы
    .replace(/^\.+/, '')             // Точки в начале
    .replace(/\.+$/, '')             // Точки в конце
    .replace(/\s+/g, ' ')            // Множественные пробелы → один
    .trim()

  // Пустое имя после очистки
  if (!cleaned) {
    return 'unnamed'
  }

  // Слишком длинное имя (255 — стандартный лимит ФС)
  if (cleaned.length > 200) {
    const { name: baseName, extension } = parseFileName(cleaned)
    const maxBaseLength = 200 - extension.length - 1
    cleaned = baseName.slice(0, maxBaseLength) + (extension ? '.' + extension : '')
  }

  // Зарезервированные имена Windows
  const nameWithoutExt = cleaned.split('.')[0].toUpperCase()
  if (RESERVED_NAMES.has(nameWithoutExt)) {
    cleaned = '_' + cleaned
  }

  return cleaned
}

export function saveFileOnFs(file: MultipartFile, path: string) {
  
}