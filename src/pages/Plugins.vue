<template>
  <SettingsNav v-on:page="setIframeSrc"/>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <div class="row">
        <div class="col q-ma-sm">
          <PluginsInstalledTable/>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script>
import SettingsNav from "components/SettingsNav";
import PluginsInstalledTable from "components/PluginsInstalledTable";

export default {
  components: { PluginsInstalledTable, SettingsNav },
  methods: {
    setIframeSrc(pageName) {
      this.$router.push('/unmanic-settings?step=' + pageName)
    }
  }
}
</script>
