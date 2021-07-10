import { createTranslator } from "@corets/translator"

import en from "./locales/en"
import de from "./locales/de"
import fr from "./locales/fr"
import it from "./locales/it"
import es from "./locales/es"
import ru from "./locales/ru"

export const schemaTranslator = createTranslator(
  { en, de, fr, it, es, ru },
  { language: "en" }
)
