<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <!--      <h4 class="q-ma-none">{{ $t('headers.librarySettings') }}</h4>-->

      <div class="row">
        <div class="col q-ma-sm">

          <div class="q-pa-md"
               :style="$q.platform.is.mobile ? '' : 'max-width: 70%'">

            <q-form
              @submit="save"
              class="q-gutter-md"
            >

              <!--START WORKER GROUPS-->
              <h5 class="q-mb-none">{{ $t('components.settings.workers.workerGroups') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="workerGroups === null"
                  type="text"/>

                <q-list
                  bordered
                  separator
                  class="rounded-borders">

                  <q-item
                    v-for="(workerGroup, index) in workerGroups"
                    v-bind:key="index"
                    active-class="library-path-list-item">
                    <q-item-section avatar>
                      <q-avatar text-color="grey-8" icon="workspaces"/>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>
                        <span class="text-weight-medium">{{ $t('components.settings.workers.workerGroupName') }}:</span>
                        {{ workerGroup.name }}
                      </q-item-label>
                      <q-item-label caption lines="1">
                        <span class="text-weight-bold">{{ $t('components.settings.workers.workerCount') }}:</span>
                        {{ workerGroup.workerCount }}
                      </q-item-label>
                      <q-item-label caption lines="1">
                        <span class="text-weight-bold">{{ $t('components.settings.common.tags') }}:</span>
                        {{ workerGroup.tags.join(', ') || $t('status.none') }}
                      </q-item-label>
                      <q-tooltip>
                        <span class="text-weight-bold">{{ $t('components.settings.workers.workerCount') }}:</span>
                        {{ workerGroup.workerCount }}
                        <br>
                        <span class="text-weight-bold">{{ $t('components.settings.common.tags') }}:</span>
                        {{ workerGroup.tags.join(', ') || $t('status.none') }}
                      </q-tooltip>
                    </q-item-section>

                    <q-separator inset vertical class="q-mx-sm"/>

                    <q-item-section center side>
                      <div class="text-grey-8 q-gutter-xs">
                        <q-btn
                          flat dense round
                          size="12px"
                          color="grey-8"
                          icon="tune"
                          @click="configureWorkerGroup(index)">
                          <q-tooltip class="bg-white text-primary">
                            {{ $t('tooltips.configure') }}
                          </q-tooltip>
                        </q-btn>
                        <q-btn
                          flat dense round
                          size="12px"
                          color="negative"
                          icon="delete"
                          :disable="workerGroup.locked"
                          @click="deleteWorkerGroup(index)">
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
                    @click="configureWorkerGroup('new')">
                    <q-tooltip class="bg-white text-primary">{{ $t('tooltips.add') }}</q-tooltip>
                  </q-btn>
                </q-bar>

              </div>
              <!--END WORKER GROUPS-->

              <!--START CACHE PATHS-->
              <h5 class="q-mb-none">{{ $t('components.settings.workers.path') }}</h5>
              <div class="q-gutter-sm">
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
                  @click="updateCacheWithDirectoryBrowser">
                  <template v-slot:append>
                    <q-icon
                      @click="updateCacheWithDirectoryBrowser"
                      class="cursor-pointer"
                      name="folder_open"/>
                  </template>
                </q-input>
              </div>
              <!--END CACHE PATHS-->

              <div>
                <q-btn :label="$t('navigation.submit')" type="submit" color="secondary"/>
              </div>
            </q-form>

          </div>

        </div>
      </div>

      <MobileSettingsQuickNav
        v-bind:prevEnabled="true"
        v-bind:prevLabel="$t('navigation.library')"
        v-bind:prevPath="'/ui/settings-library'"
        v-bind:nextEnabled="true"
        v-bind:nextLabel="$t('navigation.plugins')"
        v-bind:nextPath="'/ui/settings-plugins'"/>

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
import WorkerGroupConfigureDialog from "components/WorkerGroupConfigureDialog";
import MobileSettingsQuickNav from "components/MobileSettingsQuickNav";

export default {
  name: 'SettingsWorkers',
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
      workerGroups: ref(null),
      cachePath: ref(null),
    }
  },
  methods: {
    updateCacheWithDirectoryBrowser: function () {
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
        // Set the cache path value
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
    fetchWorkerGroupsList: function () {
      // Fetch current settings
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/worker_groups')
      }).then((response) => {
        let workerGroupsList = []
        for (let i = 0; i < response.data.worker_groups.length; i++) {
          let workerGroup = response.data.worker_groups[i];
          workerGroupsList[workerGroupsList.length] = {
            id: workerGroup.id,
            name: workerGroup.name,
            workerCount: workerGroup.number_of_workers,
            tags: workerGroup.tags,
            locked: workerGroup.locked,
          }
        }
        this.workerGroups = workerGroupsList
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
    deleteWorkerGroup: function (index) {
      // Fetch worker group ID
      let workerGroupId;
      for (let i = 0; i < this.workerGroups.length; i++) {
        if (i === index) {
          workerGroupId = this.workerGroups[i].id;
          break;
        }
      }
      this.$q.dialog({
        title: this.$t('headers.confirm'),
        message: this.$t('components.settings.workers.confirmRemove'),
        cancel: this.$t('navigation.cancel'),
        ok: this.$t('navigation.yes'),
        persistent: true
      }).onOk(() => {
        // Request a DELETE from server
        let data = {
          id: workerGroupId,
        }
        axios({
          method: 'delete',
          url: getUnmanicApiUrl('v2', 'settings/worker_group/remove'),
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
          this.fetchWorkerGroupsList();
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
    save: function () {
      // Save settings
      let data = {
        settings: {
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
    },
    configureWorkerGroup: function (index) {
      let workerGroupId;
      if (index === 'new') {
        workerGroupId = 0;
      } else {
        workerGroupId = this.workerGroups[index].id
      }
      this.$q.dialog({
        component: WorkerGroupConfigureDialog,
        componentProps: {
          dialogHeader: this.$t('headers.configureWorkerGroup'),
          workerGroupId: workerGroupId
        },
      }).onOk((payload) => {
      }).onDismiss(() => {
        this.fetchSettings();
        this.fetchWorkerGroupsList();
      })
    },
  },
  created() {
    this.fetchSettings();
    this.fetchWorkerGroupsList();
  },
}
</script>
<style>
.schedule-list-group {
  padding-left: 0;
  padding-right: 20px;
}

.ghost {
  opacity: 0;
}

.schedule-list-item {
  background: #F2C037;
}
</style>
