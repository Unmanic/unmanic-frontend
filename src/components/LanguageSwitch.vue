<template>
  <q-select
    v-model="locale"
    :options="localeOptions"
    label="Language"
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

    return {
      locale,
      localeOptions: [
        { value: 'en-NZ', label: 'English' },
        { value: 'nl-NL', label: 'Dutch' }
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
