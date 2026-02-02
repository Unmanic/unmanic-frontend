<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="t('headers.completedTasks')"
    @hide="onDialogHide"
  >
    <div class="completed-tasks-dialog">
      <div class="completed-tasks-table-actions-bar q-pa-sm">
        <div class="row q-col-gutter-sm items-center completed-tasks-toolbar">
          <div v-if="showActionsToggle" class="col-12 row items-center justify-end">
            <UnmanicListActionButton
              :icon="actionsExpanded ? 'expand_less' : 'expand_more'"
              :tooltip="actionsExpanded ? t('components.completedTasks.hideActions') : t('components.completedTasks.showActions')"
              @click="toggleActionsExpanded"
            />
          </div>
          <q-slide-transition>
            <div v-show="actionsExpanded" class="col-12">
              <div class="row q-col-gutter-sm completed-tasks-actions-panel">
                <div class="col-12">
                  <q-input
                    outlined
                    dense
                    debounce="300"
                    :color="searchLabelColor"
                    :label-color="searchLabelColor"
                    v-model="searchValue"
                    :placeholder="t('navigation.search')"
                  >
                    <template v-slot:append>
                      <q-icon name="search" :color="searchLabelColor"/>
                    </template>
                  </q-input>
                </div>

                <div class="col-12">
                  <div class="row items-center q-col-gutter-sm completed-tasks-action-row">
                    <div class="col-auto">
                      <UnmanicStandardButton
                        :color="filterButtonColor"
                        icon="filter_list"
                        :label="t('components.completedTasks.filters')"
                        :size="filterSortButtonSize"
                        @click="openFilterDialog"
                      />
                    </div>

                    <div class="col-auto">
                      <UnmanicStandardButton
                        :color="sortButtonColor"
                        icon="sort"
                        :icon-right="sortDirectionIcon"
                        :label="sortButtonLabel"
                        :size="filterSortButtonSize"
                        @click="openSortDialog"
                      />
                    </div>

                    <q-space/>

                    <div class="col-auto">
                      <UnmanicStandardButtonDropdown
                        class="completed-tasks-options-button"
                        :label="t('navigation.options')"
                        :size="filterSortButtonSize"
                      >
                        <q-list>
                          <q-item clickable v-close-popup @click="selectLibraryForRecreateTask">
                            <q-item-section>
                              <q-item-label>
                                <q-icon name="add"/>
                                {{ t('components.completedTasks.addToPendingTasksList') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-separator/>

                          <q-item clickable v-close-popup @click="deleteSelected">
                            <q-item-section>
                              <q-item-label>
                                <q-icon name="delete_outline"/>
                                {{ t('components.completedTasks.removeSelected') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </UnmanicStandardButtonDropdown>
                    </div>
                  </div>
                </div>

                <div v-if="activeFilterChips.length" class="col-12">
                  <div class="row items-center q-col-gutter-sm completed-tasks-filter-indicator">
                    <div class="col-auto text-secondary completed-tasks-filter-indicator__label">
                      <q-icon name="filter_list" class="q-mr-xs"/>
                      {{ t('components.completedTasks.filtersActive') }}
                    </div>
                    <div class="col">
                      <div class="row items-center">
                        <q-chip
                          v-for="chip in activeFilterChips"
                          :key="chip.key"
                          dense
                          outline
                          color="secondary"
                          class="completed-tasks-filter-chip"
                        >
                          {{ chip.label }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="row items-center q-col-gutter-sm completed-tasks-selection">
                    <div class="col-auto">
                      <q-checkbox
                        :model-value="allPageSelected"
                        @update:model-value="toggleSelectPage"
                        color="secondary"
                        :label="t('components.completedTasks.selectPage')"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-slide-transition>
        </div>

        <q-separator class="q-mt-sm"/>
      </div>

      <!-- SELECTION BANNER -->
      <q-slide-transition>
        <div
          v-show="(allPageSelected || selectAllMatching) && actionsExpanded"
          class="row items-center q-pa-sm completed-tasks-selection-banner"
        >
          <div class="completed-tasks-selection-banner__center">
            <div class="completed-tasks-selection-banner__content">
              <template v-if="showSelectAllMatchingPrompt">
                {{ selectionBannerPageText }}
              </template>
              <template v-else-if="selectAllMatching">
                {{ selectionBannerAllSelectedText }}
              </template>
            </div>
            <div
              v-if="showSelectAllMatchingPrompt || selectAllMatching"
              class="completed-tasks-selection-banner__actions"
            >
              <UnmanicStandardButton
                v-if="showSelectAllMatchingPrompt"
                dense
                :label="selectionBannerSelectAllLabel"
                @click="selectAllMatchingResults"
              />
              <UnmanicStandardButton
                v-else
                dense
                :label="t('components.completedTasks.selectionBanner.clearSelection')"
                @click="clearSelection"
              />
            </div>
          </div>
        </div>
      </q-slide-transition>
      <!-- END SELECTION BANNER -->

      <div
        id="completed-tasks-scroller"
        ref="tableWrapperRef"
        class="completed-tasks-table-wrapper"
        @scroll.passive="handleTableScroll"
      >
        <div :class="[isMobile ? 'q-px-none' : 'q-px-sm', 'completed-tasks-body q-pa-sm']">
          <q-infinite-scroll
            ref="infiniteScrollRef"
            :disable="allLoaded"
            :offset="200"
            scroll-target="#completed-tasks-scroller"
            @load="loadMore"
          >
            <q-table
              flat
              bordered
              hide-header
              hide-pagination
              :rows-per-page-options="[0]"
              row-key="id"
              :rows="rows"
              :columns="columns"
              class="completed-tasks-table"
            >
              <template v-slot:body="props">
                <q-tr :props="props" class="completed-task-row">
                  <q-td auto-width class="completed-task-select">
                    <div class="completed-task-cell-center">
                      <q-checkbox
                        color="secondary"
                        :model-value="isRowSelected(props.row)"
                        @update:model-value="value => toggleRowSelection(props.row, value)"
                      />
                    </div>
                  </q-td>

                  <q-td>
                    <div class="completed-task-name">
                      {{ props.row.name }}
                    </div>
                    <div class="text-caption">
                      <span class="text-weight-medium">
                        {{ t('components.completedTasks.columns.completed') }}:
                      </span>
                      {{ props.row.dateTimeCompleted }}
                    </div>
                    <div class="text-caption">
                      <span class="text-weight-medium">
                        {{ t('components.completedTasks.columns.status') }}:
                      </span>
                      <q-badge :color="props.row.status ? 'positive' : 'negative'">
                        {{ props.row.status ? t('status.success') : t('status.failed') }}
                      </q-badge>
                    </div>
                  </q-td>

                  <q-td auto-width class="completed-task-actions">
                    <div class="completed-task-cell-center">
                      <UnmanicStandardButton
                        v-if="$q.screen.gt.xs"
                        @click="openDetailsDialog(props.row.id)"
                        :label="t('components.completedTasks.details')"
                        style="min-width: 100px;"
                      />
                      <UnmanicListActionButton
                        v-else
                        @click="openDetailsDialog(props.row.id)"
                        icon="info"
                        :tooltip="t('components.completedTasks.details')"
                      />
                    </div>
                  </q-td>
                </q-tr>
              </template>

              <template v-slot:no-data>
                <div class="full-width row flex-center text-accent q-gutter-sm">
                  <q-icon size="2em" name="sentiment_dissatisfied"/>
                  <q-item-label>{{ t('headers.listEmpty') }}</q-item-label>
                  <q-icon size="2em" name="priority_high"/>
                </div>
              </template>
            </q-table>

            <template v-slot:loading>
              <div class="row flex-center q-my-md">
                <q-spinner-dots size="32px" color="secondary"/>
              </div>
            </template>
          </q-infinite-scroll>

          <div class="row justify-center q-mt-md" v-if="!allLoaded && rows.length > 0">
            <UnmanicStandardButton
              color="secondary"
              :label="t('components.completedTasks.loadMore')"
              @click="manualLoadMore"
            />
          </div>

          <q-inner-loading :showing="loading && rows.length === 0">
            <q-spinner-dots size="42px" color="secondary"/>
          </q-inner-loading>
        </div>
      </div>
    </div>

    <q-dialog v-model="filterDialogOpen" backdrop-filter="blur(2px)">
      <q-card class="completed-tasks-dialog-card" flat bordered>
        <q-card-section class="bg-card-head completed-tasks-dialog-header row items-center justify-between no-wrap">
          <div class="text-h6 text-primary">
            {{ t('components.completedTasks.filtersTitle') }}
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section class="completed-tasks-dialog-body scroll q-pa-lg q-gutter-md">
          <div class="text-subtitle2 text-secondary">
            {{ t('components.completedTasks.filterStatusLabel') }}
          </div>
          <q-btn-toggle
            v-model="draftStatusFilter"
            toggle-color="secondary"
            :options="statusFilterOptions"
          />

          <div class="text-subtitle2 text-secondary">
            {{ t('components.completedTasks.since') }}
          </div>
          <div class="row items-center q-col-gutter-sm">
            <div class="col">
              <q-input
                outlined
                dense
                debounce="300"
                color="secondary"
                v-model="draftSinceDate"
              >
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="draftSinceDate" mask="YYYY-MM-DD HH:mm" flat bordered>
                        <div class="row items-center justify-end">
                          <UnmanicStandardButton v-close-popup :label="sincePopupActionLabel" color="secondary"/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>

                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="draftSinceDate" mask="YYYY-MM-DD HH:mm" format24h flat bordered>
                        <div class="row items-center justify-end">
                          <UnmanicStandardButton v-close-popup :label="sincePopupActionLabel" color="secondary"/>
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-auto">
              <UnmanicListActionButton
                icon="clear"
                color="secondary"
                :disable="!draftSinceDate"
                :tooltip="draftSinceDate ? t('components.completedTasks.clearSinceFilter') : ''"
                @click="draftSinceDate = null"
              />
            </div>
          </div>

          <div class="text-subtitle2 text-secondary">
            {{ t('components.completedTasks.before') }}
          </div>
          <div class="row items-center q-col-gutter-sm">
            <div class="col">
              <q-input
                outlined
                dense
                debounce="300"
                color="secondary"
                v-model="draftBeforeDate"
              >
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="draftBeforeDate" mask="YYYY-MM-DD HH:mm" flat bordered>
                        <div class="row items-center justify-end">
                          <UnmanicStandardButton v-close-popup :label="beforePopupActionLabel" color="secondary"/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>

                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="draftBeforeDate" mask="YYYY-MM-DD HH:mm" format24h flat bordered>
                        <div class="row items-center justify-end">
                          <UnmanicStandardButton v-close-popup :label="beforePopupActionLabel" color="secondary"/>
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-auto">
              <UnmanicListActionButton
                icon="clear"
                color="secondary"
                :disable="!draftBeforeDate"
                :tooltip="draftBeforeDate ? t('components.completedTasks.clearBeforeFilter') : ''"
                @click="draftBeforeDate = null"
              />
            </div>
          </div>

          <div class="text-caption text-italic text-secondary">
            {{ t('components.completedTasks.filtersHint') }}
          </div>
        </q-card-section>

        <q-card-actions align="between">
          <UnmanicStandardButton
            color="secondary"
            :label="t('components.completedTasks.clear')"
            @click="clearFilterDrafts"
          />
          <UnmanicStandardButton
            color="secondary"
            :label="t('components.completedTasks.apply')"
            v-close-popup
            @click="applyFilterDrafts"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="sortDialogOpen" backdrop-filter="blur(2px)">
      <q-card class="completed-tasks-dialog-card" flat bordered>
        <q-card-section class="bg-card-head completed-tasks-dialog-header row items-center justify-between no-wrap">
          <div class="text-h6 text-primary">
            {{ t('components.completedTasks.sortTitle') }}
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section class="completed-tasks-dialog-body scroll q-pa-lg q-gutter-md">
          <q-list bordered separator>
            <q-item clickable v-ripple @click="toggleDraftSort('finish_time')">
              <q-item-section>{{ t('components.completedTasks.columns.completed') }}</q-item-section>
              <q-item-section side>
                <q-icon
                  :name="draftSortBy === 'finish_time' ? (draftDescending ? 'arrow_downward' : 'arrow_upward') : 'sort'"
                  :color="draftSortBy === 'finish_time' ? 'secondary' : 'grey-5'"
                />
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="toggleDraftSort('task_label')">
              <q-item-section>{{ t('components.completedTasks.columns.name') }}</q-item-section>
              <q-item-section side>
                <q-icon
                  :name="draftSortBy === 'task_label' ? (draftDescending ? 'arrow_downward' : 'arrow_upward') : 'sort'"
                  :color="draftSortBy === 'task_label' ? 'secondary' : 'grey-5'"
                />
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="toggleDraftSort('task_success')">
              <q-item-section>{{ t('components.completedTasks.columns.status') }}</q-item-section>
              <q-item-section side>
                <q-icon
                  :name="draftSortBy === 'task_success' ? (draftDescending ? 'arrow_downward' : 'arrow_upward') : 'sort'"
                  :color="draftSortBy === 'task_success' ? 'secondary' : 'grey-5'"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <div class="text-caption text-italic text-secondary">
            {{ t('components.completedTasks.sortHint') }}
          </div>
        </q-card-section>

        <q-card-actions align="between">
          <UnmanicStandardButton
            color="secondary"
            :label="t('components.completedTasks.clear')"
            @click="clearSortDrafts"
          />
          <UnmanicStandardButton
            color="secondary"
            :label="t('components.completedTasks.apply')"
            v-close-popup
            @click="applySortDrafts"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="selectLibrary" persistent>
      <q-card class="select-library-card" flat bordered>
        <q-card-section>
          <div class="text-h6 text-primary">{{ t('headers.selectLibrary') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            outlined
            dense
            color="secondary"
            emit-value
            map-options
            v-model="selectedLibraryId"
            :options="libraryOptions"
            :label="t('components.completedTasks.selectLibraryToAdd')"
          />
        </q-card-section>

        <q-card-actions align="right">
          <UnmanicStandardButton color="secondary" :label="t('navigation.cancel')" v-close-popup/>
          <UnmanicStandardButton
            @click="addSelectedToPendingTaskList"
            color="secondary"
            :label="t('navigation.submit')"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </UnmanicDialogWindow>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import dateTools from 'src/js/dateTools'
import { useMobile } from 'src/composables/useMobile'
import UnmanicDialogWindow from 'components/ui/dialogs/UnmanicDialogWindow.vue'
import CompletedTaskLogDialog from 'components/dashboard/completed/partials/CompletedTaskLogDialog.vue'
import UnmanicStandardButton from 'components/ui/buttons/UnmanicStandardButton.vue'
import UnmanicListActionButton from 'components/ui/buttons/UnmanicListActionButton.vue'
import UnmanicStandardButtonDropdown from 'components/ui/buttons/UnmanicStandardButtonDropdown.vue'

const props = defineProps({
  initStatusFilter: {
    type: String,
    default: 'all'
  }
})

const emit = defineEmits(['hide'])

const { t } = useI18n()
const $q = useQuasar()
const { isMobile } = useMobile()

const dialogRef = ref(null)
const infiniteScrollRef = ref(null)

const loading = ref(false)
const loadingMore = ref(false)

const rows = ref([])
const totalCount = ref(0)
const pageSize = 50
const offset = ref(0)

const searchValue = ref('')
const statusFilter = ref('all')
const draftStatusFilter = ref('all')
const sinceDate = ref(null)
const beforeDate = ref(null)
const draftSinceDate = ref(null)
const draftBeforeDate = ref(null)
const sortBy = ref('finish_time')
const draftSortBy = ref('finish_time')
const descending = ref(true)
const draftDescending = ref(true)

const filterDialogOpen = ref(false)
const sortDialogOpen = ref(false)

const actionsExpanded = ref(true)

const selectedIds = ref([])
const selectAllMatching = ref(false)
const excludedIds = ref([])

const selectLibrary = ref(false)
const selectedLibraryId = ref(null)
const libraryOptions = ref([])

const columns = computed(() => ([
  {
    name: 'select',
    label: '',
    field: 'id',
    sortable: false,
  },
  {
    name: 'name',
    label: t('components.completedTasks.columns.name'),
    field: 'name',
    sortable: false,
  },
  {
    name: 'completed',
    label: t('components.completedTasks.columns.completed'),
    field: 'dateTimeCompleted',
    sortable: false,
  },
  {
    name: 'status',
    label: t('components.completedTasks.columns.status'),
    field: 'status',
    sortable: false,
  },
  {
    name: 'actions',
    label: '',
    field: 'id',
    sortable: false,
  }
]))

const statusFilterOptions = computed(() => ([
  {
    label: t('status.all'),
    value: 'all'
  },
  {
    label: t('status.success'),
    value: 'success'
  },
  {
    label: t('status.failed'),
    value: 'failed'
  }
]))

const filterSortButtonSize = computed(() => ($q.screen.width < 450 ? 'sm' : 'md'))

const filterSortActiveColor = 'warning'

const searchLabelColor = computed(() => (searchValue.value.trim().length > 0 ? filterSortActiveColor : 'secondary'))

const showActionsToggle = computed(() => (
  $q.screen.width < 1024 ||
  ($q.screen.width >= 1024 && $q.screen.height < 800)
))

const sincePopupActionLabel = computed(() => (
  draftSinceDate.value ? t('components.completedTasks.apply') : t('navigation.close')
))

const beforePopupActionLabel = computed(() => (
  draftBeforeDate.value ? t('components.completedTasks.apply') : t('navigation.close')
))

const activeFilterChips = computed(() => {
  const chips = []

  if (statusFilter.value !== 'all') {
    const statusLabel = statusFilterOptions.value.find((option) => option.value === statusFilter.value)?.label || statusFilter.value
    chips.push({
      key: 'status',
      label: t('components.completedTasks.filterStatus', { status: statusLabel })
    })
  }

  if (sinceDate.value) {
    chips.push({
      key: 'since',
      label: t('components.completedTasks.filterSince', { date: sinceDate.value })
    })
  }

  if (beforeDate.value) {
    chips.push({
      key: 'before',
      label: t('components.completedTasks.filterBefore', { date: beforeDate.value })
    })
  }

  return chips
})

const hasSearch = computed(() => searchValue.value.trim().length > 0)
const hasFilters = computed(() => (
  statusFilter.value !== 'all' ||
  !!sinceDate.value ||
  !!beforeDate.value
))

const filterButtonColor = computed(() => (hasFilters.value ? filterSortActiveColor : 'secondary'))

const isDefaultSort = computed(() => (
  sortBy.value === 'finish_time' && descending.value === true
))

const sortButtonColor = computed(() => (isDefaultSort.value ? 'secondary' : filterSortActiveColor))

const sortFieldLabel = computed(() => {
  if (sortBy.value === 'task_label') {
    return t('components.completedTasks.columns.name')
  }
  if (sortBy.value === 'task_success') {
    return t('components.completedTasks.columns.status')
  }
  return t('components.completedTasks.columns.completed')
})

const sortDirectionIcon = computed(() => (
  descending.value ? 'arrow_downward' : 'arrow_upward'
))

const sortButtonLabel = computed(() => (
  t('components.completedTasks.sortByActive', {
    field: sortFieldLabel.value
  })
))

const selectedCount = computed(() => {
  if (selectAllMatching.value) {
    return Math.max(0, totalCount.value - excludedIds.value.length)
  }
  return selectedIds.value.length
})

const allPageSelected = computed(() => {
  if (rows.value.length === 0) {
    return false
  }
  return rows.value.every((row) => isRowSelected(row))
})

const showSelectAllMatchingPrompt = computed(() => (
  !selectAllMatching.value && allPageSelected.value && totalCount.value > rows.value.length
))

const selectionBannerPageText = computed(() => (
  t('components.completedTasks.selectionBanner.pageSelected', { count: rows.value.length })
))

const selectionBannerSelectAllLabel = computed(() => {
  if (hasSearch.value) {
    return t('components.completedTasks.selectionBanner.selectAllMatchingSearch', { count: totalCount.value })
  }
  if (hasFilters.value) {
    return t('components.completedTasks.selectionBanner.selectAllMatchingFilters', { count: totalCount.value })
  }
  return t('components.completedTasks.selectionBanner.selectAll', { count: totalCount.value })
})

const selectionBannerAllSelectedText = computed(() => {
  if (hasSearch.value) {
    return t('components.completedTasks.selectionBanner.allSelectedSearch', { count: totalCount.value })
  }
  if (hasFilters.value) {
    return t('components.completedTasks.selectionBanner.allSelectedFilters', { count: totalCount.value })
  }
  return t('components.completedTasks.selectionBanner.allSelected', { count: totalCount.value })
})

const allLoaded = computed(() => {
  if (totalCount.value === 0) {
    return true
  }
  return rows.value.length >= totalCount.value
})

let reloadInterval = null

const show = () => {
  dialogRef.value.show()
}

const hide = () => {
  dialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
}

const toggleActionsExpanded = () => {
  actionsExpanded.value = !actionsExpanded.value
}

const handleTableScroll = (event) => {
  if (!showActionsToggle.value || !actionsExpanded.value) {
    return
  }
  const wrapper = event?.target || tableWrapperRef.value
  if (!wrapper) {
    return
  }
  if (wrapper.scrollTop > 4) {
    actionsExpanded.value = false
  }
}

const resetSelection = () => {
  selectedIds.value = []
  selectAllMatching.value = false
  excludedIds.value = []
}

const openFilterDialog = () => {
  draftStatusFilter.value = statusFilter.value
  draftSinceDate.value = sinceDate.value
  draftBeforeDate.value = beforeDate.value
  filterDialogOpen.value = true
}

const openSortDialog = () => {
  draftSortBy.value = sortBy.value
  draftDescending.value = descending.value
  sortDialogOpen.value = true
}

const clearFilterDrafts = () => {
  draftStatusFilter.value = 'all'
  draftSinceDate.value = null
  draftBeforeDate.value = null
}

const applyFilterDrafts = () => {
  statusFilter.value = draftStatusFilter.value
  sinceDate.value = draftSinceDate.value
  beforeDate.value = draftBeforeDate.value
}

const clearSortDrafts = () => {
  draftSortBy.value = 'finish_time'
  draftDescending.value = true
}

const applySortDrafts = () => {
  sortBy.value = draftSortBy.value
  descending.value = draftDescending.value
}

const toggleDraftSort = (option) => {
  if (draftSortBy.value === option) {
    draftDescending.value = !draftDescending.value
  } else {
    draftSortBy.value = option
    draftDescending.value = true
  }
}

const isRowSelected = (row) => {
  if (selectAllMatching.value) {
    return !excludedIds.value.includes(row.id)
  }
  return selectedIds.value.includes(row.id)
}

const toggleRowSelection = (row, value) => {
  if (selectAllMatching.value) {
    if (value) {
      excludedIds.value = excludedIds.value.filter((id) => id !== row.id)
    } else if (!excludedIds.value.includes(row.id)) {
      excludedIds.value.push(row.id)
    }
    return
  }

  if (value && !selectedIds.value.includes(row.id)) {
    selectedIds.value.push(row.id)
  } else if (!value) {
    selectedIds.value = selectedIds.value.filter((id) => id !== row.id)
  }
}

const toggleSelectPage = (value) => {
  if (value) {
    // Select all visible rows on the current page
    const pageIds = rows.value.map((row) => row.id)
    pageIds.forEach((id) => {
      if (!selectedIds.value.includes(id)) {
        selectedIds.value.push(id)
      }
    })
  } else {
    // Unchecking the box clears the entire selection, including 'selectAllMatching'
    resetSelection()
  }
}

const selectAllMatchingResults = () => {
  selectAllMatching.value = true
  selectedIds.value = []
  excludedIds.value = []
}

const clearSelection = () => {
  resetSelection()
}

const buildFiltersPayload = () => ({
  search_value: searchValue.value,
  status: statusFilter.value,
  after: sinceDate.value,
  before: beforeDate.value,
})

const getSelectionPayload = () => {
  if (selectAllMatching.value) {
    return {
      selection_mode: 'all_filtered',
      exclude_ids: excludedIds.value,
      ...buildFiltersPayload(),
    }
  }
  return {
    selection_mode: 'explicit',
    id_list: selectedIds.value,
  }
}

const deleteSelected = () => {
  if (selectedCount.value === 0) {
    $q.notify({
      color: 'warning',
      position: 'top',
      message: t('components.completedTasks.nothingSelected'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
    return
  }

  const data = getSelectionPayload()
  axios({
    method: 'delete',
    url: getUnmanicApiUrl('v2', 'history/tasks'),
    data
  }).then(() => {
    resetSelection()
    fetchCompletedTasks({ reset: true })
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('components.completedTasks.errorDeleteSelected'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const selectLibraryForRecreateTask = () => {
  axios({
    method: 'get',
    url: getUnmanicApiUrl('v2', 'settings/libraries')
  }).then((response) => {
    const libraryPathsList = []
    let defaultSelection
    for (let i = 0; i < response.data.libraries.length; i++) {
      const libraryPath = response.data.libraries[i]
      if (typeof defaultSelection === 'undefined') {
        defaultSelection = libraryPath.id
      }
      libraryPathsList.push({
        label: libraryPath.name,
        value: libraryPath.id,
      })
    }
    libraryOptions.value = libraryPathsList

    selectedLibraryId.value = 1
    if (libraryPathsList.length === 1) {
      selectedLibraryId.value = defaultSelection
      addSelectedToPendingTaskList()
    } else {
      selectLibrary.value = true
    }
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.failedToFetchLibraryList'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const addSelectedToPendingTaskList = () => {
  if (selectedCount.value === 0) {
    $q.notify({
      color: 'warning',
      position: 'top',
      message: t('components.completedTasks.nothingSelected'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
    return
  }

  const data = {
    ...getSelectionPayload(),
    library_id: selectedLibraryId.value,
  }

  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'history/reprocess'),
    data
  }).then(() => {
    resetSelection()
    fetchCompletedTasks({ reset: true })
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('components.completedTasks.errorAddSelected'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const openDetailsDialog = (id) => {
  $q.dialog({
    component: CompletedTaskLogDialog,
    componentProps: {
      completedTaskId: id
    },
  })
}

const fetchCompletedTasks = ({ reset = false, silent = false, refreshTop = false } = {}) => {
  if (reset) {
    offset.value = 0
    rows.value = []
  }

  const startRow = refreshTop ? 0 : offset.value

  if (reset && !silent) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  const data = {
    start: startRow,
    length: pageSize,
    ...buildFiltersPayload(),
    order_by: sortBy.value,
    order_direction: descending.value ? 'desc' : 'asc',
  }

  return axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'history/tasks'),
    data
  }).then((response) => {
    totalCount.value = response.data.recordsFiltered

    const returnedData = response.data.results.map((results) => ({
      id: results.id,
      name: results.task_label,
      dateTimeCompleted: dateTools.printDateTimeString(results.finish_time),
      status: results.task_success
    }))

    if (refreshTop) {
      if (rows.value.length === 0) {
        rows.value = returnedData
        offset.value = rows.value.length
      } else {
        const updated = [...rows.value]
        for (let i = 0; i < returnedData.length; i++) {
          updated[i] = returnedData[i]
        }
        rows.value = updated
      }
    } else if (reset) {
      rows.value = returnedData
      offset.value = rows.value.length
    } else {
      rows.value = [...rows.value, ...returnedData]
      offset.value = rows.value.length
    }

    if (totalCount.value > 0 && rows.value.length > totalCount.value) {
      rows.value = rows.value.slice(0, totalCount.value)
      offset.value = rows.value.length
    }
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('components.completedTasks.errorFetchingList'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  }).finally(() => {
    if (!silent) {
      loading.value = false
    }
    loadingMore.value = false
  })
}

const loadMore = (index, done) => {
  if (loading.value || loadingMore.value || allLoaded.value) {
    done(allLoaded.value)
    return
  }
  fetchCompletedTasks().finally(() => {
    nextTick(() => {
      done(allLoaded.value)
    })
  })
}

const manualLoadMore = () => {
  if (infiniteScrollRef.value) {
    infiniteScrollRef.value.trigger()
  }
}

watch(statusFilter, () => {
  resetSelection()
  fetchCompletedTasks({ reset: true })
})

watch(sinceDate, () => {
  resetSelection()
  fetchCompletedTasks({ reset: true })
})

watch(beforeDate, () => {
  resetSelection()
  fetchCompletedTasks({ reset: true })
})

watch(searchValue, () => {
  resetSelection()
  fetchCompletedTasks({ reset: true })
})

watch(sortBy, () => {
  fetchCompletedTasks({ reset: true })
})

watch(descending, () => {
  fetchCompletedTasks({ reset: true })
})

onMounted(() => {
  statusFilter.value = props.initStatusFilter

  actionsExpanded.value = true

  fetchCompletedTasks({ reset: true })

  reloadInterval = setInterval(() => {
    if (!loadingMore.value) {
      fetchCompletedTasks({ refreshTop: true, silent: true })
    }
  }, 10000)
})

onBeforeUnmount(() => {
  if (reloadInterval != null) {
    clearInterval(reloadInterval)
  }
})

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.completed-tasks-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.completed-tasks-table-actions-bar {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--q-card-head);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  min-width: 0;
}

.q-dark .completed-tasks-table-actions-bar {
  background: var(--q-card-head) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.completed-tasks-selection-banner {
  border-bottom: 1px solid var(--q-separator-color);
  background: rgba(0, 0, 0, 0.03);
  gap: 12px;
}

.q-dark .completed-tasks-selection-banner {
  background: rgba(255, 255, 255, 0.06);
}

.completed-tasks-selection-banner__content {
  min-width: 0;
}

.completed-tasks-selection-banner__center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.completed-tasks-selection-banner__actions {
  display: flex;
  align-items: center;
}

.completed-tasks-selection {
  padding-left: 17px;
}

@media (min-width: 601px) {
  .completed-tasks-selection {
    margin-top: 8px;
  }
}

.completed-tasks-filter-indicator {
  min-width: 0;
  padding: 2px 0;
}

.completed-tasks-filter-indicator__label {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.completed-tasks-filter-chip {
  max-width: 100%;
}

.completed-tasks-filter-chip :deep(.q-chip__content) {
  line-height: 1.2;
  padding: 1px 0;
}

.completed-tasks-toolbar {
  width: 100%;
}

.completed-tasks-table-wrapper {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
}

.completed-tasks-body {
  position: relative;
  min-width: 0;
}

.completed-tasks-table {
  width: 100%;
  min-width: 0;
}

.completed-tasks-table :deep(table) {
  width: 100%;
  min-width: 0;
}

.completed-tasks-table :deep(.q-td) {
  white-space: normal;
  overflow-wrap: anywhere;
}

.completed-task-row :deep(.q-td) {
  vertical-align: top;
}

.completed-task-select,
.completed-task-actions {
  vertical-align: middle;
}

.completed-task-cell-center {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.completed-task-name {
  font-weight: 500;
}

.completed-task-actions {
  align-items: center;
  min-width: 0;
  max-width: 100%;
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

@media (max-width: 599px) {
  .select-library-card {
    max-width: 95vw;
  }

  .completed-tasks-dialog-card {
    max-width: 95vw;
  }
}

@media (max-width: 449px) {
  .completed-tasks-filter-indicator {
    align-items: flex-start;
  }

  .completed-tasks-filter-indicator__label {
    width: 100%;
  }

  .completed-tasks-selection-banner {
    align-items: flex-start;
    flex-direction: column;
  }

  .completed-tasks-selection-banner__center {
    align-items: flex-start;
    flex-direction: column;
  }

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
