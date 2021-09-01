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

    const s2 = schema(() => "foo").string()
    expect(s2 instanceof StringSchema).toBe(true)
    expect(s2.sanitize(undefined)).toBe("foo")

    const s3 = schema(9).number()
    expect(s3 instanceof NumberSchema).toBe(true)
    expect(s3.sanitize(undefined)).toBe(9)

    const s4 = schema(() => 9).number()
    expect(s4 instanceof NumberSchema).toBe(true)
    expect(s4.sanitize(undefined)).toBe(9)

    const s5 = schema(["foo"]).array()
    expect(s5 instanceof ArraySchema).toBe(true)
    expect(s5.sanitize(undefined)).toEqual(["foo"])

    const s6 = schema(() => ["foo"]).array()
    expect(s6 instanceof ArraySchema).toBe(true)
    expect(s6.sanitize(undefined)).toEqual(["foo"])

    const s7 = schema({ foo: "bar" }).object()
    expect(s7 instanceof ObjectSchema).toBe(true)
    expect(s7.sanitize(undefined)).toEqual({ foo: "bar" })

    const s8 = schema(() => ({ foo: "bar" })).object()
    expect(s8 instanceof ObjectSchema).toBe(true)
    expect(s8.sanitize(undefined)).toEqual({ foo: "bar" })

    const s9 = schema(true).boolean()
    expect(s9 instanceof BooleanSchema).toBe(true)
    expect(s9.sanitize(undefined)).toBe(true)

    const s10 = schema(() => true).boolean()
    expect(s10 instanceof BooleanSchema).toBe(true)
    expect(s10.sanitize(undefined)).toBe(true)

    const s11 = schema(new Date()).date()
    expect(s11 instanceof DateSchema).toBe(true)
    expect((s11.sanitize(undefined) as any) instanceof Date).toBe(true)

    const s12 = schema(() => new Date()).date()
    expect(s12 instanceof DateSchema).toBe(true)
    expect((s12.sanitize(undefined) as any) instanceof Date).toBe(true)

    const s13 = schema("foo").mixed()
    expect(s13 instanceof MixedSchema).toBe(true)
    expect(s13.sanitize(undefined)).toBe("foo")

    const s14 = schema(() => "foo").mixed()
    expect(s14 instanceof MixedSchema).toBe(true)
    expect(s14.sanitize(undefined)).toBe("foo")
  })
})
