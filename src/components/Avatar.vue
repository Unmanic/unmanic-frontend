<template>
  <q-img class="absolute-top" src="~assets/bg-md1.jpg" style="height: 150px">
    <div class="absolute-bottom bg-transparent">
      <q-avatar
        v-if="unmanicSession && unmanicSession.level && unmanicSession.level > 0"
        size="56px" class="q-mb-sm">
        <q-img :src="unmanicSession.picture_uri"/>
      </q-avatar>
      <div
        v-if="unmanicSession && unmanicSession.level && unmanicSession.level > 0"
        class="text-weight-bold">
        {{ unmanicSession.name }}
      </div>
      <!--<div>{{ unmanicSession.email }}</div>-->
    </div>
  </q-img>
</template>

<script>

import { ref } from "vue";
import unmanicGlobals from "src/js/unmanicGlobals";

export default {
  setup() {

    const unmanicSession = ref(null);

    unmanicGlobals.getUnmanicSession().then((session) => {
      unmanicSession.value = session;
    })

    return {
      unmanicSession
    }
  }
}
</script>
