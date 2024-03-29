import includes from "lodash/includes"
import isInteger from "lodash/isInteger"
import isNumber from "lodash/isNumber"
import round from "lodash/round"
import floor from "lodash/floor"
import ceil from "lodash/ceil"
import { isDefined } from "./mixed"
import { LazyValue, ValidationFunctionResult } from "../types"
import { lazyValue } from "../lazyValue"

const isDefinedNumber = (value: any) => isDefined(value) && isNumber(value)

export const numberRequired = (
  value: any,
  required?: LazyValue<boolean>
): ValidationFunctionResult => {
  if (lazyValue(required) === false) return

  return isDefined(value) && isNumber(value)
}

export const numberType = (value: any): ValidationFunctionResult => {
  if (!isDefined(value)) return

  return isNumber(value)
}

export const numberEquals = (
  value: any,
  equal: LazyValue<number>
): ValidationFunctionResult => {
  if (!isDefinedNumber(value)) return

  return value === lazyValue(equal)
}

export const numberMin = (
  value: any,
  minValue: LazyValue<number>
): ValidationFunctionResult => {
  if (!isDefinedNumber(value)) return

  return value >= lazyValue(minValue)
}

export const numberMax = (
  value: any,
  maxValue: LazyValue<number>
): ValidationFunctionResult => {
  if (!isDefinedNumber(value)) return

  return value <= lazyValue(maxValue)
}

export const numberBetween = (
  value: any,
  minValue: LazyValue<number>,
  maxValue: LazyValue<number>
): ValidationFunctionResult => {
  if (!isDefinedNumber(value)) return

  return value >= lazyValue(minValue) && value <= lazyValue(maxValue)
}

export const numberPositive = (value: any): ValidationFunctionResult => {
  if (!isDefinedNumber(value)) return

  return value > 0 || value === 0
}

export const numberNegative = (value: any): ValidationFunctionResult => {
  if (!isDefinedNumber(value)) return

  return value < 0 || value === 0
}

export const numberInteger = (value: any): ValidationFunctionResult => {
  if (!isDefinedNumber(value)) return

  return isInteger(value)
}

export const numberOneOf = (
  value: any,
  whitelist: LazyValue<number[]>
): ValidationFunctionResult => {
  if (!isDefinedNumber(value)) return

  return includes(lazyValue(whitelist), value)
}

export const numberNoneOf = (
  value: any,
  blacklist: LazyValue<number[]>
): ValidationFunctionResult => {
  if (!isDefinedNumber(value)) return

  return !includes(lazyValue(blacklist), value)
}

////////////////////////////////////////////////////////////////////////////////

export const numberToDefault = (
  value: any,
  defaultValue: LazyValue<number>
): number => {
  return !isNumber(value) ? lazyValue(defaultValue) : value
}

export const numberToRounded = (value: any, precision: LazyValue<number>) => {
  return isNumber(value) ? round(value, lazyValue(precision)) : value
}

export const numberToFloored = (value: any, precision: LazyValue<number>) => {
  return isNumber(value) ? floor(value, lazyValue(precision)) : value
}

export const numberToCeiled = (value: any, precision: LazyValue<number>) => {
  return isNumber(value) ? ceil(value, lazyValue(precision)) : value
}

export const numberToTrunced = (value: any) => {
  return isNumber(value) ? Math.trunc(value) : value
}
