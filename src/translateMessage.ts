import { ValidationType } from "./types"
import { schemaTranslator } from "./schemaTranslator"

export const translateMessage = (
  key: ValidationType,
  args: any[] = [],
  language?: string,
  fallbackLanguage?: string
) => {
  const interpolations = Object.fromEntries(args.map((v, i) => [i + 1, v]))

  return schemaTranslator.t(key, {
    ...interpolations,
    lng: language,
    fallbackLng: fallbackLanguage,
  })
}
