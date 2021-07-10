import { StringSchema } from "./schemas/StringSchema"
import { ObjectShape, ValidationError, ValidationOptions } from "./types"
import { difference, keys } from "lodash"
import { joinPath } from "./helpers"

export const validateObjectUnknownValues = (
  value: any,
  objectShape: ObjectShape<any> | undefined,
  unknownValuesSchema: StringSchema | undefined,
  options: ValidationOptions
): ValidationError[] => {
  if (!unknownValuesSchema) return []

  const unknownKeys = difference(keys(value), keys(objectShape))
  const errors: ValidationError[] = []

  unknownKeys.map((unknownKey) => {
    const unknownValue = value[unknownKey]
    const newErrors = unknownValuesSchema.verify(unknownValue, options)

    if (newErrors) {
      newErrors.forEach((error) => {
        error.path = joinPath(unknownKey, error.path)
        errors.push(error)
      })
    }
  })

  return errors
}
