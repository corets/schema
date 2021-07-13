import { ValidationFunctionResult } from "./types"
import isString from "lodash/isString"
import isArray from "lodash/isArray"

export const isValidationError = (error: ValidationFunctionResult): boolean => {
  if (error === false || isString(error) || isArray(error)) {
    return true
  }

  return false
}
