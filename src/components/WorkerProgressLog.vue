<template>
  <q-card>
    <q-card-section class="bg-card-head q-pa-sm">

      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6 text-grey-8">
            {{ $t('components.workers.workerLog') }}
          </div>
        </div>
      </div>

    </q-card-section>

    <q-separator/>

    <q-card-section class="q-pa-md">
      <div
        v-for="(logLine, index) in workerLog"
        v-bind:key="index">
        <p class="q-ma-none q-pa-none">{{ logLine }}</p>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  // name: 'ComponentName',
  setup() {
    return {}
  },
  props: {
    workerLog: {
      type: Array
    },
  }
}
</script>
