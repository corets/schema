import { difference, keys } from "lodash-es"
import { ObjectShape } from "./types"

export const testObjectIsMissingKeys = <TValue = any>(
  value: any,
  objectShape: ObjectShape<TValue> | undefined
): boolean => {
  if (!objectShape) return true

  const missingKeys = difference(keys(objectShape), keys(value))

  return missingKeys.length === 0
}
