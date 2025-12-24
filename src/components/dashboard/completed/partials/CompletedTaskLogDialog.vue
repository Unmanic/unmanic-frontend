<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="$t('headers.completedTaskDetails')"
    width="92vw"
    @hide="onDialogHide"
  >
    <div class="completed-task-details-body column full-height">
      <q-scroll-area class="col full-height q-pa-md">
        <div class="completed-task-details-dialog-content">
          <p
            v-for="(line, index) in taskDetails"
            v-bind:key="index"
            v-html="line"></p>
        </div>
      </q-scroll-area>
    </div>
  </UnmanicDialogWindow>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from "axios"
import { getUnmanicApiUrl } from "src/js/unmanicGlobals"
import UnmanicDialogWindow from "components/dialogs/standard/UnmanicDialogWindow.vue"
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  completedTaskId: {
    type: String,
    required: true
  },
})

const emit = defineEmits(['hide', 'ok'])
const dialogRef = ref(null)
const taskDetails = ref([])
const $q = useQuasar()
const { t: $t } = useI18n()

const show = () => {
  dialogRef.value.show()
}

const hide = () => {
  dialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
}

const fetchCompletedTaskLog = () => {
  let data = {
    task_id: props.completedTaskId,
  }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'history/task/log'),
    data: data
  }).then((response) => {
    taskDetails.value = response.data.command_log_lines
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: $t('components.completedTasks.errorGettingDetails'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

onMounted(() => {
  fetchCompletedTaskLog()
})

defineExpose({
  show,
  hide
})
</script>

<style lang="scss">
.completed-task-details-body {
  height: 100%;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.completed-task-details-dialog-content h1 {
  font-size: 2.125rem;
  line-height: 2.125rem;
}

.completed-task-details-dialog-content h2 {
  font-size: 1.75rem;
  line-height: 1.75rem;
}

.completed-task-details-dialog-content h3 {
  font-size: 1.5rem;
  line-height: 1.5rem;
}

.completed-task-details-dialog-content h4 {
  font-size: 1.25rem;
  line-height: 1.5rem;
}

.completed-task-details-dialog-content h5 {
  font-size: 1rem;
  line-height: 1.5rem;
}

.completed-task-details-dialog-content h6 {
  font-size: 1rem;
  line-height: 1.5rem;
}

.completed-task-details-dialog-content p {
  margin: 0 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.completed-task-details-dialog-content b {
  color: $secondary;
  display: block;
  margin: 20px 0 0 0;
}

.completed-task-details-dialog-content pre {
  display: block;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.428571;
  color: #333;
  word-break: break-all;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: auto;
}
.completed-task-details-dialog-content span.terminated {
  color: $negative;
}
</style>
