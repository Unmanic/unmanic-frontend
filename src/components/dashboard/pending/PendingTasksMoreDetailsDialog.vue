<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="$t('headers.pendingTasks')"
    @hide="onDialogHide"
  >
    <div class="pending-tasks-details-body column full-height">
      <q-card-section class="col full-height q-pa-none">
        <PendingTasksTable/>
      </q-card-section>
    </div>
  </UnmanicDialogWindow>
</template>

<script setup>
import { ref } from 'vue'
import UnmanicDialogWindow from 'components/ui/dialogs/UnmanicDialogWindow.vue'
import PendingTasksTable from 'components/dashboard/pending/partials/PendingTasksTable.vue'

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
.pending-tasks-details-body {
  height: 100%;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}
</style>
