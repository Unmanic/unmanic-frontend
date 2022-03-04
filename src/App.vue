<template>
  <router-view/>
</template>
<script>
import { defineComponent } from 'vue';
import { LocalStorage, setCssVar, useQuasar } from "quasar";
import { setTheme } from "src/js/unmanicGlobals";

export default defineComponent({
  name: 'App',
  setup() {
    const $q = useQuasar();
    let darkMode;
    let configuredTheme = LocalStorage.getItem('theme');
    darkMode = false;
    if (configuredTheme === 'dark') {
      darkMode = true;
    }
    setTheme(configuredTheme)
    $q.dark.set(darkMode);
  }
})
</script>
