import { StringSchema } from "./schemas/StringSchema"
import { difference, keys } from "lodash-es"
import { ObjectShape, ValidationError, ValidationOptions } from "./types"
import { joinPath } from "./helpers"

export const validateObjectUnknownValuesAsync = async (
  value: any,
  objectShape: ObjectShape<any> | undefined,
  unknownValuesSchema: StringSchema | undefined,
  options: ValidationOptions
): Promise<ValidationError[]> => {
  if (!unknownValuesSchema) return []

  const unknownKeys = difference(keys(value), keys(objectShape))
  const errors: ValidationError[] = []

  await Promise.all(
    unknownKeys.map(async (unknownKey) => {
      const unknownValue = value[unknownKey]
      const newErrors = await unknownValuesSchema.verifyAsync(
        unknownValue,
        options
      )

      if (newErrors) {
        newErrors.forEach((error) => {
          error.path = joinPath(unknownKey, error.path)
          errors.push(error)
        })
      }
    })
  )

  return errors
}
