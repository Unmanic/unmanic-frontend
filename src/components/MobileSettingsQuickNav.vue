<template>
  <!--START QUICK NAV-->
  <div v-if="$q.platform.is.mobile" class="mobile-quick-nav">
    <q-separator/>
    <div class="row q-pa-sm">
      <div class="col-6 q-pr-xs">
        <q-btn
          v-if="prevEnabled"
          outline
          color="secondary"
          icon="navigate_before"
          class="full-width"
          @click="$router.push(prevPath)">
          {{ prevLabel }}
        </q-btn>
      </div>
      <div class="col-6 q-pl-xs">
        <q-btn
          v-if="nextEnabled"
          outline
          color="secondary"
          icon-right="navigate_next"
          class="full-width"
          @click="$router.push(nextPath)">
          {{ nextLabel }}
        </q-btn>
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

<style scoped>
.mobile-quick-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
}
</style>
