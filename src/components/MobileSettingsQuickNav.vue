<template>
  <!--START QUICK NAV-->
  <div v-if="$q.platform.is.mobile">
    <q-separator class="q-my-lg"/>
    <div class="row">
      <div class="col-6 text-center">
        <q-card
          v-if="prevEnabled"
          flat
          bordered
          @click="$router.push(prevPath)"
          class="q-ma-xs">
          <q-btn
            icon="navigate_before"
            flat>
            {{ prevLabel }}
          </q-btn>
        </q-card>
      </div>
      <div class="col-6 text-center">
        <q-card
          v-if="nextEnabled"
          flat
          bordered
          @click="$router.push(nextPath)"
          class="q-ma-xs">
          <q-btn
            icon-right="navigate_next"
            flat>
            {{ nextLabel }}
          </q-btn>
        </q-card>
      </div>
    </div>
  </div>
  <!--END QUICK NAV-->
</template>

<script>
export default {
  name: 'MobileSettingsQuickNav',
  props: {
    prevEnabled: {
      type: Boolean
    },
    prevLabel: {
      type: String
    },
    prevPath: {
      type: String
    },
    nextEnabled: {
      type: Boolean
    },
    nextLabel: {
      type: String
    },
    nextPath: {
      type: String
    }
  },
  setup() {
    return {}
  }
}
</script>
