import { ObjectShape } from "./schemas/ObjectSchema"
import { ValidationSchema } from "./types"
import { difference, keys } from "lodash"

export const testObjectUnknownKeys = (
  value: any,
  objectShape: ObjectShape<any> | undefined,
  unknownKeysSchema: ValidationSchema | undefined
): boolean => {
  if (!unknownKeysSchema) return true

  const unknownKeys = difference(keys(value), keys(objectShape))

  for (const unknownKey of unknownKeys) {
    if (!unknownKeysSchema.test(unknownKey)) {
      return false
    }
  }

  return true
}
