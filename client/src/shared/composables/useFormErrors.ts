import { ref } from 'vue'

type FormErrors = Record<string, string>
type Validator = (v: unknown) => true | string

export function useFormErrors<T>(
  formValue: () => T | null | undefined
) {
  const errors = ref<FormErrors>({})
  const validators = new Map<string, Validator>()
  const activated = new Set<string>()

  const setError = (field: string, message: string) => {
    errors.value[field] = message
  }

  const clearError = (field: string) => {
    delete errors.value[field]
  }

  const clearAll = () => {
    errors.value = {}
    activated.clear()
  }

  const addValidator = (field: string, validator: Validator) => {
    validators.set(field, validator)
  }

  const runValidator = (field: string, value: unknown): boolean => {
    const validator = validators.get(field)
    if (!validator) return true
    const result = validator(value)
    if (typeof result === 'string') {
      setError(field, result)
      return false
    }
    clearError(field)
    return true
  }

  const validateFields = (...fields: string[]): boolean => {
    const form = formValue() as Record<string, unknown> | null | undefined
    let valid = true
    for (const field of fields) {
      activated.add(field)
      if (!runValidator(field, form?.[field])) {
        valid = false
      }
    }
    return valid
  }

  const onFieldUpdate = (field: string, value: unknown) => {
    if (!activated.has(field)) return
    runValidator(field, value)
  }

  return { errors, setError, clearError, clearAll, addValidator, validateFields, onFieldUpdate }
}
