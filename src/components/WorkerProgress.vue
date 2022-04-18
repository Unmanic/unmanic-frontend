<template>

  <q-card inline style="width: 370px" class="worker-progress-card">
    <q-card-section class="" maxlength="2">

      <div class="row items-center no-wrap">
        <div class="col">
          <div v-if="label.length<50" class="text-h8 text-primary">
            {{ label }}
          </div>
          <div v-else class="text-h8 text-primary">
            {{ label.substring(0, 48) + ".." }}
          </div>
        </div>

        <div class="col-auto">
          <q-btn
            @click="workerProgressPopup = true"
            color="grey-7"
            dense
            round
            flat
            icon="open_in_full">
            <q-tooltip class="bg-white text-primary">{{ $t('navigation.showMore') }}</q-tooltip>
          </q-btn>
        </div>

      </div>

    </q-card-section>

    <q-separator :style="'border-bottom:solid thin ' + workerGroupColour"/>

    <div class="row">
      <q-card-section class="q-pb-none col q-pb-none justify-center full-height full-width text-center">

        <q-circular-progress
          :indeterminate="indeterminate"
          show-value
          :value="progress"
          size="90px"
          :thickness="0.2"
          :color="color"
          :center-color="$q.dark.isActive ? 'grey-10' : 'grey-3'"
          track-color="grey-7"
          font-size="10px"
          class="q-ma-md"
        >
          <q-avatar size="60px">
            {{ progressText }}
          </q-avatar>
        </q-circular-progress>

      </q-card-section>

      <q-card-section class="q-pb-none col-7">
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
        </q-list>
      </q-card-section>
    </div>

    <q-card-section
      class="q-pt-sm">
      <div class="row">
        <div class="column q-ml-sm">ETC:</div>
        <div class="column q-ml-lg">{{ etc }}</div>
        <q-tooltip class="bg-white text-primary">{{ $t('tooltips.etc') }}</q-tooltip>
      </div>
    </q-card-section>

    <!--FULL SCREEN-->
    <q-card-section
      class="q-pa-none">

      <q-dialog
        v-model="workerProgressPopup"
        full-width
        full-height
      >
        <q-card :style="'border:solid thin ' + workerGroupColour">

          <!--CARD HEAD-->
          <q-card-section class="bg-card-head">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 text-primary">
                  {{ label }}
                </div>
              </div>

              <div class="col-auto">
                <q-btn
                  color="grey-7"
                  dense
                  round
                  flat
                  icon="close_fullscreen" v-close-popup>
                  <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <!--CARD BODY-->
          <q-card-section class="q-pt-none">
            <div class="row">

              <!--START STATUS-->
              <q-card-section class="col-12 col-md-7">
                <WorkerProgressStatus
                  v-bind:id="id"
                  v-bind:state="state"
                  v-bind:currentRunner="currentRunner"
                  v-bind:startTime="startTime"
                  v-bind:totalProcTime="totalProcTime"
                  v-bind:paused="paused"
                  v-bind:idle="idle"/>
              </q-card-section>
              <!--END STATUS-->

              <!--START PROGRESS-->
              <q-card-section class="col-12 col-md q-pb-none justify-center full-height full-width text-center">
                <q-circular-progress
                  :indeterminate="indeterminate"
                  show-value
                  :value="progress"
                  size="90px"
                  :thickness="0.2"
                  :color="color"
                  :center-color="$q.dark.isActive ? 'grey-10' : 'grey-3'"
                  track-color="grey-7"
                  font-size="10px"
                  class="q-ma-md"
                >
                  <q-avatar size="60px">
                    {{ progressText }}
                  </q-avatar>
                </q-circular-progress>
              </q-card-section>
              <!--END PROGRESS-->

            </div>
            <div class="row">

              <!--START WORKER LOG-->
              <q-card-section class="col">
                <WorkerProgressLog
                  v-bind:workerLog="workerLog"/>
              </q-card-section>
              <!--END WORKER LOG-->

            </div>

          </q-card-section>

        </q-card>
      </q-dialog>
    </q-card-section>

  </q-card>

</template>

<script>
import { defineComponent, ref } from "vue";
import WorkerProgressStatus from "components/WorkerProgressStatus";
import WorkerProgressLog from "components/WorkerProgressLog";

export default defineComponent({
  name: 'WorkerProgress',
  components: { WorkerProgressStatus, WorkerProgressLog },
  data() {
    return {
      workerProgressPopup: ref(false)
    }
  },
  props: {
    id: {
      type: String,
      required: true
    },

    label: {
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

    etc: {
      type: String,
      default: ''
    },

    color: {
      type: String,
      default: 'warning'
    },

    workerGroupColour: {
      type: String,
      default: '#cccccc'
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
    },

    workerLog: {
      type: Array
    },

    idle: {
      type: Boolean
    },

    paused: {
      type: Boolean
    }
  }
})
</script>

<style lang="css" scoped>
.worker-progress-card {
  margin: 5px;
}

</style>
