<template>
  <q-card>
    <q-card-section class="bg-grey-2 q-pa-sm">

      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6 text-grey-8">
            Status
          </div>
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
export default {
  // name: 'ComponentName',
  setup () {
    return {}
  },
  props: {
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
  }
}
</script>
