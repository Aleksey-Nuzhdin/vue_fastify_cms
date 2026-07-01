import { workerData, parentPort } from 'worker_threads'
import sharp from 'sharp'

interface WorkerData {
  inputPath: string
  outputPath: string
  width: number
  height: number
}

async function resize() {
  const { inputPath, outputPath, width, height } = workerData as WorkerData

  const { width: actualWidth, height: actualHeight } = await sharp(inputPath)
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath)

  parentPort?.postMessage({ width: actualWidth, height: actualHeight })
}

resize().catch((err) => {
  parentPort?.postMessage({ error: err.message })
})
