import {
  ObjectShape,
  ValidationError,
  ValidationOptions,
  ValidationSchema,
} from "./types"
import { difference, keys } from "lodash-es"
import { joinPath } from "./helpers"

export const validateObjectUnknownKeys = (
  value: any,
  objectShape: ObjectShape<any> | undefined,
  unknownKeysSchema: ValidationSchema | undefined,
  options: ValidationOptions
): ValidationError[] => {
  if (!unknownKeysSchema) return []

  const unknownKeys = difference(keys(value), keys(objectShape))
  const errors: ValidationError[] = []

  unknownKeys.map((unknownKey) => {
    const newErrors = unknownKeysSchema.verify(unknownKey, options)

    if (newErrors) {
      newErrors.forEach((error) => {
        error.path = joinPath(unknownKey, error.path)
        errors.push(error)
      })
    }
  })

  return errors
}
