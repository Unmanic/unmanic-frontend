<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <div class="row">
        <div class="col q-ma-sm">

          <div class="row">
            <div class="col-sm-6 col-xs-12">

              <!--START CONFIGURATION-->
              <h5 class="q-mb-none q-mt-sm">{{ $t('components.settings.support.configuration') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="debugging === null"
                  type="QToggle"/>
                <div class="q-pa-md" style="max-width: 350px">
                  <q-list
                    padding
                    class="rounded-borders">

                    <q-item>
                      <q-item-section avatar>
                        <q-img src="~assets/unmanic-logo-white.png"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.appVersion') }}:</q-item-label>
                        <q-item-label caption>{{ appVersion }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator spaced inset="item"/>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon color="primary" name="fab fa-python"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.pythonVersion') }}:</q-item-label>
                        <q-item-label caption>{{ pythonVersion }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator spaced inset="item"/>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon color="primary" name="computer"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.platform') }}:</q-item-label>
                        <q-item-label caption>{{ platform }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator spaced inset="item"/>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon color="primary" name="fas fa-folder"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.configPath') }}:</q-item-label>
                        <q-item-label caption>{{ configPath }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon color="primary" name="fas fa-folder"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.logsPath') }}:</q-item-label>
                        <q-item-label caption>{{ logsPath }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon color="primary" name="fas fa-folder"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('components.settings.support.userdataPath') }}:</q-item-label>
                        <q-item-label caption>{{ userdataPath }}</q-item-label>
                      </q-item-section>
                    </q-item>

                  </q-list>
                </div>
              </div>
              <!--END CONFIGURATION-->

            </div>
            <div class="col-sm-6 col-xs-12">

              <!--START EXT DOC LINKS-->
              <h5 class="q-mb-none q-mt-sm">{{ $t('components.settings.support.docs') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="debugging === null"
                  type="QToggle"/>
                <div class="q-pa-md" style="max-width: 550px">
                  <q-list
                    dense
                    padding
                    class="rounded-borders">

                    <q-item>
                      <q-item-section>
                        <q-btn
                          outline
                          color="secondary"
                          class="full-width support-link-button"
                          @click="openExternalURL('/unmanic/swagger')">
                          <div class="row items-center full-width no-wrap">
                            <q-icon color="primary" name="article" class="q-mr-sm"/>
                            <div class="col">{{ $t('components.settings.support.apiSpec') }}</div>
                            <q-icon name="open_in_new" color="secondary"/>
                          </div>
                        </q-btn>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-btn
                          outline
                          color="secondary"
                          class="full-width support-link-button"
                          @click="openExternalURL('https://docs.unmanic.app/docs/')">
                          <div class="row items-center full-width no-wrap">
                            <q-icon color="primary" name="article" class="q-mr-sm"/>
                            <div class="col">{{ $t('components.settings.support.applicationDocumentation') }}</div>
                            <q-icon name="open_in_new" color="secondary"/>
                          </div>
                        </q-btn>
                      </q-item-section>
                    </q-item>

                  </q-list>
                </div>
              </div>
              <!--END EXT DOC LINKS-->

              <!--START EXT SUPPORT LINKS-->
              <h5 class="q-mb-none q-mt-sm">{{ $t('components.settings.support.support') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="debugging === null"
                  type="QToggle"/>
                <div class="q-pa-md" style="max-width: 550px">
                  <q-list
                    dense
                    padding
                    class="rounded-borders">

                    <q-item>
                      <q-item-section>
                        <q-btn
                          outline
                          color="secondary"
                          class="full-width support-link-button"
                          @click="openExternalURL('https://github.com/Unmanic/unmanic/issues')">
                          <div class="row items-center full-width no-wrap">
                            <q-icon color="primary" name="fab fa-github" class="q-mr-sm"/>
                            <div class="col">{{ $t('components.settings.support.unmanicAppSourceRequests') }}</div>
                            <q-icon name="open_in_new" color="secondary"/>
                          </div>
                        </q-btn>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-btn
                          outline
                          color="secondary"
                          class="full-width support-link-button"
                          @click="openExternalURL('https://github.com/Unmanic/unmanic-frontend/issues')">
                          <div class="row items-center full-width no-wrap">
                            <q-icon color="primary" name="fab fa-github" class="q-mr-sm"/>
                            <div class="col">{{ $t('components.settings.support.unmanicFrontendSourceRequests') }}</div>
                            <q-icon name="open_in_new" color="secondary"/>
                          </div>
                        </q-btn>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-btn
                          outline
                          color="secondary"
                          class="full-width support-link-button"
                          @click="openExternalURL('https://github.com/Unmanic/unmanic-plugins/issues')">
                          <div class="row items-center full-width no-wrap">
                            <q-icon color="primary" name="fab fa-github" class="q-mr-sm"/>
                            <div class="col">{{ $t('components.settings.support.unmanicOfficialPluginRequests') }}</div>
                            <q-icon name="open_in_new" color="secondary"/>
                          </div>
                        </q-btn>
                      </q-item-section>
                    </q-item>

                  </q-list>
                </div>
              </div>
              <!--END EXT DOC LINKS-->

            </div>
          </div>

          <q-separator/>

          <div class="q-pa-md" style="max-width: 600px">
            <h5 class="q-mb-none q-mt-sm">{{ $t('components.settings.support.logs') }}</h5>
            <div class="column">
              <!--START DEBUGGING ENABLE-->
              <div class="row q-gutter-sm items-stretch">
                <div class="col-12">
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

                <!--START BUFFER RETENTION-->
                <div class="col-12">
                  <q-btn-dropdown
                    outline
                    color="secondary"
                    :label="$t('components.settings.support.confLogBufferRetentionLabel')"
                  >
                    <q-list>
                      <q-item
                        v-for="(val, label) in retentionOptions"
                        :key="val"
                        clickable
                        v-close-popup
                        @click="setLogRetention(val)"
                      >
                        <q-item-section>
                          <q-item-label>{{ label }}</q-item-label>
                        </q-item-section>
                        <!-- Optional checkmark if you have the current value available -->
                        <q-item-section side v-if="settings?.log_buffer_retention === val">
                          <q-icon name="check"/>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                  <!--END BUFFER RETENTION-->
                </div>
              </div>
            </div>
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

                <q-space class="gt-xs"/>

                <div class="col-12 col-sm-auto q-mt-sm q-mt-sm-none">
                  <q-btn
                    @click="downloadLogs"
                    outline
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
import axios from "axios";
import unmanicGlobals, { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { openURL } from 'quasar'

export default {
  name: 'SettingsLibrary',
  setup() {
    const $q = useQuasar()
    const { t: $t } = useI18n();

    const currentLog = ref([]);
    const logsPath = ref('');

    const appVersion = ref(null);
    const pythonVersion = ref(null);
    const platform = ref(null);
    const configPath = ref(null);
    const userdataPath = ref(null);

    /**
     * Unmanic WS handle
     * @type {null}
     */
    let ws = null;
    let serverId = null;
    let unmanicWSHandler = UnmanicWebsocketHandler($t);

    function updateServerLogs(data) {
      currentLog.value = data.system_logs;
      let styledLogs = [];
      for (let i = 0; i < data.system_logs.length; i++) {
        let logLine = data.system_logs[i];

        // Highlight paths
        logLine = logLine.replace(/\/[\/|.|\s|\w|-]+/, "<span style='color:var(--q-secondary);'>$&</span>")

        // Debug logs
        logLine = logLine.replace(/[\d(\-|T|\:)]+\:DEBUG:[\w(\.|\-)]+/, "<span style='color:var(--q-primary);'>$&</span>")

        // Warning logs
        logLine = logLine.replace(/[\d(\-|T|\:)]+\:WARNING:[\w(\.|\-)]+/, "<span style='color:var(--q-warning);'>$&</span>")

        // Error logs
        logLine = logLine.replace(/[\d(\-|T|\:)]+\:ERROR:[\w(\.|\-)]+/, "<span style='color:var(--q-negative);'>$&</span>")

        styledLogs[i] = logLine;
      }
      currentLog.value = styledLogs;
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
      logsPath,
      appVersion,
      pythonVersion,
      platform,
      configPath,
      userdataPath,
    }
  },
  data() {
    return {
      debugging: ref(null),
      retentionOptions: {
        'Disabled': 0,
        '1 day': 1,
        '3 days': 3,
        '5 days': 5,
        '7 days': 7,
        '14 days': 14
      }
    }
  },
  methods: {
    openExternalURL: function (url) {
      openURL(url)
    },
    fetchSettings: function () {
      // Fetch current settings
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/read')
      }).then((response) => {
        this.debugging = response.data.settings.debugging

        // Set system configuration paths
        this.configPath = response.data.settings.config_path;
        this.logsPath = response.data.settings.log_path;
        this.userdataPath = response.data.settings.userdata_path;

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
    fetchSystemConfig: function () {
      // Fetch unmanic version
      unmanicGlobals.getUnmanicVersion().then((version) => {
        this.appVersion = version;
      })
      // Fetch system config
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/configuration')
      }).then((response) => {
        let configuration = response.data.configuration;

        // Set python versoin
        this.pythonVersion = configuration.python;

        // Set platform data
        if (typeof configuration.platform !== 'undefined' && configuration.platform.length > 0) {
          let platform = configuration.platform.join(' ');
          console.log(platform)
          this.platform = platform;
        }

      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchSystemConfig'),
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
    setLogRetention(value) {
      const retention = parseInt(value, 10);
      if (Number.isNaN(retention)) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSaveSettings'),
          icon: 'report_problem'
        });
        return;
      }

      const data = {
        settings: {
          log_buffer_retention: retention,
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
    },
  },
  created() {
    this.fetchSettings();
    this.fetchSystemConfig();
  }
}
</script>

<style lang="scss">
.system-log-content p {
  margin: 0 0;
  white-space: pre-wrap;
}

.support-link-button {
  text-align: left;
}

.support-link-button .q-btn__content {
  min-height: 56px;
}

.support-link-button + .support-link-button {
  margin-top: 8px;
}
</style>
