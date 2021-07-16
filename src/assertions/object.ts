import camelCase from "lodash/camelCase"
import isObjectLike from "lodash/isObjectLike"
import kebabCase from "lodash/kebabCase"
import mapKeys from "lodash/mapKeys"
import mapValues from "lodash/mapValues"
import snakeCase from "lodash/snakeCase"
import isEqual from "fast-deep-equal"
import { isDefined } from "./mixed"
import { mapKeysDeep, mapValuesDeep } from "../helpers"
import { LazyValue, ValidationFunctionResult } from "../types"
import { lazyValue } from "../lazyValue"

const isDefinedObject = (value: any) => isDefined(value) && isObjectLike(value)

export const objectRequired = (
  value: any,
  required?: LazyValue<boolean>
): ValidationFunctionResult => {
  if (lazyValue(required) === false) return

  return isDefinedObject(value)
}

export const objectType = (value: any): ValidationFunctionResult => {
  if (!isDefined(value)) return

  return isObjectLike(value)
}

export const objectEquals = (
  value: any,
  equal: LazyValue<object>
): ValidationFunctionResult => {
  if (!isDefinedObject(value)) return

  return isEqual(value, lazyValue(equal))
}

////////////////////////////////////////////////////////////////////////////////

export const objectToDefault = (
  value: any,
  defaultValue: LazyValue<object>
): object => {
  return !isObjectLike(value) ? lazyValue(defaultValue) : value
}

export const objectToCamelCaseKeys = (value: any, deep: LazyValue<boolean>) => {
  return !isObjectLike(value)
    ? value
    : lazyValue(deep)
    ? mapKeysDeep(value, (value, key) => camelCase(key))
    : mapKeys(value, (value, key) => camelCase(key))
}

export const objectToKebabCaseKeys = (value: any, deep: LazyValue<boolean>) => {
  return !isObjectLike(value)
    ? value
    : lazyValue(deep)
    ? mapKeysDeep(value, (value, key) => kebabCase(key))
    : mapKeys(value, (value, key) => kebabCase(key))
}

export const objectToSnakeCaseKeys = (value: any, deep: LazyValue<boolean>) => {
  return !isObjectLike(value)
    ? value
    : lazyValue(deep)
    ? mapKeysDeep(value, (value, key) => snakeCase(key))
    : mapKeys(value, (value, key) => snakeCase(key))
}

export const objectToConstantCaseKeys = (
  value: any,
  deep: LazyValue<boolean>
) => {
  return !isObjectLike(value)
    ? value
    : lazyValue(deep)
    ? mapKeysDeep(value, (value, key) => snakeCase(key).toUpperCase())
    : mapKeys(value, (value, key) => snakeCase(key).toUpperCase())
}

export const objectToMappedValues = (
  value: any,
  mapper: (value: any, key: string | number) => any,
  deep: LazyValue<boolean>
) => {
  return !isObjectLike(value)
    ? value
    : lazyValue(deep)
    ? mapValuesDeep(value, mapper)
    : mapValues(value, mapper)
}

export const objectToMappedKeys = (
  value: any,
  mapper: (value: any, key: string) => any,
  deep: LazyValue<boolean>
) => {
  return !isObjectLike(value)
    ? value
    : lazyValue(deep)
    ? mapKeysDeep(value, mapper)
    : mapKeys(value, mapper)
}
