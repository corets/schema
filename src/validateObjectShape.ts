import { ObjectShape } from "./schemas/ObjectSchema"
import { ValidationError } from "./types"
import { get, keys } from "lodash-es"
import { joinPath } from "./helpers"

export const validateObjectShape = (
  value: any,
  objectShape: ObjectShape<any> | undefined
): ValidationError[] => {
  if (!objectShape) return []

  const errors: ValidationError[] = []

  keys(objectShape).map(async (key) => {
    const shapeValue = objectShape[key]
    const keyValue = get(value, key)
    const newErrors = await shapeValue.validate(keyValue)

    if (newErrors) {
      newErrors.forEach((error) => {
        error.path = joinPath(key, error.path)
        errors.push(error)
      })
    }
  })

  return errors
}
