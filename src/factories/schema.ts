import { ValidationSchema } from "../types"
import {
  ArraySchema,
  BooleanSchema,
  DateSchema,
  MixedSchema,
  NumberSchema,
  ObjectSchema,
  ObjectShape,
  StringSchema,
} from ".."

export const schema = (defaultValue?: any): SchemaFactory => {
  return new SchemaFactory(defaultValue)
}

class SchemaFactory {
  private readonly defaultValue?: any

  constructor(defaultValue?: any) {
    this.defaultValue = defaultValue
  }

  string() {
    return new StringSchema().toDefault(this.defaultValue)
  }

  number() {
    return new NumberSchema().toDefault(this.defaultValue)
  }

  boolean() {
    return new BooleanSchema().toDefault(this.defaultValue)
  }

  date() {
    return new DateSchema().toDefault(this.defaultValue)
  }
  array(arrayShape?: ValidationSchema) {
    return new ArraySchema(arrayShape).toDefault(this.defaultValue)
  }

  object<TValue extends object = any>(objectShape?: ObjectShape<TValue>) {
    return new ObjectSchema<TValue>(objectShape).toDefault(this.defaultValue)
  }

  mixed() {
    return new MixedSchema().toDefault(this.defaultValue)
  }
}
