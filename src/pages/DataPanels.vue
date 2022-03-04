<template>
  <q-page>
    <div class="iframe-container">

      <iframe
        v-if="(iframeSrc !== null)"
        id="data-panel-iframe"
        :src="iframeSrc">
        Your browser is not supported. Sorry.
      </iframe>

      <div v-else>
        <div class="full-width row flex-center text-negative q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied"/>
          <q-item-label>{{ $t('components.dataPanels.noDataPanelsEnabled') }}</q-item-label>
          <q-icon size="2em" name="priority_high"/>
        </div>

        <div class="full-width row flex-center text-negative absolute-center">
          <q-icon
            size="512px"
            name="warning_amber"
          />
        </div>
      </div>

    </div>
  </q-page>
</template>

<script>

import { ref } from "vue";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { LocalStorage } from "quasar";

export default {
  data() {
    const iframeSrc = ref(null)
    return {
      page: '',
      iframeSrc,
      iframeHeight: '0px',
    };
  },
  created() {
    console.debug('Component has been created!');
    //window.addEventListener('message', this.resizeIframe);
    if (typeof this.$route.query !== 'undefined' && typeof this.$route.query.pluginId !== 'undefined') {
      console.debug("Initial update using query in uri - " + this.$route.query.pluginId)
      this.setPageFromParams(this.$route.query.pluginId);
    } else {
      console.debug("Fetching enabled panel plugins list and setting the first result as current window")
      this.setPageAsFirstEnabledPanel();
    }
  },
  methods: {
    setPageFromParams(pluginId) {
      if (typeof pluginId !== 'undefined') {
        let theme = LocalStorage.getItem('theme');
        console.debug('setting iframe url to "/unmanic/panel/' + pluginId + '/?theme=' + theme + '"')
        this.iframeSrc = '/unmanic/panel/' + pluginId + '/?theme=' + theme;
      }
    },
    setPageAsFirstEnabledPanel() {
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'plugins/panels/enabled'),
      }).then((response) => {
        // Success
        if (response.data.results.length > 0) {
          let first = response.data.results[0];
          this.setPageFromParams(first.plugin_id);
        }
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchEnabledDataPanelPlugins'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    }
  },
  watch: {
    $route(to, from) {
      if (typeof to.query !== 'undefined') {
        console.debug("Detected change in route with query in uri - " + to.query.pluginId)
        this.setPageFromParams(to.query.pluginId);
      }
    }
  }
}
</script>

<style>
.iframe-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 20px;
}

.iframe-container iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
