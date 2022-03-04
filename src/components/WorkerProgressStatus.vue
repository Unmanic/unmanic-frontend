<template>
  <q-card>
    <q-card-section class="bg-card-head q-pa-sm">

      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6 text-grey-8">
            {{ $t('components.workers.status') }}
          </div>
        </div>

        <div class="col-auto">
          <q-btn-dropdown class="q-ml-sm" color="secondary" :label="$t('navigation.options')">
            <q-list>

              <q-item
                v-if="paused"
                clickable
                @click="resumeWorker()"
                v-close-popup>
                <q-item-section>
                  <q-item-label>
                    <q-icon name="play_arrow"/>
                    {{ $t('components.workers.resumeWorker') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-else
                clickable
                @click="pauseWorker()"
                v-close-popup>
                <q-item-section>
                  <q-item-label>
                    <q-icon name="pause"/>
                    {{ $t('components.workers.pauseWorker') }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator/>

              <q-item
                clickable
                @click="terminateWorkerPrompt()"
                v-close-popup>
                <q-item-section>
                  <q-item-label>
                    <q-icon name="fas fa-skull-crossbones"/>
                    {{ $t('components.workers.terminateWorker') }}
                  </q-item-label>
                </q-item-section>
              </q-item>

            </q-list>
          </q-btn-dropdown>
        </div>
      </div>

    </q-card-section>

    <q-separator/>

    <q-list bordered padding>
      <q-item>
        <q-item-section>
          <q-item-label>{{ $t('components.workers.stateLabel') }}</q-item-label>
          <q-item-label caption>
            {{ state }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label>{{ $t('components.workers.currentRunnerLabel') }}</q-item-label>
          <q-item-label caption>
            {{ currentRunner }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="worker-progress-card-state-t-start">
        <q-item-section>
          <q-item-label>{{ $t('components.workers.startTimeLabel') }}</q-item-label>
          <q-item-label caption>
            {{ startTime }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="worker-progress-card-state-t-total">
        <q-item-section>
          <q-item-label>{{ $t('components.workers.totalProcessingTimeLabel') }}</q-item-label>
          <q-item-label caption>
            {{ totalProcTime }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";

export default {
  // name: 'ComponentName',
  setup() {
    return {}
  },
  props: {
    id: {
      type: String
    },

    state: {
      type: String,
      default: 'Waiting for another task...'
    },

    currentRunner: {
      type: String,
      default: ''
    },

    startTime: {
      type: String,
      default: ''
    },

    totalProcTime: {
      type: String,
      default: ''
    },

    idle: {
      type: Boolean
    },

    paused: {
      type: Boolean
    }
  },
  methods: {
    pauseWorker: function () {
      let data = {
        worker_id: this.id,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'workers/worker/pause'),
        data: data
      }).then((response) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('components.workers.workerPaused'),
          icon: 'check_circle',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.workers.workerPausedFailed'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    },
    resumeWorker: function () {
      let data = {
        worker_id: this.id,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'workers/worker/resume'),
        data: data
      }).then((response) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('components.workers.workerResumed'),
          icon: 'check_circle',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.workers.workerResumedFailed'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    },
    terminateWorker: function () {
      let data = {
        worker_id: this.id,
      }
      axios({
        method: 'delete',
        url: getUnmanicApiUrl('v2', 'workers/worker/terminate'),
        data: data
      }).then((response) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('components.workers.workerTerminated'),
          icon: 'check_circle',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.workers.workerTerminationFailed'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    },
    terminateWorkerPrompt: function () {
      if (this.idle) {
        // If the worker is idle, dont prompt, just terminate it.
        this.terminateWorker();
      } else {
        // If the worker is not idle, prompt to confirm the termination
        this.$q.dialog({
          title: this.$t('headers.confirm'),
          message: this.$t('components.workers.terminateWorkerWarning'),
          cancel: true,
          persistent: true
        }).onOk(() => {
          this.terminateWorker();
        })
      }
    },
  }
}
</script>
