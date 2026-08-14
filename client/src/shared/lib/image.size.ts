// Размеры картинки до отправки на сервер: превышение потолка (IMAGE_MAX_SIDE)
// показываем сразу, не гоняя файл по сети. null — файл не читается как
// картинка, решение о нём остаётся за сервером.
export function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    image.src = url
  })
}
