import isArray from "lodash/isArray"
import { ValidationError, ValidationOptions, ValidationSchema } from "./types"
import { joinPath } from "./helpers"

export const validateArrayValuesAsync = async (
  values: any,
  valuesSchema: ValidationSchema | undefined,
  options: ValidationOptions
): Promise<ValidationError[]> => {
  if (!valuesSchema || !isArray(values)) return []

  const errors: ValidationError[] = []

  await Promise.all(
    values.map(async (value, index) => {
      const newErrors = await valuesSchema.verifyAsync(value, options)

      if (newErrors) {
        newErrors.forEach((error) => {
          error.path = joinPath(index.toString(), error.path)
          errors.push(error)
        })
      }
    })
  )

  return errors
}
