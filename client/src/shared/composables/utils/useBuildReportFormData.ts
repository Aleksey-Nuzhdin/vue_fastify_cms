import type { ReportAuthor, CreateReportDto, UpdateReportDto } from '@shared/types'
import { useBuildUpdate } from './useBuildUpdate'

type FormRecord = Record<string, string | File | ReportAuthor[] | null | undefined>

function toFormData(data: FormRecord): FormData {
  const formData = new FormData()

  for (const key of Object.keys(data)) {
    const value = data[key]
    if (value === null || value === undefined) continue

    if (key === 'fileAnnotation') {
      if (value instanceof File) formData.append(key, value)
      continue
    }
    if (key === 'authors') {
      formData.append(key, JSON.stringify(value))
      continue
    }
    formData.append(key, value as string)
  }

  return formData
}

export function useBuildReportFormData() {
  const { buildUpdate } = useBuildUpdate()

  const buildReportFormData = {
    create(data: CreateReportDto<ReportAuthor[], File>, status: 'draft' | 'waiting'): FormData {
      const fields = buildUpdate<CreateReportDto<ReportAuthor[], File | ''>>({
        title: data.title,
        description: data.description,
        authors: data.authors,
        fileAnnotation: data.fileAnnotation || '',
        section: data.section,
        status,
      })

      return toFormData(fields as FormRecord)
    },

    update(data: UpdateReportDto<ReportAuthor[], File | string>): FormData {
      const fields = buildUpdate<UpdateReportDto<ReportAuthor[], File | ''>>({
        title: data.title ?? null,
        description: data.description ?? null,
        authors: data.authors ?? null,
        fileAnnotation: null,
        section: data.section ?? null,
        status: data.status ?? null,
      })
      if( data.fileAnnotation instanceof File ){
        fields.fileAnnotation = data.fileAnnotation
      }
      if( data.fileAnnotation === '' ){
        fields.fileAnnotation = data.fileAnnotation
      }

      return toFormData(fields as FormRecord)
    },
  }

  return { buildReportFormData }
}
