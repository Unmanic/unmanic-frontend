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
              <q-avatar rounded size="32px">
                <img :src="props.row.icon" class="plugin-list-icon">
              </q-avatar>
            </q-btn>
          </span>
        </div>
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
      <q-btn
        color="secondary"
        icon-right="add"
        :label="$t('components.plugins.addNew')"/>
      <q-btn
        class="q-ml-sm"
        color="secondary"
        icon-right="account_tree"
        :label="$t('components.plugins.configurePluginFow')"/>
      <q-input borderless dense debounce="300" color="primary" v-model="filter" :placeholder="$t('navigation.search')">
        <template v-slot:append>
          <q-icon name="search"/>
        </template>
      </q-input>
    </template>

    <template v-slot:top-right>
      <q-btn-dropdown class="q-ml-sm" color="secondary" label="Options">
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
    </template>

    <template v-slot:no-data>
      <div class="full-width row flex-center text-accent q-gutter-sm">
        <q-icon size="2em" name="sentiment_dissatisfied"/>
        <q-item-label>{{ $t('components.completedTasks.listEmpty') }}</q-item-label>
        <q-icon size="2em" name="priority_high"/>
      </div>
    </template>

  </q-table>
</template>

<script>
import { onMounted, ref } from 'vue';
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { useQuasar } from "quasar";
import dateTools from "src/js/dateTools";
import axios from "axios";

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
    sortable: true
  }
]


export default {
  setup() {
    const $q = useQuasar();
    const rows = ref([])
    const filter = ref('')
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'name',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10
    })
    const selected = ref([]);

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
            icon: 'report_problem'
          })
        })
      } else {
        $q.notify({
          color: 'warning',
          position: 'top',
          message: 'Nothing selected',
          icon: 'report_problem'
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
            icon: 'report_problem'
          })
        })
      } else {
        $q.notify({
          color: 'warning',
          position: 'top',
          message: 'Nothing selected',
          icon: 'report_problem'
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
            icon: 'report_problem'
          })
        })
      } else {
        $q.notify({
          color: 'warning',
          position: 'top',
          message: 'Nothing selected',
          icon: 'report_problem'
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
            icon: 'report_problem'
          })
        })
      } else {
        $q.notify({
          color: 'warning',
          position: 'top',
          message: 'Nothing selected',
          icon: 'report_problem'
        })
      }
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
        const returnedData = [];
        for (let i = 0; i < response.data.results.length; i++) {
          let results = response.data.results[i];
          console.log(results)
          returnedData[i] = {
            id: results.id,
            icon: results.icon,
            name: results.name,
            description: results.description,
            tags: results.tags,
            author: results.author,
            version: results.version,
            status: results.status,
          }
        }

        // clear out existing data and add new
        rows.value.splice(0, rows.value.length, ...returnedData);

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
          message: 'An error was encountered while requesting the completed tasks list',
          icon: 'report_problem'
        })
      })
    }

    function openPluginInfo(e) {
      console.log(e)

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
