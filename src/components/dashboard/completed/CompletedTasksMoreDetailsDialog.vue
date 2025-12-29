<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="$t('headers.completedTasks')"
    @hide="onDialogHide"
  >
    <div class="completed-tasks-details-body column full-height">
      <q-card-section class="col full-height q-pa-none">
        <CompletedTasksTable :initStatusFilter="initStatusFilter"/>
      </q-card-section>
    </div>
  </UnmanicDialogWindow>
</template>

<script setup>
import { ref } from 'vue'
import UnmanicDialogWindow from 'components/ui/dialogs/UnmanicDialogWindow.vue'
import CompletedTasksTable from 'components/dashboard/completed/partials/CompletedTasksTable.vue'

const props = defineProps({
  initStatusFilter: {
    type: String,
    default: 'all'
  }
})

const emit = defineEmits(['hide'])
const dialogRef = ref(null)

const show = () => {
  dialogRef.value.show()
}

const hide = () => {
  dialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.completed-tasks-details-body {
  height: 100%;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}
</style>
