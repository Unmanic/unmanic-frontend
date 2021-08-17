<template>
  <SettingsNav v-on:page="setIframeSrc"/>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <div class="row">
        <div class="col q-ma-sm">
          <PluginsInstalledTable/>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script>
import SettingsNav from "components/SettingsNav";
import PluginsInstalledTable from "components/PluginsInstalledTable";
import { UnmanicWebsocketHandler } from "src/js/unmanicWebsocket";
import { onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

export default {
  components: { PluginsInstalledTable, SettingsNav },
  methods: {
    setIframeSrc(pageName) {
      this.$router.push('/unmanic-settings?step=' + pageName)
    }
  },
  setup() {
    const { t: $t } = useI18n();
    let ws = null;
    let unmanicWSHandler = UnmanicWebsocketHandler($t);

    function initPluginsWebsocket() {
      ws = unmanicWSHandler.init();
    }

    function closePluginsWebsocket() {
      unmanicWSHandler.close();
    }

    onMounted(() => {
      // Start the websocket
      initPluginsWebsocket();
    })

    onUnmounted(() => {
      // Close the websocket
      closePluginsWebsocket();
    })

  }
}
</script>
