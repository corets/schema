import { Schema } from "../Schema"
import {
  numberBetween,
  numberEquals,
  numberInteger,
  numberMax,
  numberMin,
  numberNegative,
  numberType,
  numberPositive,
  numberRequired,
  numberToCeiled,
  numberToDefault,
  numberToFloored,
  numberToRounded,
  numberToTrunced,
  numberOneOf,
  numberNoneOf,
} from "../assertions/number"
import { CustomValidationMessage, LazyValue } from "../types"
import { createValidationDefinition } from "../createValidationDefinition"
import { createSanitizerDefinition } from "../createSanitizerDefinition"

export class NumberSchema extends Schema<number> {
  constructor() {
    super()
    this.skipClone(() => this.required())
  }

  protected cloneInstance(): this {
    const clone = new NumberSchema()
    clone.validationDefinitions = [...this.validationDefinitions]
    clone.sanitizerDefinitions = [...this.sanitizerDefinitions]
    clone.conditionalValidationDefinitions = [
      ...this.conditionalValidationDefinitions,
    ]

    return clone as any
  }

  required(
    required?: LazyValue<boolean>,
    message?: CustomValidationMessage
  ): this {
    return this.addValidationDefinition(
      createValidationDefinition("number_type", numberType, [], message)
    ).addValidationDefinition(
      createValidationDefinition(
        "number_required",
        numberRequired,
        [required],
        message
      )
    )
  }

  optional(message?: CustomValidationMessage): this {
    return this.removeValidationDefinitionsOfType(
      "number_required"
    ).addValidationDefinition(
      createValidationDefinition("number_type", numberType, [], message)
    )
  }

  equals(equal: LazyValue<number>, message?: CustomValidationMessage): this {
    return this.addValidationDefinition(
      createValidationDefinition(
        "number_equals",
        numberEquals,
        [equal],
        message
      )
    )
  }

  min(minValue: LazyValue<number>, message?: CustomValidationMessage): this {
    return this.addValidationDefinition(
      createValidationDefinition("number_min", numberMin, [minValue], message)
    )
  }

  max(maxValue: LazyValue<number>, message?: CustomValidationMessage): this {
    return this.addValidationDefinition(
      createValidationDefinition("number_max", numberMax, [maxValue], message)
    )
  }

  between(
    minValue: LazyValue<number>,
    maxValue: LazyValue<number>,
    message?: CustomValidationMessage
  ): this {
    return this.addValidationDefinition(
      createValidationDefinition(
        "number_between",
        numberBetween,
        [minValue, maxValue],
        message
      )
    )
  }

  positive(message?: CustomValidationMessage): this {
    return this.addValidationDefinition(
      createValidationDefinition("number_positive", numberPositive, [], message)
    )
  }

  negative(message?: CustomValidationMessage): this {
    return this.addValidationDefinition(
      createValidationDefinition("number_negative", numberNegative, [], message)
    )
  }

  integer(message?: CustomValidationMessage): this {
    return this.addValidationDefinition(
      createValidationDefinition("number_integer", numberInteger, [], message)
    )
  }

  oneOf(
    whitelist: LazyValue<number[]>,
    message?: CustomValidationMessage
  ): this {
    return this.addValidationDefinition(
      createValidationDefinition(
        "number_one_of",
        numberOneOf,
        [whitelist],
        message
      )
    )
  }

  noneOf(
    blacklist: LazyValue<number[]>,
    message?: CustomValidationMessage
  ): this {
    return this.addValidationDefinition(
      createValidationDefinition(
        "number_none_of",
        numberNoneOf,
        [blacklist],
        message
      )
    )
  }

  toDefault(defaultValue: LazyValue<number> = 0): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(numberToDefault, [defaultValue])
    )
  }

  toRounded(precision: LazyValue<number> = 0): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(numberToRounded, [precision])
    )
  }

  toFloored(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(numberToFloored)
    )
  }

  toCeiled(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(numberToCeiled)
    )
  }

  toTrunced(): this {
    return this.addSanitizerDefinition(
      createSanitizerDefinition(numberToTrunced)
    )
  }
}
