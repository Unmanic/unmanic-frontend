import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import { LocalStorage } from 'quasar'

// Dont import messages from the directory... Read them from the JSON files in the language directory
//import messages from 'src/i18n'

function loadLocaleInfo() {
  const locales = require.context('src/language', true, /(^|\/)[A-Za-z0-9_,\s-]+\.json$/i)
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9_-]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return { id: locales.id, messages }
}

const { id, messages } = loadLocaleInfo()

// Read configured local from localStorage
let configuredLocale = LocalStorage.getItem('locale')
if (configuredLocale === null) {
  // Default to English
  configuredLocale = 'en';
}

const i18n = createI18n({
  locale: configuredLocale,
  fallbackLocale: 'en',
  messages
})

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})

export { i18n }
