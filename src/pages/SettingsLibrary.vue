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

              <!--START LIBRARY PATHS-->
              <h5 class="q-mb-none">{{ $t('components.settings.library.path') }}</h5>
              <q-skeleton
                v-if="libraryPath === null"
                type="QInput"/>
              <q-input
                v-else
                readonly
                outlined
                color="primary"
                v-model="libraryPath"
                :label="$t('components.settings.library.path')"
                :placeholder="libraryPath"
                @click="updateLibraryWithDirectoryBrowser">
                <template v-slot:append>
                  <q-icon
                    @click="updateLibraryWithDirectoryBrowser"
                    class="cursor-pointer"
                    name="folder_open"/>
                </template>
              </q-input>
              <!--END LIBRARY PATHS-->

              <q-separator class="q-my-lg"/>

              <!--START LIBRARY SCANNER-->
              <h5 class="q-mb-none">{{ $t('components.settings.library.libraryScanner') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="enableLibraryScanner === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="enableLibraryScanner"
                  :label="$t('components.settings.library.enableLibraryScanner')"
                />
              </div>
              <q-skeleton
                v-if="libraryScanSchedule === null"
                type="QInput"/>
              <q-input
                v-if="enableLibraryScanner && libraryScanSchedule !== null"
                outlined
                type="number"
                v-model="libraryScanSchedule"
                :label="$t('components.settings.library.libraryScannerSchedule')"
                lazy-rules
                :rules="[
                  val => val !== null && val !== '' || $t('components.settings.library.libraryScannerScheduleNotValid'),
                  val => val > 0 || $t('components.settings.pleaseEnterAValidNumber')
                ]"
              />
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="libraryScanFollowSymlinks === null"
                  type="QToggle"/>
                <q-toggle
                  v-if="enableLibraryScanner && libraryScanFollowSymlinks !== null"
                  v-model="libraryScanFollowSymlinks"
                  :label="$t('components.settings.library.followSymlinks')"
                />
              </div>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="runLibraryScanOnStart === null"
                  type="QToggle"/>
                <q-toggle
                  v-if="enableLibraryScanner && runLibraryScanOnStart !== null"
                  v-model="runLibraryScanOnStart"
                  :label="$t('components.settings.library.runLibraryScanOnStart')"
                />
              </div>
              <!--END LIBRARY SCANNER-->

              <q-separator class="q-my-lg"/>

              <!--START LIBRARY FILE MONITOR-->
              <h5 class="q-mb-none">{{ $t('components.settings.library.fileMonitor') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="enableLibraryFileMonitor === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="enableLibraryFileMonitor"
                  :label="$t('components.settings.library.enableLibraryFileMonitor')"
                />
              </div>
              <!--END LIBRARY SCANNER-->

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
            <!--<q-card
              flat
              bordered
              @click="$router.push('/ui/settings-library')"
              class="bg-grey-1 q-ma-xs">
              <q-btn
                icon="navigate_before"
                flat>
                Library
              </q-btn>
            </q-card>-->
          </div>
          <div class="col-6 text-center">
            <q-card
              flat
              bordered
              @click="$router.push('/ui/settings-workers')"
              class="bg-grey-1 q-ma-xs">
              <q-btn
                icon-right="navigate_next"
                flat>
                Workers
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
      libraryPath: ref(null),
      enableLibraryScanner: ref(null),
      libraryScanSchedule: ref(null),
      libraryScanFollowSymlinks: ref(null),
      runLibraryScanOnStart: ref(null),
      enableLibraryFileMonitor: ref(null),
    }
  },
  methods: {
    updateLibraryWithDirectoryBrowser: function () {
      this.$q.dialog({
        component: DirectoryBrowserDialog,
        componentProps: {
          dialogHeader: this.$t('headers.selectDirectory'),
          initialPath: this.libraryPath,
          listType: 'directories'
        },
      }).onOk((payload) => {
        if (typeof payload.selectedPath !== 'undefined' && payload.selectedPath !== null) {
          this.libraryPath = payload.selectedPath
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
        this.libraryPath = response.data.settings.library_path
        this.enableLibraryScanner = response.data.settings.enable_library_scanner
        this.libraryScanSchedule = response.data.settings.schedule_full_scan_minutes
        this.libraryScanFollowSymlinks = response.data.settings.follow_symlinks
        this.runLibraryScanOnStart = response.data.settings.run_full_scan_on_start
        this.enableLibraryFileMonitor = response.data.settings.enable_inotify
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
          library_path: this.libraryPath,
          enable_library_scanner: this.enableLibraryScanner,
          schedule_full_scan_minutes: this.libraryScanSchedule,
          follow_symlinks: this.libraryScanFollowSymlinks,
          run_full_scan_on_start: this.runLibraryScanOnStart,
          enable_inotify: this.enableLibraryFileMonitor,
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
