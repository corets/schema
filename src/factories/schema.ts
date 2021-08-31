import { LazyValue, ValidationSchema } from "../types"
import {
  array,
  boolean,
  date,
  mixed,
  number,
  ObjectShape,
  string,
  object,
} from ".."

export const schema = (defaultValue?: LazyValue<any>): SchemaFactory => {
  return new SchemaFactory(defaultValue)
}

class SchemaFactory {
  private readonly defaultValue?: LazyValue<any>

  constructor(defaultValue?: LazyValue<any>) {
    this.defaultValue = defaultValue
  }

  string() {
    return string().toDefault(this.defaultValue)
  }

  number() {
    return number().toDefault(this.defaultValue)
  }

  boolean() {
    return boolean().toDefault(this.defaultValue)
  }

  date() {
    return date().toDefault(this.defaultValue)
  }
  array(arrayShape?: ValidationSchema) {
    return array(arrayShape).toDefault(this.defaultValue)
  }

  object<TValue extends object = any>(objectShape?: ObjectShape<TValue>) {
    return object<TValue>(objectShape).toDefault(this.defaultValue)
  }

  mixed() {
    return mixed().toDefault(this.defaultValue)
  }
}
