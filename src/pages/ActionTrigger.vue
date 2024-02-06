<template>
  <q-page padding>
    <!-- content -->
  </q-page>
</template>

<script>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    function navigateToDashboard() {
      router.replace('/ui/dashboard')
    }

    function reloadSession() {
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'session/reload')
      }).then((response) => {
        navigateToDashboard();
      }).catch(() => {
        console.error("Failed to reload session.")
      })
    }

    onMounted(() => {
      if (typeof route.query !== 'undefined') {
        if (route.query.session === 'reload') {
          console.log("HERE")
          reloadSession()
        }
      }
    })

    return {}
  }
}
</script>
