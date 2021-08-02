<template>
  <q-page padding>
    <!-- content -->
  </q-page>
</template>

<script>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";

export default {
  setup() {
    const router = useRoute()

    function reloadSession() {
      axios({
        method: 'put',
        url: getUnmanicApiUrl('v2', 'session/reload')
      }).then((response) => {
        window.location.href = '/';
      }).catch(() => {
        console.error("Failed to reload session.")
      })
    }

    onMounted(() => {
      if (typeof router.query !== 'undefined') {
        if (router.query.session === 'reload') {
          reloadSession()
        }
      }
    })

    return {}
  }
}
</script>
