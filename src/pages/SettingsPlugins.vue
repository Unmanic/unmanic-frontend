<template>
  <q-page padding class="page-with-mobile-quick-nav">
    <!-- content -->

    <div class="q-pa-none">

      <div class="col-12 col-sm-12 col-md-10 col-lg-8">
        <div :class="$q.platform.is.mobile ? 'q-ma-sm' : 'q-ma-sm q-pa-md'">

          <q-form class="q-gutter-md">
            <h5 class="q-mb-none">{{ $t('components.plugins.pathConfiguration') }}</h5>
            <PluginsInstalledTable/>
          </q-form>
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

<style>
.page-with-mobile-quick-nav {
  padding-bottom: 24px;
}

@media (max-width: 1023px) {
  .page-with-mobile-quick-nav {
    padding-bottom: 96px;
  }
}
</style>
