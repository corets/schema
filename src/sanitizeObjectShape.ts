import { isObjectLike, keys } from "lodash-es"
import { ObjectShape } from "./types"

export const sanitizeObjectShape = <TValue, TSanitizedValue = TValue>(
  value: TValue,
  objectShape: ObjectShape<any> | undefined
): TSanitizedValue => {
  if (!objectShape || !isObjectLike(value)) return value as any

  keys(objectShape).map((shapeKey) => {
    const shapeValue = value[shapeKey]
    const shapeSchema = objectShape[shapeKey]
    const sanitizedValue = shapeSchema.sanitize(shapeValue)

    value[shapeKey] = sanitizedValue
  })

  return value as any
}
