import { ValidationFunctionResult } from "./types"
import { isString, isArray } from "lodash-es"

export const isValidationError = (error: ValidationFunctionResult): boolean => {
  if (error === false || isString(error) || isArray(error)) {
    return true
  }

  return false
}
