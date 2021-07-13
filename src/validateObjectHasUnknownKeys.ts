import difference from "lodash/difference"
import keys from "lodash/keys"
import isObjectLike from "lodash/isObjectLike"
import { ObjectShape, ValidationError, ValidationOptions } from "./types"
import { createValidationError } from "./createValidationError"
import { translateMessage } from "./translateMessage"

export const validateObjectHasUnknownKeys = <TValue = any>(
  value: any,
  objectShape: ObjectShape<TValue> | undefined,
  allowUnknownKeysAndValues: boolean,
  options: ValidationOptions
): ValidationError[] => {
  if (allowUnknownKeysAndValues || !isObjectLike(value)) return []

  const unknownKeys = difference(keys(value), keys(objectShape))

  const errors: ValidationError[] = []

  unknownKeys.forEach((unknownKey) => {
    const error = createValidationError(
      "object_unknown_key",
      translateMessage(
        "object_unknown_key",
        [unknownKey],
        options.language,
        options.fallbackLanguage
      ),
      [],
      value
    )

    errors.push(error)
  })

  return errors
}
