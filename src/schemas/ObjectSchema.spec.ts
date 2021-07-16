import { ObjectSchema } from "../index"
import isString from "lodash/isString"
import keys from "lodash/keys"
import { translateMessage } from "../translateMessage"
import { string } from "../factories/string"
import { array } from "../factories/array"
import { object } from "../factories/object"
import { schema } from "../factories/schema"

describe("ObjectSchema", () => {
  test("required", async () => {
    const s1 = object()
    const s2 = object().required()

    expect(await s1.testAsync(null)).toBe(false)
    expect(await s2.testAsync(null)).toBe(false)
    expect(await s1.testAsync(undefined)).toBe(false)
    expect(await s2.testAsync(undefined)).toBe(false)
    expect(await s1.testAsync(1)).toBe(false)
    expect(await s2.testAsync(1)).toBe(false)
    expect(await s1.testAsync({})).toBe(true)
    expect(await s2.testAsync({})).toBe(true)

    const errors1 = (await s1.verifyAsync(null))!

    expect(errors1.length).toBe(1)
    expect(errors1[0].message).toBe(translateMessage("object_required"))

    const errors2 = (await s1.verifyAsync("object"))!

    expect(errors2.length).toBe(2)
    expect(errors2[0].message).toBe(translateMessage("object_type"))
    expect(errors2[1].message).toBe(translateMessage("object_required"))

    expect(await s1.verifyAsync({})).toBe(undefined)

    expect(object().required(false).test(undefined)).toBe(true)
    expect(
      object()
        .required(() => false)
        .test(undefined)
    ).toBe(true)
    expect(
      object()
        .required(() => true)
        .test(undefined)
    ).toBe(false)
  })

  test("sync and async errors are identical", async () => {
    const s = object({
      foo: string(),
    })
      .shapeUnknownKeys(string().numeric())
      .shapeUnknownValues(string().numeric())

    const errors1 = s.verify(null, { language: "de" })!
    const errors2 = (await s.verifyAsync(null, {
      language: "de",
    }))!
    const errors3 = s.verify(
      {
        yolo: "swag",
      },
      {
        language: "xx",
        fallbackLanguage: "de",
      }
    )!
    const errors4 = (await s.verifyAsync(
      {
        yolo: "swag",
      },
      {
        language: "xx",
        fallbackLanguage: "de",
      }
    ))!

    expect(JSON.stringify(errors1)).toBe(JSON.stringify(errors2))
    expect(JSON.stringify(errors3)).toBe(JSON.stringify(errors4))

    expect(errors1[0].type).toBe("object_required")
    expect(errors1[1].type).toBe("object_missing_key")
    expect(errors1[2].type).toBe("string_required")

    expect(errors3[0].type).toBe("object_missing_key")
    expect(errors3[1].type).toBe("string_numeric")
    expect(errors3[2].type).toBe("string_required")
  })

  test("translates into another language", async () => {
    const s = object({
      foo: string(),
    })
      .shapeUnknownKeys(string().numeric())
      .shapeUnknownValues(string().numeric())

    const errors1 = s.verify(null, { language: "de" })!
    const errors2 = (await s.verifyAsync(null, {
      language: "de",
    }))!
    const errors3 = s.verify(
      {
        yolo: "swag",
      },
      {
        language: "xx",
        fallbackLanguage: "de",
      }
    )!
    const errors4 = (await s.verifyAsync(
      {
        yolo: "swag",
      },
      {
        language: "xx",
        fallbackLanguage: "de",
      }
    ))!

    expect(errors1.length).toBe(3)
    expect(errors1[0].message).toBe(
      translateMessage("object_required", [], "de")
    )

    expect(errors2.length).toBe(3)
    expect(errors2[0].message).toBe(
      translateMessage("object_required", [], "de")
    )

    expect(errors3.length).toBe(3)
    expect(errors3[0].message).toBe(
      translateMessage("object_missing_key", ["foo"], "de")
    )

    expect(errors4.length).toBe(3)
    expect(errors4[0].message).toBe(
      translateMessage("object_missing_key", ["foo"], "de")
    )
  })

  test("optional", async () => {
    const s1 = object({ foo: string() }).optional()
    const s2 = object({ foo: string().optional() }).optional()

    expect(await s1.testAsync(null)).toBe(true)
    expect(await s1.testAsync(undefined)).toBe(true)
    expect(await s1.testAsync({})).toBe(false)
    expect(await s1.testAsync(1)).toBe(false)

    expect(await s2.testAsync(null)).toBe(true)
    expect(await s2.testAsync(undefined)).toBe(true)
    expect(await s2.testAsync({})).toBe(true)
    expect(await s2.testAsync(1)).toBe(false)

    expect(await s1.verifyAsync(null)).toBe(undefined)
    expect(await s1.verifyAsync(undefined)).toBe(undefined)

    const errors1 = (await s1.verifyAsync({}))!
    expect(errors1.length).toBe(2)
    expect(errors1[0].message).toBe(
      translateMessage("object_missing_key", ["foo"])
    )

    const errors2 = (await s1.verifyAsync(1))!
    expect(errors2.length).toBe(3)
    expect(errors2[0].message).toBe(translateMessage("object_type"))

    expect(await s2.verifyAsync({})).toBe(undefined)

    const errors3 = (await s1.verifyAsync(1))!
    expect(errors3.length).toBe(3)
    expect(errors3[0].message).toBe(translateMessage("object_type"))
  })

  test("equals", async () => {
    const equals = {
      tag: "bar",
      baz: [1, 2],
    }
    const s1 = object().equals(equals)

    expect(
      await s1.testAsync({
        tag: "baz",
        baz: [1, 2],
      })
    ).toBe(false)
    expect(
      await s1.testAsync({
        tag: "bar",
        baz: [1],
      })
    ).toBe(false)
    expect(await s1.testAsync(equals)).toBe(true)

    const errors = (await s1.verifyAsync({ tag: "baz" }))!
    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe(translateMessage("object_equals", [equals]))
    expect(errors[0].path).toBe(undefined)

    expect(await s1.verifyAsync(equals)).toBe(undefined)

    const s2 = object().equals(() => equals)

    expect(await s2.testAsync(equals)).toBe(true)
  })

  ////////////////////////////////////////////////////////////////////////////////

  test("toDefault", async () => {
    const newObject = { foo: "bar" }
    const s1 = object().toDefault(newObject)
    const otherObject = { bar: "baz" }

    expect(await s1.sanitizeAsync(null)).toBe(newObject)
    expect(await s1.sanitizeAsync(undefined)).toBe(newObject)
    expect(await s1.sanitizeAsync(1)).toBe(newObject)
    expect(await s1.sanitizeAsync(otherObject)).toBe(otherObject)

    const s2 = object().toDefault(() => newObject)

    expect(await s2.sanitizeAsync(null)).toBe(newObject)
  })

  test("toCamelCaseKeys", async () => {
    const s = object().toCamelCaseKeys(false)

    expect(await s.sanitizeAsync({ foo_bar: { yolo_swag: "here" } })).toEqual({
      fooBar: { yolo_swag: "here" },
    })
  })

  test("toCamelCaseKeysDeep", async () => {
    const s = object().toCamelCaseKeys()

    expect(await s.sanitizeAsync({ foo_bar: { yolo_swag: "here" } })).toEqual({
      fooBar: { yoloSwag: "here" },
    })
  })

  test("toSnakeCaseKeys", async () => {
    const s = object().toSnakeCaseKeys(false)

    expect(await s.sanitizeAsync({ fooBar: { yoloSwag: "here" } })).toEqual({
      foo_bar: { yoloSwag: "here" },
    })
  })

  test("toSnakeCaseKeysDeep", async () => {
    const s = object().toSnakeCaseKeys()

    expect(await s.sanitizeAsync({ fooBar: { yoloSwag: "here" } })).toEqual({
      foo_bar: { yolo_swag: "here" },
    })
  })

  test("toKebabCaseKeys", async () => {
    const s = object().toKebabCaseKeys(false)

    expect(await s.sanitizeAsync({ foo_bar: { yolo_swag: "here" } })).toEqual({
      "foo-bar": { yolo_swag: "here" },
    })
  })

  test("toKebabCaseKeysDeep", async () => {
    const s = object().toKebabCaseKeys()

    expect(await s.sanitizeAsync({ foo_bar: { yolo_swag: "here" } })).toEqual({
      "foo-bar": { "yolo-swag": "here" },
    })
  })

  test("toConstantCaseKeys", async () => {
    const s = object().toConstantCaseKeys(false)

    expect(await s.sanitizeAsync({ fooBar: { yoloSwag: "here" } })).toEqual({
      FOO_BAR: { yoloSwag: "here" },
    })
  })

  test("toConstantCaseKeysDeep", async () => {
    const s = object().toConstantCaseKeys()

    expect(await s.sanitizeAsync({ fooBar: { yoloSwag: "here" } })).toEqual({
      FOO_BAR: { YOLO_SWAG: "here" },
    })
  })

  test("toMappedKeys", async () => {
    const s = object().toMappedKeys((value, key) => `${key}_`, false)

    expect(
      await s.sanitizeAsync({
        foo: { bar: "baz" },
        yolo: "swag",
      })
    ).toEqual({
      foo_: { bar: "baz" },
      yolo_: "swag",
    })
  })

  test("toMappedValues", async () => {
    const s = object().toMappedValues(
      (value, key) => (isString(value) ? `${value}_` : value),
      false
    )

    expect(
      await s.sanitizeAsync({
        foo: { bar: "baz" },
        yolo: "swag",
      })
    ).toEqual({
      foo: { bar: "baz" },
      yolo: "swag_",
    })
  })

  test("toMappedKeysDeep", async () => {
    const s = object().toMappedKeys((value, key) => `${key}_`)

    expect(
      await s.sanitizeAsync({
        foo: { bar: "baz" },
        yolo: "swag",
      })
    ).toEqual({
      foo_: { bar_: "baz" },
      yolo_: "swag",
    })
  })

  test("toMappedValues", async () => {
    const s = object().toMappedValues(
      (value, key) => (isString(value) ? `${value}_` : value),
      false
    )

    expect(
      await s.sanitizeAsync({
        foo: { bar: "baz" },
        yolo: "swag",
      })
    ).toEqual({
      foo: { bar: "baz" },
      yolo: "swag_",
    })
  })

  test("toMappedValuesDeep", async () => {
    const s = object().toMappedValues((value, key) =>
      isString(value) ? `${value}_` : value
    )

    expect(
      await s.sanitizeAsync({
        foo: { bar: "baz" },
        yolo: "swag",
      })
    ).toEqual({
      foo: { bar: "baz_" },
      yolo: "swag_",
    })
  })

  ////////////////////////////////////////////////////////////////////////////////

  test("or", async () => {
    const s1 = object({
      foo: string().min(3).or(string().min(2)),
    }).or(
      object({
        bar: string().min(3).or(string().min(2)),
      })
    )

    expect(await s1.testAsync({ foo: "1" })).toBe(false)
    expect(await s1.testAsync({ foo: "12" })).toBe(true)
    expect(await s1.testAsync({ foo: "123" })).toBe(true)
    expect(await s1.testAsync({ bar: "1" })).toBe(false)
    expect(await s1.testAsync({ bar: "12" })).toBe(true)
    expect(await s1.testAsync({ bar: "123" })).toBe(true)

    const errors1 = (await s1.verifyAsync({ foo: "1" }))!

    expect(errors1.length).toBe(5)
    expect(errors1[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors1[0].path).toBe("foo")
    expect(errors1[0].link).toBe(undefined)
    expect(errors1[1].message).toBe(translateMessage("string_min", [2]))
    expect(errors1[1].path).toBe("foo")
    expect(errors1[1].link).toBe("or")
    expect(errors1[2].message).toBe(
      translateMessage("object_unknown_key", ["foo"])
    )
    expect(errors1[2].path).toBe(undefined)
    expect(errors1[2].link).toBe("or")
    expect(errors1[3].message).toBe(
      translateMessage("object_missing_key", ["bar"])
    )
    expect(errors1[3].path).toBe(undefined)
    expect(errors1[3].link).toBe("or")
    expect(errors1[4].message).toBe(translateMessage("string_required"))
    expect(errors1[4].path).toBe("bar")
    expect(errors1[4].link).toBe("or")

    expect(await s1.verifyAsync({ foo: "123" })).toBe(undefined)
    expect(await s1.verifyAsync({ bar: "123" })).toBe(undefined)

    const s2 = object().shapeUnknownKeys(string().min(3).or(string().min(2)))

    expect(await s2.testAsync({ f: "1" })).toBe(false)
    expect(await s2.testAsync({ fo: "12" })).toBe(true)
    expect(await s2.testAsync({ foo: "123" })).toBe(true)

    const errors2 = (await s2.verifyAsync({ f: "1" }))!

    expect(errors2.length).toBe(2)
    expect(errors2[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors2[0].path).toBe("f")
    expect(errors2[0].link).toBe(undefined)
    expect(errors2[1].message).toBe(translateMessage("string_min", [2]))
    expect(errors2[1].path).toBe("f")
    expect(errors2[1].link).toBe("or")

    const s3 = object().shapeUnknownValues(string().min(3).or(string().min(2)))

    expect(await s3.testAsync({ foo: "1" })).toBe(false)
    expect(await s3.testAsync({ foo: "12" })).toBe(true)
    expect(await s3.testAsync({ foo: "123" })).toBe(true)

    const errors3 = (await s3.verifyAsync({ foo: "1" }))!

    expect(errors3.length).toBe(2)
    expect(errors3[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors3[0].path).toBe("foo")
    expect(errors3[0].link).toBe(undefined)
    expect(errors3[1].message).toBe(translateMessage("string_min", [2]))
    expect(errors3[1].path).toBe("foo")
    expect(errors3[1].link).toBe("or")

    expect(await s3.verifyAsync({ foo: "12" })).toBe(undefined)
    expect(await s3.verifyAsync({ foo: "123" })).toBe(undefined)
  })

  test("and", async () => {
    const s = object({
      foo: string().min(2),
    }).and(
      object({
        foo: string().min(3).and(string().min(4)),
      })
    )

    expect(await s.testAsync({ foo: "1" })).toBe(false)
    expect(await s.testAsync({ foo: "12" })).toBe(false)
    expect(await s.testAsync({ foo: "123" })).toBe(false)
    expect(await s.testAsync({ foo: "1234" })).toBe(true)

    const errors1 = (await s.verifyAsync({ foo: "1" }))!

    expect(errors1.length).toBe(1)
    expect(errors1[0].message).toBe(translateMessage("string_min", [2]))
    expect(errors1[0].link).toBe(undefined)

    const errors2 = (await s.verifyAsync({ foo: "12" }))!

    expect(errors2.length).toBe(1)
    expect(errors2[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors2[0].link).toBe("and")

    const errors3 = (await s.verifyAsync({ foo: "123" }))!

    expect(errors3.length).toBe(1)
    expect(errors3[0].message).toBe(translateMessage("string_min", [4]))
    expect(errors3[0].link).toBe("and.and")

    expect(await s.verifyAsync({ foo: "1234" })).toBe(undefined)
  })

  test("forbidUnknownKeys", async () => {
    const s1 = object({ foo: string() })

    expect(await s1.testAsync({ foo: "bar" })).toBe(true)
    expect(await s1.testAsync({ yolo: "swag" })).toBe(false)
    expect(
      await s1.testAsync({
        foo: "bar",
        yolo: "swag",
      })
    ).toBe(false)

    const s2 = object({ foo: string() }).forbidUnknownKeys()

    expect(await s2.testAsync({ foo: "bar" })).toBe(true)
    expect(await s2.testAsync({ yolo: "swag" })).toBe(false)
    expect(
      await s2.testAsync({
        foo: "bar",
        yolo: "swag",
      })
    ).toBe(false)

    const errors = (await s2.verifyAsync({
      foo: "bar",
      yolo: "swag",
    }))!

    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe(
      translateMessage("object_unknown_key", ["yolo"])
    )
    expect(errors[0].path).toBe(undefined)

    expect(await s2.verifyAsync({ foo: "bar" })).toBe(undefined)
  })

  test("allowUnknownKeys", async () => {
    const s = object({ foo: string() }).allowUnknownKeys()

    expect(await s.testAsync({ foo: "bar" })).toBe(true)
    expect(
      await s.testAsync({
        foo: "bar",
        yolo: "swag",
      })
    ).toBe(true)
    expect(await s.testAsync({ yolo: "swag" })).toBe(false)

    const errors = (await s.verifyAsync({
      foo: 1,
      yolo: "swag",
    }))!

    expect(errors.length).toBe(2)
    expect(errors[0].message).toBe(translateMessage("string_type"))
    expect(errors[1].message).toBe(translateMessage("string_required"))

    expect(
      await s.verifyAsync({
        foo: "bar",
        yolo: "swag",
      })
    ).toBe(undefined)
  })

  test("shapeUnknownKeys", async () => {
    const s = object().shapeUnknownKeys(string().min(3))

    expect(
      await s.testAsync({
        foo: "bar",
        yo: "swag",
      })
    ).toBe(false)
    expect(
      await s.testAsync({
        foo: "bar",
        yolo: "swag",
      })
    ).toBe(true)

    const errors = (await s.verifyAsync({
      foo: "bar",
      yo: "swag",
    }))!

    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors[0].path).toBe("yo")

    expect(
      await s.verifyAsync({
        foo: "bar",
        yolo: "swag",
      })
    ).toBe(undefined)
  })

  test("shapeUnknownValues", async () => {
    const s = object().shapeUnknownValues(string().min(3))

    expect(
      await s.testAsync({
        foo: "bar",
        yolo: "sw",
      })
    ).toBe(false)
    expect(
      await s.testAsync({
        foo: "bar",
        yolo: "swag",
      })
    ).toBe(true)

    const errors = (await s.verifyAsync({
      foo: "bar",
      yolo: "sw",
    }))!

    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors[0].path).toBe("yolo")

    expect(
      await s.verifyAsync({
        foo: "bar",
        yolo: "swag",
      })
    ).toBe(undefined)
  })

  test("shape", async () => {
    const s1 = object({ tag: string().min(2) })

    expect(await s1.testAsync({})).toBe(false)
    expect(await s1.testAsync({ bar: "12" })).toBe(false)
    expect(await s1.testAsync({ tag: "1" })).toBe(false)
    expect(await s1.testAsync({ tag: "12" })).toBe(true)

    const errors1 = (await s1.verifyAsync({ tag: "1" }))!

    expect(errors1.length).toBe(1)
    expect(errors1[0].message).toBe(translateMessage("string_min", [2]))
    expect(errors1[0].path).toBe("tag")
    expect(errors1[0].value).toBe("1")

    expect(await s1.verifyAsync({ tag: "12" })).toBe(undefined)

    const s2 = object().shape({
      tag: string().oneOf(["foo", "bar"]),
      keys: array().someOf(["yolo", "swag"]),
    })

    expect(
      await s2.testAsync({
        tag: "yolo",
        keys: [],
      })
    ).toBe(false)

    expect(
      await s2.testAsync({
        tag: "bar",
        keys: ["baz"],
      })
    ).toBe(false)

    expect(
      await s2.testAsync({
        tag: "bar",
        keys: ["yolo"],
      })
    ).toBe(true)

    const errors2 = (await s2.verifyAsync({ tag: "yolo" }))!

    expect(errors2.length).toBe(3)
    expect(errors2[0].message).toBe(
      translateMessage("object_missing_key", ["keys"])
    )
    expect(errors2[0].path).toBe(undefined)
    expect(errors2[1].message).toBe(
      translateMessage("string_one_of", [["foo", "bar"]])
    )
    expect(errors2[1].path).toBe("tag")
    expect(errors2[2].message).toBe(translateMessage("array_required"))
    expect(errors2[2].path).toBe("keys")

    expect(
      await s2.verifyAsync({
        tag: "foo",
        keys: ["yolo"],
      })
    ).toBe(undefined)

    const s3 = object({
      foo: object({
        bar: string().min(3),
      }),
    })

    expect(await s3.testAsync({})).toBe(false)
    expect(await s3.testAsync({ foo: "123" })).toBe(false)
    expect(await s3.testAsync({ foo: {} })).toBe(false)
    expect(await s3.testAsync({ foo: { boo: "123" } })).toBe(false)
    expect(await s3.testAsync({ foo: { bar: "12" } })).toBe(false)
    expect(await s3.testAsync({ foo: { bar: "123" } })).toBe(true)

    const errors3 = (await s3.verifyAsync(null))!

    expect(errors3.length).toBe(5)
    expect(errors3[0].message).toBe(translateMessage("object_required"))
    expect(errors3[0].path).toBe(undefined)
    expect(errors3[1].message).toBe(
      translateMessage("object_missing_key", ["foo"])
    )
    expect(errors3[1].path).toBe(undefined)
    expect(errors3[2].message).toBe(translateMessage("object_required"))
    expect(errors3[2].path).toBe("foo")
    expect(errors3[3].message).toBe(
      translateMessage("object_missing_key", ["bar"])
    )
    expect(errors3[3].path).toBe("foo")
    expect(errors3[4].message).toBe(translateMessage("string_required"))
    expect(errors3[4].path).toBe("foo.bar")

    expect(await s3.verifyAsync({ foo: { bar: "123" } })).toBe(undefined)
  })

  test("also", async () => {
    const s1 = string().also((value) => {
      if (value.length < 3) {
        return "is too short"
      }
    })
    const s2 = object({ foo: s1 })
      .allowUnknownKeys()
      .also((value) => {
        if (keys(value).length < 2) {
          return "not enough keys"
        }
      })

    expect(await s2.testAsync({ foo: "12" })).toBe(false)
    expect(await s2.testAsync({ foo: "123" })).toBe(false)
    expect(
      await s2.testAsync({
        foo: "1234",
        bar: "123",
      })
    ).toBe(true)
  })

  test("map", async () => {
    const s = object({
      foo: string().map((value) => value.toString()),
    })

    expect(await s.sanitizeAsync({ foo: 1 })).toEqual({ foo: "1" })
  })

  test("sanitize", async () => {
    const s = object({ foo: string().length(2).toTrimmed() })

    expect(await s.sanitizeAsync({ foo: " 12 " })).toEqual({ foo: "12" })
  })

  test("sanitize and test", async () => {
    const s = object({ foo: string().length(2).toTrimmed() })

    expect(await s.sanitizeAndTestAsync({ foo: " 12 " })).toEqual([
      true,
      { foo: "12" },
    ])
  })

  test("validate with raw errors", async () => {
    const s = object({ foo: string().length(2) })
    const errors = s.verify({ foo: "1" })!

    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe(translateMessage("string_length", [2]))
    expect(errors[0].path).toBe("foo")

    expect(s.verify({ foo: "12" })).toBe(undefined)
  })

  test("validate", () => {
    const s = object({ foo: string().length(2) })
    const errors = s.validate({ foo: "1" })!

    expect(!!errors).toBe(true)
    expect(errors.foo[0]).toBe(translateMessage("string_length", [2]))

    expect(s.validate({ foo: "12" })).toBe(undefined)
  })

  test("validate async with raw errors", async () => {
    const s = object({ foo: string().length(2) })
    const errors = (await s.verifyAsync({ foo: "1" }))!

    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe(translateMessage("string_length", [2]))
    expect(errors[0].path).toBe("foo")

    expect(await s.verifyAsync({ foo: "12" })).toBe(undefined)
  })

  test("validate async", async () => {
    const s = object({ foo: string().length(2) })
    const errors = (await s.validateAsync({ foo: "1" }))!

    expect(!!errors).toBe(true)
    expect(errors.foo[0]).toBe(translateMessage("string_length", [2]))

    expect(await s.validateAsync({ foo: "12" })).toBe(undefined)
  })

  test("sanitize and validate with raw errors", () => {
    const s = object({ foo: string().length(2).toTrimmed() })
    const [errors1, value1] = s.sanitizeAndVerify({
      foo: "  1  ",
    })

    expect(errors1!.length).toBe(1)
    expect(errors1![0].message).toBe(translateMessage("string_length", [2]))
    expect(errors1![0].path).toBe("foo")
    expect(value1).toEqual({ foo: "1" })

    const [errors2, value2] = s.sanitizeAndVerify({
      foo: "  12  ",
    })
    expect(errors2).toBe(undefined)
    expect(value2).toEqual({ foo: "12" })
  })

  test("sanitize and validate", () => {
    const s = object({ foo: string().length(2).toTrimmed() })
    const [errors1, value1] = s.sanitizeAndValidate({
      foo: "  1  ",
    })

    expect(!!errors1).toBe(true)
    expect(errors1!.foo[0]).toBe(translateMessage("string_length", [2]))
    expect(value1).toEqual({ foo: "1" })

    const [errors2, value2] = s.sanitizeAndValidate({
      foo: "  12  ",
    })
    expect(errors2).toBe(undefined)
    expect(value2).toEqual({ foo: "12" })
  })

  test("sanitize and validate async with raw errors", async () => {
    const s = object({ foo: string().length(2).toTrimmed() })
    const [errors1, value1] = await s.sanitizeAndVerifyAsync({
      foo: "  1  ",
    })

    expect(errors1!.length).toBe(1)
    expect(errors1![0].message).toBe(translateMessage("string_length", [2]))
    expect(errors1![0].path).toBe("foo")
    expect(value1).toEqual({ foo: "1" })

    const [errors2, value2] = await s.sanitizeAndVerifyAsync({
      foo: "  12  ",
    })
    expect(errors2).toBe(undefined)
    expect(value2).toEqual({ foo: "12" })
  })

  test("sanitize and async validate", async () => {
    const s = object({ foo: string().length(2).toTrimmed() })
    const [errors1, value1] = await s.sanitizeAndValidateAsync({
      foo: "  1  ",
    })

    expect(!!errors1).toBe(true)
    expect(errors1!.foo[0]).toBe(translateMessage("string_length", [2]))
    expect(value1).toEqual({ foo: "1" })

    const [errors2, value2] = await s.sanitizeAndValidateAsync({
      foo: "  12  ",
    })
    expect(errors2).toBe(undefined)
    expect(value2).toEqual({ foo: "12" })
  })

  test("omits errors for optional fields", () => {
    const s1 = object({ foo: string().optional(), bar: string().optional() })
    const errors1 = s1.validate({})

    expect(errors1).toBe(undefined)

    const s2 = object({ foo: string().optional(), bar: string() })
    const errors2 = s2.validate({ bar: "bar" })

    expect(errors2).toBe(undefined)

    const s3 = object({ foo: string().optional(), bar: string() })
    const errors3 = s3.validate({})

    expect(errors3?.["self"]).toEqual(['Missing object key "bar"'])
  })

  ////////////////////////////////////////////////////////////////////////////////

  test("value().object()", async () => {
    const s = schema({ foo: "bar" }).object()

    expect(s instanceof ObjectSchema).toBe(true)
    expect(await s.sanitizeAsync(undefined)).toEqual({ foo: "bar" })
  })
})
