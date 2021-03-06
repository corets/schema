import { ObjectShape, ValidationError, ValidationOptions } from "./types"
import get from "lodash/get"
import keys from "lodash/keys"
import { joinPath } from "./helpers"

export const validateObjectShape = (
  value: any,
  objectShape: ObjectShape<any> | undefined,
  options: ValidationOptions
): ValidationError[] => {
  if (!objectShape) return []

  const errors: ValidationError[] = []

  keys(objectShape).map((key) => {
    const shapeValue = objectShape[key]
    const keyValue = get(value, key)
    const newErrors = shapeValue.verify(keyValue, options)

    if (newErrors) {
      newErrors.forEach((error) => {
        error.path = joinPath(key, error.path)
        errors.push(error)
      })
    }
  })

  return errors
}
