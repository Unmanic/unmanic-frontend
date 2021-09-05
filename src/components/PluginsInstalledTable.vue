<template>
  <q-table
    title="Plugins"
    :rows="rows"
    :columns="columns"
    row-key="id"
    v-model:pagination="pagination"
    :loading="loading"
    :filter="filter"
    @request="onRequest"
    binary-state-sort
    :selected-rows-label="getSelectedString"
    selection="multiple"
    v-model:selected="selected"
  >

    <template v-slot:body-cell-icon="props">
      <q-td :props="props">
        <div>
          <span>
            <q-btn
              @click="openPluginInfo(props.row.id)">
              <q-skeleton v-if="!props.row.icon" width="35px" height="35px"/>
              <q-avatar v-else rounded size="35px">
                <img :src="props.row.icon" class="plugin-list-icon">
              </q-avatar>
            </q-btn>
          </span>
        </div>
      </q-td>
    </template>

    <template v-slot:body-cell-description="props">
      <q-td :props="props">
        <span v-html="props.row.description"></span>
      </q-td>
    </template>

    <template v-slot:body-cell-status="props">
      <q-td :props="props">
        <div class="row">
          <q-badge
            v-if="props.row.status.enabled"
            color="positive"
            class="shadow-1">
            {{ $t('status.enabled') }}
          </q-badge>
          <q-badge
            v-else
            color="negative"
            class="shadow-1">
            {{ $t('status.disabled') }}
          </q-badge>
        </div>
        <div class="row">
          <q-badge
            v-if="props.row.status.update_available"
            color="warning"
            class="shadow-1">
            {{ $t('components.plugins.updateAvailable') }}
          </q-badge>
          <q-badge
            v-else
            color="secondary"
            class="shadow-1">
            {{ $t('components.plugins.upToDate') }}
          </q-badge>
        </div>
      </q-td>
    </template>

    <template v-slot:top-left>
      <div class="row q-gutter-xs q-mt-xs">
        <div class="col-auto">
          <q-btn
            @click="openPluginInstaller"
            class=""
            color="secondary"
            icon-right="add"
            :label="$t('components.plugins.addNew')"/>
        </div>
        <div class="col-auto">
          <q-btn
            @click="openPluginFlow"
            class=""
            color="secondary"
            icon-right="low_priority"
            :label="$t('components.plugins.configurePluginFow')"/>
        </div>
      </div>
      <div class="row q-gutter-xs q-mt-xs">
        <div class="col-auto">
          <q-input
            filled
            class="shadow-1"
            dense
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
    </template>

    <template v-slot:top-right>
      <div class="row q-gutter-xs q-mt-xs">
        <div class="col-auto">
          <q-btn-dropdown class="q-ml-sm" color="secondary" :label="$t('navigation.options')">
            <q-list>
              <q-item clickable v-close-popup @click="enableSelected">
                <q-item-section>
                  <q-item-label>
                    <q-icon name="radio_button_checked"/>
                    {{ $t('components.plugins.enablePlugins') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="disableSelected">
                <q-item-section>
                  <q-item-label>
                    <q-icon name="radio_button_unchecked"/>
                    {{ $t('components.plugins.disablePlugins') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="updateSelected">
                <q-item-section>
                  <q-item-label>
                    <q-icon name="update"/>
                    {{ $t('components.plugins.updatePlugins') }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator/>

              <q-item clickable v-close-popup @click="uninstallSelected">
                <q-item-section>
                  <q-item-label>
                    <q-icon name="delete_outline"/>
                    {{ $t('components.plugins.removePlugins') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
    </template>

    <template v-slot:no-data>
      <div class="full-width row flex-center text-accent q-gutter-sm">
        <q-icon size="2em" name="sentiment_dissatisfied"/>
        <q-item-label>{{ $t('components.plugins.listEmpty') }}</q-item-label>
        <q-icon size="2em" name="priority_high"/>
      </div>
    </template>

  </q-table>

  <PluginInfo v-bind:showPluginInfo="showPluginInfo" v-on:hide="closePluginInfo"/>

</template>

<script>
import { onMounted, ref } from 'vue';
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { useQuasar } from "quasar";
import axios from "axios";
import PluginInfo from "components/PluginInfo";
import { bbCodeToHTML } from "src/js/markupParser";
import PluginFlowDialog from "components/PluginFlowDialog";
import PluginInstallerDialog from "components/PluginInstallerDialog";

const columns = [
  {
    name: 'icon',
    label: '',
    required: true,
    align: 'left',
    field: 'icon',
    sortable: false
  },
  {
    name: 'name',
    label: 'Plugin',
    required: true,
    align: 'left',
    field: 'name',
    sortable: true
  },
  {
    name: 'description',
    label: 'Description',
    required: true,
    align: 'left',
    field: 'description',
    sortable: true
  },
  {
    name: 'tags',
    label: 'Tags',
    required: true,
    align: 'left',
    field: 'tags',
    sortable: true
  },
  {
    name: 'author',
    label: 'Author',
    required: true,
    align: 'left',
    field: 'author',
    sortable: true
  },
  {
    name: 'version',
    label: 'Version',
    required: true,
    align: 'left',
    field: 'version',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    required: true,
    align: 'left',
    field: 'status',
    sortable: false
  }
]


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

    function getSelectedString() {
      let return_value = ''
      if (selected.value.length !== 0) {
        return_value = `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${rows.value.length}`
      }
      return return_value
    }

    function enableSelected() {
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
          url: getUnmanicApiUrl('v2', 'plugins/enable'),
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
            message: 'An error was encountered while requesting the selected plugins be enabled',
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

    function updateSelected() {
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

    function uninstallSelected() {
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

    function openPluginInfo(table_id) {
      showPluginInfo.value = '';
      for (let i = 0; i < listedPlugins.value.length; i++) {
        let plugin = listedPlugins.value[i];
        if (plugin.id === table_id) {
          showPluginInfo.value = plugin.plugin_id;
        }
      }
    }

    function closePluginInfo() {
      showPluginInfo.value = '';
    }

    function openPluginFlow() {
      $q.dialog({
        component: PluginFlowDialog,
        // props forwarded to your custom component
        componentProps: {},
      }).onOk((payload) => {
      }).onDismiss(() => {
      })
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

    return {
      selected,
      filter,
      loading,
      pagination,
      columns,
      rows,

      getSelectedString,
      onRequest,
      enableSelected,
      disableSelected,
      updateSelected,
      uninstallSelected,
      openPluginInfo,
      showPluginInfo,
      closePluginInfo,
      openPluginFlow,
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
