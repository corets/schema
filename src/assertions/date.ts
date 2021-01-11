import { isDefined } from "./mixed"
import { LazyValue, ValidationFunctionResult } from "../types"
import { lazyValue } from "../lazyValue"
import dayjs from "dayjs"

export const isDate = (value: any): boolean => value instanceof Date

const isDefinedDate = (value: any) => isDefined(value) && isDate(value)

export const dateRequired = (
  value: any,
  required?: LazyValue<boolean>
): ValidationFunctionResult => {
  if (lazyValue(required) === false) return

  return isDefined(value) && isDate(value)
}

export const dateType = (value: any): ValidationFunctionResult => {
  if (!isDefined(value)) return

  return isDate(value)
}

export const dateEquals = (
  value: any,
  equal: LazyValue<Date>
): ValidationFunctionResult => {
  if (!isDefinedDate(value)) return

  return dayjs(value).isSame(lazyValue(equal), "date")
}

export const dateAfter = (
  value: any,
  after: LazyValue<Date>
): ValidationFunctionResult => {
  if (!isDefinedDate(value)) return

  return dayjs(value).isAfter(lazyValue(after))
}

export const dateBefore = (
  value: any,
  before: LazyValue<Date>
): ValidationFunctionResult => {
  if (!isDefinedDate(value)) return

  return dayjs(value).isBefore(lazyValue(before))
}

export const dateBetween = (
  value: any,
  after: LazyValue<Date>,
  before: LazyValue<Date>
): ValidationFunctionResult => {
  if (!isDefinedDate(value)) return

  return (
    dayjs(value).isAfter(lazyValue(after)) &&
    dayjs(value).isBefore(lazyValue(before))
  )
}

////////////////////////////////////////////////////////////////////////////////

export const dateToDefault = (
  value: any,
  defaultValue: LazyValue<Date>
): boolean => {
  return !isDate(value) ? lazyValue(defaultValue) : value
}
