import { ValidationType } from "./types"
import { schemaTranslator } from "./schemaTranslator"
import isFunction from "lodash/isFunction"

export const translateMessage = (
  key: ValidationType,
  args: any[] = [],
  language?: string,
  fallbackLanguage?: string
) => {
  const interpolations = Object.fromEntries(
    args.map((v, i) => [i + 1, isFunction(v) ? v() : v])
  )

  return schemaTranslator.get(key, {
    replace: interpolations,
    language,
    fallbackLanguage,
  })
}
