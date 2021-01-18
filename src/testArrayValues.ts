import { ValidationSchema } from "./types"
import { isArray } from "lodash-es"

export const testArrayValues = (
  values: any,
  valuesSchema: ValidationSchema | undefined
): boolean => {
  if (!valuesSchema || !isArray(values)) return true

  for (let value of values) {
    if (!valuesSchema.test(value)) {
      return false
    }
  }

  return true
}
