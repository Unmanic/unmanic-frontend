<template>
  <div class="completed-tasks-table">
    <div class="completed-tasks-table-actions-bar">
      <div class="q-pa-md">
        <div class="row q-col-gutter-sm items-center completed-tasks-toolbar">
          <div class="col-12">
            <q-input
              outlined
              dense
              debounce="300"
              color="secondary"
              v-model="searchValue"
              :placeholder="$t('navigation.search')">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </div>

          <div class="col-12">
            <div class="row items-center q-col-gutter-sm justify-between completed-tasks-action-row">
              <div class="col-auto">
                <q-btn
                  outline
                  color="secondary"
                  icon="filter_list"
                  :label="$t('components.completedTasks.filters')"
                  :size="filterSortButtonSize"
                  @click="openFilterDialog"/>
              </div>

              <div class="col-auto">
                <q-btn
                  outline
                  color="secondary"
                  icon="sort"
                  :label="$t('components.completedTasks.sortBy')"
                  :size="filterSortButtonSize"
                  @click="openSortDialog"/>
              </div>

              <div class="col-auto q-ml-auto">
                <UnmanicStandardButtonDropdown
                  class="completed-tasks-options-button"
                  :label="$t('navigation.options')"
                  :size="filterSortButtonSize">
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
                </UnmanicStandardButtonDropdown>
              </div>
            </div>
          </div>
        </div>

        <div class="row items-center q-col-gutter-sm q-mt-sm completed-tasks-selection">
          <div class="col-auto">
            <q-checkbox
              :model-value="allPageSelected"
              @update:model-value="toggleSelectPage"
              color="secondary"
              :label="$t('components.completedTasks.selectPage')"/>
          </div>
          <div class="col-auto text-secondary">
            {{ selectedCountLabel }}
          </div>
          <div class="col-auto">
            <q-btn
              v-if="selectedCount > 0"
              flat
              color="secondary"
              :label="$t('components.completedTasks.clearSelection')"
              @click="clearSelection"/>
          </div>
        </div>

        <div
          v-if="showSelectAllMatchingPrompt"
          class="row items-center q-col-gutter-sm q-mt-xs completed-tasks-selection-hint">
          <div class="col-auto text-secondary">
            {{ $t('components.completedTasks.allPageSelected') }}
          </div>
          <div class="col-auto">
            <q-btn
              flat
              color="secondary"
              :label="$t('components.completedTasks.selectAllMatching', { count: totalCount })"
              @click="selectAllMatchingResults"/>
          </div>
        </div>

        <div
          v-if="selectAllMatching"
          class="row items-center q-col-gutter-sm q-mt-xs completed-tasks-selection-hint">
          <div class="col-auto text-secondary">
            {{ $t('components.completedTasks.allMatchingSelected', { count: selectedCount }) }}
          </div>
        </div>
      </div>
      <q-separator/>
    </div>

    <div class="completed-tasks-table-wrapper">
      <div class="q-pa-md completed-tasks-body">
        <q-list
          bordered
          separator
          class="rounded-borders completed-tasks-list">
          <q-infinite-scroll
            :disable="allLoaded"
            :offset="200"
            :scroll-target="scrollTarget"
            @load="loadMore">
          <q-item
            v-for="task in rows"
            :key="task.id">
            <q-item-section avatar class="completed-task-checkbox">
              <q-checkbox
                color="secondary"
                :model-value="isRowSelected(task)"
                @update:model-value="value => toggleRowSelection(task, value)"/>
            </q-item-section>

            <q-item-section top>
              <q-item-label>{{ task.name }}</q-item-label>
              <q-item-label caption lines="1">
              <span class="text-weight-medium">
                {{ $t('components.completedTasks.columns.completed') }}:
              </span>
                {{ task.dateTimeCompleted }}
              </q-item-label>
              <q-item-label caption lines="1">
              <span class="text-weight-medium">
                {{ $t('components.completedTasks.columns.status') }}:
              </span>
                <q-badge :color="task.status ? 'positive' : 'negative'">
                  {{ task.status ? $t('status.success') : $t('status.failed') }}
                </q-badge>
              </q-item-label>
            </q-item-section>

            <q-item-section side top class="completed-task-actions">
              <UnmanicStandardButton
                @click="openDetailsDialog(task.id)"
                :label="$t('components.completedTasks.details')"/>
            </q-item-section>
          </q-item>

            <div v-if="loadingMore" class="row flex-center q-my-md">
              <q-spinner size="32px" color="secondary"/>
            </div>
          </q-infinite-scroll>

          <q-item v-if="!loading && rows.length === 0">
            <q-item-section>
              <div class="full-width row flex-center text-accent q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied"/>
                <q-item-label>{{ $t('headers.listEmpty') }}</q-item-label>
                <q-icon size="2em" name="priority_high"/>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="row justify-center q-mt-md" v-if="!allLoaded && rows.length > 0">
          <q-btn
            outline
            color="secondary"
            :loading="loadingMore"
            :label="$t('components.completedTasks.loadMore')"
            @click="manualLoadMore"/>
        </div>

        <q-inner-loading :showing="loading && rows.length === 0">
          <q-spinner size="42px" color="secondary"/>
        </q-inner-loading>
      </div>
    </div>
  </div>

  <div class="completed-tasks-scroll-top" v-show="showScrollTop">
    <q-btn round color="secondary" icon="keyboard_arrow_up" @click="scrollToTop">
      <q-tooltip>{{ $t('components.completedTasks.scrollToTop') }}</q-tooltip>
    </q-btn>
  </div>

  <q-dialog v-model="filterDialogOpen" backdrop-filter="blur(2px)">
    <q-card class="completed-tasks-dialog-card" flat bordered>
      <q-card-section class="bg-card-head completed-tasks-dialog-header row items-center justify-between no-wrap">
        <div class="text-h6 text-primary">
          {{ $t('components.completedTasks.filtersTitle') }}
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section class="completed-tasks-dialog-body scroll q-pa-lg q-gutter-md">
        <q-btn-toggle
          v-model="draftStatusFilter"
          toggle-color="secondary"
          :options="statusFilterOptions"
        />

        <q-input
          outlined
          dense
          debounce="300"
          color="secondary"
          :label="$t('components.completedTasks.since')"
          v-model="draftSinceDate">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="draftSinceDate" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="$t('navigation.close')" color="secondary" flat/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="draftSinceDate" mask="YYYY-MM-DD HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="$t('navigation.close')" color="secondary" flat/>
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input
          outlined
          dense
          debounce="300"
          color="secondary"
          :label="$t('components.completedTasks.before')"
          v-model="draftBeforeDate">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="draftBeforeDate" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="$t('navigation.close')" color="secondary" flat/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="draftBeforeDate" mask="YYYY-MM-DD HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="$t('navigation.close')" color="secondary" flat/>
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="between">
        <q-btn
          outline
          color="secondary"
          :label="$t('components.completedTasks.clear')"
          @click="clearFilterDrafts"/>
        <q-btn
          color="secondary"
          :label="$t('components.completedTasks.apply')"
          v-close-popup
          @click="applyFilterDrafts"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="sortDialogOpen" backdrop-filter="blur(2px)">
    <q-card class="completed-tasks-dialog-card" flat bordered>
      <q-card-section class="bg-card-head completed-tasks-dialog-header row items-center justify-between no-wrap">
        <div class="text-h6 text-primary">
          {{ $t('components.completedTasks.sortTitle') }}
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section class="completed-tasks-dialog-body scroll q-pa-lg q-gutter-md">
        <q-list bordered separator>
          <q-item clickable v-ripple @click="toggleDraftSort('finish_time')">
            <q-item-section>{{ $t('components.completedTasks.columns.completed') }}</q-item-section>
            <q-item-section side>
              <q-icon
                :name="draftSortBy === 'finish_time' ? (draftDescending ? 'arrow_downward' : 'arrow_upward') : 'sort'"
                :color="draftSortBy === 'finish_time' ? 'secondary' : 'grey-5'"/>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="toggleDraftSort('task_label')">
            <q-item-section>{{ $t('components.completedTasks.columns.name') }}</q-item-section>
            <q-item-section side>
              <q-icon
                :name="draftSortBy === 'task_label' ? (draftDescending ? 'arrow_downward' : 'arrow_upward') : 'sort'"
                :color="draftSortBy === 'task_label' ? 'secondary' : 'grey-5'"/>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="toggleDraftSort('task_success')">
            <q-item-section>{{ $t('components.completedTasks.columns.status') }}</q-item-section>
            <q-item-section side>
              <q-icon
                :name="draftSortBy === 'task_success' ? (draftDescending ? 'arrow_downward' : 'arrow_upward') : 'sort'"
                :color="draftSortBy === 'task_success' ? 'secondary' : 'grey-5'"/>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="between">
        <q-btn
          outline
          color="secondary"
          :label="$t('components.completedTasks.clear')"
          @click="clearSortDrafts"/>
        <q-btn
          color="secondary"
          :label="$t('components.completedTasks.apply')"
          v-close-popup
          @click="applySortDrafts"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="selectLibrary" persistent>
    <q-card class="select-library-card" flat bordered>

      <q-card-section>
        <div class="text-h6 text-primary">{{ $t('headers.selectLibrary') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select
          outlined
          dense
          color="secondary"
          emit-value
          map-options
          v-model="selectedLibraryId"
          :options="LibraryOptions"
          :label="$t('components.completedTasks.selectLibraryToAdd')"/>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="secondary" :label="$t('navigation.cancel')" v-close-popup/>
        <q-btn
          @click="addSelectedToPendingTaskList"
          flat color="secondary" :label="$t('navigation.submit')" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from 'vue';
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import dateTools from "src/js/dateTools";
import axios from "axios";
import CompletedTaskLogDialog from "components/dashboard/completed/partials/CompletedTaskLogDialog.vue";
import UnmanicStandardButton from "components/ui/buttons/UnmanicStandardButton.vue";
import UnmanicStandardButtonDropdown from "components/ui/buttons/UnmanicStandardButtonDropdown.vue";
import { useQuasar } from "quasar";

export default {
  components: { UnmanicStandardButton, UnmanicStandardButtonDropdown },
  setup() {
    const $q = useQuasar();

    return {
      $q,
    };
  },
  props: {
    initStatusFilter: {
      type: String,
      default: 'all',
      required: false
    }
  },
  computed: {
    filterSortButtonSize() {
      return this.$q.screen.width < 450 ? 'sm' : 'md';
    },
    selectedCount() {
      if (this.selectAllMatching) {
        return Math.max(0, this.totalCount - this.excludedIds.length);
      }
      return this.selectedIds.length;
    },
    selectedCountLabel() {
      if (this.selectedCount === 0) {
        return this.$t('components.completedTasks.noSelection');
      }
      return this.$t('components.completedTasks.selectedCount', {
        count: this.selectedCount,
        total: this.totalCount
      });
    },
    allPageSelected() {
      if (this.rows.length === 0) {
        return false;
      }
      return this.rows.every((row) => this.isRowSelected(row));
    },
    showSelectAllMatchingPrompt() {
      return !this.selectAllMatching && this.allPageSelected && this.totalCount > this.rows.length;
    },
    allLoaded() {
      if (this.totalCount === 0) {
        return true;
      }
      return this.rows.length >= this.totalCount;
    }
  },
  methods: {
    resetSelection() {
      this.selectedIds = [];
      this.selectAllMatching = false;
      this.excludedIds = [];
    },
    openFilterDialog() {
      this.draftStatusFilter = this.statusFilter;
      this.draftSinceDate = this.sinceDate;
      this.draftBeforeDate = this.beforeDate;
      this.filterDialogOpen = true;
    },
    openSortDialog() {
      this.draftSortBy = this.sortBy;
      this.draftDescending = this.descending;
      this.sortDialogOpen = true;
    },
    clearFilterDrafts() {
      this.draftStatusFilter = 'all';
      this.draftSinceDate = null;
      this.draftBeforeDate = null;
    },
    applyFilterDrafts() {
      this.statusFilter = this.draftStatusFilter;
      this.sinceDate = this.draftSinceDate;
      this.beforeDate = this.draftBeforeDate;
    },
    clearSortDrafts() {
      this.draftSortBy = 'finish_time';
      this.draftDescending = true;
    },
    applySortDrafts() {
      this.sortBy = this.draftSortBy;
      this.descending = this.draftDescending;
    },
    toggleDraftSort(option) {
      if (this.draftSortBy === option) {
        this.draftDescending = !this.draftDescending;
      } else {
        this.draftSortBy = option;
        this.draftDescending = true;
      }
    },
    isRowSelected(row) {
      if (this.selectAllMatching) {
        return !this.excludedIds.includes(row.id);
      }
      return this.selectedIds.includes(row.id);
    },
    toggleRowSelection(row, value) {
      if (this.selectAllMatching) {
        if (value) {
          this.excludedIds = this.excludedIds.filter((id) => id !== row.id);
        } else if (!this.excludedIds.includes(row.id)) {
          this.excludedIds.push(row.id);
        }
        return;
      }

      if (value && !this.selectedIds.includes(row.id)) {
        this.selectedIds.push(row.id);
      } else if (!value) {
        this.selectedIds = this.selectedIds.filter((id) => id !== row.id);
      }
    },
    toggleSelectPage(value) {
      const pageIds = this.rows.map((row) => row.id);
      if (this.selectAllMatching) {
        if (value) {
          this.excludedIds = this.excludedIds.filter((id) => !pageIds.includes(id));
        } else {
          pageIds.forEach((id) => {
            if (!this.excludedIds.includes(id)) {
              this.excludedIds.push(id);
            }
          });
        }
        return;
      }

      if (value) {
        pageIds.forEach((id) => {
          if (!this.selectedIds.includes(id)) {
            this.selectedIds.push(id);
          }
        });
      } else {
        this.selectedIds = this.selectedIds.filter((id) => !pageIds.includes(id));
      }
    },
    selectAllMatchingResults() {
      this.selectAllMatching = true;
      this.selectedIds = [];
      this.excludedIds = [];
    },
    clearSelection() {
      this.resetSelection();
    },
    buildFiltersPayload() {
      return {
        search_value: this.searchValue,
        status: this.statusFilter,
        after: this.sinceDate,
        before: this.beforeDate,
      };
    },
    getSelectionPayload() {
      if (this.selectAllMatching) {
        return {
          selection_mode: 'all_filtered',
          exclude_ids: this.excludedIds,
          ...this.buildFiltersPayload(),
        };
      }
      return {
        selection_mode: 'explicit',
        id_list: this.selectedIds,
      };
    },
    deleteSelected() {
      if (this.selectedCount === 0) {
        this.$q.notify({
          color: 'warning',
          position: 'top',
          message: this.$t('components.completedTasks.nothingSelected'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        });
        return;
      }

      const data = this.getSelectionPayload();
      axios({
        method: 'delete',
        url: getUnmanicApiUrl('v2', 'history/tasks'),
        data: data
      }).then(() => {
        this.resetSelection();
        this.fetchCompletedTasks({ reset: true });
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.completedTasks.errorDeleteSelected'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        });
      });
    },
    selectLibraryForRecreateTask() {
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/libraries')
      }).then((response) => {
        let libraryPathsList = [];
        let defaultSelection;
        for (let i = 0; i < response.data.libraries.length; i++) {
          let libraryPath = response.data.libraries[i];
          if (typeof defaultSelection === 'undefined') {
            defaultSelection = libraryPath.id;
          }
          libraryPathsList[libraryPathsList.length] = {
            label: libraryPath.name,
            value: libraryPath.id,
          };
        }
        this.LibraryOptions = libraryPathsList;

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
        });
      });
    },
    addSelectedToPendingTaskList() {
      if (this.selectedCount === 0) {
        this.$q.notify({
          color: 'warning',
          position: 'top',
          message: this.$t('components.completedTasks.nothingSelected'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        });
        return;
      }

      const data = {
        ...this.getSelectionPayload(),
        library_id: this.selectedLibraryId,
      };

      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'history/reprocess'),
        data: data
      }).then(() => {
        this.resetSelection();
        this.fetchCompletedTasks({ reset: true });
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.completedTasks.errorAddSelected'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        });
      });
    },
    openDetailsDialog(id) {
      this.$q.dialog({
        component: CompletedTaskLogDialog,
        componentProps: {
          completedTaskId: id
        },
      }).onOk(() => {
      }).onDismiss(() => {
      });
    },
    fetchCompletedTasks({ reset = false, silent = false, refreshTop = false } = {}) {
      if (reset) {
        this.offset = 0;
        this.rows = [];
      }

      const startRow = refreshTop ? 0 : this.offset;

      if (reset && !silent) {
        this.loading = true;
      } else {
        this.loadingMore = true;
      }

      let data = {
        start: startRow,
        length: this.pageSize,
        ...this.buildFiltersPayload(),
        order_by: this.sortBy,
        order_direction: this.descending ? 'desc' : 'asc',
      };

      return axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'history/tasks'),
        data: data
      }).then((response) => {
        this.totalCount = response.data.recordsFiltered;

        const returnedData = [];
        for (let i = 0; i < response.data.results.length; i++) {
          let results = response.data.results[i];
          returnedData[i] = {
            id: results.id,
            name: results.task_label,
            dateTimeCompleted: dateTools.printDateTimeString(results.finish_time),
            status: results.task_success
          };
        }

        if (refreshTop) {
          if (this.rows.length === 0) {
            this.rows = returnedData;
            this.offset = this.rows.length;
          } else {
            const updated = [...this.rows];
            for (let i = 0; i < returnedData.length; i++) {
              updated[i] = returnedData[i];
            }
            this.rows = updated;
          }
        } else if (reset) {
          this.rows = returnedData;
          this.offset = this.rows.length;
        } else {
          this.rows = [...this.rows, ...returnedData];
          this.offset = this.rows.length;
        }

        if (this.totalCount > 0 && this.rows.length > this.totalCount) {
          this.rows = this.rows.slice(0, this.totalCount);
          this.offset = this.rows.length;
        }
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.completedTasks.errorFetchingList'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        });
      }).finally(() => {
        if (!silent) {
          this.loading = false;
        }
        this.loadingMore = false;
      });
    },
    loadMore(index, done) {
      if (this.loading || this.loadingMore || this.allLoaded) {
        done();
        return;
      }
      this.fetchCompletedTasks().finally(() => {
        done();
      });
    },
    manualLoadMore() {
      if (this.loading || this.loadingMore || this.allLoaded) {
        return;
      }
      this.fetchCompletedTasks();
    },
    onScroll() {
      const target = this.scrollTarget === window ? window : this.scrollTarget;
      const scrollTop = this.scrollTarget === window
        ? (window.pageYOffset || document.documentElement.scrollTop || 0)
        : (target ? target.scrollTop : 0);
      this.showScrollTop = scrollTop > 300;
      this.isAtTop = scrollTop < 10;
    },
    scrollToTop() {
      if (this.scrollTarget && this.scrollTarget !== window) {
        this.scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  },
  watch: {
    statusFilter() {
      this.resetSelection();
      this.fetchCompletedTasks({ reset: true });
    },
    sinceDate() {
      this.resetSelection();
      this.fetchCompletedTasks({ reset: true });
    },
    beforeDate() {
      this.resetSelection();
      this.fetchCompletedTasks({ reset: true });
    },
    searchValue() {
      this.resetSelection();
      this.fetchCompletedTasks({ reset: true });
    },
    sortBy() {
      this.fetchCompletedTasks({ reset: true });
    },
    descending() {
      this.fetchCompletedTasks({ reset: true });
    }
  },
  mounted() {
    this.statusFilter = this.initStatusFilter;

    this.fetchCompletedTasks({ reset: true });

    this.reloadInterval = setInterval(() => {
      if (!this.showScrollTop && !this.loadingMore) {
        this.fetchCompletedTasks({ refreshTop: true, silent: true });
      }
    }, 10000);

    this.$nextTick(() => {
      this.scrollTarget = this.$el.querySelector('.completed-tasks-table-wrapper') || this.$el.closest('.q-card__section.scroll') || this.$el.closest('.scroll') || window;
      const target = this.scrollTarget === window ? window : this.scrollTarget;
      target.addEventListener('scroll', this.onScroll, { passive: true });
      this.onScroll();
    });
  },
  unmounted() {
    if (this.reloadInterval != null) {
      clearInterval(this.reloadInterval);
    }

    const target = this.scrollTarget === window ? window : this.scrollTarget;
    if (target) {
      target.removeEventListener('scroll', this.onScroll);
    }
  },
  data: function () {
    return {
      reloadInterval: ref(null),
      loading: ref(false),
      loadingMore: ref(false),
      showScrollTop: ref(false),
      isAtTop: ref(true),
      scrollTarget: null,

      rows: ref([]),
      totalCount: ref(0),
      pageSize: 50,
      offset: 0,
      searchValue: ref(''),
      statusFilter: ref('all'),
      draftStatusFilter: ref('all'),
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
      draftSinceDate: ref(null),
      draftBeforeDate: ref(null),
      sortBy: ref('finish_time'),
      draftSortBy: ref('finish_time'),
      sortOptions: [
        {
          label: this.$t('components.completedTasks.columns.completed'),
          value: 'finish_time'
        },
        {
          label: this.$t('components.completedTasks.columns.name'),
          value: 'task_label'
        },
        {
          label: this.$t('components.completedTasks.columns.status'),
          value: 'task_success'
        }
      ],
      descending: ref(true),
      draftDescending: ref(true),
      sortDirectionOptions: [
        {
          label: this.$t('components.completedTasks.sortNewest'),
          value: true
        },
        {
          label: this.$t('components.completedTasks.sortOldest'),
          value: false
        }
      ],
      filterDialogOpen: ref(false),
      sortDialogOpen: ref(false),
      selectedIds: ref([]),
      selectAllMatching: ref(false),
      excludedIds: ref([]),
      selectLibrary: ref(false),
      selectedLibraryId: ref(null),
      LibraryOptions: ref([]),
    }
  }
}
</script>

<style scoped>
.completed-tasks-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.completed-tasks-table-actions-bar {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--q-card-head);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.q-dark .completed-tasks-table-actions-bar {
  background: var(--q-card-head) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.completed-tasks-toolbar {
  width: 100%;
}

.completed-tasks-table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.completed-tasks-body {
  position: relative;
  min-width: 0;
}

.completed-tasks-filters {
  flex-wrap: wrap;
}

.completed-tasks-filter-date {
  max-width: 300px;
}

.completed-tasks-list {
  width: 100%;
  min-width: 0;
}

.completed-task-checkbox {
  padding-right: 4px;
}

.completed-task-actions {
  align-items: center;
  min-width: 0;
  max-width: 100%;
}

.completed-tasks-list :deep(.q-item__section) {
  min-width: 0;
}

.completed-tasks-list :deep(.q-item__label) {
  overflow-wrap: anywhere;
}

.select-library-card {
  width: 100%;
  max-width: 420px;
}

.completed-tasks-dialog-card {
  width: 100%;
  max-width: 520px;
}

.completed-tasks-dialog-header {
  position: sticky;
  top: 0;
  z-index: 2;
}

.completed-tasks-dialog-body {
  max-height: 60vh;
}

.completed-tasks-scroll-top {
  position: sticky;
  bottom: 18px;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  padding: 0 18px 12px;
}

.completed-tasks-scroll-top .q-btn {
  pointer-events: auto;
}

@media (max-width: 1023px) {
  .completed-tasks-filter-date {
    max-width: none;
  }
}

@media (max-width: 599px) {
  .select-library-card {
    max-width: 95vw;
  }
}

@media (max-width: 449px) {
  .completed-tasks-action-row {
    flex-direction: column;
    align-items: stretch;
  }

  .completed-tasks-action-row .q-btn,
  .completed-tasks-action-row .completed-tasks-options-button {
    width: 100%;
  }
}
</style>
