<template>
  <q-dialog
    ref="dialogRef"
    :maximized="$q.platform.is.mobile"
    transition-show="slide-right"
    transition-hide="slide-left"
    full-height
    position="left"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.left="hide"
      style="max-width: 100vw;">

      <q-card-section class="bg-card-head">
        <div class="row items-center no-wrap">

          <div class="col-auto">
            <q-btn
              color="grey-7"
              dense
              round
              flat
              icon="arrow_back" v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.back') }}</q-tooltip>
            </q-btn>
          </div>

          <div class="col">
            <div class="text-h6 text-secondary">
              <q-icon name="description"/>
              {{ $t('headers.completedTaskDetails') }}
            </div>
          </div>

        </div>
      </q-card-section>

      <q-card-section class="q-pt-none q-pa-none">

        <div class="q-pt-md q-px-lg" style="width: 2000px; max-width: 95vw;">
          <div class="q-pa-md completed-task-details-dialog-content">
            <p
              v-for="(line, index) in taskDetails"
              v-bind:key="index"
              v-html="line"></p>
          </div>
        </div>

      </q-card-section>

    </q-card>

  </q-dialog>
</template>

<script>
import { ref } from 'vue';
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import dateTools from "src/js/dateTools";

const defaultOrder = []

export default {
  name: 'CompletedTaskLogDialog',
  props: {
    completedTaskId: {
      type: String,
    },
  },
  emits: [
    // REQUIRED
    'ok', 'hide', 'path'
  ],
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialogRef.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },
    fetchCompletedTaskLog: function () {
      // Fetch from server
      let data = {
        task_id: this.completedTaskId,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'history/task/log'),
        data: data
      }).then((response) => {
        // update rowsCount with appropriate value
        this.taskDetails = response.data.command_log_lines
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.completedTasks.errorGettingDetails'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    },
  },
  created() {
    this.fetchCompletedTaskLog();
  },
  data: function () {
    return {
      taskDetails: ref([]),
    }
  }
}
</script>

<style lang="scss">
.completed-task-details-dialog-content h1 {
  font-size: 2.125rem;
  line-height: 2.125rem;
}

.completed-task-details-dialog-content h2 {
  font-size: 1.75rem;
  line-height: 1.75rem;
}

.completed-task-details-dialog-content h3 {
  font-size: 1.5rem;
  line-height: 1.5rem;
}

.completed-task-details-dialog-content h4 {
  font-size: 1.25rem;
  line-height: 1.5rem;
}

.completed-task-details-dialog-content h5 {
  font-size: 1rem;
  line-height: 1.5rem;
}

.completed-task-details-dialog-content h6 {
  font-size: 1rem;
  line-height: 1.5rem;
}

.completed-task-details-dialog-content p {
  margin: 0 0;
}

.completed-task-details-dialog-content b {
  color: $secondary;
  display: block;
  margin: 20px 0 0 0;
}

.completed-task-details-dialog-content pre {
  /*background: #EEE;
  border: inset thin;*/
  display: block;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.428571;
  color: #333;
  word-break: break-all;
  word-wrap: break-word;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: auto;
}
.completed-task-details-dialog-content span.terminated {
  color: $negative;
}
</style>
