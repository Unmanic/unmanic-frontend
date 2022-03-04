<template>
  <div v-if="$q.platform.is.mobile">
    <p class="text-subtitle1 q-mb-none">
      &copy; 2018-{{ new Date().getFullYear() }} by <a class="footer-link" target="_blank"
                                                       href="https://github.com/Josh5">Josh Sunnex</a>
    </p>
    <p class="text-subtitle1">
      {{ $t('components.footer.version') }}:
      <a class="footer-link"
         target="_blank"
         href="https://github.com/unmanic/unmanic/releases">{{ unmanicVersion }}</a>
    </p>
  </div>
  <div v-else>
    <div class="row q-mt-lg">
      <div class="col q-ml-lg">
        <p class="text-subtitle1">
          &copy; 2018-{{ new Date().getFullYear() }} by <a class="footer-link" target="_blank"
                                                           href="https://github.com/Josh5">Josh Sunnex</a>
        </p>
      </div>
      <div
        class="col-auto q-mr-lg">
        <p class="text-subtitle1">
          {{ $t('components.footer.version') }}:
          <a class="footer-link"
             target="_blank"
             href="https://github.com/unmanic/unmanic/releases">{{ unmanicVersion }}</a>
        </p>
      </div>
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

<style>
a.footer-link {
  color: inherit;
  text-decoration: inherit;
}
</style>
