import camelCase from "lodash/camelCase"
import capitalize from "lodash/capitalize"
import endsWith from "lodash/endsWith"
import includes from "lodash/includes"
import isEmpty from "lodash/isEmpty"
import isNumber from "lodash/isNumber"
import isString from "lodash/isString"
import kebabCase from "lodash/kebabCase"
import snakeCase from "lodash/snakeCase"
import startsWith from "lodash/startsWith"
import trim from "lodash/trim"
import { isDefined } from "./mixed"
import { LazyValue, ValidationFunctionResult } from "../types"
import { lazyValue } from "../lazyValue"
import dayjs from "dayjs"
import { isDate } from "./date"

const isDefinedNonEmptyString = (value: any) =>
  isDefined(value) && isString(value) && value.length > 0
const isNumeric = (value: any) =>
  isNumber(value) || (!isEmpty(value) && !isNaN(value))

export const stringRequired = (
  value: any,
  required?: LazyValue<boolean>
): ValidationFunctionResult => {
  if (lazyValue(required) === false) return

  return isDefinedNonEmptyString(value)
}

export const stringType = (value: any): ValidationFunctionResult => {
  if (!isDefined(value)) return

  return isString(value)
}

export const stringEquals = (
  value: any,
  equal: LazyValue<string>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return value === lazyValue(equal)
}

export const stringLength = (
  value: any,
  exactLength: LazyValue<number>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return value.length === lazyValue(exactLength)
}

export const stringMin = (
  value: any,
  minLength: LazyValue<number>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return value.length >= lazyValue(minLength)
}

export const stringMax = (
  value: any,
  maxLength: LazyValue<number>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return value.length <= lazyValue(maxLength)
}

export const stringBetween = (
  value: any,
  minLength: LazyValue<number>,
  maxLength: LazyValue<number>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return (
    value.length >= lazyValue(minLength) && value.length <= lazyValue(maxLength)
  )
}

export const stringMatches = (
  value: any,
  regex: LazyValue<RegExp>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return lazyValue(regex).test(value)
}

let emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i

export const stringEmail = (value: any): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return emailRegex.test(value)
}

let urlRegex = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i

export const stringUrl = (value: any): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return urlRegex.test(value)
}

export const stringStartsWith = (
  value: any,
  find: LazyValue<string>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return startsWith(value, lazyValue(find))
}

export const stringEndsWith = (
  value: any,
  find: LazyValue<string>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return endsWith(value, lazyValue(find))
}

export const stringIncludes = (
  value: any,
  find: LazyValue<string>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return includes(value, lazyValue(find))
}

export const stringOmits = (
  value: any,
  find: LazyValue<string>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return !includes(value, lazyValue(find))
}

export const stringOneOf = (
  value: any,
  whitelist: LazyValue<string[]>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return includes(lazyValue(whitelist), value)
}

export const stringNoneOf = (
  value: any,
  blacklist: LazyValue<string[]>
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return !includes(lazyValue(blacklist), value)
}

export const stringNumeric = (value: any): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return isNumeric(value)
}

const alphaRegex = /^[a-zA-Z]+$/

export const stringAlpha = (value: any): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return alphaRegex.test(value)
}

const alphaNumericRegex = /^[0-9a-zA-Z]+$/

export const stringAlphaNumeric = (value: any): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return alphaNumericRegex.test(value)
}

const alphaDashes = /^[a-zA-Z-]+$/

export const stringAlphaDashes = (value: any): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return alphaDashes.test(value)
}

const alphaUnderscores = /^[a-zA-Z_]+$/

export const stringAlphaUnderscores = (
  value: any
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return alphaUnderscores.test(value)
}

const alphaNumericDashes = /^[0-9a-zA-Z-]+$/

export const stringAlphaNumericDashes = (
  value: any
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return alphaNumericDashes.test(value)
}

const alphaNumericUnderscores = /^[0-9a-zA-Z_]+$/

export const stringAlphaNumericUnderscores = (
  value: any
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return alphaNumericUnderscores.test(value)
}

const dateRegex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$/

export const stringDate = (value: any): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return dateRegex.test(value)
}

const timeRegex = /^(2[0-3]|[01][0-9]):([0-5][0-9]):?([0-5][0-9])?(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$/

export const stringTime = (value: any): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return timeRegex.test(value)
}

const dateTimeRegex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$/

export const stringDateTime = (value: any): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return dateTimeRegex.test(value)
}

export const stringDateAfter = (
  value: any,
  after: LazyValue<Date>,
  allowEqual: boolean
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  if (!stringDateTime(value) && !stringDate(value)) {
    return false
  }

  const date = dayjs(value).toDate()

  return (
    dayjs(date).isAfter(lazyValue(after)) ||
    (allowEqual && dayjs(date).isSame(lazyValue(after), "second"))
  )
}

export const stringDateBefore = (
  value: any,
  before: LazyValue<Date>,
  allowEqual: boolean
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  if (!stringDateTime(value) && !stringDate(value)) {
    return false
  }

  const date = dayjs(value).toDate()

  return (
    dayjs(date).isBefore(lazyValue(before)) ||
    (allowEqual && dayjs(date).isSame(lazyValue(before), "second"))
  )
}

export const stringDateBetween = (
  value: any,
  after: LazyValue<Date>,
  before: LazyValue<Date>,
  allowEqual: boolean
): ValidationFunctionResult => {
  return (
    stringDateAfter(value, after, allowEqual) &&
    stringDateBefore(value, before, allowEqual)
  )
}

export const stringTimeAfter = (
  value: any,
  after: LazyValue<string>,
  allowEqual: boolean
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  if (!stringDateTime(value) && !stringTime(value)) {
    return false
  }

  const date = stringDateTime(value)
    ? dayjs(value).toDate()
    : dayjs(`${dayjs().format("YYYY-MM-DD")}T${value}`).toDate()
  const dateAfter = dayjs(
    `${dayjs(date).format("YYYY-MM-DD")}T${lazyValue(after)}`
  ).toDate()

  return (
    isDate(date) &&
    isDate(dateAfter) &&
    (dayjs(date).isAfter(dateAfter) ||
      (allowEqual && dayjs(date).isSame(lazyValue(dateAfter), "second")))
  )
}

export const stringTimeBefore = (
  value: any,
  before: LazyValue<string>,
  allowEqual: boolean
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  if (!stringDateTime(value) && !stringTime(value)) {
    return false
  }

  const date = stringDateTime(value)
    ? dayjs(value).toDate()
    : dayjs(`${dayjs().format("YYYY-MM-DD")}T${value}`).toDate()
  const dateBefore = dayjs(
    `${dayjs(date).format("YYYY-MM-DD")}T${lazyValue(before)}`
  ).toDate()

  return (
    isDate(date) &&
    isDate(dateBefore) &&
    (dayjs(date).isBefore(dateBefore) ||
      (allowEqual && dayjs(date).isSame(lazyValue(dateBefore), "second")))
  )
}

export const stringTimeBetween = (
  value: any,
  after: LazyValue<string>,
  before: LazyValue<string>,
  allowEqual: boolean
): ValidationFunctionResult => {
  if (!isDefinedNonEmptyString(value)) return

  return (
    stringTimeAfter(value, after, allowEqual) &&
    stringTimeBefore(value, before, allowEqual)
  )
}

////////////////////////////////////////////////////////////////////////////////

export const stringToDefault = (
  value: any,
  defaultValue: LazyValue<string>
): string => {
  return !isString(value) ? lazyValue(defaultValue) : value
}

export const stringToUpperCase = (value: any): string => {
  return isString(value) ? value.toUpperCase() : value
}

export const stringToLowerCase = (value: any): string => {
  return isString(value) ? value.toLowerCase() : value
}

export const stringToCapitalized = (value: any): string => {
  return isString(value) ? capitalize(value) : value
}

export const stringToCamelCase = (value: any): string => {
  return isString(value) ? camelCase(value) : value
}

export const stringToSnakeCase = (value: any): string => {
  return isString(value) ? snakeCase(value) : value
}

export const stringToKebabCase = (value: any): string => {
  return isString(value) ? kebabCase(value) : value
}

export const stringToConstantCase = (value: any): string => {
  return isString(value) ? snakeCase(value).toUpperCase() : value
}

export const stringToTrimmed = (value: any): string => {
  return isString(value) ? trim(value) : value
}
