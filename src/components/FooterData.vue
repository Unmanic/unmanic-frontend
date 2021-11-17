<template>
  <div class="row">
    <div class="col">
      <p class="text-subtitle1">
        &copy; 2018-2021 by <a href="https://github.com/Josh5">Josh Sunnex</a> (<a href="https://ko-fi.com/josh5coffee">Buy Me a Coffee!</a>)
      </p>
    </div>
    <div class="col-auto">
      <p class="text-subtitle1">
        Unmanic Version <a href="https://github.com/unmanic/unmanic/releases">{{ unmanicVersion }}</a>
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
