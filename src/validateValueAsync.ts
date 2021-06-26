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
import { boolean } from "./factories/boolean"

export const validateValueAsync = async (
  value: any,
  definitions: ValidationDefinition[],
  options: ValidationOptions
): Promise<ValidationError[]> => {
  const errors: ValidationError[] = []

  for (let definition of definitions) {
    if (definition.validator instanceof Schema) {
      const schemaErrors =
        (await definition.validator.verifyAsync(value, options)) || []

      errors.push(...schemaErrors)

      continue
    }

    const functionResult = await (definition.validator as ValidationFunction)(
      value,
      ...definition.args
    )
    const results = Array.isArray(functionResult)
      ? functionResult
      : [functionResult]

    for (const result of results) {
      // we might get another schema from a validation function,
      // let's call it and merge the errors
      if (result instanceof Schema) {
        const schemaErrors = (await result.verifyAsync(value, options)) || []

        errors.push(...schemaErrors)

        continue
      }

      if (typeof result === "boolean") {
        // conditional definitions must always return some sort of an error,
        // booleans are useful for chaining and early exits from conditionals,
        // but can not represent an error
        if (["and", "or", "custom"].includes(definition.type)) {
          continue
        }

        // regular validation functions return booleans to indicate whether a value
        // is valid or not, we need to construct an error object based on the definition
        if (result === false) {
          errors.push(
            createValidationError(
              definition.type,
              translateValidationDefinition(
                definition,
                options.language,
                options.fallbackLanguage
              ),
              definition.args,
              value
            )
          )
        }

        continue
      }

      // simple string returned from a custom validation function
      if (typeof result === "string") {
        errors.push(
          createValidationError(definition.type, result, definition.args, value)
        )

        continue
      }

      // a validation error returned form a custom validation function
      // as the result of a validateWithRawErrors call
      if (result !== undefined && result !== null) {
        errors.push(result as ValidationError)
      }
    }
  }

  return errors
}
