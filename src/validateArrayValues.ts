import { ValidationError, ValidationOptions, ValidationSchema } from "./types"
import { isArray } from "lodash-es"
import { joinPath } from "./helpers"

export const validateArrayValues = (
  values: any,
  valuesSchema: ValidationSchema | undefined,
  options: ValidationOptions
): ValidationError[] => {
  if (!valuesSchema || !isArray(values)) return []

  const errors: ValidationError[] = []

  values.map((value, index) => {
    const newErrors = valuesSchema.verify(value, options)

    if (newErrors) {
      newErrors.forEach((error) => {
        error.path = joinPath(index.toString(), error.path)
        errors.push(error)
      })
    }
  })

  return errors
}
