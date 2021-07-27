<template>
  <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
    <div class="absolute-bottom bg-transparent">
      <q-avatar size="56px" class="q-mb-sm">
        <q-img :src="unmanicSession.picture_uri"/>
      </q-avatar>
      <div class="text-weight-bold">{{ unmanicSession.name }}</div>
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
