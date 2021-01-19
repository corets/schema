import { ObjectShape } from "./types"

export const testObjectShape = (
  value: any,
  objectShape: ObjectShape<any> | undefined
): boolean => {
  if (!objectShape) return true

  for (const key in objectShape) {
    const keyValue = value[key]
    const shapeDefinitions = objectShape[key]

    if (shapeDefinitions && !shapeDefinitions.test(keyValue)) {
      return false
    }
  }

  return true
}
