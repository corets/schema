import { ObjectShape, ValidationError, ValidationOptions } from "./types"
import get from "lodash/get"
import keys from "lodash/keys"
import { joinPath } from "./helpers"

export const validateObjectShapeAsync = async (
  value: any,
  objectShape: ObjectShape<any> | undefined,
  options: ValidationOptions
): Promise<ValidationError[]> => {
  if (!objectShape) return []

  const errors: ValidationError[] = []

  await Promise.all(
    keys(objectShape).map(async (key) => {
      const shapeValue = objectShape[key]
      const keyValue = get(value, key)
      const newErrors = await shapeValue.verifyAsync(keyValue, options)

      if (newErrors) {
        newErrors.forEach((error) => {
          error.path = joinPath(key, error.path)
          errors.push(error)
        })
      }
    })
  )

  return errors
}
