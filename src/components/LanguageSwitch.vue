<template>
  <q-select
    v-model="locale"
    :options="localeOptions"
    :label="$t('buttons.language')"
    dense
    borderless
    emit-value
    map-options
    options-dense
    style="min-width: 150px"
  />
</template>

<script>
import { LocalStorage } from 'quasar'
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const { locale } = useI18n({ useScope: 'global' })

    // Use ISO codes from table: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    return {
      locale,
      localeOptions: [
        { value: 'en', label: 'English' },
        { value: 'mi', label: 'Maori/te reo Māori' },
        { value: 'zh', label: 'Chinese/中文' },
        { value: 'nl', label: 'Dutch/Nederlands' },
        { value: 'fr', label: 'French/français' },
        { value: 'de', label: 'German/Deutsch' },
        { value: 'it', label: 'Italian/Italiano' },
        { value: 'ja', label: 'Japanese/日本語' },
        { value: 'pl', label: 'Polish/Polskie' },
        { value: 'pt-br', label: 'Portuguese (Brazil)/Português' },
        { value: 'ru', label: 'Russian/русский' },
        { value: 'es', label: 'Spanish/Español' },
        { value: 'sv', label: 'Swedish/Svenska' }
      ]
    }
  },
  watch: {
    locale(lang) {
      LocalStorage.set('locale', lang)
    }
  }
}
</script>
