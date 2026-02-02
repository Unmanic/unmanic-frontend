<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="t('headers.pendingTasks')"
    @hide="onDialogHide"
  >
    <div class="pending-tasks-dialog">
      <div class="pending-tasks-table-actions-bar q-pa-sm">
        <div class="row q-col-gutter-sm items-center pending-tasks-toolbar">
          <div v-if="showActionsToggle" class="col-12 row items-center justify-end">
            <UnmanicListActionButton
              :icon="actionsExpanded ? 'expand_less' : 'expand_more'"
              :tooltip="actionsExpanded ? t('components.pendingTasks.hideActions') : t('components.pendingTasks.showActions')"
              @click="toggleActionsExpanded"
            />
          </div>

          <q-slide-transition>
            <div v-show="actionsExpanded" class="col-12">
              <div class="row q-col-gutter-sm pending-tasks-actions-panel">
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
                  <div class="row items-center q-col-gutter-sm pending-tasks-action-row">
                    <div class="col-auto">
                      <UnmanicStandardButton
                        :color="filterButtonColor"
                        icon="filter_list"
                        :label="t('components.pendingTasks.filters')"
                        :size="filterButtonSize"
                        @click="openFilterDialog"
                      />
                    </div>

                    <q-space/>
                    <div class="col-auto">
                      <UnmanicStandardButtonDropdown
                        class="pending-tasks-options-button"
                        :label="t('navigation.options')"
                        :size="filterButtonSize"
                      >
                        <q-list>
                          <q-item clickable v-close-popup @click="rescanLibrary">
                            <q-item-section>
                              <q-item-label>
                                <q-icon name="search"/>
                                {{ t('components.pendingTasks.rescanLibrary') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-separator/>

                          <q-item clickable v-close-popup @click="moveToTop">
                            <q-item-section>
                              <q-item-label>
                                <q-icon name="arrow_upward"/>
                                {{ t('components.pendingTasks.moveToTop') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-item clickable v-close-popup @click="moveToBottom">
                            <q-item-section>
                              <q-item-label>
                                <q-icon name="arrow_downward"/>
                                {{ t('components.pendingTasks.moveToBottom') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-separator/>

                          <q-item clickable v-close-popup @click="deleteSelected">
                            <q-item-section>
                              <q-item-label>
                                <q-icon name="delete_outline"/>
                                {{ t('components.pendingTasks.removeSelected') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </UnmanicStandardButtonDropdown>
                    </div>
                  </div>
                </div>

                <div v-if="activeFilterChips.length" class="col-12">
                  <div class="row items-center q-col-gutter-sm pending-tasks-filter-indicator">
                    <div class="col-auto text-secondary pending-tasks-filter-indicator__label">
                      <q-icon name="filter_list" class="q-mr-xs"/>
                      {{ t('components.pendingTasks.filtersActive') }}
                    </div>
                    <div class="col">
                      <div class="row items-center">
                        <q-chip
                          v-for="chip in activeFilterChips"
                          :key="chip.key"
                          dense
                          outline
                          color="secondary"
                          class="pending-tasks-filter-chip"
                        >
                          {{ chip.label }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="row items-center q-col-gutter-sm pending-tasks-selection">
                    <div class="col-auto">
                      <q-checkbox
                        :model-value="allPageSelected"
                        @update:model-value="toggleSelectPage"
                        color="secondary"
                        :label="t('components.pendingTasks.selectPage')"
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

      <q-slide-transition>
        <div
          v-show="(allPageSelected || selectAllMatching) && actionsExpanded"
          class="row items-center q-pa-sm pending-tasks-selection-banner"
        >
          <div class="pending-tasks-selection-banner__center">
            <div class="pending-tasks-selection-banner__content">
              <template v-if="showSelectAllMatchingPrompt">
                {{ selectionBannerPageText }}
              </template>
              <template v-else-if="selectAllMatching">
                {{ selectionBannerAllSelectedText }}
              </template>
            </div>
            <div
              v-if="showSelectAllMatchingPrompt || selectAllMatching"
              class="pending-tasks-selection-banner__actions"
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
                :label="t('components.pendingTasks.selectionBanner.clearSelection')"
                @click="clearSelection"
              />
            </div>
          </div>
        </div>
      </q-slide-transition>

      <div
        id="pending-tasks-scroller"
        ref="tableWrapperRef"
        class="pending-tasks-table-wrapper"
        @scroll.passive="handleTableScroll"
      >
        <div :class="[isMobile ? 'q-px-none' : 'q-px-sm', 'pending-tasks-body q-pa-sm']">
          <q-infinite-scroll
            ref="infiniteScrollRef"
            :disable="allLoaded"
            :offset="200"
            scroll-target="#pending-tasks-scroller"
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
              class="pending-tasks-table"
            >
              <template v-slot:body="props">
                <q-tr :props="props" class="pending-task-row">
                  <q-td auto-width class="pending-task-select">
                    <div class="pending-task-cell-center">
                      <q-checkbox
                        color="secondary"
                        :model-value="isRowSelected(props.row)"
                        @update:model-value="value => toggleRowSelection(props.row, value)"
                      />
                    </div>
                  </q-td>

                  <q-td>
                    <div class="pending-task-name">
                      {{ props.row.name }}
                    </div>
                    <div class="text-caption">
                      <span class="text-weight-medium">
                        {{ t('components.pendingTasks.columns.library') }}:
                      </span>
                      {{ props.row.libraryName }}
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
              :label="t('components.pendingTasks.loadMore')"
              @click="manualLoadMore"
            />
          </div>

          <q-inner-loading :showing="loading && rows.length === 0">
            <q-spinner-dots size="42px" color="secondary"/>
          </q-inner-loading>

          <div v-show="showScrollTop" class="pending-tasks-scroll-top">
            <UnmanicStandardButton
              round
              dense
              icon="keyboard_arrow_up"
              :label="''"
              :aria-label="t('components.pendingTasks.scrollToTop')"
              :title="t('components.pendingTasks.scrollToTop')"
              @click="scrollToTop"
            />
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="filterDialogOpen" backdrop-filter="blur(2px)">
      <q-card class="pending-tasks-dialog-card" flat bordered>
        <q-card-section class="bg-card-head pending-tasks-dialog-header row items-center justify-between no-wrap">
          <div class="text-h6 text-primary">
            {{ t('components.pendingTasks.filtersTitle') }}
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section class="pending-tasks-dialog-body scroll q-pa-lg q-gutter-md">
          <div class="text-subtitle2 text-secondary">
            {{ t('components.pendingTasks.filterLibrariesLabel') }}
          </div>
          <q-select
            v-if="showLibraryChips"
            outlined
            color="primary"
            multiple
            emit-value
            map-options
            use-chips
            v-model="draftLibraryFilters"
            :options="libraryOptions"
            :label="t('components.pendingTasks.filterLibrariesLabel')"
          />
          <q-select
            v-else
            outlined
            color="primary"
            multiple
            emit-value
            map-options
            v-model="draftLibraryFilters"
            :options="libraryOptions"
            :label="t('components.pendingTasks.filterLibrariesLabel')"
            :display-value="libraryFilterDisplay"
          />
          <div class="text-caption text-italic text-secondary">
            {{ t('components.pendingTasks.filterLibrariesHint') }}
          </div>
        </q-card-section>

        <q-card-actions align="between">
          <UnmanicStandardButton
            color="secondary"
            :label="t('components.pendingTasks.clear')"
            @click="clearFilterDrafts"
          />
          <UnmanicStandardButton
            color="secondary"
            :label="t('components.pendingTasks.apply')"
            v-close-popup
            @click="applyFilterDrafts"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </UnmanicDialogWindow>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import { useMobile } from 'src/composables/useMobile'
import UnmanicDialogWindow from 'components/ui/dialogs/UnmanicDialogWindow.vue'
import UnmanicStandardButton from 'components/ui/buttons/UnmanicStandardButton.vue'
import UnmanicStandardButtonDropdown from 'components/ui/buttons/UnmanicStandardButtonDropdown.vue'
import UnmanicListActionButton from 'components/ui/buttons/UnmanicListActionButton.vue'

const emit = defineEmits(['hide'])

const { t } = useI18n()
const $q = useQuasar()
const { isMobile } = useMobile()

const dialogRef = ref(null)
const infiniteScrollRef = ref(null)
const tableWrapperRef = ref(null)
const showScrollTop = ref(false)

const loading = ref(false)
const loadingMore = ref(false)

const rows = ref([])
const totalCount = ref(0)
const pageSize = 50
const offset = ref(0)

const searchValue = ref('')
const libraryFilters = ref([])
const draftLibraryFilters = ref([])
const libraryOptions = ref([])
const filterDialogOpen = ref(false)
const actionsExpanded = ref(true)

const selectedIds = ref([])
const selectAllMatching = ref(false)
const excludedIds = ref([])

let reloadInterval = null

const columns = computed(() => ([
  {
    name: 'select',
    label: '',
    field: 'id',
    sortable: false,
  },
  {
    name: 'name',
    label: t('components.pendingTasks.columns.name'),
    field: 'name',
    sortable: false,
  },
  {
    name: 'library',
    label: t('components.pendingTasks.columns.library'),
    field: 'libraryName',
    sortable: false,
  },
]))

const showActionsToggle = computed(() => {
  const isNarrow = $q.screen.lt.md
  const isShortWide = !$q.screen.lt.md && $q.screen.height < 800
  return isNarrow || isShortWide
})

const filterSortActiveColor = 'warning'

const searchLabelColor = computed(() => (
  searchValue.value.trim().length > 0 ? filterSortActiveColor : 'secondary'
))

const hasSearch = computed(() => searchValue.value.trim().length > 0)
const hasFilters = computed(() => libraryFilters.value.length > 0)

const filterButtonColor = computed(() => (
  hasFilters.value ? filterSortActiveColor : 'secondary'
))

const filterButtonSize = computed(() => ($q.screen.width < 450 ? 'sm' : 'md'))

const libraryNameById = computed(() => (
  libraryOptions.value.reduce((acc, option) => {
    acc[option.value] = option.label
    return acc
  }, {})
))

const activeFilterChips = computed(() => (
  libraryFilters.value
    .map((id) => ({
      key: `library-${id}`,
      label: t('components.pendingTasks.filterLibraryChip', { library: libraryNameById.value[id] || id }),
    }))
))

const showLibraryChips = computed(() => draftLibraryFilters.value.length > 0)

const libraryFilterDisplay = computed(() => {
  if (draftLibraryFilters.value.length === 0) {
    return t('components.pendingTasks.allLibraries')
  }
  return draftLibraryFilters.value
    .map((id) => libraryNameById.value[id] || id)
    .join(', ')
})


const allLoaded = computed(() => {
  if (totalCount.value === 0) {
    return true
  }
  return rows.value.length >= totalCount.value
})

const allPageSelected = computed(() => (
  rows.value.length > 0 && rows.value.every((row) => isRowSelected(row))
))

const selectedCount = computed(() => {
  if (selectAllMatching.value) {
    return Math.max(0, totalCount.value - excludedIds.value.length)
  }
  return selectedIds.value.length
})

const showSelectAllMatchingPrompt = computed(() => (
  !selectAllMatching.value && allPageSelected.value && totalCount.value > rows.value.length
))

const selectionBannerPageText = computed(() => (
  t('components.pendingTasks.selectionBanner.pageSelected', { count: rows.value.length })
))

const selectionBannerSelectAllLabel = computed(() => {
  if (hasSearch.value) {
    return t('components.pendingTasks.selectionBanner.selectAllMatchingSearch', { count: totalCount.value })
  }
  if (hasFilters.value) {
    return t('components.pendingTasks.selectionBanner.selectAllMatchingFilters', { count: totalCount.value })
  }
  return t('components.pendingTasks.selectionBanner.selectAll', { count: totalCount.value })
})

const selectionBannerAllSelectedText = computed(() => {
  if (hasSearch.value) {
    return t('components.pendingTasks.selectionBanner.allSelectedSearch', { count: totalCount.value })
  }
  if (hasFilters.value) {
    return t('components.pendingTasks.selectionBanner.allSelectedFilters', { count: totalCount.value })
  }
  return t('components.pendingTasks.selectionBanner.allSelected', { count: totalCount.value })
})

const show = () => {
  dialogRef.value.show()
  showScrollTop.value = false
}

const hide = () => {
  dialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
  showScrollTop.value = false
}

const toggleActionsExpanded = () => {
  actionsExpanded.value = !actionsExpanded.value
}

const fetchLibraryOptions = () => {
  return axios({
    method: 'get',
    url: getUnmanicApiUrl('v2', 'settings/libraries')
  }).then((response) => {
    const options = response.data.libraries.map((library) => ({
      label: library.name,
      value: library.id,
    }))
    libraryOptions.value = options
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

const openFilterDialog = () => {
  draftLibraryFilters.value = [...libraryFilters.value]
  filterDialogOpen.value = true
  if (libraryOptions.value.length === 0) {
    fetchLibraryOptions()
  }
}

const clearFilterDrafts = () => {
  draftLibraryFilters.value = []
}

const applyFilterDrafts = () => {
  libraryFilters.value = [...draftLibraryFilters.value]
}

const handleTableScroll = (event) => {
  const wrapper = event?.target || tableWrapperRef.value
  if (!wrapper) {
    return
  }
  showScrollTop.value = wrapper.scrollTop > 120
  if (showActionsToggle.value && actionsExpanded.value && wrapper.scrollTop > 4) {
    actionsExpanded.value = false
  }
}

const scrollToTop = () => {
  const wrapper = tableWrapperRef.value
  if (!wrapper) {
    return
  }
  wrapper.scrollTo({ top: 0, behavior: 'smooth' })
  showScrollTop.value = false
}

const resetSelection = () => {
  selectedIds.value = []
  selectAllMatching.value = false
  excludedIds.value = []
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
    const pageIds = rows.value.map((row) => row.id)
    pageIds.forEach((id) => {
      if (!selectedIds.value.includes(id)) {
        selectedIds.value.push(id)
      }
    })
  } else {
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
  library_ids: libraryFilters.value,
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

const rescanLibrary = () => {
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'pending/rescan')
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.rescanLibraryError'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const moveToTop = () => {
  if (selectedCount.value === 0) {
    $q.notify({
      color: 'warning',
      position: 'top',
      message: t('components.pendingTasks.nothingSelected'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
    return
  }
  moveTo('top')
}

const moveToBottom = () => {
  if (selectedCount.value === 0) {
    $q.notify({
      color: 'warning',
      position: 'top',
      message: t('components.pendingTasks.nothingSelected'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
    return
  }
  moveTo('bottom')
}

const moveTo = (position) => {
  const data = {
    position,
    ...getSelectionPayload(),
  }

  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'pending/reorder'),
    data
  }).then(() => {
    resetSelection()
    fetchPendingTasks({ reset: true })
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('components.pendingTasks.errorReorder'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const deleteSelected = () => {
  if (selectedCount.value === 0) {
    $q.notify({
      color: 'warning',
      position: 'top',
      message: t('components.pendingTasks.nothingSelected'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
    return
  }

  const data = getSelectionPayload()
  axios({
    method: 'delete',
    url: getUnmanicApiUrl('v2', 'pending/tasks'),
    data
  }).then(() => {
    resetSelection()
    fetchPendingTasks({ reset: true })
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('components.pendingTasks.errorDeleteSelected'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const fetchPendingTasks = ({ reset = false, silent = false, refreshTop = false } = {}) => {
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
    order_by: 'priority',
    order_direction: 'desc',
  }

  return axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'pending/tasks'),
    data
  }).then((response) => {
    totalCount.value = response.data.recordsFiltered

    const returnedData = response.data.results.map((results) => ({
      id: results.id,
      name: results.abspath,
      libraryName: results.library_name,
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
      message: t('components.pendingTasks.errorFetchingList'),
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
  fetchPendingTasks().finally(() => {
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

watch(searchValue, () => {
  resetSelection()
  fetchPendingTasks({ reset: true })
})

watch(libraryFilters, () => {
  resetSelection()
  fetchPendingTasks({ reset: true })
})

onMounted(() => {
  actionsExpanded.value = true

  fetchLibraryOptions()

  fetchPendingTasks({ reset: true })

  reloadInterval = setInterval(() => {
    if (!loadingMore.value) {
      fetchPendingTasks({ refreshTop: true, silent: true })
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
.pending-tasks-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.pending-tasks-table-actions-bar {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--q-card-head);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  min-width: 0;
}

.q-dark .pending-tasks-table-actions-bar {
  background: var(--q-card-head) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.pending-tasks-selection-banner {
  border-bottom: 1px solid var(--q-separator-color);
  background: rgba(0, 0, 0, 0.03);
  gap: 12px;
}

.q-dark .pending-tasks-selection-banner {
  background: rgba(255, 255, 255, 0.06);
}

.pending-tasks-selection-banner__content {
  min-width: 0;
}

.pending-tasks-selection-banner__center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.pending-tasks-selection-banner__actions {
  display: flex;
  align-items: center;
}

.pending-tasks-selection {
  padding-left: 17px;
}

@media (min-width: 601px) {
  .pending-tasks-selection {
    margin-top: 8px;
  }
}

.pending-tasks-filter-indicator {
  min-width: 0;
  padding: 2px 0;
}

.pending-tasks-filter-indicator__label {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.pending-tasks-filter-chip {
  max-width: 100%;
}

.pending-tasks-filter-chip :deep(.q-chip__content) {
  line-height: 1.2;
  padding: 1px 0;
}

.pending-tasks-toolbar {
  width: 100%;
}

.pending-tasks-table-wrapper {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
}

.pending-tasks-body {
  position: relative;
  min-width: 0;
}

.pending-tasks-table {
  width: 100%;
  min-width: 0;
}

.pending-tasks-table :deep(table) {
  width: 100%;
  min-width: 0;
}

.pending-tasks-table :deep(.q-td) {
  white-space: normal;
  overflow-wrap: anywhere;
}

.pending-task-row :deep(.q-td) {
  vertical-align: top;
}

.pending-task-select {
  vertical-align: middle;
}

.pending-task-cell-center {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.pending-task-name {
  font-weight: 500;
}

.pending-tasks-dialog-card {
  width: 100%;
  max-width: 520px;
}

.pending-tasks-dialog-header {
  position: sticky;
  top: 0;
  z-index: 2;
}

.pending-tasks-dialog-body {
  max-height: 60vh;
}

.pending-tasks-scroll-top {
  position: sticky;
  bottom: 18px;
  display: flex;
  justify-content: center;
  pointer-events: none;
  padding: 0 18px 12px;
}

.pending-tasks-scroll-top .q-btn {
  pointer-events: auto;
}

@media (max-width: 599px) {
  .pending-tasks-dialog-card {
    max-width: 95vw;
  }
}

@media (max-width: 449px) {
  .pending-tasks-filter-indicator {
    align-items: flex-start;
  }

  .pending-tasks-filter-indicator__label {
    width: 100%;
  }

  .pending-tasks-selection-banner {
    align-items: flex-start;
    flex-direction: column;
  }

  .pending-tasks-selection-banner__center {
    align-items: flex-start;
    flex-direction: column;
  }

  .pending-tasks-action-row {
    flex-direction: column;
    align-items: stretch;
  }

  .pending-tasks-action-row .q-btn,
  .pending-tasks-action-row .pending-tasks-options-button {
    width: 100%;
  }
}
</style>
