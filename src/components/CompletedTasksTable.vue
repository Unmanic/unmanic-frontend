<template>
  <div class="q-pa-md">
    <q-table
      title="Completed Tasks"
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
            <q-item clickable v-close-popup @click="selectLibraryForRecreateTask">
              <q-item-section>
                <q-item-label>
                  <q-icon name="add"/>
                  {{ $t('components.completedTasks.addToPendingTasksList') }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator/>

            <q-item clickable v-close-popup @click="deleteSelected">
              <q-item-section>
                <q-item-label>
                  <q-icon name="delete_outline"/>
                  {{ $t('components.completedTasks.removeSelected') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>

      <template v-slot:body-cell-task_success="props">
        <q-td :props="props">
          <div class="row">
            <q-badge
              v-if="props.row.status"
              color="positive"
              class="shadow-1">
              {{ $t('status.success') }}
            </q-badge>
            <q-badge
              v-else
              color="negative"
              class="shadow-1">
              {{ $t('status.failed') }}
            </q-badge>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-details="props">
        <q-td :props="props">
          <div class="row">
            <q-btn
              @click="openDetailsDialog(props.row.id)"
              color="secondary"
              :label="$t('components.completedTasks.details')"/>
          </div>
        </q-td>
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

  <q-dialog v-model="selectLibrary" persistent>
    <q-card style="min-width: 350px">

      <q-card-section>
        <div class="text-h6">{{ $t('headers.selectLibrary') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select
          filled
          emit-value
          map-options
          v-model="selectedLibraryId"
          :options="LibraryOptions"
          :label="$t('components.completedTasks.selectLibraryToAdd')"/>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat :label="$t('navigation.cancel')" v-close-popup/>
        <q-btn
          @click="addSelectedToPendingTaskList"
          flat :label="$t('navigation.submit')" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { onMounted, ref } from 'vue';
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { useQuasar } from "quasar";
import dateTools from "src/js/dateTools";
import axios from "axios";
import CompletedTaskLogDialog from "components/CompletedTaskLogDialog";
import { useI18n } from "vue-i18n";

const columns = [
  {
    name: 'task_label',
    label: 'Name',
    required: true,
    align: 'left',
    field: 'name',
    sortable: true
  },
  {
    name: 'finish_time',
    label: 'Completed',
    required: true,
    align: 'left',
    field: 'dateTimeCompleted',
    sortable: true
  },
  {
    name: 'task_success',
    label: 'Status',
    required: true,
    align: 'left',
    field: 'status',
    sortable: true
  },
  {
    name: 'details',
    label: 'Details',
    required: true,
    align: 'left',
    field: 'id',
    sortable: false
  }
]

export default {
  setup() {
    const $q = useQuasar();
    const { t: $t } = useI18n();
    const rows = ref([])
    const filter = ref('')
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'finish_time',
      descending: true,
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 10
    })
    const selected = ref([]);
    const selectLibrary = ref(false)
    const selectedLibraryId = ref(null)
    const LibraryOptions = ref([])

    function getSelectedString() {
      let return_value = ''
      if (selected.value.length !== 0) {
        return_value = `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${rows.value.length}`
      }
      return return_value
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
          url: getUnmanicApiUrl('v2', 'history/tasks'),
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

    function selectLibraryForRecreateTask() {
      // Fetch current settings
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/libraries')
      }).then((response) => {
        let libraryPathsList = []
        let defaultSelection;
        for (let i = 0; i < response.data.libraries.length; i++) {
          let libraryPath = response.data.libraries[i];
          if (typeof defaultSelection === 'undefined') {
            defaultSelection = libraryPath.id
          }
          libraryPathsList[libraryPathsList.length] = {
            label: libraryPath.name,
            value: libraryPath.id,
          }
        }
        LibraryOptions.value = libraryPathsList;

        // If the list of libraries is only one, then dont bother showing this selector
        selectedLibraryId.value = 1;
        if (libraryPathsList.length === 1) {
          selectedLibraryId.value = defaultSelection;
          addSelectedToPendingTaskList();
        } else {
          selectLibrary.value = true;
        }
      }).catch(() => {
        $q.notify({
          color: 'negative',
          position: 'top',
          message: $t('notifications.failedToFetchLibraryList'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    }

    function addSelectedToPendingTaskList() {
      if (selected.value.length !== 0) {
        // Fetch the selected row IDs
        let id_list = []
        for (let i = 0; i < selected.value.length; i++) {
          let row = selected.value[i];
          id_list[id_list.length] = row.id;
        }
        // Get library ID
        let library_id = selectedLibraryId.value
        // Send those to the backend
        let data = {
          id_list: id_list,
          library_id: library_id,
        }
        axios({
          method: 'post',
          url: getUnmanicApiUrl('v2', 'history/reprocess'),
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
            message: 'An error was encountered while requesting the selected tasks be added to the pending tasks list',
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
        url: getUnmanicApiUrl('v2', 'history/tasks'),
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
            name: results.task_label,
            dateTimeCompleted: dateTools.printDateTimeString(results.finish_time),
            status: results.task_success
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
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    }

    function openDetailsDialog(id) {
      $q.dialog({
        component: CompletedTaskLogDialog,
        // props forwarded to your custom component
        componentProps: {
          completedTaskId: id
        },
      }).onOk((payload) => {
      }).onDismiss(() => {
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

      selectLibrary,
      selectedLibraryId,
      LibraryOptions,

      getSelectedString,
      onRequest,
      deleteSelected,
      selectLibraryForRecreateTask,
      addSelectedToPendingTaskList,
      openDetailsDialog
    }
  }
}
</script>
