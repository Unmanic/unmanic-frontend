<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <!--      <h4 class="q-ma-none">{{ $t('headers.librarySettings') }}</h4>-->

      <div class="row">
        <div class="col q-ma-sm">

          <div class="q-pa-md" style="max-width: 500px">

            <q-form
              @submit="save"
              class="q-gutter-md"
            >

              <!--START WORKER COUNT-->
              <h5 class="q-mb-none">{{ $t('components.settings.workers.workerCount') }}</h5>
              <div class="q-gutter-sm">
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
                </q-input>
                <q-skeleton
                  v-if="workerCount === null"
                  type="QSlider"/>
                <q-slider
                  v-if="workerCount !== null"
                  v-model="workerCount"
                  :min="0"
                  :max="12"
                  color="primary"
                />
              </div>
              <!--END WORKER COUNT-->

              <q-separator class="q-my-lg"/>

              <!--START EVENT SCHEDULE-->
              <h5 class="q-mb-none">{{ $t('components.settings.workers.schedule') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="cachePath === null"
                  type="text"/>

                <q-list
                  bordered
                  separator
                  class="rounded-borders">

                  <draggable
                    class="schedule-list-group"
                    item-key="order"
                    tag="transition-group"
                    :component-data="{ tag: 'ul', name: 'flip-list', type: 'transition' }"
                    v-model="schedules"
                    v-bind="dragOptions">
                    <template #item="{ element, index }">
                      <q-item
                        :key="index"
                        class="q-pa-none rounded-borders"
                        active-class="schedule-list-item">

                        <q-item-section avatar class="q-px-sm q-mx-sm">
                          <q-avatar rounded>
                            <q-icon name="drag_handle" class="" style="max-width: 30px;">
                                <q-tooltip class="bg-white text-primary">{{ $t('tooltips.move') }}</q-tooltip>
                            </q-icon>
                          </q-avatar>
                        </q-item-section>

                        <q-separator inset vertical class="q-mr-sm"/>

                        <q-item-section class="q-px-sm q-mx-sm">
                          <!-- Add stings for i18n of element.repetition value -->
                          <q-item-label lines="1">{{ element.repetitionLabel }} @ {{ element.scheduleTime }}
                          </q-item-label>
                          <q-item-label
                            v-if="element.scheduleTask === 'count'"
                            caption lines="2">
                            <span class="text-weight-bold">{{ element.scheduleTaskLabel }}</span>
                            = {{ element.scheduleWorkerCount }}
                          </q-item-label>
                          <q-item-label
                            v-else
                            caption lines="2">
                            <span class="text-weight-bold">{{ element.scheduleTaskLabel }}</span>
                          </q-item-label>
                        </q-item-section>

                        <q-separator inset vertical class="q-mx-sm"/>

                        <q-item-section center side>
                          <div class="text-grey-8 q-gutter-xs">
                            <q-btn
                              flat dense round
                              size="12px"
                              color="negative"
                              icon="delete"
                              @click="deleteSchedule(index)">
                              <q-tooltip class="bg-white text-primary">
                                {{ $t('tooltips.delete') }}
                              </q-tooltip>
                            </q-btn>
                          </div>
                        </q-item-section>

                      </q-item>

                    </template>
                  </draggable>

                </q-list>

                <q-bar class="bg-transparent">
                  <q-space/>
                  <q-btn
                    round
                    flat
                    color="primary"
                    icon="add"
                    @click="newSchedule = true">
                    <q-tooltip class="bg-white text-primary">{{ $t('tooltips.add') }}</q-tooltip>
                  </q-btn>
                </q-bar>

                <q-dialog v-model="newSchedule" persistent>
                  <q-card style="min-width: 350px">

                    <q-card-section>
                      <div class="text-h6">{{ $t('components.settings.workers.newScheduledEvent') }}</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-select filled v-model="repetition" :options="repetitionOptions"
                                :label="$t('components.settings.workers.repetition')"/>
                    </q-card-section>
                    <q-card-section class="q-pt-none">
                      <q-input filled v-model="scheduleTime" mask="time">
                        <template v-slot:append>
                          <q-icon name="access_time" class="cursor-pointer">
                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-time v-model="scheduleTime">
                                <div class="row items-center justify-end">
                                  <q-btn v-close-popup :label="$t('navigation.close')" color="primary" flat/>
                                </div>
                              </q-time>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </q-card-section>
                    <q-card-section class="q-pt-none">
                      <q-select filled v-model="scheduleTask" :options="scheduleTaskOptions"
                                :label="$t('components.settings.workers.task')"/>
                    </q-card-section>
                    <q-card-section
                      v-if="scheduleTask.value === 'count'"
                      class="q-pt-none q-mt-md q-mx-md">
                      <q-slider
                        v-model="scheduleWorkerCount"
                        :min="0"
                        :max="12"
                        label
                        :label-value="'Worker count: ' + scheduleWorkerCount"
                        label-always
                        color="primary"
                      />
                    </q-card-section>

                    <q-card-actions align="right" class="text-primary">
                      <q-btn flat :label="$t('navigation.cancel')" v-close-popup/>
                      <q-btn
                        @click="addNewScheduledEvent"
                        flat :label="$t('components.settings.workers.addEvent')" v-close-popup/>
                    </q-card-actions>
                  </q-card>
                </q-dialog>

              </div>
              <!--END EVENT SCHEDULE-->

              <q-separator class="q-my-lg"/>

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
                  @click="updateLibraryWithDirectoryBrowser">
                  <template v-slot:append>
                    <q-icon
                      @click="updateLibraryWithDirectoryBrowser"
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

      <!--START QUICK NAV-->
      <div v-if="$q.platform.is.mobile">
        <q-separator class="q-mb-lg"/>
        <div class="row">
          <div class="col-6 text-center">
            <q-card
              flat
              bordered
              @click="$router.push('/ui/settings-library')"
              class="q-ma-xs">
              <q-btn
                icon="navigate_before"
                flat>
                {{ $t('navigation.library') }}
              </q-btn>
            </q-card>
          </div>
          <div class="col-6 text-center">
            <q-card
              flat
              bordered
              @click="$router.push('/ui/settings-plugins')"
              class="q-ma-xs">
              <q-btn
                icon-right="navigate_next"
                flat>
                {{ $t('navigation.plugins') }}
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
import draggable from "vuedraggable";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";

export default {
  name: 'SettingsWorkers',
  components: {
    draggable
  },
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
      // Add stings for i18n of element.scheduleWorkerCount label
      schedules: ref([]),
      newSchedule: ref(false),
      repetition: ref(''),
      repetitionOptions: [
        {
          label: this.$t('components.settings.workers.scheduleLabels.daily'),
          value: 'daily',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.weekday'),
          value: 'weekday',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.weekend'),
          value: 'weekend',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.monday'),
          value: 'monday',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.tuesday'),
          value: 'tuesday',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.wednesday'),
          value: 'wednesday',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.thursday'),
          value: 'thursday',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.friday'),
          value: 'friday',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.saturday'),
          value: 'saturday',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.sunday'),
          value: 'sunday',
        },
      ],
      scheduleTime: ref('00:00'),
      scheduleTask: ref(''),
      scheduleTaskOptions: [
        {
          label: this.$t('components.settings.workers.scheduleLabels.count'),
          value: 'count',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.pause'),
          value: 'pause',
        },
        {
          label: this.$t('components.settings.workers.scheduleLabels.resume'),
          value: 'resume',
        },
      ],
      scheduleWorkerCount: ref(1)
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
        // Set the worker count value
        this.workerCount = response.data.settings.number_of_workers
        // Set the worker schedules list
        let workerEventSchedules = []
        for (let i = 0; i < response.data.settings.worker_event_schedules.length; i++) {
          let workerEventSchedule = response.data.settings.worker_event_schedules[i];
          workerEventSchedules[workerEventSchedules.length] = {
            repetition: workerEventSchedule.repetition,
            repetitionLabel: this.$t('components.settings.workers.scheduleLabels.' + workerEventSchedule.repetition),
            scheduleTime: workerEventSchedule.schedule_time,
            scheduleTask: workerEventSchedule.schedule_task,
            scheduleTaskLabel: this.$t('components.settings.workers.scheduleLabels.' + workerEventSchedule.schedule_task),
            scheduleWorkerCount: workerEventSchedule.schedule_worker_count
          }
        }
        this.schedules = workerEventSchedules;
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
    save: function () {
      // Save settings
      let workerEventSchedule = []
      for (let i = 0; i < this.schedules.length; i++) {
        workerEventSchedule[workerEventSchedule.length] = {
          repetition: this.schedules[i].repetition,
          schedule_time: this.schedules[i].scheduleTime,
          schedule_task: this.schedules[i].scheduleTask,
          schedule_worker_count: this.schedules[i].scheduleWorkerCount,
        };
      }
      let data = {
        settings: {
          number_of_workers: this.workerCount,
          cache_path: this.cachePath,
          worker_event_schedules: workerEventSchedule,
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
    addNewScheduledEvent: function () {
      // validate
      if (typeof this.repetition.value === 'undefined' || typeof this.scheduleTask.value === 'undefined') {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.invalidWorkerEvent'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
        return
      }
      this.schedules[this.schedules.length] = {
        repetition: this.repetition.value,
        repetitionLabel: this.$t('components.settings.workers.scheduleLabels.' + this.repetition.value),
        scheduleTime: this.scheduleTime,
        scheduleTask: this.scheduleTask.value,
        scheduleTaskLabel: this.$t('components.settings.workers.scheduleLabels.' + this.scheduleTask.value),
        scheduleWorkerCount: this.scheduleWorkerCount
      }
    },
    deleteSchedule: function (index) {
      let newList = []
      for (let i = 0; i < this.schedules.length; i++) {
        if (i === index) {
          // Ignore this item to remove it from the list
          continue;
        }
        newList[newList.length] = this.schedules[i];
      }
      this.schedules = newList;
    }
  },
  created() {
    this.fetchSettings();
  },
  computed: {
    dragOptions() {
      return {
        animation: 100,
        group: "scheduleOrder",
        disabled: false,
        ghostClass: "ghost",
        direction: "vertical",
        delay: 200,
        delayOnTouchOnly: true,
      };
    }
  }
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
