<template>

  <!-- START DIALOG CONFIG
  Right fullscreen pop-up
  Note: Update template q-dialog ref="" value

  All Platforms:
   - Swipe right to dismiss
  Desktop:
   - Width 700px
   - Minimise button top-right
  Mobile:
   - Full screen
   - Back button top-left
  -->
  <q-dialog
    ref="workerGroupConfigureDialogRef"
    :maximized="$q.platform.is.mobile"
    :transition-show="$q.platform.is.mobile ? 'jump-left' : 'slide-left'"
    :transition-hide="$q.platform.is.mobile ? 'jump-right' : 'slide-right'"
    full-height
    position="right"
    @before-hide="beforeDialogHide"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.right="hide"
      :style="$q.platform.is.mobile ? 'max-width: 100vw;' : 'max-width: 95vw;'"
      style="width:700px;">

      <q-card-section class="bg-card-head">
        <div class="row items-center no-wrap">
          <div
            v-if="$q.platform.is.mobile"
            class="col">
            <q-btn
              color="grey-7"
              dense
              round
              flat
              icon="arrow_back"
              v-close-popup>
            </q-btn>
          </div>

          <div class="col">
            <div class="text-h6 text-blue-10">
              {{ dialogHeader }}
            </div>
          </div>

          <div
            v-if="!$q.platform.is.mobile"
            class="col-auto">
            <q-btn
              color="grey-7"
              dense
              round
              flat
              icon="arrow_forward"
              v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <!-- END DIALOG CONFIG -->

      <q-card-section class="q-pt-none">

        <div :class="$q.platform.is.mobile ? 'q-px-none' : ''">

          <q-card flat>
            <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

              <div class="row items-center no-wrap q-mb-md">
                <div class="col">
                  <div class="text-h5">
                    {{ $t('components.settings.common.configuration') }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    v-if="locked"
                    round
                    flat
                    color="negative"
                    icon="lock"
                    @click="locked = false">
                    <q-tooltip class="bg-white text-primary">{{
                        $t('components.settings.workers.locked')
                      }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    v-else
                    round
                    flat
                    color="primary"
                    icon="lock_open"
                    @click="locked = true">
                    <q-tooltip class="bg-white text-primary">{{
                        $t('components.settings.workers.unlocked')
                      }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!--START WORKER NAME-->
              <div class="q-pb-sm">
                <q-skeleton
                  v-if="name === null"
                  type="QInput"/>
                <q-input
                  v-if="name !== null"
                  outlined
                  color="primary"
                  v-model="name"
                  :label="$t('components.settings.workers.workerGroupName')"
                  :placeholder="name">
                </q-input>
              </div>
              <!--END WORKER NAME-->

              <!--START WORKER COUNT-->
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

              <!--START WORKER TAGS-->
              <div class="q-pb-sm">
                <q-skeleton
                  v-if="tags === null"
                  type="QInput"/>
                <q-select
                  filled
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  v-model="tags"
                  :label="$t('components.settings.common.tags')"
                  @keyup.tab="addTag"
                />
              </div>
              <!--END WORKER TAGS-->

            </q-card-section>

            <q-separator/>

            <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

              <!--START EVENT SCHEDULE-->
              <h5 class="q-mb-none">{{ $t('components.settings.workers.schedule') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="schedules === null"
                  type="text"/>

                <q-list
                  bordered
                  separator
                  class="rounded-borders">

                  <draggable
                    class="schedule-list-group"
                    item-key="order"
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
                    @click="addNewScheduledEvent">
                    <q-tooltip class="bg-white text-primary">{{ $t('tooltips.add') }}</q-tooltip>
                  </q-btn>
                </q-bar>

              </div>
              <!--END EVENT SCHEDULE-->

            </q-card-section>

          </q-card>

        </div>

      </q-card-section>

    </q-card>

  </q-dialog>
</template>

<script>
import axios from "axios";
import draggable from "vuedraggable";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { ref } from "vue";
import WorkerEventCreateDialog from "components/WorkerEventCreateDialog";

export default {
  name: 'WorkerGroupConfigureDialog',
  components: { draggable },
  props: {
    dialogHeader: {
      type: String,
      default: ' --- header --- '
    },
    workerGroupId: {
      type: Number,
      default: 0
    }
  },
  emits: [
    // REQUIRED
    'ok', 'hide', 'path'
  ],
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.workerGroupConfigureDialogRef.show();
      this.fetchWorkerGroupConfig(this.workerGroupId);
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.workerGroupConfigureDialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('ok', {});
      this.$emit('hide');
    },

    beforeDialogHide() {
      this.saveLibraryConfig();
    },

    fetchWorkerGroupConfig: function (workerGroupId) {
      // If this is for a new worker group, do not fetch the current settings
      if (workerGroupId === 0) {
        // Set defaults
        this.name = '';
        this.workerCount = 1;
        this.tags = [];
        this.schedules = [];
        return;
      }
      // Fetch from server
      let data = {
        id: workerGroupId,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/worker_group/read'),
        data: data
      }).then((response) => {
        this.currentID = response.data.id;
        this.locked = response.data.locked;
        this.name = response.data.name;
        this.workerCount = response.data.number_of_workers;
        this.tags = response.data.tags;
        // Set the worker schedules list
        let workerEventSchedules = []
        for (let i = 0; i < response.data.worker_event_schedules.length; i++) {
          let workerEventSchedule = response.data.worker_event_schedules[i];
          workerEventSchedules[workerEventSchedules.length] = {
            repetition: workerEventSchedule.repetition,
            repetitionLabel: this.$t('components.settings.workers.scheduleLabels.' + workerEventSchedule.repetition),
            scheduleTime: workerEventSchedule.schedule_time,
            scheduleTask: workerEventSchedule.schedule_task,
            scheduleTaskLabel: this.$t('components.settings.workers.scheduleLabels.' + workerEventSchedule.schedule_task),
            scheduleWorkerCount: workerEventSchedule.schedule_worker_count,
          }
        }
        this.schedules = workerEventSchedules;
      });
    },
    saveLibraryConfig: function () {
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
        id: this.currentID,
        locked: this.locked,
        name: this.name,
        number_of_workers: this.workerCount,
        worker_event_schedules: workerEventSchedule,
        tags: this.tags,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/worker_group/write'),
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
        this.componentKey += 1;
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
    addTag: function () {
      if (this.newTag) {
        this.tags[this.tags.length] = this.newTag;
        this.newTag = null;
      }
    },
    addNewScheduledEvent: function () {
      this.$q.dialog({
        component: WorkerEventCreateDialog,
        componentProps: {},
      }).onOk((payload) => {
        if (payload.repetition === null || payload.scheduleTask === null) {
          return
        }
        this.schedules[this.schedules.length] = {
          repetition: payload.repetition,
          repetitionLabel: this.$t('components.settings.workers.scheduleLabels.' + payload.repetition),
          scheduleTime: payload.scheduleTime,
          scheduleTask: payload.scheduleTask,
          scheduleTaskLabel: this.$t('components.settings.workers.scheduleLabels.' + payload.scheduleTask),
          scheduleWorkerCount: payload.scheduleWorkerCount
        }
      }).onDismiss(() => {
      })
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
    },
  },
  watch: {
    workerGroupId(value) {
      if (value.length > 0) {
        this.currentID = this.workerGroupId;
      }
    }
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
  },
  data: function () {
    return {
      maximizedToggle: true,
      showPluginSettings: ref(''),
      currentID: ref(null),
      locked: ref(false),
      name: ref(null),
      workerCount: ref(null),
      newTag: ref(''),
      tags: ref([]),
      schedules: ref(null)
    }
  }
}
</script>
