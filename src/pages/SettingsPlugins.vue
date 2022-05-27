<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <div class="row">
        <div class="col q-ma-sm">
          <PluginsInstalledTable/>
        </div>
      </div>

      <MobileSettingsQuickNav
        v-bind:prevEnabled="true"
        v-bind:prevLabel="$t('navigation.workers')"
        v-bind:prevPath="'/ui/settings-workers'"
        v-bind:nextEnabled="true"
        v-bind:nextLabel="$t('navigation.link')"
        v-bind:nextPath="'/ui/settings-link'"/>

    </div>
  </q-page>
</template>

<script>
import PluginsInstalledTable from "components/PluginsInstalledTable";
import { UnmanicWebsocketHandler } from "src/js/unmanicWebsocket";
import { onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import MobileSettingsQuickNav from "components/MobileSettingsQuickNav";

export default {
  components: { MobileSettingsQuickNav, PluginsInstalledTable },
  setup() {
    const { t: $t } = useI18n();

    /**
     * Unmanic WS handle
     * @type {null}
     */
    let ws = null;
    let unmanicWSHandler = UnmanicWebsocketHandler($t);

    function initUnmanicWebsocket() {
      ws = unmanicWSHandler.init();
    }

    function closeUnmanicWebsocket() {
      unmanicWSHandler.close();
    }

    // END UNMANIC WS HANDLE

    onMounted(() => {
      // Start the websocket
      initUnmanicWebsocket();
    })
    onUnmounted(() => {
      // Close the websocket
      closeUnmanicWebsocket();
    })
  }
}
</script>
