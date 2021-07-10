import {
  SanitizerDefinition,
  SanitizerFunction,
  ValidationDefinition,
  ValidationError,
  ValidationSchema,
  ValidationType,
  CustomValidation,
  ValidationOptions,
  ValidationResult,
} from "./types"
import { createValidationDefinition } from "./createValidationDefinition"
import { createSanitizerDefinition } from "./createSanitizerDefinition"
import { sanitizeValue } from "./sanitizeValue"
import { validateValueAsync } from "./validateValueAsync"
import { validateAndOrSchemasAsync } from "./validateAndOrSchemasAsync"
import { dedupeValidationErrors } from "./dedupeValidationErrors"
import { sanitizeValueAsync } from "./sanitizeValueAsync"
import { validateValue } from "./validateValue"
import { validateAndOrSchemas } from "./validateAndOrSchemas"
import { createValidationResult } from "./createValidationResult"

export abstract class Schema<TValue> implements ValidationSchema<TValue> {
  protected abstract cloneInstance(): this

  protected immutableMode: boolean = true
  protected sanitizerDefinitions: SanitizerDefinition[] = []
  protected validationDefinitions: ValidationDefinition[] = []
  protected conditionalValidationDefinitions: ValidationDefinition[] = []

  or(orValidator: CustomValidation): this {
    return this.addConditionalValidationDefinition(
      createValidationDefinition("or", orValidator, [], "")
    )
  }

  and(andValidator: CustomValidation): this {
    return this.addConditionalValidationDefinition(
      createValidationDefinition("and", andValidator, [], "")
    )
  }

  also(validator: CustomValidation): this {
    return this.addValidationDefinition(
      createValidationDefinition("custom", validator, [], "")
    )
  }

  map(sanitizer: SanitizerFunction): this {
    return this.addSanitizerDefinition(createSanitizerDefinition(sanitizer))
  }

  test(value: any): boolean {
    return !this.validate(value)
  }

  async testAsync(value: any): Promise<boolean> {
    return !(await this.validateAsync(value))
  }

  validate(
    value: any,
    options?: ValidationOptions
  ): ValidationResult | undefined {
    return createValidationResult(this.verify(value, options))
  }

  async validateAsync(
    value: any,
    options?: ValidationOptions
  ): Promise<ValidationResult | undefined> {
    return createValidationResult(await this.verifyAsync(value, options))
  }

  verify(
    value: any,
    options?: ValidationOptions
  ): ValidationError[] | undefined {
    const validationOptions: ValidationOptions = {
      language: options?.language,
      fallbackLanguage: options?.fallbackLanguage,
    }

    const errors = validateValue(
      value,
      this.validationDefinitions,
      validationOptions
    )
    const customErrors = this.customValidationBehavior(
      value,
      errors,
      validationOptions
    )
    const errorsWithAndOr = validateAndOrSchemas(
      value,
      customErrors,
      this.conditionalValidationDefinitions,
      validationOptions
    )
    const dedupedErrors = dedupeValidationErrors(errorsWithAndOr)

    return !dedupedErrors || dedupedErrors.length === 0
      ? undefined
      : dedupedErrors
  }

  async verifyAsync(
    value: any,
    options?: ValidationOptions
  ): Promise<ValidationError[] | undefined> {
    const validationOptions: ValidationOptions = {
      language: options?.language,
      fallbackLanguage: options?.fallbackLanguage,
    }

    const errors = await validateValueAsync(
      value,
      this.validationDefinitions,
      validationOptions
    )
    const customErrors = await this.customValidationBehaviorAsync(
      value,
      errors,
      validationOptions
    )
    const errorsWithAndOr = await validateAndOrSchemasAsync(
      value,
      customErrors,
      this.conditionalValidationDefinitions,
      validationOptions
    )
    const dedupedErrors = dedupeValidationErrors(errorsWithAndOr)

    return !dedupedErrors || dedupedErrors.length === 0
      ? undefined
      : dedupedErrors
  }

  sanitize<TValue, TSanitizedValue = TValue>(value: TValue): TSanitizedValue {
    const sanitizedValue = sanitizeValue<TValue, TSanitizedValue>(
      value,
      this.sanitizerDefinitions
    )
    const customSanitizedValue = this.customSanitizeBehavior<
      TValue,
      TSanitizedValue
    >(sanitizedValue as any)

    return customSanitizedValue
  }

  async sanitizeAsync<TValue, TSanitizedValue = TValue>(
    value: TValue
  ): Promise<TSanitizedValue> {
    const sanitizedValue = await sanitizeValueAsync<TValue, TSanitizedValue>(
      value,
      this.sanitizerDefinitions
    )
    const customSanitizedValue = await this.customSanitizeBehaviorAsync<
      TValue,
      TSanitizedValue
    >(sanitizedValue as any)

    return customSanitizedValue
  }

  sanitizeAndTest<TValue, TSanitizedValue = TValue>(
    value: any
  ): [boolean, TSanitizedValue] {
    const sanitizedValue = this.sanitize<TValue, TSanitizedValue>(value)
    const testResult = this.test(sanitizedValue)

    return [testResult, sanitizedValue]
  }

  async sanitizeAndTestAsync<TValue, TSanitizedValue = TValue>(
    value: any
  ): Promise<[boolean, TSanitizedValue]> {
    const sanitizedValue = await this.sanitizeAsync<TValue, TSanitizedValue>(
      value
    )
    const testResult = await this.testAsync(sanitizedValue)

    return [testResult, sanitizedValue]
  }

  sanitizeAndValidate<TValue, TSanitizedValue = TValue>(
    value: any,
    options?: ValidationOptions
  ): [ValidationResult | undefined, TSanitizedValue] {
    const sanitizedValue = this.sanitize<TValue, TSanitizedValue>(value)
    const validationResult = this.validate(sanitizedValue, options)

    return [validationResult, sanitizedValue]
  }

  async sanitizeAndValidateAsync<TValue, TSanitizedValue = TValue>(
    value: any,
    options?: ValidationOptions
  ): Promise<[ValidationResult | undefined, TSanitizedValue]> {
    const sanitizedValue = await this.sanitizeAsync<TValue, TSanitizedValue>(
      value
    )
    const validationResult = await this.validateAsync(sanitizedValue, options)

    return [validationResult, sanitizedValue]
  }

  sanitizeAndVerify<TValue, TSanitizedValue = TValue>(
    value: any,
    options?: ValidationOptions
  ): [ValidationError[] | undefined, TSanitizedValue] {
    const sanitizedValue = this.sanitize<TValue, TSanitizedValue>(value)
    const errors = this.verify(sanitizedValue, options)

    return [errors, sanitizedValue]
  }

  async sanitizeAndVerifyAsync<TValue, TSanitizedValue = TValue>(
    value: any,
    options?: ValidationOptions
  ): Promise<[ValidationError[] | undefined, TSanitizedValue]> {
    const sanitizedValue = await this.sanitizeAsync<TValue, TSanitizedValue>(
      value
    )
    const errors = await this.verifyAsync(sanitizedValue, options)

    return [errors, sanitizedValue]
  }

  protected customValidationBehavior(
    value: any,
    errors: ValidationError[],
    options: ValidationOptions
  ): ValidationError[] {
    return errors
  }

  protected async customValidationBehaviorAsync(
    value: any,
    errors: ValidationError[],
    options: ValidationOptions
  ): Promise<ValidationError[]> {
    return errors
  }

  protected customSanitizeBehavior<TValue, TSanitizedValue = TValue>(
    value: TValue
  ): TSanitizedValue {
    return value as any
  }

  protected async customSanitizeBehaviorAsync<TValue, TSanitizedValue = TValue>(
    value: TValue
  ): Promise<TSanitizedValue> {
    return value as any
  }

  protected addValidationDefinition(
    validationDefinition: ValidationDefinition
  ): this {
    let clone = this.clone()

    // do not remove custom validations, they all share the same key
    if (validationDefinition.type !== "custom") {
      clone = this.removeValidationDefinitionsOfType(validationDefinition.type)
    }

    clone.validationDefinitions.push(validationDefinition)

    return clone
  }

  protected hasValidationDefinition(type: ValidationType): boolean {
    return !!this.validationDefinitions.find(
      (validationDefinition) => validationDefinition.type === type
    )
  }

  protected addConditionalValidationDefinition(
    validationDefinition: ValidationDefinition
  ): this {
    let clone = this.clone()
    clone.conditionalValidationDefinitions.push(validationDefinition)

    return clone
  }

  protected addSanitizerDefinition(
    sanitizerDefinition: SanitizerDefinition
  ): this {
    const clone = this.clone()
    clone.sanitizerDefinitions.push(sanitizerDefinition)

    return clone
  }

  protected removeValidationDefinitionsOfType(type: ValidationType): this {
    const clone = this.clone()
    clone.validationDefinitions = this.validationDefinitions.filter(
      (definition) => definition.type !== type
    )

    return clone
  }

  protected clone(): this {
    if (this.immutableMode) {
      return this.cloneInstance()
    }

    return this
  }

  protected skipClone(fn: () => void): void {
    this.immutableMode = false
    fn()
    this.immutableMode = true
  }
}
