<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <!--      <h4 class="q-ma-none">{{ $t('headers.librarySettings') }}</h4>-->

      <div class="row">
        <div class="col q-ma-sm">

          <div class="q-pa-md" style="max-width: 400px">

            <q-form
              @submit="save"
              class="q-gutter-md"
            >

              <!--START WORKER COUNT-->
              <h5 class="q-mb-none">{{ $t('components.settings.workers.workerCount') }}</h5>
              <q-skeleton
                v-if="workerCount === null"
                type="QInput"/>
              <q-input
                v-if="workerCount !== null"
                readonly
                outlined
                color="primary"
                v-model="workerCount"
                :label="$t('components.settings.workers.workerCount')"
                :placeholder="workerCount">
                <!--                <template v-slot:append>
                                  <q-icon
                                    @click="updateLibraryWithDirectoryBrowser"
                                    class="cursor-pointer"
                                    name="folder_open"/>
                                </template>-->
              </q-input>
              <q-skeleton
                v-if="workerCount === null"
                type="QSlider"/>
              <q-slider
                v-if="workerCount !== null"
                v-model="workerCount"
                :min="1"
                :max="12"
                color="primary"
              />
              <!--END WORKER COUNT-->

              <q-separator class="q-my-lg"/>

              <!--START CACHE PATHS-->
              <h5 class="q-mb-none">{{ $t('components.settings.workers.path') }}</h5>
              <q-skeleton
                v-if="cachePath === null"
                type="QInput"/>
              <q-input
                v-else
                readonly
                outlined
                color="primary"
                v-model="cachePath"
                :label="$t('components.settings.workers.path')"
                :placeholder="cachePath"
                @click="updateLibraryWithDirectoryBrowser">
                <template v-slot:append>
                  <q-icon
                    @click="updateLibraryWithDirectoryBrowser"
                    class="cursor-pointer"
                    name="folder_open"/>
                </template>
              </q-input>
              <!--END CACHE PATHS-->

              <div>
                <q-btn :label="$t('navigation.submit')" type="submit" color="secondary"/>
              </div>
            </q-form>

          </div>

        </div>
      </div>

      <!--START QUICK NAV-->
      <div v-if="$q.platform.is.mobile">
        <q-separator class="q-mb-lg"/>
        <div class="row">
          <div class="col-6 text-center">
            <q-card
              flat
              bordered
              @click="$router.push('/ui/settings-library')"
              class="bg-grey-1 q-ma-xs">
              <q-btn
                icon="navigate_before"
                flat>
                Library
              </q-btn>
            </q-card>
          </div>
          <div class="col-6 text-center">
            <q-card
              flat
              bordered
              @click="$router.push('/ui/settings-plugins')"
              class="bg-grey-1 q-ma-xs">
              <q-btn
                icon-right="navigate_next"
                flat>
                Plugins
              </q-btn>
            </q-card>
          </div>
        </div>
      </div>
      <!--END QUICK NAV-->

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

export default {
  name: 'SettingsLibrary',
  setup() {
    const $q = useQuasar()
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
  },
  data() {
    return {
      workerCount: ref(null),
      cachePath: ref(null),
    }
  },
  methods: {
    updateLibraryWithDirectoryBrowser: function () {
      this.$q.dialog({
        component: DirectoryBrowserDialog,
        componentProps: {
          dialogHeader: this.$t('headers.selectDirectory'),
          initialPath: this.cachePath,
          listType: 'directories'
        },
      }).onOk((payload) => {
        if (typeof payload.selectedPath !== 'undefined' && payload.selectedPath !== null) {
          this.cachePath = payload.selectedPath
        }
      }).onDismiss(() => {
      })
    },
    fetchSettings: function () {
      // Fetch current settings
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/read')
      }).then((response) => {
        this.workerCount = response.data.settings.number_of_workers
        this.cachePath = response.data.settings.cache_path
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
    save: function () {
      // Save settings
      let data = {
        settings: {
          number_of_workers: this.workerCount,
          cache_path: this.cachePath,
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
    }
  },
  created() {
    this.fetchSettings();
  }
}
</script>
