<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="$t('components.completedTasks.metadataTitle')"
    width="92vw"
    :actions="dialogActions"
    :persistent="isDirty"
    :closeTooltip="isDirty ? $t('components.completedTasks.metadataUnsaved') : ''"
    @save="saveAll"
    @delete="confirmDeleteAll"
    @hide="onDialogHide"
  >
    <div class="task-metadata-dialog column full-height">
      <q-scroll-area class="col full-height q-pa-md">
        <div class="task-metadata-dialog-content q-gutter-md">
          <q-card flat>
            <q-card-section>
              <div v-if="metadataResults.length === 0" class="text-secondary">
                {{ $t('components.completedTasks.metadataEmpty') }}
              </div>
              <div v-else class="q-gutter-sm">
                <q-select
                  v-if="metadataResults.length > 1"
                  v-model="selectedFingerprint"
                  :options="metadataOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  color="primary"
                  :label="$t('components.completedTasks.metadataSelectRecord')"
                />
                <div class="task-metadata-summary">
                  <div class="task-metadata-summary__label">
                    {{ $t('components.completedTasks.metadataFingerprint') }}
                  </div>
                  <div class="task-metadata-summary__value">
                    {{ selectedEntry?.fingerprint || '-' }}
                  </div>
                </div>
                <div class="task-metadata-summary">
                  <div class="task-metadata-summary__label">
                    {{ $t('components.completedTasks.metadataPathsTitle') }}
                  </div>
                  <div class="task-metadata-summary__value">
                    <div v-if="selectedEntryPaths.length === 0">-</div>
                    <div v-else class="q-gutter-xs">
                      <div v-for="path in selectedEntryPaths" :key="path.key">
                        <strong>{{ path.label }}:</strong> {{ path.path }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div v-if="selectedEntry && editorEntries.length" class="q-gutter-md">
                <q-card flat bordered v-for="entry in editorEntries" :key="entry.pluginId" class="nested-card">
                  <q-card-section class="bg-card-head text-primary row items-center justify-between">
                    <div class="row items-center q-gutter-xs">
                      <q-icon name="extension"/>
                      <span>{{ entry.pluginId }}</span>
                    </div>
                    <UnmanicListActionButton
                      icon="delete"
                      color="negative"
                      :tooltip="$t('components.completedTasks.metadataDeletePlugin')"
                      @click="confirmDeletePlugin(entry.pluginId)"
                    />
                  </q-card-section>
                  <q-card-section>
                    <q-input
                      v-model="entry.jsonText"
                      type="textarea"
                      outlined
                      dense
                      autogrow
                      color="primary"
                      :label="$t('components.completedTasks.metadataJsonLabel')"
                      :error="Boolean(entry.error)"
                      :error-message="entry.error"
                      @update:model-value="markDirty"
                    />
                  </q-card-section>
                </q-card>
              </div>

              <div v-else-if="selectedEntry && !editorEntries.length" class="text-secondary">
                {{ $t('components.completedTasks.metadataEmptyPlugin') }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-scroll-area>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-dots size="42px" color="secondary"/>
    </q-inner-loading>
  </UnmanicDialogWindow>

  <UnmanicDialogConfirm
    ref="confirmDialogRef"
    :title="$t('headers.confirm')"
    :message="$t('components.completedTasks.metadataDeleteConfirm')"
    :ok-label="$t('components.completedTasks.metadataDeleteTitle')"
    ok-color="negative"
    @confirm="confirmDeleteAction"
    @cancel="resetConfirmDialog"
    @hide="resetConfirmDialog"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import UnmanicDialogWindow from 'components/ui/dialogs/UnmanicDialogWindow.vue'
import UnmanicListActionButton from 'components/ui/buttons/UnmanicListActionButton.vue'
import UnmanicDialogConfirm from 'components/ui/dialogs/UnmanicDialogConfirm.vue'

const props = defineProps({
  completedTaskId: {
    type: String,
    default: ''
  },
  fingerprint: {
    type: String,
    default: ''
  },
})

const emit = defineEmits(['hide'])

const dialogRef = ref(null)
const confirmDialogRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const metadataResults = ref([])
const selectedFingerprint = ref(null)
const editorEntries = ref([])
const isDirty = ref(false)

const confirmState = ref({ type: '', pluginId: null })

const $q = useQuasar()
const { t: $t } = useI18n()

const selectedEntry = computed(() => {
  if (!selectedFingerprint.value) {
    return metadataResults.value[0] || null
  }
  return metadataResults.value.find((entry) => entry.fingerprint === selectedFingerprint.value) || null
})

const metadataOptions = computed(() => (
  metadataResults.value.map((entry) => ({
    label: entry.paths?.[0]?.path || entry.fingerprint,
    value: entry.fingerprint,
  }))
))

const selectedEntryPaths = computed(() => {
  const entry = selectedEntry.value
  if (!entry || !Array.isArray(entry.paths)) {
    return []
  }
  return entry.paths.map((item, idx) => ({
    key: `${item.path_type || 'path'}-${idx}`,
    label: item.path_type || $t('components.completedTasks.metadataPath'),
    path: item.path,
  }))
})

const dialogActions = computed(() => {
  const actions = []
  actions.push({
    label: $t('components.completedTasks.metadataDeleteFile'),
    icon: 'delete',
    color: 'negative',
    emit: 'delete',
    disabled: !selectedEntry.value,
  })
  actions.push({
    label: $t('components.completedTasks.metadataSave'),
    icon: 'save',
    color: isDirty.value ? 'positive' : 'grey-6',
    emit: 'save',
    disabled: !isDirty.value || saving.value,
    tooltip: isDirty.value ? $t('components.completedTasks.metadataSave') : $t('components.completedTasks.metadataNoChanges'),
  })
  return actions
})

const show = () => {
  dialogRef.value.show()
  fetchMetadata()
}

const hide = () => {
  dialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
  isDirty.value = false
}

const markDirty = () => {
  if (!isDirty.value) {
    isDirty.value = true
  }
}

const fetchMetadata = () => {
  if (!props.completedTaskId && !props.fingerprint) {
    metadataResults.value = []
    editorEntries.value = []
    selectedFingerprint.value = null
    return
  }

  loading.value = true
  const payload = {}
  let endpoint = 'metadata/by-task'
  if (props.fingerprint) {
    endpoint = 'metadata/by-fingerprint'
    payload.fingerprint = props.fingerprint
  } else {
    payload.task_id = Number(props.completedTaskId)
  }

  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', endpoint),
    data: payload,
  }).then((response) => {
    metadataResults.value = response.data.results || []
    selectedFingerprint.value = metadataResults.value[0]?.fingerprint || null
    buildEditorEntries()
    isDirty.value = false
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

const buildEditorEntries = () => {
  if (!selectedEntry.value) {
    editorEntries.value = []
    return
  }
  const metadata = selectedEntry.value.metadata_json || {}
  editorEntries.value = Object.keys(metadata)
    .sort()
    .map((pluginId) => ({
      pluginId,
      jsonText: JSON.stringify(metadata[pluginId], null, 2),
      error: '',
    }))
}

const validateEntry = (entry) => {
  try {
    const parsed = JSON.parse(entry.jsonText || '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      entry.error = $t('components.completedTasks.metadataInvalidJson')
      return null
    }
    entry.error = ''
    return parsed
  } catch (err) {
    entry.error = $t('components.completedTasks.metadataInvalidJson')
    return null
  }
}

const saveAll = () => {
  if (!selectedEntry.value) {
    return
  }
  saving.value = true
  const requests = []

  for (const entry of editorEntries.value) {
    const parsed = validateEntry(entry)
    if (!parsed) {
      saving.value = false
      return
    }
    requests.push(axios({
      method: 'post',
      url: getUnmanicApiUrl('v2', 'metadata/update'),
      data: {
        fingerprint: selectedEntry.value.fingerprint,
        plugin_id: entry.pluginId,
        json_blob: parsed,
      }
    }))
  }

  Promise.all(requests).then(() => {
    $q.notify({
      color: 'positive',
      position: 'top',
      message: $t('components.completedTasks.metadataSaved'),
      icon: 'check',
      actions: [{ icon: 'close', color: 'white' }]
    })
    fetchMetadata()
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: $t('components.completedTasks.metadataErrorSave'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  }).finally(() => {
    saving.value = false
  })
}

const confirmDeletePlugin = (pluginId) => {
  if (!selectedEntry.value) {
    return
  }
  confirmState.value = { type: 'plugin', pluginId }
  showConfirmDialog()
}

const confirmDeleteAll = () => {
  if (!selectedEntry.value) {
    return
  }
  confirmState.value = { type: 'all', pluginId: null }
  showConfirmDialog()
}

const resetConfirmDialog = () => {
  confirmState.value = { type: '', pluginId: null }
}

const confirmDeleteAction = () => {
  const { type, pluginId } = confirmState.value
  resetConfirmDialog()
  if (type === 'plugin') {
    deleteMetadata(pluginId)
  } else if (type === 'all') {
    deleteMetadata(null)
  }
}

const showConfirmDialog = () => {
  if (confirmDialogRef.value) {
    confirmDialogRef.value.show()
  }
}

const deleteMetadata = (pluginId) => {
  axios({
    method: 'delete',
    url: getUnmanicApiUrl('v2', 'metadata'),
    data: {
      fingerprint: selectedEntry.value.fingerprint,
      plugin_id: pluginId,
    }
  }).then(() => {
    $q.notify({
      color: 'positive',
      position: 'top',
      message: $t('components.completedTasks.metadataDeleted'),
      icon: 'check',
      actions: [{ icon: 'close', color: 'white' }]
    })
    fetchMetadata()
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

watch(selectedEntry, () => {
  buildEditorEntries()
})

watch(() => props.fingerprint, (value) => {
  if (!value) {
    return
  }
  fetchMetadata()
})

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.task-metadata-dialog {
  height: 100%;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.task-metadata-dialog-content {
  min-height: 0;
}

.task-metadata-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  word-break: break-word;
}

.task-metadata-summary__label {
  font-weight: 600;
}

.task-metadata-summary__value {
  color: var(--q-secondary);
}
</style>
