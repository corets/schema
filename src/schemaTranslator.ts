import i18next from "i18next"

import en from "./locales/en.json"
import de from "./locales/de.json"
import fr from "./locales/fr.json"
import it from "./locales/it.json"
import ru from "./locales/ru.json"

export const schemaTranslator = i18next.createInstance({
  lng: "en",

  resources: {
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    it: { translation: it },
    ru: { translation: ru },
  },
})

schemaTranslator.init()
