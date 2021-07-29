<template>
  <div class="row">
    <div class="col-12 col-md-6">
      <p class="text-subtitle1">
        <br>
        Version - {{ unmanicVersion }}
        <br>
        2018 © Unmanic by Josh Sunnex.
      </p>
    </div>
  </div>
</template>

<script>
import unmanicGlobals from "src/js/unmanicGlobals";
import { onMounted, ref } from "vue";

export default {
  setup() {
    const unmanicVersion = ref('UNSET')

    function updateVersion() {
      unmanicGlobals.getUnmanicVersion().then((version) => {
        unmanicVersion.value = version;
      })
    }

    onMounted(() => {
      updateVersion();
    })

    return {
      unmanicVersion
    }
  }
}
</script>
