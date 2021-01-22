import {
  ValidationDefinition,
  ValidationError,
  ValidationFunction,
  ValidationFunctionResult,
  ValidationOptions,
} from "./types"
import { createValidationError } from "./createValidationError"
import { translateValidationDefinition } from "./translateValidationDefinition"
import { isValidationError } from "./isValidationError"
import { isArray, isString, isBoolean } from "lodash-es"
import { Schema } from "./Schema"

export const validateValue = (
  value: any,
  definitions: ValidationDefinition[],
  options: ValidationOptions
): ValidationError[] => {
  const errors: ValidationError[] = []

  for (let definition of definitions) {
    if (definition.validator instanceof Schema) {
      const newErrors = definition.validator.validateWithRawErrors(
        value,
        options
      )

      if (newErrors) {
        errors.push(...newErrors)
      }
    } else {
      let result = (definition.validator as ValidationFunction)(
        value,
        ...definition.args
      )

      if (result != undefined && result["then"] && result["catch"]) {
        throw new Error(
          "Trying to execute async validation logic in a sync call, use an async method instead"
        )
      }

      // we might get a schema from a validation function
      if (result instanceof Schema) {
        result = result.validateWithRawErrors(value, options)
      }

      // conditional definitions must always return some sort of an error,
      // boolean are useful for chaining and early exits from conditionals,
      // but can not represent an error
      if (
        ["and", "or", "custom"].includes(definition.type) &&
        isBoolean(result)
      ) {
        continue
      }

      if (isValidationError(result as ValidationFunctionResult)) {
        if (isArray(result)) {
          // check for an array of validation errors
          errors.push(...result)
        } else {
          const error = createValidationError(
            definition.type,
            isString(result)
              ? result
              : translateValidationDefinition(
                  definition,
                  options.language,
                  options.fallbackLanguage
                ),
            definition.args,
            value
          )

          errors.push(error)
        }
      }
    }
  }

  return errors
}
