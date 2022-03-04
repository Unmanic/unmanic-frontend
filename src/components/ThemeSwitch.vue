<template>
  <q-toggle
    :icon="unmanicDarkMode? 'dark_mode' : 'light_mode'"
    color="secondary"
    v-model="unmanicDarkMode"/>
</template>

<script>
import { LocalStorage, useQuasar } from 'quasar'
import { ref } from "vue";
import { setTheme } from "src/js/unmanicGlobals";

export default {
  setup() {
    const $q = useQuasar();
    const unmanicDarkMode = ref($q.dark.isActive);
    return {
      unmanicDarkMode,
    }
  },
  watch: {
    unmanicDarkMode(mode) {
      if (mode) {
        LocalStorage.set('theme', 'dark');
        this.$q.dark.set(true);
        setTheme('dark')
      } else {
        LocalStorage.set('theme', 'light');
        this.$q.dark.set(false);
        setTheme('light')
      }
    }
  }
}
</script>
