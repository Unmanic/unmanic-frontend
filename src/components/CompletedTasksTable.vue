<template>
  <div class="q-pa-md">
    <q-table
      title="Completed Tasks"
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="searchValue"
      @request="fetchCompletedTasks"
      binary-state-sort
      :selected-rows-label="getSelectedString"
      selection="multiple"
      v-model:selected="selected"
    >
      <template v-slot:top-left>
        <div class="row">

          <div class="col q-pl-md">
            <q-btn-toggle
              v-model="statusFilter"
              toggle-color="secondary"
              :options="statusFilterOptions"
            />
          </div>

          <div class="col q-pl-md">
            <q-input
              filled
              class="shadow-1"
              dense
              debounce="300"
              color="primary"
              v-model="searchValue"
              :placeholder="$t('navigation.search')">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </div>

          <div class="col q-pl-md" style="max-width: 300px">
            <q-input
              filled
              class="shadow-1"
              dense
              debounce="300"
              color="primary"
              :label="$t('components.completedTasks.since')"
              v-model="sinceDate">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="sinceDate" mask="YYYY-MM-DD HH:mm">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat/>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="sinceDate" mask="YYYY-MM-DD HH:mm" format24h>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat/>
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col q-pl-md" style="max-width: 300px">
            <q-input
              filled
              class="shadow-1"
              dense
              debounce="300"
              color="primary"
              :label="$t('components.completedTasks.before')"
              v-model="beforeDate">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="beforeDate" mask="YYYY-MM-DD HH:mm">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat/>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="beforeDate" mask="YYYY-MM-DD HH:mm" format24h>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat/>
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

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
import { ref } from 'vue';
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import dateTools from "src/js/dateTools";
import axios from "axios";
import CompletedTaskLogDialog from "components/CompletedTaskLogDialog";

export default {
  props: {
    initStatusFilter: {
      type: String,
      default: 'all',
      required: false
    }
  },
  methods: {
    getSelectedString: function () {
      let return_value = ''
      if (this.selected.length !== 0) {
        return_value = `${this.selected.length} record${this.selected.length > 1 ? 's' : ''} selected of ${this.rows.length}`
      }
      return return_value
    },
    deleteSelected: function () {
      if (this.selected.length !== 0) {
        // Fetch the selected row IDs
        let id_list = []
        for (let i = 0; i < this.selected.length; i++) {
          let row = this.selected[i];
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
          this.fetchCompletedTasks({
            pagination: this.pagination,
            searchValue: this.searchValue
          })
        }).catch(() => {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'An error was encountered while requesting the selected tasks be deleted',
            icon: 'report_problem',
            actions: [{ icon: 'close', color: 'white' }]
          })
        })
      } else {
        this.$q.notify({
          color: 'warning',
          position: 'top',
          message: 'Nothing selected',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }
    },
    selectLibraryForRecreateTask: function () {
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
        this.LibraryOptions = libraryPathsList;

        // If the list of libraries is only one, then don't bother showing this selector
        this.selectedLibraryId = 1;
        if (libraryPathsList.length === 1) {
          this.selectedLibraryId = defaultSelection;
          this.addSelectedToPendingTaskList();
        } else {
          this.selectLibrary = true;
        }
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchLibraryList'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    addSelectedToPendingTaskList: function () {
      if (this.selected.length !== 0) {
        // Fetch the selected row IDs
        let id_list = []
        for (let i = 0; i < this.selected.length; i++) {
          let row = this.selected[i];
          id_list[id_list.length] = row.id;
        }
        // Get library ID
        let library_id = this.selectedLibraryId
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
          this.fetchCompletedTasks({
            pagination: this.pagination,
            searchValue: this.searchValue
          })
        }).catch(() => {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'An error was encountered while requesting the selected tasks be added to the pending tasks list',
            icon: 'report_problem',
            actions: [{ icon: 'close', color: 'white' }]
          })
        })
      } else {
        this.$q.notify({
          color: 'warning',
          position: 'top',
          message: 'Nothing selected',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }
    },
    openDetailsDialog: function (id) {
      this.$q.dialog({
        component: CompletedTaskLogDialog,
        // props forwarded to your custom component
        componentProps: {
          completedTaskId: id
        },
      }).onOk((payload) => {
      }).onDismiss(() => {
      })
    },
    fetchCompletedTasks: function (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const searchValue = props.searchValue;

      this.loading = true;

      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage;

      // calculate starting row of data
      const startRow = (page - 1) * rowsPerPage;

      // Fetch from server
      let data = {
        start: startRow,
        length: fetchCount,
        search_value: searchValue,
        status: this.statusFilter,
        after: this.sinceDate,
        before: this.beforeDate,
        order_by: sortBy,
        order_direction: descending ? 'desc' : 'asc',
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'history/tasks'),
        data: data
      }).then((response) => {
        // update rowsCount with appropriate value
        this.pagination.rowsNumber = response.data.recordsFiltered;

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
        this.rows.splice(0, this.rows.length, ...returnedData);

        // don't forget to update local pagination object
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;

        // ...and turn of loading indicator
        this.loading = false;
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'An error was encountered while requesting the completed tasks list',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    }
  },
  watch: {
    statusFilter(value) {
      this.fetchCompletedTasks({
        pagination: this.pagination,
        searchValue: this.searchValue
      })
    },
    sinceDate(value) {
      this.fetchCompletedTasks({
        pagination: this.pagination,
        searchValue: this.searchValue
      })
    },
    beforeDate(value) {
      this.fetchCompletedTasks({
        pagination: this.pagination,
        searchValue: this.searchValue
      })
    },
  },
  mounted() {
    // Set default values
    this.statusFilter = this.initStatusFilter;

    // get initial data from server (1st page)
    this.fetchCompletedTasks({
      pagination: this.pagination,
      searchValue: undefined
    })

    // TODO: Remove on unmount
    this.reloadInterval = setInterval(() => {
      this.fetchCompletedTasks({
        pagination: this.pagination,
        searchValue: this.searchValue
      })
    }, 10000);
  },
  unmounted() {
    if (this.reloadInterval != null) {
      clearInterval(this.reloadInterval);
    }
  },
  data: function () {
    return {
      reloadInterval: ref(null),
      loading: ref(false),

      columns: ref([
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
      ]),

      rows: ref([]),
      searchValue: ref(''),
      statusFilter: ref('all'),
      statusFilterOptions: [
        {
          label: this.$t('status.all'),
          value: 'all'
        },
        {
          label: this.$t('status.success'),
          value: 'success'
        },
        {
          label: this.$t('status.failed'),
          value: 'failed'
        }
      ],
      sinceDate: ref(null),
      beforeDate: ref(null),
      pagination: ref({
        sortBy: 'finish_time',
        descending: true,
        page: 1,
        rowsPerPage: 15,
        rowsNumber: 10
      }),
      selected: ref([]),
      selectLibrary: ref(false),
      selectedLibraryId: ref(null),
      LibraryOptions: ref([]),
    }
  }
}
</script>
