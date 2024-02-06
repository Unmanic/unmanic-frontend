<template>
  <div class="q-pa-md">
    <q-table
      title="Pending Tasks"
      :rows="rows"
      :columns="columns"
      row-key="name"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
      binary-state-sort
      :selected-rows-label="getSelectedString"
      selection="multiple"
      v-model:selected="selected"
    >
      <template v-slot:top-left>
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
      </template>

      <template v-slot:top-right>
        <q-btn-dropdown class="q-ml-sm" color="secondary" :label="$t('navigation.options')">
          <q-list>
            <q-item clickable v-close-popup @click="rescanLibrary">
              <q-item-section>
                <q-item-label>
                  <q-icon name="search"/>
                  {{ $t('components.pendingTasks.rescanLibrary') }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator/>

            <q-item clickable v-close-popup @click="moveToTop">
              <q-item-section>
                <q-item-label>
                  <q-icon name="arrow_upward"/>
                  {{ $t('components.pendingTasks.moveToTop') }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="moveToBottom">
              <q-item-section>
                <q-item-label>
                  <q-icon name="arrow_downward"/>
                  {{ $t('components.pendingTasks.moveToBottom') }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator/>

            <q-item clickable v-close-popup @click="deleteSelected">
              <q-item-section>
                <q-item-label>
                  <q-icon name="delete_outline"/>
                  {{ $t('components.pendingTasks.removeSelected') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-accent q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied"/>
          <q-item-label>{{ $t('headers.listEmpty') }}</q-item-label>
          <q-icon size="2em" name="priority_high"/>
        </div>
      </template>

    </q-table>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue';
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { useQuasar } from "quasar";
import axios from "axios";
import { useI18n } from "vue-i18n";

const columns = [
  {
    name: 'id',
    label: 'Name',
    required: true,
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: false
  },
  {
    name: 'library',
    label: 'Library',
    required: true,
    align: 'left',
    field: row => row.libraryName,
    sortable: false
  }
]


export default {
  setup() {
    const $q = useQuasar();
    const { t: $t } = useI18n();
    const rows = ref([]);
    const filter = ref('');
    const loading = ref(false);
    const pagination = ref({
      sortBy: 'priority',
      descending: true,
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 10
    });
    const selected = ref([]);

    const rescanResponse = ref(null);
    let reloadInterval = null;

    function getSelectedString() {
      let return_value = ''
      if (selected.value.length !== 0) {
        return_value = `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${rows.value.length}`
      }
      return return_value
    }

    function rescanLibrary() {
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'pending/rescan')
      }).then((response) => {
        rescanResponse.value = response.data
      }).catch(() => {
        $q.notify({
          color: 'negative',
          position: 'top',
          message: $t('notifications.rescanLibraryError'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    }

    function moveToTop() {
      if (selected.value.length !== 0) {
        // Fetch the selected row IDs
        let id_list = []
        for (let i = 0; i < selected.value.length; i++) {
          let row = selected.value[i];
          id_list[id_list.length] = row.id;
        }
        // Send those to the backend
        let params = {
          id_list: id_list,
          position: 'top',
        }
        moveTo(params)
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

    function moveToBottom() {
      if (selected.value.length !== 0) {
        // Fetch the selected row IDs
        let id_list = []
        for (let i = 0; i < selected.value.length; i++) {
          let row = selected.value[i];
          id_list[id_list.length] = row.id;
        }
        // Send those to the backend
        let params = {
          id_list: id_list,
          position: 'bottom',
        }
        moveTo(params)
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

    function moveTo(data) {
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'pending/reorder'),
        data: data
      }).then((response) => {
        rescanResponse.value = response.data
        onRequest({
          pagination: pagination.value,
          filter: filter.value
        })
      }).catch(() => {
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'An error was encountered while requesting a task reorder',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    }

    function deleteSelected() {
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
          url: getUnmanicApiUrl('v2', 'pending/tasks'),
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
            message: 'An error was encountered while requesting the selected tasks be deleted',
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
        url: getUnmanicApiUrl('v2', 'pending/tasks'),
        data: data
      }).then((response) => {
        // update rowsCount with appropriate value
        pagination.value.rowsNumber = response.data.recordsFiltered;

        // Set returned data from server results
        const returnedData = [];
        for (let i = 0; i < response.data.results.length; i++) {
          let results = response.data.results[i];
          returnedData[i] = {
            id: results.id,
            name: results.abspath,
            libraryName: results.library_name,
            completed: results.finish_time,
            status: results.success ? 'Success' : 'Failed'
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
          message: 'An error was encountered while requesting the pending tasks list',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    }

    onMounted(() => {
      // get initial data from server
      onRequest({
        pagination: pagination.value,
        filter: undefined
      })
      reloadInterval = setInterval(() => {
        onRequest({
          pagination: pagination.value,
          filter: filter.value
        })
      }, 10000);
    })

    onUnmounted(() => {
      if (reloadInterval != null) {
        clearInterval(reloadInterval);
      }
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
      rescanLibrary,
      moveToTop,
      moveToBottom,
      deleteSelected,

      reloadTable() {
        onRequest({
          pagination: pagination.value,
          filter: filter.value
        })
      }
    }
  }
}
</script>
