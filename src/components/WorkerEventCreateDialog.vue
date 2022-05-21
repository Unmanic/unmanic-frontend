<template>

  <!-- START DIALOG CONFIG
  Center dialog pop-up
  Note: Update template q-dialog ref="" value

  All Platforms:
   - Click outside to dismiss
  Desktop:
   - Width 350px
   - Minimise button top-right
  Mobile:
   - Full screen
   - Back button top-left
  -->
  <q-dialog
    ref="workerEventCreateDialogRef"
    :transition-show="$q.platform.is.mobile ? 'jump-down' : 'scale'"
    :transition-hide="$q.platform.is.mobile ? 'jump-up' : 'scale'"
    @before-hide="beforeDialogHide"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.right="hide"
      :style="$q.platform.is.mobile ? 'max-width: 100vw;' : 'max-width: 95vw;'"
      style="width:350px;">

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
          flat :label="$t('components.settings.workers.addEvent')"/>
      </q-card-actions>

    </q-card>
  </q-dialog>

</template>

<script>
import { ref } from "vue";

export default {
  name: 'WorkerEventCreateDialog',
  components: {},
  props: {},
  emits: [
    // REQUIRED
    'ok', 'hide', 'path'
  ],
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.workerEventCreateDialogRef.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.workerEventCreateDialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('ok', {
        repetition: this.repetitionOut,
        scheduleTime: this.scheduleTimeOut,
        scheduleTask: this.scheduleTaskOut,
        scheduleWorkerCount: this.scheduleWorkerCountOut,
      })
      this.$emit('hide');
    },

    beforeDialogHide() {
      // Do something before hiding
    },

    addNewScheduledEvent() {
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

      // Apply final values to output variables
      this.repetitionOut = this.repetition.value;
      this.scheduleTimeOut = this.scheduleTime;
      this.scheduleTaskOut = this.scheduleTask.value;
      this.scheduleWorkerCountOut = this.scheduleWorkerCount;

      // Hide dialog
      this.hide();
    }
  },
  watch: {
    libraryId(value) {
      if (value.length > 0) {
        this.currentID = this.libraryId;
      }
    }
  },
  data: function () {
    return {
      maximizedToggle: true,
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
      scheduleWorkerCount: ref(1),

      repetitionOut: ref(null),
      scheduleTimeOut: ref(null),
      scheduleTaskOut: ref(null),
      scheduleWorkerCountOut: ref(null),
    }
  }
}
</script>
