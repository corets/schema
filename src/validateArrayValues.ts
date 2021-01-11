import { ValidationError, ValidationSchema } from "./types"
import { isArray } from "lodash"
import { joinPath } from "./helpers"

export const validateArrayValues = (
  values: any,
  valuesSchema: ValidationSchema | undefined
): ValidationError[] => {
  if (!valuesSchema || !isArray(values)) return []

  const errors: ValidationError[] = []

  values.map((value, index) => {
    const newErrors = valuesSchema.validate(value)

    if (newErrors) {
      newErrors.forEach((error) => {
        error.path = joinPath(index.toString(), error.path)
        errors.push(error)
      })
    }
  })

  return errors
}
