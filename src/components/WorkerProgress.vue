<template>

    <q-card
      class="worker-progress-card">

      <q-card-section horizontal>
        <q-card-section>

          <q-circular-progress
            :indeterminate="indeterminate"
            show-value
            :value="progress"
            size="90px"
            :thickness="0.2"
            :color="color"
            center-color="grey-3"
            track-color="grey-7"
            font-size="10px"
            class="q-ma-md"
          >
            <q-avatar size="60px">
              {{ progressText }}
            </q-avatar>
          </q-circular-progress>

          <p class="text-center">ETA: {{ eta }}</p>

        </q-card-section>
        <q-card-section>

          <q-list bordered padding>
            <!--                      <q-item-label header>Status:</q-item-label>-->

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
                  Default Unmanic Process
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              class="worker-progress-card-state-more"
              clickable
              v-ripple>
              <q-item-section>
                <q-item-label>More...</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

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

        </q-card-section>

        <q-card-section>
          <q-page-sticky position="top-right" :offset="[18, 18]">
            <q-btn
              fab
              color="primary"
              label="Close"
              class="worker-progress-card-close"
              @click="fullscreen = false"/>
          </q-page-sticky>
        </q-card-section>
      </q-card-section>

    </q-card>

</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: 'WorkerProgress',
  props: {
    id: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    progress: {
      type: Number,
      default: 100
    },

    progressText: {
      type: String,
      default: ''
    },

    eta: {
      type: String,
      default: ''
    },

    color: {
      type: String,
      default: 'warning'
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

    indeterminate: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="css" scoped>
.worker-progress-card {
  margin: 5px;
}

.worker-progress-card.fullscreen {
  margin: 130px auto 10px;
  max-width: 99%;
}
/* Hide the fullscreen data */
.worker-progress-card-close, .worker-progress-card-state-t-start, .worker-progress-card-state-t-total {
  display: none;
}
/* Show the fullscreen data when fullscreen */
.fullscreen .worker-progress-card-close, .fullscreen .worker-progress-card-state-t-start, .fullscreen .worker-progress-card-state-t-total {
  display: inherit;
}
/* Hide the fullscreen button when fullscreen */
.fullscreen .worker-progress-card-state-more {
  display: none;
}

</style>
