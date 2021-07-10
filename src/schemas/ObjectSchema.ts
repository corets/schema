import { Schema } from "../Schema"
import {
  objectEquals,
  objectRequired,
  objectToCamelCaseKeys,
  objectToCamelCaseKeysDeep,
  objectToConstantCaseKeys,
  objectToConstantCaseKeysDeep,
  objectToDefault,
  objectToKebabCaseKeys,
  objectToKebabCaseKeysDeep,
  objectToMappedKeys,
  objectToMappedKeysDeep,
  objectToMappedValues,
  objectToSnakeCaseKeys,
  objectToSnakeCaseKeysDeep,
  objectTotMappedValuesDeep,
  objectType,
} from "../assertions/object"
import { StringSchema } from "./StringSchema"
import {
  CustomValidationMessage,
  LazyValue,
  ObjectShape,
  ValidationError,
  ValidationOptions,
} from "../types"
import { createValidationDefinition } from "../createValidationDefinition"
import { createSanitizerDefinition } from "../createSanitizerDefinition"
import { sanitizeObjectShapeAsync } from "../sanitizeObjectShapeAsync"
import { validateObjectHasUnknownKeys } from "../validateObjectHasUnknownKeys"
import { validateObjectUnknownKeysAsync } from "../validateObjectUnknownKeysAsync"
import { validateObjectUnknownValuesAsync } from "../validateObjectUnknownValuesAsync"
import { validateObjectShapeAsync } from "../validateObjectShapeAsync"
import { validateObjectIsMissingKeys } from "../validateObjectIsMissingKeys"
import { sanitizeObjectShape } from "../sanitizeObjectShape"
import { validateObjectUnknownKeys } from "../validateObjectUnknownKeys"
import { validateObjectUnknownValues } from "../validateObjectUnknownValues"
import { validateObjectShape } from "../validateObjectShape"
import { isDefined } from "../assertions/mixed"

export class ObjectSchema<TValue extends object> extends Schema<TValue> {
  protected cloneInstance(): this {
    const clone = new ObjectSchema()
    clone.validationDefinitions = [...this.validationDefinitions]
    clone.sanitizerDefinitions = [...this.sanitizerDefinitions]
    clone.conditionalValidationDefinitions = [
      ...this.conditionalValidationDefinitions,
    ]
    clone.objectShape = this.objectShape
    clone.unknownKeysSchema = this.unknownKeysSchema
    clone.unknownValuesSchema = this.unknownValuesSchema
    clone.allowUnknownKeysAndValues = this.allowUnknownKeysAndValues

    return clone as any
  }

  protected customValidationBehavior(
    value: any,
    errors: ValidationError[],
    options: ValidationOptions
  ): ValidationError[] {
    if (!this.runAllTests(value)) {
      return errors
    }

    const hasUnknownKeysErrors = validateObjectHasUnknownKeys(
      value,
      this.objectShape,
      this.allowUnknownKeysAndValues,
      options
    )
    const validateShapeErrors = validateObjectShape(
      value,
      this.objectShape,
      options
    )
    const shapeErrorPaths = validateShapeErrors.map((error) => error.path)
    const isMissingKeysErrors = validateObjectIsMissingKeys(
      value,
      this.objectShape,
      options,
      shapeErrorPaths
    )
    const unknownKeysErrors = validateObjectUnknownKeys(
      value,
      this.objectShape,
      this.unknownKeysSchema,
      options
    )
    const unknownValueErrors = validateObjectUnknownValues(
      value,
      this.objectShape,
      this.unknownValuesSchema,
      options
    )

    return [
      ...errors,
      ...hasUnknownKeysErrors,
      ...isMissingKeysErrors,
      ...unknownKeysErrors,
      ...unknownValueErrors,
      ...validateShapeErrors,
    ]
  }

  protected async customValidationBehaviorAsync(
    value: any,
    errors: ValidationError[],
    options: ValidationOptions
  ): Promise<ValidationError[]> {
    if (!this.runAllTests(value)) {
      return errors
    }

    const hasUnknownKeysErrors = validateObjectHasUnknownKeys(
      value,
      this.objectShape,
      this.allowUnknownKeysAndValues,
      options
    )
    const validateShapeErrors = await validateObjectShapeAsync(
      value,
      this.objectShape,
      options
    )
    const shapeErrorPaths = validateShapeErrors.map((error) => error.path)
    const isMissingKeysErrors = validateObjectIsMissingKeys(
      value,
      this.objectShape,
      options,
      shapeErrorPaths
    )
    const unknownKeysErrors = await validateObjectUnknownKeysAsync(
      value,
      this.objectShape,
      this.unknownKeysSchema,
      options
    )
    const unknownValueErrors = await validateObjectUnknownValuesAsync(
      value,
      this.objectShape,
      this.unknownValuesSchema,
      options
    )

    return [
      ...errors,
      ...hasUnknownKeysErrors,
      ...isMissingKeysErrors,
      ...unknownKeysErrors,
      ...unknownValueErrors,
      ...validateShapeErrors,
    ]
  }

  protected customSanitizeBehavior<TValue, TSanitizedValue = TValue>(
    value: TValue
  ): TSanitizedValue {
    return sanitizeObjectShape(value, this.objectShape)
  }

  protected async customSanitizeBehaviorAsync<TValue, TSanitizedValue = TValue>(
    value: TValue
  ): Promise<TSanitizedValue> {
    return sanitizeObjectShapeAsync(value, this.objectShape)
  }

  private runAllTests(value: any): boolean {
    return this.hasValidationDefinition("object_required") || isDefined(value)
  }

  protected objectShape?: ObjectShape<TValue>
  protected unknownKeysSchema?: StringSchema
  protected unknownValuesSchema?: StringSchema
  protected allowUnknownKeysAndValues: boolean = false

  constructor(objectShape?: ObjectShape<TValue>) {
    super()

    this.skipClone(() => {
      this.required().shape(objectShape).disallowUnknownKeys()
    })
  }

  required(
    required?: LazyValue<boolean>,
    message?: CustomValidationMessage
  ): this {
    return this.addValidationDefinition(
      createValidationDefinition("object_type", objectType, [], message)
    ).addValidationDefinition(
      createValidationDefinition(
        "object_required",
        objectRequired,
        [required],
        message
      )
    )
  }

  optional(message?: CustomValidationMessage): this {
    return this.removeValidationDefinitionsOfType(
      "object_required"
    ).addValidationDefinition(
      createValidationDefinition("object_type", objectType, [], message)
    )
  }

  equals(equal: LazyValue<object>, message?: CustomValidationMessage): this {
    return this.allowUnknownKeys().addValidationDefinition(
      createValidationDefinition(
        "object_equals",
        objectEquals,
        [equal],
        message
      )
    )
  }

  shape(objectShape?: ObjectShape<TValue>): this {
    const clone = this.clone()
    clone.objectShape = objectShape

    return clone
  }

  allowUnknownKeys(): this {
    const clone = this.clone()
    clone.allowUnknownKeysAndValues = true

    return clone
  }

  disallowUnknownKeys(): this {
    const clone = this.clone()
    clone.allowUnknownKeysAndValues = false

    return clone
  }

  shapeUnknownKeys(unknownKeysSchema: StringSchema): this {
    const clone = this.clone()
    clone.unknownKeysSchema = unknownKeysSchema

    return clone.allowUnknownKeys()
  }

  shapeUnknownValues(unknownValuesSchema: StringSchema): this {
    const clone = this.clone()
    clone.unknownValuesSchema = unknownValuesSchema

    return clone.allowUnknownKeys()
  }

  toDefault(defaultValue: LazyValue<object> = {}): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToDefault, [defaultValue])
    )
  }

  toCamelCaseKeys(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToCamelCaseKeys)
    )
  }

  toCamelCaseKeysDeep(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToCamelCaseKeysDeep)
    )
  }

  toSnakeCaseKeys(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToSnakeCaseKeys)
    )
  }

  toSnakeCaseKeysDeep(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToSnakeCaseKeysDeep)
    )
  }

  toKebabCaseKeys(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToKebabCaseKeys)
    )
  }

  toKebabCaseKeysDeep(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToKebabCaseKeysDeep)
    )
  }

  toConstantCaseKeys(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToConstantCaseKeys)
    )
  }

  toConstantCaseKeysDeep(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToConstantCaseKeysDeep)
    )
  }

  toMappedValues(mapper: (value: any, key: string) => any): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToMappedValues, [mapper])
    )
  }

  toMappedValuesDeep(mapper: (value: any, key: string | number) => any): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectTotMappedValuesDeep, [mapper])
    )
  }

  toMappedKeys(mapper: (value: any, key: string) => any): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToMappedKeys, [mapper])
    )
  }

  toMappedKeysDeep(mapper: (value: any, key: string) => any): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(objectToMappedKeysDeep, [mapper])
    )
  }
}
