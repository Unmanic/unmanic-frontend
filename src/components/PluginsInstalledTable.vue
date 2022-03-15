<template>


  <q-card flat>
    <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">
      <div class="row q-gutter-xs q-mt-xs justify-between">
        <div class="col-auto">
          <q-btn
            @click="openPluginInstaller"
            class=""
            color="secondary"
            icon-right="add"
            :label="$t('components.plugins.installPlugins')"/>
        </div>
        <div class="col-auto" style="max-width: 200px">
          <q-input
            filled dense
            class="shadow-1"
            debounce="300"
            color="primary"
            v-model="filter"
            :placeholder="$t('navigation.search')">
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>
        </div>
      </div>
    </q-card-section>

    <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">
      <div class="q-gutter-sm">
        <q-list
          bordered
          separator
          class="rounded-borders">

          <div
            v-for="(plugin, index) in listedPlugins"
            v-bind:key="index">
            <q-item :class="plugin.status.update_available ? 'bg-warning' : ''">
              <q-item-section avatar>
                <q-img :src="plugin.icon"/>
              </q-item-section>

              <q-item-section top class="">
                <q-item-label>{{ plugin.name }}</q-item-label>
                <q-item-label caption lines="3">
                  <span v-html="plugin.description"></span>
                </q-item-label>
              </q-item-section>

              <q-item-section top class="gt-xs col-2">
                <q-item-label lines="1">
                  <div class="row">
                    <div class="col-6 text-right">
                      <span class="text-weight-medium">Author</span>
                    </div>
                    <div class="col-6 q-px-sm">
                      <span
                        :class="$q.dark.isActive && !plugin.status.update_available ? 'text-grey-5' : 'text-grey-8'">
                        {{ plugin.author }}
                      </span>
                    </div>
                  </div>
                </q-item-label>
                <q-item-label lines="1">
                  <div class="row">
                    <div class="col-6 text-right">
                      <span class="text-weight-medium">Version</span>
                    </div>
                    <div class="col-6 q-px-sm">
                      <span
                        :class="$q.dark.isActive && !plugin.status.update_available ? 'text-grey-5' : 'text-grey-8'">
                        {{ plugin.version }}
                      </span>
                    </div>
                  </div>
                </q-item-label>
              </q-item-section>

              <q-item-section center side>
                <div class="text-grey-8 q-gutter-xs q-mr-lg">
                  <q-btn
                    v-if="plugin.status.update_available"
                    flat dense round
                    class="gt-xs"
                    size="12px"
                    color="info"
                    icon="update"
                    @click="updateSinglePlugin(plugin.id)">
                  </q-btn>
                  <q-btn
                    v-else
                    disable
                    flat dense round
                    class="gt-xs no-pointer-events"
                    size="12px"
                    color="positive"
                    icon="download_done">
                  </q-btn>
                </div>
                <q-tooltip class="bg-white text-primary">
                  <span
                    v-if="plugin.status.update_available">
                  {{ $t('components.plugins.clickToUpdatePlugin') }}
                  </span>
                  <span
                    v-else>
                  {{ $t('components.plugins.pluginUpToDate') }}
                  </span>
                </q-tooltip>
              </q-item-section>

              <q-separator inset vertical class="q-mx-sm"/>

              <q-item-section center side>
                <div class="text-grey-8 q-gutter-xs">

                  <q-btn-dropdown
                    flat dense rounded
                    class="lt-sm"
                    size="12px"
                    no-icon-animation
                    dropdown-icon="more_vert">
                    <q-list>

                      <q-item clickable v-close-popup @click="openPluginInfo(plugin.id)">
                        <q-item-section avatar>
                          <q-icon color="info" name="info"/>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('headers.pluginInfo') }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup @click="openPluginInfo(plugin.id, 'settings')"
                              v-if="plugin.has_config">
                        <q-item-section avatar>
                          <q-icon color="grey-8" name="tune"/>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('components.plugins.globalConfiguration') }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup @click="updateSinglePlugin(plugin.id)"
                              v-if="plugin.status.update_available">
                        <q-item-section avatar>
                          <q-icon color="warning" name="update"/>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('components.plugins.updatePlugin') }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup @click="removeSinglePlugin(plugin.id)">
                        <q-item-section avatar>
                          <q-icon color="negative" name="delete"/>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('components.plugins.removePlugin') }}</q-item-label>
                        </q-item-section>
                      </q-item>

                    </q-list>
                  </q-btn-dropdown>

                  <q-btn
                    flat dense round
                    class="gt-xs"
                    size="12px"
                    color="secondary"
                    icon="info"
                    @click="openPluginInfo(plugin.id)">
                    <q-tooltip class="bg-white text-primary">{{ $t('headers.pluginInfo') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    :disable="!plugin.has_config"
                    flat dense round
                    class="gt-xs"
                    size="12px"
                    color="grey-8"
                    icon="tune"
                    @click="openPluginInfo(plugin.id, 'settings')">
                    <q-tooltip class="bg-white text-primary">
                      {{ $t('components.plugins.globalConfiguration') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    flat dense round
                    class="gt-xs"
                    size="12px"
                    color="negative"
                    icon="delete"
                    @click="removeSinglePlugin(plugin.id)">
                    <q-tooltip class="bg-white text-primary">{{ $t('components.plugins.removePlugin') }}</q-tooltip>
                  </q-btn>

                </div>
              </q-item-section>
              <q-tooltip
                v-if="plugin.status.update_available"
                class="bg-white text-primary">{{ $t('components.plugins.updateAvailable') }}
              </q-tooltip>
            </q-item>
          </div>

        </q-list>
      </div>
    </q-card-section>
  </q-card>

  <PluginInfo v-bind:showPluginInfo="showPluginInfo"
              v-bind:showPluginSettings="showPluginSettings"
              v-on:hide="closePluginInfo"/>

</template>

<script>
import { onMounted, watch, ref } from 'vue';
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { useQuasar } from "quasar";
import axios from "axios";
import PluginInfo from "components/PluginInfo";
import { bbCodeToHTML } from "src/js/markupParser";
import PluginInstallerDialog from "components/PluginInstallerDialog";

export default {
  components: { PluginInfo },
  setup() {
    const $q = useQuasar();
    const rows = ref([]);
    const filter = ref('');
    const loading = ref(false);
    const pagination = ref({
      sortBy: 'name',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 10
    })
    const selected = ref([]);
    const listedPlugins = ref([]);

    const itemOffset = ref(0)

    function getSelectedString() {
      let return_value = ''
      if (selected.value.length !== 0) {
        return_value = `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${rows.value.length}`
      }
      return return_value
    }

    function disableSelected() {
      if (selected.value.length !== 0) {
        // Fetch the selected row IDs
        let id_list = []
        for (let i = 0; i < selected.value.length; i++) {
          let row = selected.value[i];
          id_list[id_list.length] = row.id;
        }
        // Send those to the backend
        let data = {
          id_list: id_list,
        }
        axios({
          method: 'post',
          url: getUnmanicApiUrl('v2', 'plugins/disable'),
          data: data
        }).then((response) => {
          onRequest({
            pagination: pagination.value,
            filter: filter.value
          })
        }).catch(() => {
          $q.notify({
            color: 'negative',
            position: 'top',
            message: 'An error was encountered while requesting the selected plugins be disabled',
            icon: 'report_problem',
            actions: [{ icon: 'close', color: 'white' }]
          })
        })
      } else {
        $q.notify({
          color: 'warning',
          position: 'top',
          message: 'Nothing selected',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }
    }

    function updatePluginList(id_list) {
      let data = {
        id_list: id_list,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/update'),
        data: data
      }).then((response) => {
        onRequest({
          pagination: pagination.value,
          filter: filter.value
        })
      }).catch(() => {
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'An error was encountered while requesting the selected plugins be updated',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    }

    function updateSinglePlugin(tableId) {
      updatePluginList([tableId]);
    }

    function removePluginList(id_list) {
      let data = {
        id_list: id_list,
      }
      axios({
        method: 'delete',
        url: getUnmanicApiUrl('v2', 'plugins/remove'),
        data: data
      }).then((response) => {
        onRequest({
          pagination: pagination.value,
          filter: filter.value
        })
      }).catch(() => {
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'An error was encountered while requesting the selected plugins be removed',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    }

    function removeSinglePlugin(tableId) {
      removePluginList([tableId]);
    }

    function uninstallSelected() {
      if (selected.value.length !== 0) {
        // Fetch the selected row IDs
        let id_list = []
        for (let i = 0; i < selected.value.length; i++) {
          let row = selected.value[i];
          id_list[id_list.length] = row.id;
        }
        // Send those to the backend
        removePluginList(id_list);
      } else {
        $q.notify({
          color: 'warning',
          position: 'top',
          message: 'Nothing selected',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }
    }

    function parseAndLimitDescription(description_text) {
      // Limit description text to 280 characters
      if (description_text.length > 280) {
        description_text = description_text.substring(0, 277) + '...';
      }
      // Only show first line in multi-line description text.
      description_text = description_text.split('\n')[0];
      // Parse BBCode
      return bbCodeToHTML(description_text);
    }

    function onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const filter = props.filter;

      loading.value = true;

      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;

      // calculate starting row of data
      const startRow = (page - 1) * rowsPerPage;

      // Fetch from server
      let data = {
        start: startRow,
        length: fetchCount,
        search_value: filter,
        order_by: sortBy,
        order_direction: descending ? 'desc' : 'asc',
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/installed'),
        data: data
      }).then((response) => {
        // update rowsCount with appropriate value
        pagination.value.rowsNumber = response.data.recordsFiltered;

        // Set returned data from server results
        listedPlugins.value = [];
        for (let i = 0; i < response.data.results.length; i++) {
          let results = response.data.results[i];
          listedPlugins.value[i] = {
            id: results.id,
            plugin_id: results.plugin_id,
            icon: results.icon,
            name: results.name,
            description: parseAndLimitDescription(results.description),
            tags: results.tags,
            author: results.author,
            version: results.version,
            status: results.status,
            has_config: results.has_config,
          }
        }

        // clear out existing data and add new
        rows.value.splice(0, rows.value.length, ...listedPlugins.value);

        // don't forget to update local pagination object
        pagination.value.page = page;
        pagination.value.rowsPerPage = rowsPerPage;
        pagination.value.sortBy = sortBy;
        pagination.value.descending = descending;

        // ...and turn of loading indicator
        loading.value = false;
      }).catch(() => {
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'An error was encountered while requesting the installed plugins list',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    }

    const showPluginInfo = ref('');
    const showPluginSettings = ref('');

    function openPluginInfo(table_id, tab) {
      showPluginInfo.value = '';
      showPluginSettings.value = '';
      for (let i = 0; i < listedPlugins.value.length; i++) {
        let plugin = listedPlugins.value[i];
        if (plugin.id === table_id) {
          if (tab === 'settings') {
            showPluginSettings.value = plugin.plugin_id;
          } else {
            showPluginInfo.value = plugin.plugin_id;
          }
        }
      }
    }

    function closePluginInfo() {
      showPluginInfo.value = '';
      showPluginSettings.value = '';
    }

    function openPluginInstaller() {
      $q.dialog({
        component: PluginInstallerDialog,
        // props forwarded to your custom component
        componentProps: {},
      }).onOk((payload) => {
      }).onDismiss(() => {
        onRequest({
          pagination: pagination.value,
          filter: filter.value
        })
      })
    }

    onMounted(() => {
      // get initial data from server (1st page)
      onRequest({
        pagination: pagination.value,
        filter: undefined
      })
    })

    watch(filter, (currentValue, oldValue) => {
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
    });

    return {
      selected,
      filter,
      loading,
      pagination,
      rows,

      listedPlugins,
      itemOffset,

      getSelectedString,
      onRequest,
      disableSelected,
      updateSinglePlugin,
      removeSinglePlugin,
      openPluginInfo,
      showPluginInfo,
      showPluginSettings,
      closePluginInfo,
      openPluginInstaller
    }
  }
}
</script>
<style>
.plugin-list-icon {
  display: block;
  width: auto;
  max-width: 32px;
  height: 32px;
  border: none;
  text-decoration: none;
  vertical-align: middle;
}
</style>
