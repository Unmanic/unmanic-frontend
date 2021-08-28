<template>
  <q-card>
    <q-card-section class="bg-grey-2 q-pa-sm">

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

            </q-list>
          </q-btn-dropdown>
        </div>
      </div>

    </q-card-section>

    <q-separator/>

    <q-list bordered padding>
      <q-item>
        <q-item-section>
          <q-item-label>State</q-item-label>
          <q-item-label caption>
            {{ state }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label>Current Runner</q-item-label>
          <q-item-label caption>
            {{ currentRunner }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="worker-progress-card-state-t-start">
        <q-item-section>
          <q-item-label>Start Time</q-item-label>
          <q-item-label caption>
            {{ startTime }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="worker-progress-card-state-t-total">
        <q-item-section>
          <q-item-label>Total Processing Time</q-item-label>
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
        method: 'put',
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
        method: 'put',
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
    }
  }
}
</script>
