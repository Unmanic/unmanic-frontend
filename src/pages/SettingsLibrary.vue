<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <!--      <h4 class="q-ma-none">{{ $t('headers.librarySettings') }}</h4>-->

      <div class="row">
        <div class="col-sm-12 col-md-10 col-lg-8">
          <div :class="$q.platform.is.mobile ? 'q-ma-sm' : 'q-ma-sm q-pa-md'">

            <q-form
              @submit="save"
              class="q-gutter-md"
            >

              <!--START LIBRARY PATHS-->
              <h5 class="q-mb-none">{{ $t('components.settings.library.pathConfiguration') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="libraryPaths === null"
                  type="text"/>

                <q-list
                  bordered
                  separator
                  class="rounded-borders">

                  <q-item
                    v-for="(path, index) in libraryPaths"
                    v-bind:key="index"
                    active-class="library-path-list-item">
                    <q-item-section avatar>
                      <q-avatar text-color="grey-8" icon="source"/>
                      <q-tooltip>
                        <!--Indicate the default library-->
                        <span
                          v-if="index === 0"
                          class="text-weight-bold">
                          ({{ $t('components.settings.library.defaultLibrary') }})
                        <br>
                        </span>
                        <!--Indicate library path-->
                        <span class="text-weight-bold">{{ $t('components.settings.library.path') }}:</span>
                        <span v-if="path.enableRemoteOnly">
                          ({{ $t('components.settings.library.libraryRemoteOnlyStatus') }})
                        </span>
                        <span v-else>
                          {{ path.path }}
                        </span>
                        <br>
                        <!--Indicate library tags-->
                        <span class="text-weight-bold">{{ $t('components.settings.common.tags') }}:</span>
                        {{ path.tags.join(', ') || $t('status.none') }}
                      </q-tooltip>
                    </q-item-section>

                    <q-item-section class="q-px-sm q-mx-sm">
                      <!--Library Name-->
                      <q-item-label v-if="index === 0">
                        {{ path.name }} *
                        <q-tooltip>
                          {{ $t('tooltips.defaultLibrary') }}
                        </q-tooltip>
                      </q-item-label>
                      <q-item-label v-else>
                        {{ path.name }}
                      </q-item-label>

                      <!--Library Path-->
                      <q-item-label caption lines="1">
                        <span
                          class="text-weight-bold">
                          {{ $t('components.settings.library.path') }}:
                        </span>
                        <span v-if="path.enableRemoteOnly">
                          ({{ $t('components.settings.library.libraryRemoteOnlyStatus') }})
                        </span>
                        <span v-else>
                          {{ path.path }}
                        </span>
                      </q-item-label>

                      <!--Library Tags-->
                      <q-item-label caption lines="1">
                        <span class="text-weight-bold">
                          {{ $t('components.settings.common.tags') }}:
                        </span>
                        {{ path.tags.join(', ') || '' }}
                      </q-item-label>
                    </q-item-section>

                    <q-item-section v-if="!$q.platform.is.mobile">
                      <q-item-label lines="1">
                        <div class="row">
                          <div class="col-6 text-left">
                            <span
                              :class="path.enableScanner && !path.enableRemoteOnly ? 'text-primary' : 'text-grey-8'">
                              <q-icon v-if="path.enableScanner && !path.enableRemoteOnly" color="check" name="check"/>
                              <q-icon v-else color="close" name="close"/>
                              |
                              {{ $t('components.settings.library.libraryScannerStatusLabel') }}
                            </span>
                          </div>
                        </div>
                      </q-item-label>
                      <q-item-label lines="1">
                        <div class="row">
                          <div class="col-6 text-left">
                            <span
                              :class="path.enableInotify && !path.enableRemoteOnly ? 'text-primary' : 'text-grey-8'">
                              <q-icon v-if="path.enableInotify && !path.enableRemoteOnly" color="check" name="check"/>
                              <q-icon v-else color="close" name="close"/>
                              |
                              {{ $t('components.settings.library.libraryFileMonitorStatusLabel') }}
                            </span>
                          </div>
                        </div>
                      </q-item-label>
                    </q-item-section>

                    <q-separator inset vertical class="q-mx-sm"/>

                    <q-item-section center side>
                      <div class="text-grey-8 q-gutter-xs">
                        <q-btn
                          flat dense round
                          size="12px"
                          color="grey-8"
                          icon="tune"
                          @click="configureLibraryPath(index)">
                          <q-tooltip class="bg-white text-primary">
                            {{ $t('tooltips.configure') }}
                          </q-tooltip>
                        </q-btn>
                        <q-btn
                          flat dense round
                          size="12px"
                          color="negative"
                          icon="delete"
                          :disable="path.locked"
                          @click="deleteLibrary(index)">
                          <q-tooltip class="bg-white text-primary">
                            {{ $t('tooltips.delete') }}
                          </q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>

                  </q-item>

                </q-list>

                <q-bar class="bg-transparent">
                  <q-space/>
                  <q-btn
                    round
                    flat
                    color="primary"
                    icon="add"
                    @click="addNewLibraryWithDirectoryBrowser">
                    <q-tooltip class="bg-white text-primary">{{ $t('tooltips.add') }}</q-tooltip>
                  </q-btn>
                </q-bar>

              </div>
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
                <div
                  v-if="enableLibraryScanner"
                  class="sub-setting">
                  <div class="q-gutter-sm">
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
                  </div>
                </div>
              </div>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="runLibraryScanOnStart === null"
                  type="QToggle"/>
                <q-toggle
                  v-if="runLibraryScanOnStart !== null"
                  v-model="runLibraryScanOnStart"
                  :label="$t('components.settings.library.runLibraryScanOnStart')"
                />
              </div>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="libraryScanFollowSymlinks === null"
                  type="QToggle"/>
                <q-toggle
                  v-if="libraryScanFollowSymlinks !== null"
                  v-model="libraryScanFollowSymlinks"
                  :label="$t('components.settings.library.followSymlinks')"
                />
              </div>
              <!--END LIBRARY SCANNER-->

              <q-separator class="q-my-lg"/>

              <!--START FILE TESTING-->
              <h5 class="q-mb-none">{{ $t('components.settings.library.fileTesting') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="concurrentFileTesters === null"
                  type="QInput"/>
                <q-input
                  v-if="concurrentFileTesters !== null"
                  readonly
                  outlined
                  color="primary"
                  v-model="concurrentFileTesters"
                  :label="$t('components.settings.library.concurrentFileTesters')"
                  :placeholder="concurrentFileTesters">
                </q-input>
                <q-skeleton
                  v-if="concurrentFileTesters === null"
                  type="QSlider"/>
                <q-slider
                  v-if="concurrentFileTesters !== null"
                  v-model="concurrentFileTesters"
                  :min="1"
                  :max="10"
                  :step="1"
                  color="primary"
                />
              </div>
              <!--END FILE TESTING-->

              <q-separator class="q-my-lg"/>

              <!--START PENDING TASKS CONFIG-->
              <h5 class="q-mb-none">{{ $t('components.settings.library.pendingTasks') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="clearPendingTasksOnStart === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="clearPendingTasksOnStart"
                  :label="$t('components.settings.library.clearPendingTasksOnStart')"
                />
              </div>
              <!--END PENDING TASKS CONFIG-->

              <q-separator class="q-my-lg"/>

              <!--START COMPLETED TASKS CONFIG-->
              <h5 class="q-mb-none">{{ $t('components.settings.library.completedTasks') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="autoManageCompletedTasks === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="autoManageCompletedTasks"
                  :label="$t('components.settings.library.autoManageCompletedTasks')"
                />
                <div
                  v-if="autoManageCompletedTasks"
                  class="sub-setting">
                  <div class="q-gutter-sm">
                    <q-skeleton
                      v-if="maxAgeOfCompletedTasks === null"
                      type="QInput"/>
                    <q-input
                      v-if="autoManageCompletedTasks && maxAgeOfCompletedTasks !== null"
                      outlined
                      type="number"
                      v-model="maxAgeOfCompletedTasks"
                      :label="$t('components.settings.library.maxAgeOfCompletedTasks')"
                      lazy-rules
                      :rules="[
                  val => val !== null && val !== '' || $t('components.settings.pleaseEnterAValidNumber'),
                  val => val > 0 || $t('components.settings.pleaseEnterAValidNumber')
                ]"
                    />
                  </div>
                  <div class="q-gutter-sm">
                    <q-skeleton
                      v-if="alwaysKeepFailedTasks === null"
                      type="QInput"/>
                    <q-toggle
                      v-else
                      v-model="alwaysKeepFailedTasks"
                      :label="$t('components.settings.library.alwaysKeepFailedTasks')"
                    />
                  </div>
                </div>
              </div>
              <!--END COMPLETED TASKS CONFIG-->

              <div>
                <q-btn :label="$t('navigation.submit')" type="submit" color="secondary"/>
              </div>
            </q-form>

          </div>

        </div>
      </div>

      <MobileSettingsQuickNav
        v-bind:prevEnabled="false"
        v-bind:prevLabel="'none'"
        v-bind:prevPath="'/ui/settings-plugins'"
        v-bind:nextEnabled="true"
        v-bind:nextLabel="$t('navigation.workers')"
        v-bind:nextPath="'/ui/settings-workers'"/>

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
import MobileSettingsQuickNav from "components/MobileSettingsQuickNav";
import ConfigDrawerDialog from "components/dialogs/ConfigDrawerDialog";

export default {
  name: 'SettingsLibrary',
  components: { MobileSettingsQuickNav },
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
      libraryPaths: ref(null),
      newLibraryPath: ref(false),
      enableLibraryScanner: ref(null),
      libraryScanSchedule: ref(null),
      libraryScanFollowSymlinks: ref(null),
      concurrentFileTesters: ref(null),
      runLibraryScanOnStart: ref(null),
      enableLibraryFileMonitor: ref(null),
      clearPendingTasksOnStart: ref(null),
      autoManageCompletedTasks: ref(null),
      maxAgeOfCompletedTasks: ref(null),
      alwaysKeepFailedTasks: ref(null),
    }
  },
  methods: {
    addNewLibraryWithDirectoryBrowser: function () {
      this.$q.dialog({
        component: DirectoryBrowserDialog,
        componentProps: {
          dialogHeader: this.$t('headers.selectDirectory'),
          initialPath: this.libraryPath,
          listType: 'directories'
        },
      }).onOk((payload) => {
        if (typeof payload.selectedPath !== 'undefined' && payload.selectedPath !== null) {
          // Name the library as a clone
          let randomString = (Math.random() + 1).toString(36).substring(7);
          let newName = '| ' + (this.libraryPaths.length + 1) + ' | ' + this.$t('components.settings.library.newLibrary') + ' (' + randomString + ')';
          // Save this data
          let data = {
            library_config: {
              name: newName,
              path: payload.selectedPath,
            }
          }
          axios({
            method: 'post',
            url: getUnmanicApiUrl('v2', 'settings/library/write'),
            data: data
          }).then((response) => {
            // Save success, show feedback
            this.$q.notify({
              color: 'positive',
              position: 'top',
              icon: 'cloud_done',
              message: this.$t('notifications.saved'),
              timeout: 200
            })
            // Update list
            this.fetchLibraryList();
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
      }).onDismiss(() => {
      })
    },
    deleteLibrary: function (index) {
      // Fetch library ID
      let libraryId;
      for (let i = 0; i < this.libraryPaths.length; i++) {
        if (i === index) {
          libraryId = this.libraryPaths[i].id;
          break;
        }
      }
      // Ensure we do not allow removing the default path
      if (libraryId === 1) {
        // Print error message
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.cannotRemoveDefaultLibrary'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
        return;
      }
      this.$q.dialog({
        title: this.$t('headers.confirm'),
        message: this.$t('components.settings.library.confirmRemove'),
        cancel: this.$t('navigation.cancel'),
        ok: this.$t('navigation.yes'),
        persistent: true
      }).onOk(() => {
        // Request a DELETE from server
        let data = {
          id: libraryId,
        }
        axios({
          method: 'delete',
          url: getUnmanicApiUrl('v2', 'settings/library/remove'),
          data: data
        }).then((response) => {
          // Save success, show feedback
          this.$q.notify({
            color: 'positive',
            position: 'top',
            icon: 'cloud_done',
            message: this.$t('notifications.saved'),
            timeout: 200
          })
          // Update list
          this.fetchLibraryList();
        }).catch(() => {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: this.$t('notifications.failedToSaveSettings'),
            icon: 'report_problem',
            actions: [{ icon: 'close', color: 'white' }]
          })
        });
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
        this.concurrentFileTesters = response.data.settings.concurrent_file_testers
        this.runLibraryScanOnStart = response.data.settings.run_full_scan_on_start
        this.enableLibraryFileMonitor = response.data.settings.enable_inotify
        this.clearPendingTasksOnStart = response.data.settings.clear_pending_tasks_on_restart
        this.autoManageCompletedTasks = response.data.settings.auto_manage_completed_tasks
        this.maxAgeOfCompletedTasks = response.data.settings.max_age_of_completed_tasks
        this.alwaysKeepFailedTasks = response.data.settings.always_keep_failed_tasks
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
          concurrent_file_testers: this.concurrentFileTesters,
          run_full_scan_on_start: this.runLibraryScanOnStart,
          enable_inotify: this.enableLibraryFileMonitor,
          clear_pending_tasks_on_restart: this.clearPendingTasksOnStart,
          auto_manage_completed_tasks: this.autoManageCompletedTasks,
          max_age_of_completed_tasks: this.maxAgeOfCompletedTasks,
          always_keep_failed_tasks: this.alwaysKeepFailedTasks,
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
    fetchLibraryList: function () {
      // Fetch current settings
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/libraries')
      }).then((response) => {
        let libraryPathsList = []
        // TODO: Rename from library path
        for (let i = 0; i < response.data.libraries.length; i++) {
          let libraryPath = response.data.libraries[i];
          libraryPathsList[libraryPathsList.length] = {
            id: libraryPath.id,
            name: libraryPath.name,
            path: libraryPath.path,
            enableRemoteOnly: libraryPath.enable_remote_only,
            enableScanner: libraryPath.enable_scanner,
            enableInotify: libraryPath.enable_inotify,
            tags: libraryPath.tags,
            locked: libraryPath.locked,
          }
        }
        this.libraryPaths = libraryPathsList
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchLibraryList'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    configureLibraryPath: function (index) {
      let library = this.libraryPaths[index]
      this.$q.dialog({
        component: ConfigDrawerDialog,
        componentProps: {
          header: this.$t('headers.configureLibrary'),
          componentName: "LibraryConfigForm",
          componentProps: {
            libraryId: library.id,
          },
        },
      }).onOk((payload) => {
      }).onDismiss(() => {
        this.fetchSettings();
        this.fetchLibraryList();
      });
    },
  },
  created() {
    this.fetchSettings();
    this.fetchLibraryList();
  }
}
</script>

<style>
div.sub-setting {
  margin-left: 30px;
  padding-top: 8px;
  padding-left: 8px;
  border-left: solid thin var(--q-primary);
}

.library-path-list-item {
  background: #F2C037;
}
</style>
