<template>
  <q-scroll-area
    style="height: 100%;"
    :style="$q.platform.is.mobile ? 'height: calc(100% - 90px); margin-top: 90px; border-right: 1px solid #ddd' : ''">
    <q-list padding>

      <q-item-label header>{{ $t('navigation.dataPanels') }}:</q-item-label>

      <q-item
        v-for="(item, index) in availableDataPanels"
        v-bind:key="index"
        clickable
        @click="$router.push('/ui/data-panels?pluginId=' + item.id)"
        v-ripple>
        <q-item-section avatar>
          <q-icon name="insights"/>
        </q-item-section>
        <q-item-section>
          {{ item.label }}
        </q-item-section>
      </q-item>


    </q-list>
  </q-scroll-area>

  <q-img
    v-if="$q.platform.is.mobile"
    class="absolute-top header-background"
    style="height: 90px;">
    <div class="absolute-center header-background">
      <q-avatar
        rounded
        clickable
        @click="$router.push('/ui/dashboard')"
        size="56px" class="q-mb-sm cursor-pointer">
        <q-img src="~assets/unmanic-logo-white.png"/>
      </q-avatar>
    </div>
  </q-img>

</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";

export default {
  name: 'DrawerDataPanelsNav',
  methods: {
    setPage(value) {
      this.$router.push('/ui/data-panels?pluginId=' + value)
    },
    fetchDataPanelList() {
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'plugins/panels/enabled'),
      }).then((response) => {
        // Success
        let pluginIds = []
        for (let i = 0; i < response.data.results.length; i++) {
          let plugin = response.data.results[i];
          pluginIds[pluginIds.length] = {
            id: plugin.plugin_id,
            label: plugin.name,
          }
        }
        this.availableDataPanels = pluginIds;
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchEnabledDataPanelPlugins'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    },
  },
  created() {
    this.fetchDataPanelList();
  },
  data: function () {
    const availableDataPanels = ref(null)
    return {
      availableDataPanels
    }
  }
}
</script>
