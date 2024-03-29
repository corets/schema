import { StringSchema } from "../index"
import { translateMessage } from "../translateMessage"
import { string } from "../factories/string"
import { schema } from "../factories/schema"
import dayjs from "dayjs"

describe("StringSchema", () => {
  test("required", async () => {
    const s1 = string()
    const s2 = string().required()

    expect(await s1.testAsync(null)).toBe(false)
    expect(await s2.testAsync(null)).toBe(false)
    expect(await s1.testAsync(undefined)).toBe(false)
    expect(await s2.testAsync(undefined)).toBe(false)
    expect(await s1.testAsync(1)).toBe(false)
    expect(await s2.testAsync(1)).toBe(false)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s2.testAsync("")).toBe(false)
    expect(await s1.testAsync("1")).toBe(true)
    expect(await s2.testAsync("1")).toBe(true)

    const errors1 = (await s1.verifyAsync(null))!
    expect(errors1.length).toBe(1)
    expect(errors1[0].message).toBe(translateMessage("string_required"))
    expect(errors1[0].value).toBe(null)

    const errors2 = (await s1.verifyAsync(1))!
    expect(errors2.length).toBe(2)
    expect(errors2[0].message).toBe(translateMessage("string_type"))
    expect(errors2[0].value).toBe(1)
    expect(errors2[1].message).toBe(translateMessage("string_required"))
    expect(errors2[1].value).toBe(1)

    expect(await s1.verifyAsync("1")).toBe(undefined)

    expect(string().required(false).test(undefined)).toBe(true)
    expect(
      string()
        .required(() => false)
        .test(undefined)
    ).toBe(true)
    expect(
      string()
        .required(() => true)
        .test(undefined)
    ).toBe(false)
  })

  test("translates into another language", async () => {
    const s = string().required()

    const errors1 = s.verify(null, { language: "de" })!
    const errors2 = (await s.verifyAsync(null, {
      language: "de",
    }))!
    const errors3 = (await s.verifyAsync(null, {
      language: "xx",
      fallbackLanguage: "de",
    }))!

    expect(errors1.length).toBe(1)
    expect(errors1[0].message).toBe("Erforderlich")
    expect(errors1[0].message).toBe(
      translateMessage("string_required", [], "de")
    )

    expect(errors2.length).toBe(1)
    expect(errors2[0].message).toBe("Erforderlich")
    expect(errors2[0].message).toBe(
      translateMessage("string_required", [], "de")
    )

    expect(errors3.length).toBe(1)
    expect(errors3[0].message).toBe("Erforderlich")
    expect(errors3[0].message).toBe(
      translateMessage("string_required", [], "de")
    )
  })

  test("optional", async () => {
    const s = string().optional()

    expect(await s.testAsync(null)).toBe(true)
    expect(await s.testAsync(undefined)).toBe(true)
    expect(await s.testAsync(1)).toBe(false)
    expect(await s.testAsync("")).toBe(true)

    const errors = (await s.verifyAsync(1))!

    expect(errors[0].message).toBe(translateMessage("string_type"))
    expect(await s.verifyAsync(null)).toBe(undefined)
  })

  test("is immutable", async () => {
    const s1 = string()
    const s2 = string().optional()

    expect(s1 === s1).toBe(true)
    expect(s1 === s2).toBe(false)
  })

  test("optional and required", async () => {
    expect(await string().required().testAsync(null)).toBe(false)
    expect(await string().required().optional().testAsync(null)).toBe(true)
    expect(
      await string().required().optional().required().testAsync(null)
    ).toBe(false)
  })

  test("equals", async () => {
    const arg = "joker"
    const s1 = string().equals(arg)

    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)
    expect(await s1.testAsync("abc")).toBe(false)
    expect(await s1.optional().testAsync("abc")).toBe(false)
    expect(await s1.testAsync(arg)).toBe(true)

    expect((await s1.verifyAsync("2"))![0].message).toBe(
      translateMessage("string_equals", [arg])
    )
    expect(await s1.verifyAsync(arg)).toBe(undefined)

    const s2 = string().equals(() => arg)

    expect(await s2.testAsync(arg)).toBe(true)
  })

  test("length", async () => {
    const arg = 5
    const s1 = string().length(arg)

    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)
    expect(await s1.testAsync("123")).toBe(false)
    expect(await s1.optional().testAsync("123")).toBe(false)
    expect(await s1.testAsync("12345")).toBe(true)

    expect((await s1.verifyAsync("1"))![0].message).toBe(
      translateMessage("string_length", [arg])
    )
    expect(await s1.verifyAsync("12345")).toBe(undefined)

    const s2 = string().length(() => arg)

    expect(await s2.testAsync("12345")).toBe(true)
  })

  test("overrides previous definitions with same type", async () => {
    const s = string().min(4).min(3)

    expect(await s.testAsync("123")).toBe(true)
    expect(await s.testAsync("1234")).toBe(true)
  })

  test("min", async () => {
    const arg = 5
    const s1 = string().min(arg)

    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)
    expect(await s1.testAsync("123")).toBe(false)
    expect(await s1.optional().testAsync("123")).toBe(false)
    expect(await s1.testAsync("12345")).toBe(true)
    expect(await s1.testAsync("123456")).toBe(true)

    expect((await s1.verifyAsync("1"))![0].message).toBe(
      translateMessage("string_min", [arg])
    )
    expect(await s1.verifyAsync("12345")).toBe(undefined)

    const s2 = string().min(() => arg)

    expect(await s2.testAsync("123456")).toBe(true)
  })

  test("max", async () => {
    const arg = 5
    const s1 = string().max(arg)

    expect(await s1.testAsync("123456")).toBe(false)
    expect(await s1.optional().testAsync("123456")).toBe(false)
    expect(await s1.testAsync("12345")).toBe(true)
    expect(await s1.testAsync("1234")).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)
    expect(await s1.testAsync("1")).toBe(true)

    expect((await s1.verifyAsync("123456"))![0].message).toBe(
      translateMessage("string_max", [arg])
    )
    expect(await s1.verifyAsync("12")).toBe(undefined)

    const s2 = string().max(() => arg)

    expect(await s2.testAsync("1")).toBe(true)
  })

  test("between", async () => {
    const arg1 = 3
    const arg2 = 5
    const s1 = string().between(arg1, arg2)

    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)
    expect(await s1.testAsync("12")).toBe(false)
    expect(await s1.optional().testAsync("12")).toBe(false)
    expect(await s1.testAsync("123")).toBe(true)
    expect(await s1.testAsync("1234")).toBe(true)
    expect(await s1.testAsync("12345")).toBe(true)
    expect(await s1.testAsync("123456")).toBe(false)

    expect((await s1.verifyAsync("1"))![0].message).toBe(
      translateMessage("string_between", [arg1, arg2])
    )
    expect(await s1.verifyAsync("1234")).toBe(undefined)

    const s2 = string().between(
      () => arg1,
      () => arg2
    )

    expect(await s2.testAsync("12345")).toBe(true)
  })

  test("email", async () => {
    const s = string().email()

    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)
    expect(await s.testAsync("some email")).toBe(false)
    expect(await s.optional().testAsync("some email")).toBe(false)
    expect(await s.testAsync("some@email")).toBe(false)
    expect(await s.testAsync("some@email.com")).toBe(true)

    expect((await s.verifyAsync("a"))![0].message).toBe(
      translateMessage("string_email")
    )
    expect(await s.verifyAsync("some@email.com")).toBe(undefined)
  })

  test("url", async () => {
    const s = string().url()

    expect(await s.testAsync("google.com")).toBe(false)
    expect(await s.optional().testAsync("google.com")).toBe(false)
    expect(await s.testAsync("http://google.com")).toBe(true)
    expect(await s.testAsync("https://google.com")).toBe(true)
    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)

    expect((await s.verifyAsync("a"))![0].message).toBe(
      translateMessage("string_url")
    )
    expect(await s.verifyAsync("http://google.com")).toBe(undefined)
  })

  test("startsWith", async () => {
    const arg = "red"
    const s1 = string().startsWith(arg)

    expect(await s1.testAsync("blue car")).toBe(false)
    expect(await s1.optional().testAsync("blue car")).toBe(false)
    expect(await s1.testAsync("red car")).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("a"))![0].message).toBe(
      translateMessage("string_starts_with", [arg])
    )
    expect(await s1.verifyAsync("red bus")).toBe(undefined)

    const s2 = string().startsWith(() => arg)

    expect(await s2.testAsync("red car")).toBe(true)
  })

  test("endsWith", async () => {
    const arg = "bus"
    const s1 = string().endsWith(arg)

    expect(await s1.testAsync("red car")).toBe(false)
    expect(await s1.optional().testAsync("red car")).toBe(false)
    expect(await s1.testAsync("red bus")).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("a"))![0].message).toBe(
      translateMessage("string_ends_with", [arg])
    )
    expect(await s1.verifyAsync("red bus")).toBe(undefined)

    const s2 = string().endsWith(() => arg)

    expect(await s2.testAsync("red bus")).toBe(true)
  })

  test("includes", async () => {
    const arg = "bus"
    const s1 = string().includes(arg)

    expect(await s1.testAsync("red car")).toBe(false)
    expect(await s1.optional().testAsync("red car")).toBe(false)
    expect(await s1.testAsync("red bus")).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("a"))![0].message).toBe(
      translateMessage("string_includes", [arg])
    )
    expect(await s1.verifyAsync(arg)).toBe(undefined)

    const s2 = string().includes(() => arg)

    expect(await s2.testAsync("red bus")).toBe(true)
  })

  test("omits", async () => {
    const arg = "blue"
    const s1 = string().omits(arg)

    expect(await s1.testAsync("blue")).toBe(false)
    expect(await s1.optional().testAsync("blue")).toBe(false)
    expect(await s1.testAsync("red")).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync(arg))![0].message).toBe(
      translateMessage("string_omits", [arg])
    )
    expect(await s1.verifyAsync("red")).toBe(undefined)

    const s2 = string().omits(() => arg)

    expect(await s2.testAsync("red")).toBe(true)
  })

  test("oneOf", async () => {
    const arg = ["bus", "taxi"]
    const s1 = string().oneOf(arg)

    expect(await s1.testAsync("car")).toBe(false)
    expect(await s1.optional().testAsync("car")).toBe(false)
    expect(await s1.testAsync("bus")).toBe(true)
    expect(await s1.testAsync("taxi")).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("car"))![0].message).toBe(
      translateMessage("string_one_of", [arg])
    )
    expect(await s1.verifyAsync("bus")).toBe(undefined)

    const s2 = string().oneOf(() => arg)

    expect(await s2.testAsync("taxi")).toBe(true)
  })

  test("noneOf", async () => {
    const arg = ["bus", "taxi"]
    const s1 = string().noneOf(arg)

    expect(await s1.testAsync("bus")).toBe(false)
    expect(await s1.optional().testAsync("bus")).toBe(false)
    expect(await s1.testAsync("taxi")).toBe(false)
    expect(await s1.testAsync("car")).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("bus"))![0].message).toBe(
      translateMessage("string_none_of", [arg])
    )
    expect(await s1.verifyAsync("car")).toBe(undefined)

    const s2 = string().noneOf(() => arg)

    expect(await s2.testAsync("car")).toBe(true)
  })

  test("matches", async () => {
    const regex = /^red/
    const s1 = string().matches(regex)

    expect(await s1.testAsync("blue car")).toBe(false)
    expect(await s1.optional().testAsync("blue car")).toBe(false)
    expect(await s1.testAsync("red car")).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("blue car"))![0].message).toBe(
      translateMessage("string_matches", [regex])
    )
    expect(await s1.verifyAsync("red car")).toBe(undefined)

    const s2 = string().matches(() => regex)

    expect(await s2.testAsync("red car")).toBe(true)
  })

  test("numeric", async () => {
    const s = string().numeric()

    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)
    expect(await s.testAsync("a1")).toBe(false)
    expect(await s.optional().testAsync("a1")).toBe(false)
    expect(await s.testAsync("1a")).toBe(false)
    expect(await s.testAsync("1.0 a")).toBe(false)
    expect(await s.testAsync("1-0")).toBe(false)
    expect(await s.testAsync("1,0")).toBe(false)
    expect(await s.testAsync("1'0")).toBe(false)
    expect(await s.testAsync("1")).toBe(true)
    expect(await s.testAsync("1.0")).toBe(true)
    expect(await s.testAsync("111.000")).toBe(true)

    expect((await s.verifyAsync("a"))![0].message).toBe(
      translateMessage("string_numeric")
    )
    expect(await s.verifyAsync("1")).toBe(undefined)
  })

  test("alpha", async () => {
    const s = string().alpha()

    expect(await s.testAsync("a1")).toBe(false)
    expect(await s.optional().testAsync("a1")).toBe(false)
    expect(await s.testAsync("1a")).toBe(false)
    expect(await s.testAsync("a")).toBe(true)
    expect(await s.testAsync("A")).toBe(true)
    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)

    expect((await s.verifyAsync("1"))![0].message).toBe(
      translateMessage("string_alpha")
    )
    expect(await s.verifyAsync("a")).toBe(undefined)
  })

  test("alphaNumeric", async () => {
    const s = string().alphaNumeric()

    expect(await s.testAsync("a1_")).toBe(false)
    expect(await s.optional().testAsync("a1_")).toBe(false)
    expect(await s.testAsync("1a-")).toBe(false)
    expect(await s.testAsync("a 1")).toBe(false)
    expect(await s.testAsync("1'0")).toBe(false)
    expect(await s.testAsync("1")).toBe(true)
    expect(await s.testAsync("a")).toBe(true)
    expect(await s.testAsync("A")).toBe(true)
    expect(await s.testAsync("a1")).toBe(true)
    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)

    expect((await s.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_alpha_numeric")
    )
    expect(await s.verifyAsync("1")).toBe(undefined)
  })

  test("alphaDashes", async () => {
    const s = string().alphaDashes()

    expect(await s.testAsync("a1")).toBe(false)
    expect(await s.optional().testAsync("a1")).toBe(false)
    expect(await s.testAsync("a_")).toBe(false)
    expect(await s.testAsync("a -")).toBe(false)
    expect(await s.testAsync("a-")).toBe(true)
    expect(await s.testAsync("a")).toBe(true)
    expect(await s.testAsync("A")).toBe(true)
    expect(await s.testAsync("-")).toBe(true)
    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)

    expect((await s.verifyAsync("_"))![0].message).toBe(
      translateMessage("string_alpha_dashes")
    )
    expect(await s.verifyAsync("-")).toBe(undefined)
  })

  test("alphaUnderscores", async () => {
    const s = string().alphaUnderscores()

    expect(await s.testAsync("a1")).toBe(false)
    expect(await s.testAsync("a-")).toBe(false)
    expect(await s.testAsync("a _")).toBe(false)
    expect(await s.testAsync("a_")).toBe(true)
    expect(await s.testAsync("a")).toBe(true)
    expect(await s.testAsync("A")).toBe(true)
    expect(await s.testAsync("_")).toBe(true)

    expect((await s.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_alpha_underscores")
    )
    expect(await s.verifyAsync("_")).toBe(undefined)
  })

  test("alphaNumericDashes", async () => {
    const s = string().alphaNumericDashes()

    expect(await s.testAsync("a1_")).toBe(false)
    expect(await s.optional().testAsync("a1_")).toBe(false)
    expect(await s.testAsync("1a -")).toBe(false)
    expect(await s.testAsync("a")).toBe(true)
    expect(await s.testAsync("A")).toBe(true)
    expect(await s.testAsync("1")).toBe(true)
    expect(await s.testAsync("-")).toBe(true)
    expect(await s.testAsync("a1-")).toBe(true)
    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)

    expect((await s.verifyAsync("_"))![0].message).toBe(
      translateMessage("string_alpha_numeric_dashes")
    )
    expect(await s.verifyAsync("1")).toBe(undefined)
  })

  test("alphaNumericUnderscores", async () => {
    const s = string().alphaNumericUnderscores()

    expect(await s.testAsync("a1-")).toBe(false)
    expect(await s.optional().testAsync("a1-")).toBe(false)
    expect(await s.testAsync("1a _")).toBe(false)
    expect(await s.testAsync("a")).toBe(true)
    expect(await s.testAsync("As")).toBe(true)
    expect(await s.testAsync("1")).toBe(true)
    expect(await s.testAsync("_")).toBe(true)
    expect(await s.testAsync("a1_")).toBe(true)
    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)

    expect((await s.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_alpha_numeric_underscores")
    )
    expect(await s.verifyAsync("_")).toBe(undefined)
  })

  test("date", async () => {
    const s = string().date()

    expect(await s.testAsync("2019 12 12")).toBe(false)
    expect(await s.optional().testAsync("2019 12 12")).toBe(false)
    expect(await s.testAsync("2019-12-12")).toBe(true)
    expect(await s.testAsync("2019-13-12")).toBe(false)
    expect(await s.testAsync("2019-12-40")).toBe(false)
    expect(await s.testAsync("2019-12-12T17:55:00")).toBe(false)
    expect(await s.testAsync("2019-12-12+07:00")).toBe(true)
    expect(await s.testAsync("2019-12-12Z")).toBe(true)
    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)

    expect((await s.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_date")
    )
    expect(await s.verifyAsync("2019-12-12")).toBe(undefined)
  })

  test("time", async () => {
    const s = string().time()

    expect(await s.testAsync("17 55 41")).toBe(false)
    expect(await s.optional().testAsync("17 55 41")).toBe(false)
    expect(await s.testAsync("17:55")).toBe(true)
    expect(await s.testAsync("17:55:41")).toBe(true)
    expect(await s.testAsync("17:55:41.127")).toBe(true)
    expect(await s.testAsync("17:55:41+07:00")).toBe(true)
    expect(await s.testAsync("17:55:41Z")).toBe(true)
    expect(await s.testAsync("17:55:41.127+07:00")).toBe(true)
    expect(await s.testAsync("17:55:41.127Z")).toBe(true)
    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)

    expect((await s.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_time")
    )
    expect(await s.verifyAsync("17:55:41")).toBe(undefined)
  })

  test("dateTime", async () => {
    const s = string().dateTime()

    expect(await s.testAsync("2019 12 12T17 55 41")).toBe(false)
    expect(await s.optional().testAsync("2019 12 12T17 55 41")).toBe(false)
    expect(await s.testAsync("2019-12-12T17:55:41")).toBe(true)
    expect(await s.testAsync("2019-12-12T17:55:41.123")).toBe(true)
    expect(await s.testAsync("2019-12-12T17:55:41+07:00")).toBe(true)
    expect(await s.testAsync("2019-12-12T17:55:41Z")).toBe(true)
    expect(await s.testAsync("2019-12-12T17:55:41.123+07:00")).toBe(true)
    expect(await s.testAsync("2019-12-12T17:55:41.123Z")).toBe(true)
    expect(await s.testAsync("")).toBe(false)
    expect(await s.optional().testAsync("")).toBe(true)

    expect((await s.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_date_time")
    )
    expect(await s.verifyAsync("2019-12-12T17:55:41")).toBe(undefined)
  })

  test("dateBefore", async () => {
    const before = new Date()
    const s1 = string().dateBefore(before)

    expect(await s1.testAsync(before)).toBe(false)
    expect(await s1.optional().testAsync(before)).toBe(false)
    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync(before.toISOString())).toBe(false)
    expect(await s1.testAsync(dayjs(before).subtract(1, "day").toDate())).toBe(
      false
    )
    expect(
      await s1.testAsync(dayjs(before).subtract(1, "day").toISOString())
    ).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_date_before", [before])
    )
    expect(
      await s1.verifyAsync(dayjs(before).subtract(1, "day").toISOString())
    ).toBe(undefined)

    const s2 = string().dateBefore(() => before)

    expect(
      await s2.testAsync(dayjs(before).subtract(1, "day").toISOString())
    ).toBe(true)
  })

  test("dateBeforeOrEqual", async () => {
    const before = new Date()
    const s1 = string().dateBeforeOrEqual(before)

    expect(await s1.testAsync(before)).toBe(false)
    expect(await s1.optional().testAsync(before)).toBe(false)
    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync(before.toISOString())).toBe(true)
    expect(await s1.testAsync(dayjs(before).subtract(1, "day").toDate())).toBe(
      false
    )
    expect(
      await s1.testAsync(dayjs(before).subtract(1, "day").toISOString())
    ).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_date_before_or_equal", [before])
    )
    expect(
      await s1.verifyAsync(dayjs(before).subtract(1, "day").toISOString())
    ).toBe(undefined)

    const s2 = string().dateBeforeOrEqual(() => before)

    expect(
      await s2.testAsync(dayjs(before).subtract(1, "day").toISOString())
    ).toBe(true)
  })

  test("dateAfter", async () => {
    const after = new Date()
    const s1 = string().dateAfter(after)

    expect(await s1.testAsync(after)).toBe(false)
    expect(await s1.optional().testAsync(after)).toBe(false)
    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync(after.toISOString())).toBe(false)
    expect(await s1.testAsync(dayjs(after).add(1, "day").toDate())).toBe(false)
    expect(await s1.testAsync(dayjs(after).add(1, "day").toISOString())).toBe(
      true
    )
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_date_after", [after])
    )
    expect(await s1.verifyAsync(dayjs(after).add(1, "day").toISOString())).toBe(
      undefined
    )

    const s2 = string().dateAfter(() => after)

    expect(await s2.testAsync(dayjs(after).add(1, "day").toISOString())).toBe(
      true
    )
  })

  test("dateAfterOrEqual", async () => {
    const after = new Date()
    const s1 = string().dateAfterOrEqual(after)

    expect(await s1.testAsync(after)).toBe(false)
    expect(await s1.optional().testAsync(after)).toBe(false)
    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync(after.toISOString())).toBe(true)
    expect(await s1.testAsync(dayjs(after).add(1, "day").toDate())).toBe(false)
    expect(await s1.testAsync(dayjs(after).add(1, "day").toISOString())).toBe(
      true
    )
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_date_after_or_equal", [after])
    )
    expect(await s1.verifyAsync(dayjs(after).add(1, "day").toISOString())).toBe(
      undefined
    )

    const s2 = string().dateAfterOrEqual(() => after)

    expect(await s2.testAsync(dayjs(after).add(1, "day").toISOString())).toBe(
      true
    )
  })

  test("dateBetween", async () => {
    const after = dayjs().subtract(3, "days").toDate()
    const before = dayjs().add(3, "days").toDate()
    const now = new Date()
    const s1 = string().dateBetween(after, before)

    expect(await s1.testAsync(after)).toBe(false)
    expect(await s1.optional().testAsync(after)).toBe(false)
    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync(after.toISOString())).toBe(false)
    expect(await s1.testAsync(before.toISOString())).toBe(false)
    expect(await s1.testAsync(dayjs(now).add(4, "days").toDate())).toBe(false)
    expect(await s1.testAsync(dayjs(now).add(4, "days").toISOString())).toBe(
      false
    )
    expect(await s1.testAsync(dayjs(now).subtract(4, "days").toDate())).toBe(
      false
    )
    expect(
      await s1.testAsync(dayjs(now).subtract(4, "days").toISOString())
    ).toBe(false)
    expect(await s1.testAsync(now)).toBe(false)
    expect(await s1.testAsync(now.toISOString())).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_date_between", [after, before])
    )
    expect(await s1.verifyAsync(now.toISOString())).toBe(undefined)

    const s2 = string().dateBetween(
      () => after,
      () => before
    )

    expect(await s2.testAsync(now.toISOString())).toBe(true)
  })

  test("dateBetween", async () => {
    const after = dayjs().subtract(3, "days").toDate()
    const before = dayjs().add(3, "days").toDate()
    const now = new Date()
    const s1 = string().dateBetweenOrEqual(after, before)

    expect(await s1.testAsync(after)).toBe(false)
    expect(await s1.optional().testAsync(after)).toBe(false)
    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync(after.toISOString())).toBe(true)
    expect(await s1.testAsync(before.toISOString())).toBe(true)
    expect(await s1.testAsync(dayjs(now).add(4, "days").toDate())).toBe(false)
    expect(await s1.testAsync(dayjs(now).add(4, "days").toISOString())).toBe(
      false
    )
    expect(await s1.testAsync(dayjs(now).subtract(4, "days").toDate())).toBe(
      false
    )
    expect(
      await s1.testAsync(dayjs(now).subtract(4, "days").toISOString())
    ).toBe(false)
    expect(await s1.testAsync(now)).toBe(false)
    expect(await s1.testAsync(now.toISOString())).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_date_between_or_equal", [after, before])
    )
    expect(await s1.verifyAsync(now.toISOString())).toBe(undefined)

    const s2 = string().dateBetweenOrEqual(
      () => after,
      () => before
    )

    expect(await s2.testAsync(now.toISOString())).toBe(true)
  })

  test("timeBefore", async () => {
    const before = "12:00"
    const s1 = string().timeBefore(before)

    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync("13:00")).toBe(false)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 13)
          .set("minutes", 0)
          .set("seconds", 0)
          .toISOString()
      )
    ).toBe(false)
    expect(await s1.testAsync("12:00")).toBe(false)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 12)
          .set("minutes", 0)
          .set("seconds", 0)
          .toISOString()
      )
    ).toBe(false)
    expect(await s1.testAsync("11:59")).toBe(true)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 11)
          .set("minutes", 59)
          .set("seconds", 59)
          .toISOString()
      )
    ).toBe(true)
    expect(await s1.testAsync("11:00")).toBe(true)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 11)
          .set("minutes", 0)
          .set("seconds", 0)
          .toISOString()
      )
    ).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_time_before", [before])
    )
    expect(await s1.verifyAsync("11:00")).toBe(undefined)

    const s2 = string().timeBefore(() => before)

    expect(await s2.testAsync("11:00")).toBe(true)
  })

  test("timeBeforeOrEqual", async () => {
    const before = "12:00"
    const s1 = string().timeBeforeOrEqual(before)

    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync("13:00")).toBe(false)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 13)
          .set("minutes", 0)
          .set("seconds", 0)
          .toISOString()
      )
    ).toBe(false)
    expect(await s1.testAsync("12:00")).toBe(true)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 12)
          .set("minutes", 0)
          .set("seconds", 0)
          .toISOString()
      )
    ).toBe(true)
    expect(await s1.testAsync("11:59")).toBe(true)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 11)
          .set("minutes", 59)
          .set("seconds", 59)
          .toISOString()
      )
    ).toBe(true)
    expect(await s1.testAsync("11:00")).toBe(true)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 11)
          .set("minutes", 0)
          .set("seconds", 0)
          .toISOString()
      )
    ).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_time_before_or_equal", [before])
    )
    expect(await s1.verifyAsync("11:00")).toBe(undefined)

    const s2 = string().timeBeforeOrEqual(() => before)

    expect(await s2.testAsync("11:00")).toBe(true)
  })

  test("timeAfter", async () => {
    const after = "12:00"
    const s1 = string().timeAfter(after)

    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync("11:59")).toBe(false)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 11)
          .set("minutes", 59)
          .set("seconds", 59)
          .toISOString()
      )
    ).toBe(false)
    expect(await s1.testAsync("12:00")).toBe(false)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 12)
          .set("minutes", 0)
          .set("seconds", 0)
          .toISOString()
      )
    ).toBe(false)
    expect(await s1.testAsync("12:01")).toBe(true)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 12)
          .set("minutes", 0)
          .set("seconds", 1)
          .toISOString()
      )
    ).toBe(true)
    expect(await s1.testAsync("13:00")).toBe(true)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 13)
          .set("minutes", 0)
          .set("seconds", 0)
          .toISOString()
      )
    ).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_time_after", [after])
    )
    expect(await s1.verifyAsync("13:00")).toBe(undefined)

    const s2 = string().timeAfter(() => after)

    expect(await s2.testAsync("13:00")).toBe(true)
  })

  test("timeAfterOrEqual", async () => {
    const after = "12:00"
    const s1 = string().timeAfterOrEqual(after)

    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync("11:59")).toBe(false)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 11)
          .set("minutes", 59)
          .set("seconds", 59)
          .toISOString()
      )
    ).toBe(false)
    expect(await s1.testAsync("12:00")).toBe(true)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 12)
          .set("minutes", 0)
          .set("seconds", 0)
          .toISOString()
      )
    ).toBe(true)
    expect(await s1.testAsync("12:01")).toBe(true)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 12)
          .set("minutes", 0)
          .set("seconds", 1)
          .toISOString()
      )
    ).toBe(true)
    expect(await s1.testAsync("13:00")).toBe(true)
    expect(
      await s1.testAsync(
        dayjs()
          .startOf("day")
          .set("hours", 13)
          .set("minutes", 0)
          .set("seconds", 0)
          .toISOString()
      )
    ).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_time_after_or_equal", [after])
    )
    expect(await s1.verifyAsync("13:00")).toBe(undefined)

    const s2 = string().timeAfterOrEqual(() => after)

    expect(await s2.testAsync("13:00")).toBe(true)
  })

  test("timeBetween", async () => {
    const after = "10:00"
    const before = "15:00"
    const s1 = string().timeBetween(after, before)

    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync("09:00")).toBe(false)
    expect(await s1.testAsync("09:59")).toBe(false)
    expect(await s1.testAsync("16:00")).toBe(false)
    expect(await s1.testAsync("15:01")).toBe(false)
    expect(await s1.testAsync("10:00")).toBe(false)
    expect(await s1.testAsync("15:00")).toBe(false)
    expect(await s1.testAsync("10:01")).toBe(true)
    expect(await s1.testAsync("14:59")).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_time_between", [after, before])
    )
    expect(await s1.verifyAsync("12:00")).toBe(undefined)

    const s2 = string().timeBetween(
      () => after,
      () => before
    )

    expect(await s2.testAsync("12:00")).toBe(true)
  })

  test("timeBetweenOrEqual", async () => {
    const after = "10:00"
    const before = "15:00"
    const s1 = string().timeBetweenOrEqual(after, before)

    expect(await s1.testAsync("foo")).toBe(false)
    expect(await s1.optional().testAsync("foo")).toBe(false)
    expect(await s1.testAsync("09:00")).toBe(false)
    expect(await s1.testAsync("09:59")).toBe(false)
    expect(await s1.testAsync("16:00")).toBe(false)
    expect(await s1.testAsync("15:01")).toBe(false)
    expect(await s1.testAsync("10:00")).toBe(true)
    expect(await s1.testAsync("15:00")).toBe(true)
    expect(await s1.testAsync("10:01")).toBe(true)
    expect(await s1.testAsync("14:59")).toBe(true)
    expect(await s1.testAsync("")).toBe(false)
    expect(await s1.optional().testAsync("")).toBe(true)

    expect((await s1.verifyAsync("-"))![0].message).toBe(
      translateMessage("string_time_between_or_equal", [after, before])
    )
    expect(await s1.verifyAsync("12:00")).toBe(undefined)

    const s2 = string().timeBetweenOrEqual(
      () => after,
      () => before
    )

    expect(await s2.testAsync("12:00")).toBe(true)
  })

  test("complex combination of date time before and after", () => {
    const dateBefore = new Date("2000-01-05T12:00")
    const dateAfter = new Date("2000-01-01T12:00")
    const timeBefore = "17:00"
    const timeAfter = "14:00"
    const s1 = string()
      .dateTime()
      .dateBefore(dateBefore)
      .dateAfter(dateAfter)
      .timeBefore(timeBefore)
      .timeAfter(timeAfter)
    expect(s1.test("2000-01-01T10:00:00")).toBe(false)
    expect(s1.test("2000-01-05T13:00:00")).toBe(false)
    expect(s1.test("2000-01-01T13:00:00")).toBe(false)
    expect(s1.test("2000-01-01T14:10:00Z")).toBe(true)
    expect(s1.test("2000-01-01T10:00:00")).toBe(false)
    expect(s1.test("2000-01-01T17:10:00")).toBe(false)
    expect(s1.test("2000-01-02T14:10:00")).toBe(true)
    expect(s1.test("2000-01-02T10:00:00")).toBe(false)
    expect(s1.test("2000-01-02T17:10:00")).toBe(false)
    expect(s1.test("2000-01-03T14:10:00")).toBe(true)
    expect(s1.test("2000-01-03T10:00:00")).toBe(false)
    expect(s1.test("2000-01-03T17:10:00")).toBe(false)
    expect(s1.test("2000-01-04T14:10:00")).toBe(true)
    expect(s1.test("2000-01-04T10:00:00")).toBe(false)
    expect(s1.test("2000-01-04T17:10:00")).toBe(false)
    expect(s1.test("2000-01-05T14:10:00")).toBe(false)
    expect(s1.test("2000-01-05T10:00:00")).toBe(false)
    expect(s1.test("2000-01-02T17:10:00")).toBe(false)
  })

  test("time before and after with timezones", () => {
    const s1 = string().dateTime().timeBeforeOrEqual("17:00:00+0200")
    const s2 = string().dateTime().timeAfterOrEqual("17:00:00+0200")

    expect(s1.test(new Date("2000-01-01T17:00:00Z").toISOString())).toBe(false)
    expect(s1.test(new Date("2000-01-01T16:00:00Z").toISOString())).toBe(false)
    expect(s1.test(new Date("2000-01-01T15:00:00Z").toISOString())).toBe(true)
    expect(s1.test(new Date("2000-01-01T14:00:00Z").toISOString())).toBe(true)
    expect(s1.test(new Date("2000-01-01T17:00:00+0100").toISOString())).toBe(
      false
    )
    expect(s1.test(new Date("2000-01-01T16:00:00+0100").toISOString())).toBe(
      true
    )
    expect(s1.test(new Date("2000-01-01T15:00:00+0100").toISOString())).toBe(
      true
    )
    expect(s1.test(new Date("2000-01-01T14:00:00+0100").toISOString())).toBe(
      true
    )
    expect(s2.test(new Date("2000-01-01T13:00:00Z").toISOString())).toBe(false)
    expect(s2.test(new Date("2000-01-01T14:00:00Z").toISOString())).toBe(false)
    expect(s2.test(new Date("2000-01-01T15:00:00Z").toISOString())).toBe(true)
    expect(s2.test(new Date("2000-01-01T16:00:00Z").toISOString())).toBe(true)
    expect(s2.test(new Date("2000-01-01T13:00:00+0100").toISOString())).toBe(
      false
    )
    expect(s2.test(new Date("2000-01-01T14:00:00+0100").toISOString())).toBe(
      false
    )
    expect(s2.test(new Date("2000-01-01T15:00:00+0100").toISOString())).toBe(
      false
    )
    expect(s2.test(new Date("2000-01-01T16:00:00+0100").toISOString())).toBe(
      true
    )

    const s3 = string().time().timeBeforeOrEqual("17:00")
    const s4 = string().time().timeAfterOrEqual("17:00")

    expect(s3.test("19:00")).toBe(false)
    expect(s3.test("18:00")).toBe(false)
    expect(s3.test("17:00")).toBe(true)
    expect(s3.test("16:00")).toBe(true)

    expect(s4.test("15:00")).toBe(false)
    expect(s4.test("16:00")).toBe(false)
    expect(s4.test("17:00")).toBe(true)
    expect(s4.test("18:00")).toBe(true)
  })

  ////////////////////////////////////////////////////////////////////////////////

  test("toDefault", async () => {
    const newString = "foo"
    const s1 = string().toDefault(newString)

    expect(await s1.sanitizeAsync(null)).toBe(newString)
    expect(await s1.sanitizeAsync(undefined)).toBe(newString)
    expect(await s1.sanitizeAsync(1)).toBe(newString)
    expect(await s1.sanitizeAsync("")).toBe("")
    expect(await s1.sanitizeAsync("bar")).toBe("bar")

    const s2 = string().toDefault(() => newString)

    expect(await s2.sanitizeAsync(null)).toBe(newString)
  })

  test("toUpperCase", async () => {
    const s = string().toUpperCase()

    expect(await s.sanitizeAsync("foo")).toBe("FOO")
  })

  test("toLowerCase", async () => {
    const s = string().toLowerCase()

    expect(await s.sanitizeAsync("FOO")).toBe("foo")
  })

  test("toCapitalized", async () => {
    const s = string().toCapitalized()

    expect(await s.sanitizeAsync("foo")).toBe("Foo")
    expect(await s.sanitizeAsync("foo bar")).toBe("Foo bar")
  })

  test("toCamelCase", async () => {
    const s = string().toCamelCase()

    expect(await s.sanitizeAsync("foo")).toBe("foo")
    expect(await s.sanitizeAsync("foo bar")).toBe("fooBar")
    expect(await s.sanitizeAsync("foo_bar")).toBe("fooBar")
    expect(await s.sanitizeAsync("foo-bar")).toBe("fooBar")
    expect(await s.sanitizeAsync("FOO BAR")).toBe("fooBar")
  })

  test("toSnakeCase", async () => {
    const s = string().toSnakeCase()

    expect(await s.sanitizeAsync("foo")).toBe("foo")
    expect(await s.sanitizeAsync("foo bar")).toBe("foo_bar")
    expect(await s.sanitizeAsync("fooBar")).toBe("foo_bar")
    expect(await s.sanitizeAsync("foo-bar")).toBe("foo_bar")
    expect(await s.sanitizeAsync("FOO BAR")).toBe("foo_bar")
  })

  test("toKebabCase", async () => {
    const s = string().toKebabCase()

    expect(await s.sanitizeAsync("foo")).toBe("foo")
    expect(await s.sanitizeAsync("foo bar")).toBe("foo-bar")
    expect(await s.sanitizeAsync("foo_bar")).toBe("foo-bar")
    expect(await s.sanitizeAsync("fooBar")).toBe("foo-bar")
    expect(await s.sanitizeAsync("FOO BAR")).toBe("foo-bar")
  })

  test("toConstantCase", async () => {
    const s = string().toConstantCase()

    expect(await s.sanitizeAsync("foo")).toBe("FOO")
    expect(await s.sanitizeAsync("foo bar")).toBe("FOO_BAR")
    expect(await s.sanitizeAsync("foo_bar")).toBe("FOO_BAR")
    expect(await s.sanitizeAsync("foo-bar")).toBe("FOO_BAR")
    expect(await s.sanitizeAsync("FOO BAR")).toBe("FOO_BAR")
  })

  test("toTrimmed", async () => {
    const s = string().toTrimmed()

    expect(await s.sanitizeAsync("   foo  ")).toBe("foo")
    expect(await s.sanitizeAsync("   foo   bar   ")).toBe("foo   bar")
  })

  ////////////////////////////////////////////////////////////////////////////////

  test("complex example", () => {
    const arg1 = "foo"
    const arg2 = "bar"
    const arg3 = "yolo"
    const arg4 = "swag"
    const s = string()
      .startsWith(arg1)
      .endsWith(arg2)
      .includes(arg3)
      .omits(arg4)

    expect(s.test("foo yolo")).toBe(false)
    expect(s.test("yolo bar")).toBe(false)
    expect(s.test("goo yolo bar")).toBe(false)
    expect(s.test("foo yolo gar")).toBe(false)
    expect(s.test("foo golo bar")).toBe(false)
    expect(s.test("foo yolo swag bar")).toBe(false)
    expect(s.test("foo yolo bar")).toBe(true)

    expect(s.verify(arg4)![0].message).toBe(
      translateMessage("string_starts_with", [arg1])
    )
    expect(s.verify(arg4)![1].message).toBe(
      translateMessage("string_ends_with", [arg2])
    )
    expect(s.verify(arg4)![2].message).toBe(
      translateMessage("string_includes", [arg3])
    )
    expect(s.verify(arg4)![3].message).toBe(
      translateMessage("string_omits", [arg4])
    )
  })

  test("async complex example", async () => {
    const arg1 = "foo"
    const arg2 = "bar"
    const arg3 = "yolo"
    const arg4 = "swag"
    const s = string()
      .startsWith(arg1)
      .endsWith(arg2)
      .includes(arg3)
      .omits(arg4)

    expect(await s.testAsync("foo yolo")).toBe(false)
    expect(await s.testAsync("yolo bar")).toBe(false)
    expect(await s.testAsync("goo yolo bar")).toBe(false)
    expect(await s.testAsync("foo yolo gar")).toBe(false)
    expect(await s.testAsync("foo golo bar")).toBe(false)
    expect(await s.testAsync("foo yolo swag bar")).toBe(false)
    expect(await s.testAsync("foo yolo bar")).toBe(true)

    expect((await s.verifyAsync(arg4))![0].message).toBe(
      translateMessage("string_starts_with", [arg1])
    )
    expect((await s.verifyAsync(arg4))![1].message).toBe(
      translateMessage("string_ends_with", [arg2])
    )
    expect((await s.verifyAsync(arg4))![2].message).toBe(
      translateMessage("string_includes", [arg3])
    )
    expect((await s.verifyAsync(arg4))![3].message).toBe(
      translateMessage("string_omits", [arg4])
    )
  })

  test("or", async () => {
    const s1 = string().min(3).or(string().equals("xy"))

    expect(await s1.testAsync("1")).toBe(false)
    expect(await s1.testAsync("123")).toBe(true)
    expect(await s1.testAsync("xy")).toBe(true)

    const errors1 = (await s1.verifyAsync("1"))!

    expect(errors1!.length).toBe(2)
    expect(errors1[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors1[0].link).toBe(undefined)
    expect(errors1[1].message).toBe(translateMessage("string_equals", ["xy"]))
    expect(errors1[1].link).toBe("or")

    expect(await s1.verifyAsync("123")).toBe(undefined)
    expect(await s1.verifyAsync("xy")).toBe(undefined)

    const s2 = string()
      .min(3)
      .or(string().equals("xy").or(string().equals("yx")))

    expect(await s2.testAsync("1")).toBe(false)
    expect(await s2.testAsync("123")).toBe(true)
    expect(await s2.testAsync("xy")).toBe(true)
    expect(await s2.testAsync("yx")).toBe(true)

    const errors2 = (await s2.verifyAsync("1"))!

    expect(errors2!.length).toBe(3)
    expect(errors2[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors2[0].link).toBe(undefined)
    expect(errors2[1].message).toBe(translateMessage("string_equals", ["xy"]))
    expect(errors2[1].link).toBe("or")
    expect(errors2[2].message).toBe(translateMessage("string_equals", ["yx"]))
    expect(errors2[2].link).toBe("or.or")

    expect(await s2.verifyAsync("123")).toBe(undefined)
    expect(await s2.verifyAsync("xy")).toBe(undefined)
    expect(await s2.verifyAsync("yx")).toBe(undefined)
  })

  test("lazy or", () => {
    const s = string()
      .numeric()
      .or(() => string().equals("xy"))

    expect(s.test("123")).toBe(true)
    expect(s.test("xy")).toBe(true)
    expect(s.test("abc")).toBe(false)
  })

  test("lazy empty or", () => {
    const s = string()
      .numeric()
      .or(() => undefined)

    expect(s.test("123")).toBe(true)
    expect(s.test("123abc")).toBe(true)
  })

  test("lazy void or", () => {
    const s = string().or(() => {})

    expect(s.test("abc")).toBe(true)
    expect(s.test("123")).toBe(true)
  })

  test("and", async () => {
    const s1 = string().min(2).and(string().equals("xy"))

    expect(await s1.testAsync("1")).toBe(false)
    expect(await s1.testAsync("12")).toBe(false)
    expect(await s1.testAsync("xy")).toBe(true)

    const errors1 = (await s1.verifyAsync("1"))!

    expect(errors1.length).toBe(1)
    expect(errors1[0].message).toBe(translateMessage("string_min", [2]))
    expect(errors1[0].link).toBe(undefined)

    const errors2 = (await s1.verifyAsync("12"))!
    expect(errors2[0].message).toBe(translateMessage("string_equals", ["xy"]))
    expect(errors2[0].link).toBe("and")

    expect(await s1.verifyAsync("xy")).toBe(undefined)

    const s2 = string()
      .min(2)
      .and(string().equals("xyz").and(string().length(4)))

    expect(await s2.testAsync("1")).toBe(false)
    expect(await s2.testAsync("xyz")).toBe(false)
    expect(await s2.testAsync("xyzx")).toBe(false)

    const errors3 = (await s2.verifyAsync("xy"))!

    expect(errors3.length).toBe(1)
    expect(errors3[0].message).toBe(translateMessage("string_equals", ["xyz"]))
    expect(errors3[0].link).toBe("and")

    const errors4 = (await s2.verifyAsync("xyz"))!

    expect(errors3.length).toBe(1)
    expect(errors4[0].message).toBe(translateMessage("string_length", [4]))
    expect(errors4[0].link).toBe("and.and")
  })

  test("lazy and", () => {
    const s = string().and(() => string().numeric())

    expect(s.test("abc")).toBe(false)
    expect(s.test("123")).toBe(true)
  })

  test("lazy empty and", () => {
    const s = string().and(() => undefined)

    expect(s.test("abc")).toBe(true)
    expect(s.test("123")).toBe(true)
  })

  test("lazy void and", () => {
    const s = string().and(() => {})

    expect(s.test("abc")).toBe(true)
    expect(s.test("123")).toBe(true)
  })

  test("dedupe errors", async () => {
    const s = string()
      .min(2)
      .or(string().min(2).or(string().min(2)))
      .or(string().min(2))
      .and(string().min(2).and(string().min(2)))
      .and(string().min(2))

    const errors1 = (await s.verifyAsync(""))!

    expect(errors1.length).toBe(1)
    expect(errors1[0].message).toBe(translateMessage("string_required"))

    const errors2 = (await s.verifyAsync("a"))!

    expect(errors2.length).toBe(1)
    expect(errors2[0].message).toBe(translateMessage("string_min", [2]))

    expect(await s.verifyAsync("ab")).toBe(undefined)
  })

  test("and or", () => {
    const s = string()
      .min(3)
      .or(string().min(2).and(string().equals("xy")))

    expect(s.test("1")).toBe(false)
    expect(s.test("xy")).toBe(true)

    const errors1 = s.verify("1")!

    expect(errors1.length).toBe(2)
    expect(errors1[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors1[0].link).toBe(undefined)
    expect(errors1[1].message).toBe(translateMessage("string_min", [2]))
    expect(errors1[1].link).toBe("or")

    const errors2 = s.verify("yx")!

    expect(errors2.length).toBe(2)
    expect(errors2[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors2[0].link).toBe(undefined)
    expect(errors2[1].message).toBe(translateMessage("string_equals", ["xy"]))
    expect(errors2[1].link).toBe("or.and")

    expect(s.verify("xy")).toBe(undefined)

    const errors3 = s.verify("12")!

    expect(errors3.length).toBe(2)
    expect(errors3[0].message).toBe(translateMessage("string_min", [3]))
    expect(errors3[0].link).toBe(undefined)
    expect(errors3[1].message).toBe(translateMessage("string_equals", ["xy"]))
    expect(errors3[1].link).toBe("or.and")

    const errors4 = s.verify("123")!

    expect(errors4).toBe(undefined)
  })

  test("and or at the same level", async () => {
    const s = string()
      .min(4)
      .or(string().min(3))
      .or(string().min(2))
      .and(string().endsWith("a"))

    const errors1 = (await s.verifyAsync("b"))!

    expect(errors1.length).toBe(3)
    expect(errors1[0].message).toBe(translateMessage("string_min", [4]))
    expect(errors1[0].link).toBe(undefined)
    expect(errors1[1].message).toBe(translateMessage("string_min", [3]))
    expect(errors1[1].link).toBe("or")
    expect(errors1[2].message).toBe(translateMessage("string_min", [2]))
    expect(errors1[2].link).toBe("or")

    const errors2 = (await s.verifyAsync("ab"))!

    expect(errors2.length).toBe(1)
    expect(errors2[0].message).toBe(translateMessage("string_ends_with", ["a"]))
    expect(errors2[0].link).toBe("and")

    expect(await s.verifyAsync("aa")).toBe(undefined)
    expect(await s.verifyAsync("aaa")).toBe(undefined)
    expect(await s.verifyAsync("aaaa")).toBe(undefined)
  })

  test("and returns a schema", () => {
    let length = 1
    const s = string().and(() => string().min(length))

    length = 2

    expect(s.test("1")).toBe(false)
    expect(s.test("12")).toBe(true)
  })

  test("and returns a schema result", () => {
    let length = 1
    const s = string().and((value) => string().min(length).verify(value))

    length = 2

    expect(s.test("1")).toBe(false)

    length = 1

    expect(s.test("1")).toBe(true)
  })

  test("and returns an error message", () => {
    const s = string().and(() => "too short")

    expect(s.test("1")).toBe(false)

    const errors = s.verify("12")!

    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe("too short")
    expect(errors[0].link).toBe("and")
  })

  test("also", () => {
    const s = string().also((value) => {
      if (value.length < 3) {
        return "too short"
      }
    })

    expect(s.test("12")).toBe(false)
    expect(s.test("123")).toBe(true)

    expect(s.verify("12")![0].message).toBe("too short")
    expect(s.verify("123")).toBe(undefined)
  })

  test("also returns a schema", () => {
    const s = string().also((value) => {
      if (value.length > 2) {
        return string().numeric()
      }
    })

    expect(s.test("ab")).toBe(true)
    expect(s.test("abc")).toBe(false)
    expect(s.test("123")).toBe(true)

    expect(s.verify("ab")).toBe(undefined)
    expect(s.verify("abc")![0].message).toBe(translateMessage("string_numeric"))
    expect(s.verify("123")).toBe(undefined)
  })

  test("also that returns a schema result", () => {
    const s = string().also((value) => {
      if (value.length > 2) {
        return string().numeric().verify(value)
      }
    })

    expect(s.test("ab")).toBe(true)
    expect(s.test("abc")).toBe(false)
    expect(s.test("123")).toBe(true)

    expect(s.verify("ab")).toBe(undefined)
    expect(s.verify("abc")![0].message).toBe(translateMessage("string_numeric"))
    expect(s.verify("123")).toBe(undefined)
  })

  test("also with an empty return", () => {
    const s = string().also(() => undefined)

    expect(s.also(() => undefined).test("abc")).toBe(true)
    expect(s.also(() => null).test("abc")).toBe(true)
    expect(s.also(() => false).test("abc")).toBe(true)
    expect(s.also(() => true).test("abc")).toBe(true)
  })

  test("also with a void return", () => {
    const s = string().also(() => {})

    expect(s.test("abc")).toBe(true)
    expect(s.test("123")).toBe(true)
  })

  test("also with array of strings", () => {
    const s = string().also((value) => value && ["foo", "bar"])
    const errors = s.validate("foo")

    expect(!!errors).toBe(true)
    expect(errors!.self.length).toBe(2)
    expect(errors!.self[0]).toBe("foo")
    expect(errors!.self[1]).toBe("bar")

    expect(s.optional().validate(undefined)).toBe(undefined)
  })

  test("chaining custom validators", () => {
    const s = string()
      .also((value) => {
        if (value.length < 3) {
          return "too short"
        }
      })
      .also((value) => {
        if (value.indexOf("@") === -1) {
          return "must contain @"
        }
      })

    expect(s.test("12")).toBe(false)
    expect(s.test("123")).toBe(false)
    expect(s.test("12@")).toBe(true)

    expect(s.verify("12")![0].message).toBe("too short")
    expect(s.verify("123")![0].message).toBe("must contain @")
    expect(s.verify("12@")).toBe(undefined)
  })

  test("async also", async () => {
    const s = string().also(async (value) => {
      if (value.length < 3) {
        return "too short"
      }
    })

    expect(await s.testAsync("12")).toBe(false)
    expect(await s.testAsync("123")).toBe(true)

    expect((await s.verifyAsync("12"))![0].message).toBe("too short")
    expect(await s.verifyAsync("123")).toBe(undefined)
  })

  test("map", () => {
    const s = string().map((value) => value.toString())

    expect(s.sanitize(1)).toBe("1")
  })

  test("map", () => {
    const s = string().map((value) => value.toString())

    expect(s.sanitize(1)).toBe("1")
  })

  test("async sanitizer", async () => {
    const s = string().map(async (value) => value.toString())

    expect(await s.sanitizeAsync(1)).toBe("1")
  })

  test("sanitize", () => {
    const s = string().toTrimmed().length(2)

    expect(s.sanitize(" 12 ")).toEqual("12")
  })

  test("sanitize async", async () => {
    const s = string().toTrimmed().length(2)

    expect(await s.sanitizeAsync(" 12 ")).toEqual("12")
  })

  test("sanitize and test", () => {
    const s = string().toTrimmed().length(2)

    expect(s.sanitizeAndTest(" 12 ")).toEqual([true, "12"])
  })

  test("sanitize and test async", async () => {
    const s = string().toTrimmed().length(2)

    expect(await s.sanitizeAndTestAsync(" 12 ")).toEqual([true, "12"])
  })

  test("validate with raw errors", () => {
    const s = string().min(2)
    const errors = s.verify("1")!

    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe(translateMessage("string_min", [2]))

    expect(s.verify("12")).toBe(undefined)
  })

  test("validate", () => {
    const s = string().min(2)
    const errors = s.validate("1")!

    expect(!!errors).toBe(true)
    expect(errors.self[0]).toBe(translateMessage("string_min", [2]))

    expect(s.validate("12")).toBe(undefined)
  })

  test("validate async with raw errors", async () => {
    const s = string().min(2)
    const errors = (await s.verifyAsync("1"))!

    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe(translateMessage("string_min", [2]))

    expect(await s.verifyAsync("12")).toBe(undefined)
  })

  test("validate async", async () => {
    const s = string().min(2)
    const errors = (await s.validateAsync("1"))!

    expect(!!errors).toBe(true)
    expect(errors.self[0]).toBe(translateMessage("string_min", [2]))

    expect(await s.validateAsync("12")).toBe(undefined)
  })

  test("sanitize and validate with raw errors", () => {
    const s = string().length(2).toTrimmed()
    const [errors1, value1] = s.sanitizeAndVerify("   1   ")

    expect(errors1!.length).toBe(1)
    expect(errors1![0].message).toBe(translateMessage("string_length", [2]))
    expect(value1).toEqual("1")

    const [errors2, value2] = s.sanitizeAndVerify("   12   ")
    expect(errors2).toBe(undefined)
    expect(value2).toEqual("12")
  })

  test("sanitize and validate", () => {
    const s = string().length(2).toTrimmed()
    const [errors1, value1] = s.sanitizeAndValidate("   1   ")

    expect(!!errors1).toBe(true)
    expect(errors1!.self[0]).toBe(translateMessage("string_length", [2]))
    expect(value1).toEqual("1")

    const [errors2, value2] = s.sanitizeAndValidate("   12   ")
    expect(errors2).toBe(undefined)
    expect(value2).toEqual("12")
  })

  test("sanitize and validate async with raw errors", async () => {
    const s = string().length(2).toTrimmed()
    const [errors1, value1] = await s.sanitizeAndVerifyAsync("   1   ")

    expect(errors1!.length).toBe(1)
    expect(errors1![0].message).toBe(translateMessage("string_length", [2]))
    expect(value1).toEqual("1")

    const [errors2, value2] = await s.sanitizeAndVerifyAsync("   12   ")
    expect(errors2).toBe(undefined)
    expect(value2).toEqual("12")
  })

  test("sanitize and validate async", async () => {
    const s = string().length(2).toTrimmed()
    const [errors1, value1] = await s.sanitizeAndValidateAsync("   1   ")

    expect(!!errors1).toBe(true)
    expect(errors1!.self[0]).toBe(translateMessage("string_length", [2]))
    expect(value1).toEqual("1")

    const [errors2, value2] = await s.sanitizeAndValidateAsync("   12   ")
    expect(errors2).toBe(undefined)
    expect(value2).toEqual("12")
  })

  test("validate with raw errors conditional with early exit", async () => {
    const errors1 = string()
      .and(() => false && string().min(2))
      .verify("a")
    const errors2 = await string()
      .and(() => false && string().min(2))
      .verifyAsync("a")

    expect(errors1).toBe(undefined)
    expect(errors2).toBe(undefined)

    const errors3 = string()
      .and(() => true && string().min(2))
      .verify("a")
    const errors4 = await string()
      .and(() => true && string().min(2))
      .verifyAsync("a")

    expect(errors3!.length).toBe(1)
    expect(errors3![0].message).toBe(translateMessage("string_min", [2]))
    expect(errors4!.length).toBe(1)
    expect(errors4![0].message).toBe(translateMessage("string_min", [2]))

    const errors5 = string()
      .and(() => true && string().min(2))
      .verify("aa")
    const errors6 = await string()
      .and(() => true && string().min(2))
      .verifyAsync("aa")

    expect(errors5).toBe(undefined)
    expect(errors6).toBe(undefined)
  })

  test("validate with raw errors also / also with early exit", async () => {
    const errors1 = string()
      .also(() => false && string().min(2))
      .verify("a")
    const errors2 = await string()
      .also(() => false && string().min(2))
      .verifyAsync("a")

    expect(errors1).toBe(undefined)
    expect(errors2).toBe(undefined)

    const errors3 = string()
      .and(() => true && string().min(2))
      .verify("a")
    const errors4 = await string()
      .and(() => true && string().min(2))
      .verifyAsync("a")

    expect(errors3!.length).toBe(1)
    expect(errors3![0].message).toBe(translateMessage("string_min", [2]))
    expect(errors4!.length).toBe(1)
    expect(errors4![0].message).toBe(translateMessage("string_min", [2]))

    const errors5 = string()
      .and(() => true && string().min(2))
      .verify("aa")
    const errors6 = await string()
      .and(() => true && string().min(2))
      .verifyAsync("aa")

    expect(errors5).toBe(undefined)
    expect(errors6).toBe(undefined)
  })

  test("test conditional with early exit", async () => {
    const result1 = string()
      .and(() => false && string().min(2))
      .test("a")
    const result2 = await string()
      .and(() => false && string().min(2))
      .testAsync("a")

    expect(result1).toBe(true)
    expect(result2).toBe(true)

    const result3 = string()
      .and(() => true && string().min(2))
      .test("a")
    const result4 = await string()
      .and(() => true && string().min(2))
      .testAsync("a")

    expect(result3).toBe(false)
    expect(result4).toBe(false)

    const result5 = string()
      .and(() => true && string().min(2))
      .test("aa")
    const result6 = await string()
      .and(() => true && string().min(2))
      .testAsync("aa")

    expect(result5).toBe(true)
    expect(result6).toBe(true)
  })

  test("test also / also with early exit", async () => {
    const result1 = string()
      .also(() => false && string().min(2))
      .test("a")
    const result2 = await string()
      .also(() => false && string().min(2))
      .testAsync("a")

    expect(result1).toBe(true)
    expect(result2).toBe(true)

    const result3 = string()
      .and(() => true && string().min(2))
      .test("a")
    const result4 = await string()
      .and(() => true && string().min(2))
      .testAsync("a")

    expect(result3).toBe(false)
    expect(result4).toBe(false)

    const result5 = string()
      .and(() => true && string().min(2))
      .test("aa")
    const result6 = await string()
      .and(() => true && string().min(2))
      .testAsync("aa")

    expect(result5).toBe(true)
    expect(result6).toBe(true)
  })

  test("interpolates lazy arguments into translation message", () => {
    const args = ["foo", "bar"]
    const s = string().noneOf(() => args)
    const errors = s.validate("foo")

    expect(errors?.self[0]).toBe(translateMessage("string_none_of", [args]))
  })

  ////////////////////////////////////////////////////////////////////////////////

  test("value().string()", async () => {
    const s = schema("foo").string()

    expect(s instanceof StringSchema).toBe(true)
    expect(await s.sanitizeAsync(undefined)).toBe("foo")
  })
})
