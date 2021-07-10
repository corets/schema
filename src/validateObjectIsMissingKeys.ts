import { difference, keys } from "lodash"
import {
  ObjectShape,
  ValidationError,
  ValidationOptions,
  ValidationPath,
} from "./types"
import { createValidationError } from "./createValidationError"
import { translateMessage } from "./translateMessage"

export const validateObjectIsMissingKeys = <TValue = any>(
  value: any,
  objectShape: ObjectShape<TValue> | undefined,
  options: ValidationOptions,
  whitelistedErrorPaths: ValidationPath[]
): ValidationError[] => {
  const missingKeys = difference(keys(objectShape), keys(value))
  const isValidationError = (value: any): value is ValidationError =>
    value !== undefined

  const errors = missingKeys
    .map((missingKey) => {
      if (!whitelistedErrorPaths.includes(missingKey)) {
        return
      }

      const error = createValidationError(
        "object_missing_key",
        translateMessage(
          "object_missing_key",
          [missingKey],
          options.language,
          options.fallbackLanguage
        ),
        [],
        value
      )

      return error
    })
    .filter(isValidationError)

  return errors
}
