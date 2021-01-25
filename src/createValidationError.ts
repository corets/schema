import {
  ValidationError,
  ValidationLink,
  ValidationPath,
  ValidationType,
} from "./types"

export const createValidationError = (
  type: ValidationType,
  message: string,
  args: any[],
  value: any,
  link?: ValidationLink,
  path?: ValidationPath
): ValidationError => {
  return { __type: "ValidationError", type, message, args, value, link, path }
}
