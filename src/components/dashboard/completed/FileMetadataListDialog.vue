<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="$t('components.completedTasks.metadataBrowserTitle')"
    @hide="onDialogHide"
  >
    <div class="completed-tasks-dialog">
      <div class="completed-tasks-table-actions-bar q-pa-sm">
        <div class="row q-col-gutter-sm items-center completed-tasks-toolbar">
          <div v-if="showActionsToggle" class="col-12 row items-center justify-end">
            <UnmanicListActionButton
              :icon="actionsExpanded ? 'expand_less' : 'expand_more'"
              :tooltip="actionsExpanded ? $t('components.completedTasks.hideActions') : $t('components.completedTasks.showActions')"
              @click="toggleActionsExpanded"
            />
          </div>
          <q-slide-transition>
            <div v-show="actionsExpanded" class="col-12">
              <div class="row q-col-gutter-sm completed-tasks-actions-panel">
                <div class="col-12">
                  <q-input
                    v-model="searchValue"
                    outlined
                    dense
                    debounce="300"
                    :color="searchLabelColor"
                    :label-color="searchLabelColor"
                    :placeholder="$t('navigation.search')"
                  >
                    <template v-slot:append>
                      <q-icon name="search" :color="searchLabelColor"/>
                    </template>
                  </q-input>
                </div>

                <div class="col-12">
                  <div class="row items-center q-col-gutter-sm completed-tasks-action-row">
                    <q-space/>

                    <div class="col-auto">
                      <UnmanicStandardButtonDropdown
                        class="completed-tasks-options-button"
                        :label="$t('navigation.options')"
                        :size="filterSortButtonSize"
                      >
                        <q-list>
                          <q-item clickable v-close-popup @click="deleteSelected">
                            <q-item-section>
                              <q-item-label>
                                <q-icon name="delete_outline"/>
                                {{ $t('components.completedTasks.metadataBrowserRemoveSelected') }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </UnmanicStandardButtonDropdown>
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
                        :label="$t('components.completedTasks.selectPage')"
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

      <div
        id="metadata-browser-scroller"
        ref="tableWrapperRef"
        class="completed-tasks-table-wrapper"
        @scroll.passive="handleTableScroll"
      >
        <div :class="[isMobile ? 'q-px-none' : 'q-px-sm', 'completed-tasks-body q-pa-sm']">
          <q-infinite-scroll
            ref="infiniteScrollRef"
            :disable="allLoaded"
            :offset="200"
            scroll-target="#metadata-browser-scroller"
            @load="loadMore"
          >
            <q-table
              flat
              bordered
              hide-header
              hide-pagination
              :rows-per-page-options="[0]"
              row-key="fingerprint"
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
                      {{ props.row.fingerprint }}
                    </div>
                    <div class="text-caption">
                      <span class="text-weight-medium">
                        {{ $t('components.completedTasks.metadataPathsTitle') }}:
                      </span>
                      <span v-if="props.row.paths.length">
                        {{ props.row.paths.map((item) => item.path).join(', ') }}
                      </span>
                      <span v-else>-</span>
                    </div>
                  </q-td>

                  <q-td auto-width class="completed-task-actions">
                    <div class="completed-task-cell-center">
                      <UnmanicStandardButton
                        v-if="$q.screen.gt.xs"
                        @click="openMetadataDialog(props.row.fingerprint)"
                        :label="$t('components.completedTasks.metadata')"
                        style="min-width: 120px;"
                      />
                      <UnmanicListActionButton
                        v-else
                        @click="openMetadataDialog(props.row.fingerprint)"
                        icon="data_object"
                        :tooltip="$t('components.completedTasks.metadata')"
                      />
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-infinite-scroll>

          <div v-if="!loading && rows.length === 0" class="text-secondary q-pa-md">
            {{ $t('components.completedTasks.metadataBrowserEmpty') }}
          </div>
        </div>
      </div>

      <div v-show="showScrollTop" class="completed-tasks-scroll-top">
        <UnmanicListActionButton
          icon="arrow_upward"
          :tooltip="$t('components.completedTasks.scrollToTop')"
          @click="scrollToTop"
        />
      </div>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-dots size="42px" color="secondary"/>
    </q-inner-loading>
  </UnmanicDialogWindow>

  <FileMetadataDetailsDialog
    ref="metadataDialogRef"
    :fingerprint="metadataDialogFingerprint"
    @hide="onMetadataDialogHide"
  />
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useMobile } from 'src/composables/useMobile'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import UnmanicDialogWindow from 'components/ui/dialogs/UnmanicDialogWindow.vue'
import UnmanicStandardButton from 'components/ui/buttons/UnmanicStandardButton.vue'
import UnmanicStandardButtonDropdown from 'components/ui/buttons/UnmanicStandardButtonDropdown.vue'
import UnmanicListActionButton from 'components/ui/buttons/UnmanicListActionButton.vue'
import FileMetadataDetailsDialog from 'components/dashboard/completed/FileMetadataDetailsDialog.vue'

const emit = defineEmits(['hide'])

const $q = useQuasar()
const { t: $t } = useI18n()
const { isMobile } = useMobile()

const dialogRef = ref(null)
const metadataDialogRef = ref(null)
const metadataDialogFingerprint = ref('')
const tableWrapperRef = ref(null)
const infiniteScrollRef = ref(null)
const showScrollTop = ref(false)

const loading = ref(false)
const loadingMore = ref(false)
const rows = ref([])
const totalCount = ref(0)
const pageSize = 50
const offset = ref(0)

const searchValue = ref('')
const actionsExpanded = ref(true)
const selectedFingerprints = ref([])

const columns = computed(() => ([
  {
    name: 'select',
    label: '',
    field: 'fingerprint',
    sortable: false
  },
  {
    name: 'fingerprint',
    label: $t('components.completedTasks.metadataFingerprint'),
    field: 'fingerprint',
    sortable: false
  },
  {
    name: 'paths',
    label: $t('components.completedTasks.metadataPathsTitle'),
    field: 'paths',
    sortable: false
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    sortable: false
  },
]))

const filterSortActiveColor = 'warning'
const filterSortButtonSize = computed(() => ($q.screen.width < 450 ? 'sm' : 'md'))
const searchLabelColor = computed(() => (searchValue.value.trim().length > 0 ? filterSortActiveColor : 'secondary'))

const showActionsToggle = computed(() => (
  $q.screen.width < 1024 ||
  ($q.screen.width >= 1024 && $q.screen.height < 800)
))

const allPageSelected = computed(() => {
  if (rows.value.length === 0) {
    return false
  }
  return rows.value.every((row) => isRowSelected(row))
})

const allLoaded = computed(() => {
  if (totalCount.value === 0) {
    return true
  }
  return rows.value.length >= totalCount.value
})

let searchTimer = null

const show = () => {
  dialogRef.value.show()
  showScrollTop.value = false
  fetchMetadata({ reset: true, silent: true })
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

const isRowSelected = (row) => selectedFingerprints.value.includes(row.fingerprint)

const toggleRowSelection = (row, value) => {
  if (value) {
    if (!selectedFingerprints.value.includes(row.fingerprint)) {
      selectedFingerprints.value.push(row.fingerprint)
    }
  } else {
    selectedFingerprints.value = selectedFingerprints.value.filter((id) => id !== row.fingerprint)
  }
}

const toggleSelectPage = (value) => {
  if (value) {
    selectedFingerprints.value = rows.value.map((row) => row.fingerprint)
  } else {
    selectedFingerprints.value = []
  }
}

const resetSelection = () => {
  selectedFingerprints.value = []
}

const fetchMetadata = ({ reset = false, silent = false } = {}) => {
  if (reset) {
    offset.value = 0
    rows.value = []
    totalCount.value = 0
    resetSelection()
  }

  if (!silent) {
    loading.value = true
  }

  const payload = {
    offset: offset.value,
    limit: pageSize,
  }
  if (searchValue.value.trim()) {
    payload.path = searchValue.value.trim()
  }

  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'metadata/search'),
    data: payload,
  }).then((response) => {
    const results = response.data.results || []
    totalCount.value = response.data.total_count || results.length
    const mapped = results.map((entry) => ({
      fingerprint: entry.fingerprint,
      paths: entry.paths || [],
    }))
    if (offset.value === 0) {
      rows.value = mapped
    } else {
      rows.value = rows.value.concat(mapped)
    }
    offset.value = rows.value.length
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: $t('components.completedTasks.metadataErrorFetch'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  }).finally(() => {
    loading.value = false
  })
}

const loadMore = (index, done) => {
  if (loadingMore.value) {
    done()
    return
  }
  loadingMore.value = true
  fetchMetadata({ silent: true })
  setTimeout(() => {
    loadingMore.value = false
    done()
  }, 0)
}

const deleteSelected = () => {
  if (selectedFingerprints.value.length === 0) {
    return
  }

  const requests = selectedFingerprints.value.map((fingerprint) => (
    axios({
      method: 'delete',
      url: getUnmanicApiUrl('v2', 'metadata'),
      data: { fingerprint }
    })
  ))

  Promise.all(requests).then(() => {
    resetSelection()
    fetchMetadata({ reset: true, silent: true })
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: $t('components.completedTasks.metadataErrorDelete'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const openMetadataDialog = (fingerprint) => {
  metadataDialogFingerprint.value = fingerprint
  nextTick(() => {
    if (metadataDialogRef.value) {
      metadataDialogRef.value.show()
    }
  })
}

const onMetadataDialogHide = () => {
  metadataDialogFingerprint.value = ''
  fetchMetadata({ reset: true, silent: true })
}

watch(searchValue, () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    fetchMetadata({ reset: true })
  }, 300)
})

defineExpose({ show, hide })
</script>

<style scoped>
.completed-tasks-dialog {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.completed-task-actions {
  align-items: center;
  min-width: 0;
  max-width: 100%;
}

.completed-task-name {
  font-weight: 500;
}

.completed-tasks-selection {
  padding-left: 17px;
}

@media (min-width: 601px) {
  .completed-tasks-selection {
    margin-top: 8px;
  }
}
</style>
