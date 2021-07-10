import { difference, keys } from "lodash"
import {
  ObjectShape,
  ValidationError,
  ValidationOptions,
  ValidationSchema,
} from "./types"
import { joinPath } from "./helpers"

export const validateObjectUnknownKeysAsync = async (
  value: any,
  objectShape: ObjectShape<any> | undefined,
  unknownKeysSchema: ValidationSchema | undefined,
  options: ValidationOptions
): Promise<ValidationError[]> => {
  if (!unknownKeysSchema) return []

  const unknownKeys = difference(keys(value), keys(objectShape))
  const errors: ValidationError[] = []

  await Promise.all(
    unknownKeys.map(async (unknownKey) => {
      const newErrors = await unknownKeysSchema.verifyAsync(unknownKey, options)

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
