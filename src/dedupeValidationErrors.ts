import { ValidationError } from "./types"
import { uniqBy } from "lodash-es"

export const dedupeValidationErrors = (
  errors: ValidationError[]
): ValidationError[] => {
  if (errors.length === 0) return []

  return uniqBy(errors, (error) => `${error.type}${error.path}${error.message}`)
}
