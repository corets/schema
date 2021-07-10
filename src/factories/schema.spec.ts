import { schema } from "./schema"
import {
  ArraySchema,
  BooleanSchema,
  DateSchema,
  MixedSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from ".."

describe("schema", () => {
  it("creates various schemas", () => {
    const s1 = schema("foo").string()
    expect(s1 instanceof StringSchema).toBe(true)
    expect(s1.sanitize(undefined)).toBe("foo")

    const s2 = schema(9).number()
    expect(s2 instanceof NumberSchema).toBe(true)
    expect(s2.sanitize(undefined)).toBe(9)

    const s3 = schema(["foo"]).array()
    expect(s3 instanceof ArraySchema).toBe(true)
    expect(s3.sanitize(undefined)).toEqual(["foo"])

    const s4 = schema({ foo: "bar" }).object()
    expect(s4 instanceof ObjectSchema).toBe(true)
    expect(s4.sanitize(undefined)).toEqual({ foo: "bar" })

    const s5 = schema(true).boolean()
    expect(s5 instanceof BooleanSchema).toBe(true)
    expect(s5.sanitize(undefined)).toBe(true)

    const s6 = schema(new Date()).date()
    expect(s6 instanceof DateSchema).toBe(true)
    expect((s6.sanitize(undefined) as any) instanceof Date).toBe(true)

    const s7 = schema("foo").mixed()
    expect(s7 instanceof MixedSchema).toBe(true)
    expect(s7.sanitize(undefined)).toBe("foo")
  })
})
