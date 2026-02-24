<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="$t('navigation.applicationLogs')"
    @hide="onDialogHide"
  >
    <div class="q-pa-md application-logs-dialog-content">
      <div class="q-pb-md" style="max-width: 700px;">
        <h5 class="q-mb-none q-mt-sm">{{ $t('components.settings.support.logs') }}</h5>
        <div class="column">
          <div class="row q-gutter-sm items-stretch">
            <div class="col-12">
              <q-skeleton
                v-if="debugging === null"
                type="QToggle"/>
              <q-toggle
                v-else
                v-model="debugging"
                @update:model-value="toggleDebugging(debugging)"
                :label="$t('components.settings.support.enableDebugging')"
              />
            </div>
            <div class="col-12">
              <q-btn-dropdown
                outline
                color="secondary"
                :label="$t('components.settings.support.confLogBufferRetentionLabel')"
                content-class="unmanic-dropdown-menu"
              >
                <q-list>
                  <q-item
                    v-for="(val, label) in retentionOptions"
                    :key="val"
                    clickable
                    v-close-popup
                    @click="setLogRetention(val)"
                  >
                    <q-item-section>
                      <q-item-label>{{ label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="currentRetention === val">
                      <q-icon name="check"/>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>
        </div>
      </div>

      <q-card flat bordered class="application-logs-card" style="width: 2000px; max-width: 100%;">
        <q-card-section class="col-auto">
          <div class="row items-center">
            <div class="col-sm-6 col-xs-12">
              <div class="text-h6">{{ $t('components.settings.support.currentSystemLogs') }}:</div>
              <div class="text-subtitle2">{{ logsPath }}</div>
            </div>
            <q-space class="gt-xs"/>
            <div class="col-12 col-sm-auto q-mt-sm q-mt-sm-none">
              <q-btn
                @click="downloadLogs"
                outline
                color="secondary"
                icon-right="file_download"
                :label="$t('components.settings.support.downloadSystemLogs')"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section class="system-log-section">
          <q-skeleton
            v-if="currentLog.length === 0"
            style="width: 100%"
            type="text"
          />
          <div
            ref="logContainerRef"
            v-else
            :class="$q.platform.is.mobile ? '' : 'q-px-lg'"
            class="system-log-content"
          >
            <p
              v-for="(line, index) in currentLog"
              :key="index"
              v-html="line"
            ></p>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </UnmanicDialogWindow>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { UnmanicWebsocketHandler } from 'src/js/unmanicWebsocket'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import UnmanicDialogWindow from 'components/ui/dialogs/UnmanicDialogWindow.vue'

const emit = defineEmits(['hide'])
const { t: $t } = useI18n()
const $q = useQuasar()

const dialogRef = ref(null)
const logContainerRef = ref(null)
const currentLog = ref([])
const currentRawLog = ref([])
const logsPath = ref('')
const debugging = ref(null)
const currentRetention = ref(null)

const retentionOptions = {
  Disabled: 0,
  '1 day': 1,
  '3 days': 3,
  '5 days': 5,
  '7 days': 7,
  '14 days': 14
}

const MAX_LOG_LINES = 2000

let ws = null
let unmanicWSHandler = null

const requestSystemLogs = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ command: 'start_system_logs', params: {} }))
  }
}

const styleLogLine = (logLine) => {
  let styledLine = logLine
  styledLine = styledLine.replace(/\/[\/|.|\s|\w|-]+/, "<span style='color:var(--q-secondary);'>$&</span>")
  styledLine = styledLine.replace(/[\d(\-|T|\:)]+\:DEBUG:[\w(\.|\-)]+/, "<span style='color:var(--q-primary);'>$&</span>")
  styledLine = styledLine.replace(/[\d(\-|T|\:)]+\:WARNING:[\w(\.|\-)]+/, "<span style='color:var(--q-warning);'>$&</span>")
  styledLine = styledLine.replace(/[\d(\-|T|\:)]+\:ERROR:[\w(\.|\-)]+/, "<span style='color:var(--q-negative);'>$&</span>")
  return styledLine
}

const getOverlapCount = (existingLogs, incomingLogs) => {
  const maxOverlap = Math.min(existingLogs.length, incomingLogs.length)
  for (let overlap = maxOverlap; overlap > 0; overlap--) {
    let isMatch = true
    for (let i = 0; i < overlap; i++) {
      if (existingLogs[existingLogs.length - overlap + i] !== incomingLogs[i]) {
        isMatch = false
        break
      }
    }
    if (isMatch) {
      return overlap
    }
  }
  return 0
}

const updateServerLogs = (data) => {
  const incomingLogs = Array.isArray(data.system_logs) ? data.system_logs : []
  const logContainer = logContainerRef.value
  const shouldTail = !logContainer
    || (logContainer.scrollHeight - logContainer.scrollTop - logContainer.clientHeight) < 24

  if (currentRawLog.value.length === 0) {
    currentRawLog.value = [...incomingLogs]
    currentLog.value = incomingLogs.map((line) => styleLogLine(line))
  } else {
    const overlap = getOverlapCount(currentRawLog.value, incomingLogs)
    const newLogs = incomingLogs.slice(overlap)
    if (newLogs.length > 0) {
      currentRawLog.value = currentRawLog.value.concat(newLogs)
      currentLog.value = currentLog.value.concat(newLogs.map((line) => styleLogLine(line)))
    }
  }

  if (currentRawLog.value.length > MAX_LOG_LINES) {
    currentRawLog.value = currentRawLog.value.slice(-MAX_LOG_LINES)
    currentLog.value = currentLog.value.slice(-MAX_LOG_LINES)
  }

  logsPath.value = data.logs_path
  nextTick(() => {
    if (shouldTail && logContainerRef.value) {
      logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight
    }
  })
}

const initUnmanicWebsocket = () => {
  unmanicWSHandler = UnmanicWebsocketHandler($t)
  ws = unmanicWSHandler.init()

  unmanicWSHandler.addEventListener('open', 'start_system_logs', () => {
    requestSystemLogs()
  })

  unmanicWSHandler.addEventListener('message', 'handle_system_logs', (evt) => {
    if (typeof evt.data !== 'string') {
      return
    }
    const jsonData = JSON.parse(evt.data)
    if (jsonData.success && jsonData.type === 'system_logs') {
      updateServerLogs(jsonData.data)
    }
  })

  // The shared websocket may already be open before this dialog registers listeners.
  // Request the current system logs immediately in that case.
  requestSystemLogs()
}

const closeUnmanicWebsocket = () => {
  if (unmanicWSHandler) {
    unmanicWSHandler.close()
    unmanicWSHandler = null
  }
  ws = null
}

const fetchSettings = () => {
  axios({
    method: 'get',
    url: getUnmanicApiUrl('v2', 'settings/read')
  }).then((response) => {
    debugging.value = response.data.settings.debugging
    logsPath.value = response.data.settings.log_path
    currentRetention.value = response.data.settings.log_buffer_retention
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: $t('notifications.failedToFetchSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const toggleDebugging = (value) => {
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'settings/write'),
    data: {
      settings: {
        debugging: value
      }
    }
  }).then(() => {
    fetchSettings()
    $q.notify({
      color: 'positive',
      position: 'top',
      icon: 'cloud_done',
      message: $t('notifications.saved'),
      timeout: 200
    })
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: $t('notifications.failedToSaveSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const setLogRetention = (value) => {
  const retention = parseInt(value, 10)
  if (Number.isNaN(retention)) {
    return
  }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'settings/write'),
    data: {
      settings: {
        log_buffer_retention: retention
      }
    }
  }).then(() => {
    fetchSettings()
    $q.notify({
      color: 'positive',
      position: 'top',
      icon: 'cloud_done',
      message: $t('notifications.saved'),
      timeout: 200
    })
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: $t('notifications.failedToSaveSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const downloadLogs = () => {
  axios({
    method: 'get',
    url: getUnmanicApiUrl('v2', 'docs/logs/zip'),
    responseType: 'blob'
  }).then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'UnmanicLogs.zip')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: $t('notifications.failedToSaveSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const show = () => {
  currentLog.value = []
  currentRawLog.value = []
  if (dialogRef.value) {
    dialogRef.value.show()
  }
  fetchSettings()
  initUnmanicWebsocket()
}

const hide = () => {
  if (dialogRef.value) {
    dialogRef.value.hide()
  }
}

const onDialogHide = () => {
  closeUnmanicWebsocket()
  currentLog.value = []
  currentRawLog.value = []
  emit('hide')
}

defineExpose({
  show,
  hide
})
</script>

<style scoped lang="scss">
.application-logs-dialog-content {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.application-logs-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.system-log-section {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.system-log-content p {
  margin: 0 0;
  white-space: pre-wrap;
}

.system-log-content {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
