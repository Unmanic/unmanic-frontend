<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <div class="row">
        <div class="col q-ma-sm">

          <div class="q-pa-md" style="max-width: 400px">

            <!--START DEBUGGING ENABLE-->
            <h5 class="q-mb-none">{{ $t('components.settings.support.logs') }}</h5>
            <div class="q-gutter-sm">
              <q-skeleton
                v-if="debugging === null"
                type="QToggle"/>
              <q-toggle
                v-else
                v-model="debugging"
                @update:model-value="toggleDebugging(debugging)"
                :label="$t('components.settings.support.enableDebugging')"/>
            </div>
            <!--END DEBUGGING ENABLE-->

          </div>

        </div>
      </div>

      <div class="row">
        <div class="col">

          <!--START LIVE LOG-->
          <q-card
            flat
            bordered
            style="width: 2000px; max-width: 100%;">

            <q-card-section>
              <div class="row items-center">
                <div class="col-sm-6 col-xs-12">
                  <div class="text-h6">{{ $t('components.settings.support.currentSystemLogs') }}:</div>
                  <div class="text-subtitle2">{{ logsPath }}</div>
                </div>

                <div class="col-auto">
                  <q-btn
                    @click="downloadLogs"
                    color="secondary"
                    icon-right="file_download"
                    :label="$t('components.settings.support.downloadSystemLogs')"/>
                </div>
              </div>
            </q-card-section>

            <q-separator/>

            <q-card-section>
              <q-skeleton
                v-if="currentLog.length === 0"
                style="width: 100%"
                type="text"/>
              <div
                v-else
                :class="$q.platform.is.mobile ? '' : 'q-px-lg'"
                class="system-log-content">
                <p
                  v-for="(line, index) in currentLog"
                  v-bind:key="index"
                  v-html="line"></p>
              </div>
            </q-card-section>

          </q-card>
          <!--END LIVE LOG-->

        </div>
      </div>


    </div>
  </q-page>
</template>

<script>
import { UnmanicWebsocketHandler } from "src/js/unmanicWebsocket";
import { onMounted, onUnmounted, ref } from "vue";
import { useQuasar } from 'quasar'
import { useI18n } from "vue-i18n";
import DirectoryBrowserDialog from "components/DirectoryBrowserDialog";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import dateTools from "src/js/dateTools";

export default {
  name: 'SettingsLibrary',
  setup() {
    const $q = useQuasar()
    const { t: $t } = useI18n();

    const currentLog = ref([]);
    const logsPath = ref('');

    /**
     * Unmanic WS handle
     * @type {null}
     */
    let ws = null;
    let serverId = null;
    let unmanicWSHandler = UnmanicWebsocketHandler($t);

    function updateServerLogs(data) {
      currentLog.value = data.system_logs;
      logsPath.value = data.logs_path;
    }

    function initUnmanicWebsocket() {
      ws = unmanicWSHandler.init();
      serverId = unmanicWSHandler.serverId;

      unmanicWSHandler.addEventListener('open', 'start_system_logs', function (evt) {
        ws.send(JSON.stringify({ command: 'start_system_logs', params: {} }));
      });

      unmanicWSHandler.addEventListener('message', 'handle_system_logs', function (evt) {
        if (typeof evt.data === 'string') {
          let jsonData = JSON.parse(evt.data);
          if (jsonData.success) {
            // Parse data type and update the dashboard
            switch (jsonData.type) {
              case 'system_logs':
                updateServerLogs(jsonData.data);
                break;
            }
          } else {
            console.error('WebSocket Error: Received contained errors - ' + evt.data);
          }
        } else {
          console.error('WebSocket Error: Received data was not JSON - ' + evt.data);
        }
      });
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

    return {
      currentLog,
      logsPath
    }
  },
  data() {
    return {
      debugging: ref(null),
    }
  },
  methods: {
    fetchSettings: function () {
      // Fetch current settings
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/read')
      }).then((response) => {
        this.debugging = response.data.settings.debugging
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    toggleDebugging(value) {
      let data = {
        settings: {
          debugging: value,
        }
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/write'),
        data: data
      }).then((response) => {
        // Save success, show feedback
        this.fetchSettings();
        this.$q.notify({
          color: 'positive',
          position: 'top',
          icon: 'cloud_done',
          message: this.$t('notifications.saved'),
          timeout: 200
        })
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSaveSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    downloadLogs() {
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'docs/logs/zip'),
        responseType: 'blob', // Important
      }).then((response) => {
        // Save success, create download link under body and click it
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'UnmanicLogs.zip');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSaveSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    }
  },
  created() {
    this.fetchSettings();
  }
}
</script>

<style lang="scss">
.system-log-content p {
  margin: 0 0;
}
</style>
