import en from "./locales/en.json"

export interface ValidationSchema<TValue = any> {
  or(orSchema: CustomValidation): this
  and(andSchema: CustomValidation): this
  also(validator: CustomValidation): this
  map(sanitizer: SanitizerFunction): this

  test(value: any): boolean

  testAsync(value: any): Promise<boolean>

  validate(
    value: any,
    options?: Partial<ValidationOptions>
  ): ValidationResult | undefined

  validateAsync(
    value: any,
    options?: ValidationOptions
  ): Promise<ValidationResult | undefined>

  verifyAsync(
    value: any,
    options?: ValidationOptions
  ): Promise<ValidationError[] | undefined>

  verify(
    value: any,
    options?: Partial<ValidationOptions>
  ): ValidationError[] | undefined

  sanitize<TValue, TSanitizedValue = TValue>(value: TValue): TSanitizedValue

  sanitizeAsync<TValue, TSanitizedValue = TValue>(
    value: TValue
  ): Promise<TSanitizedValue>

  sanitizeAndTest<TValue, TSanitizedValue = TValue>(
    value: any
  ): [boolean, TValue]

  sanitizeAndValidate<TValue, TSanitizedValue = TValue>(
    value: any,
    options?: ValidationOptions
  ): [ValidationResult | undefined, TValue]

  sanitizeAndVerify<TValue, TSanitizedValue = TValue>(
    value: any,
    options?: ValidationOptions
  ): [ValidationError[] | undefined, TValue]

  sanitizeAndTestAsync<TValue, TSanitizedValue = TValue>(
    value: any
  ): Promise<[boolean, TValue]>

  sanitizeAndValidateAsync<TValue, TSanitizedValue = TValue>(
    value: any,
    options?: ValidationOptions
  ): Promise<[ValidationResult | undefined, TValue]>

  sanitizeAndVerifyAsync<TValue, TSanitizedValue = TValue>(
    value: any,
    options?: ValidationOptions
  ): Promise<[ValidationError[] | undefined, TValue]>
}

export type ValidationOptions = {
  language?: string
  fallbackLanguage?: string
}

export type LazyValue<TValue> = TValue | (() => TValue) | undefined

export type MaybePromise<TValue> = TValue | Promise<TValue>

export type ValidationResult = { [key: string]: string[] }

export type ValidationFunctionResult =
  | void
  | undefined
  | string
  | string[]
  | boolean
  | null
  | ValidationSchema
  | ValidationError[]

export interface ValidationError {
  __type: "ValidationError"
  type: ValidationType
  message: string
  args: any[]
  value: any
  link: ValidationLink
  path: ValidationPath
}

export type ValidationBlock = ValidationSchema | ValidationFunction

export type ValidationFunction = (
  value: any,
  ...args: any[]
) => MaybePromise<ValidationFunctionResult>

export type ValidationType = keyof typeof en | "custom" | "and" | "or"

export type ValidationLink = "and" | "or" | string | undefined

export type ValidationPath = string | undefined

export type ValidationDefinition = {
  type: ValidationType
  validator: ValidationBlock
  args: any[]
  customMessage?: CustomValidationMessage
}

export type CustomValidationMessage = LazyValue<string>

export type CustomValidation =
  | ValidationSchema
  | ((value: any) => MaybePromise<ValidationFunctionResult>)

export type SanitizerFunction = (
  value: any,
  ...args: any[]
) => MaybePromise<any>

export type SanitizerDefinition = {
  sanitizer: SanitizerFunction
  args: any[]
}

export type ObjectShape<TValue> = {
  [key in keyof TValue]: ValidationSchema
}
