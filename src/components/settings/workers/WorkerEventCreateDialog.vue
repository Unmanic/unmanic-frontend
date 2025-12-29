<template>
  <UnmanicDialogPopup
    ref="workerEventCreateDialogRef"
    :title="t('components.settings.workers.newScheduledEvent')"
    :mini="true"
    :actions="dialogActions"
    @hide="onDialogHide"
    @add="addNewScheduledEvent"
  >
    <div class="q-pa-md">
      <q-select
        filled
        v-model="repetition"
        :options="repetitionOptions"
        :label="t('components.settings.workers.repetition')"
        class="q-mb-md"
      />

      <q-input
        filled
        v-model="scheduleTime"
        mask="time"
        class="q-mb-md"
      >
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-time v-model="scheduleTime">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('navigation.close')" color="primary" flat/>
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-select
        filled
        v-model="scheduleTask"
        :options="scheduleTaskOptions"
        :label="t('components.settings.workers.task')"
        class="q-mb-md"
      />

      <div v-if="scheduleTask && scheduleTask.value === 'count'" class="q-mx-md q-mb-md">
        <q-slider
          v-model="scheduleWorkerCount"
          :min="0"
          :max="12"
          label
          :label-value="'Worker count: ' + scheduleWorkerCount"
          label-always
          color="primary"
        />
      </div>
    </div>
  </UnmanicDialogPopup>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import UnmanicDialogPopup from 'components/ui/dialogs/UnmanicDialogPopup.vue'

const emit = defineEmits(['ok', 'hide'])

const $q = useQuasar()
const { t } = useI18n()

const workerEventCreateDialogRef = ref(null)

const repetition = ref('')
const repetitionOptions = [
  { label: t('components.settings.workers.scheduleLabels.daily'), value: 'daily' },
  { label: t('components.settings.workers.scheduleLabels.weekday'), value: 'weekday' },
  { label: t('components.settings.workers.scheduleLabels.weekend'), value: 'weekend' },
  { label: t('components.settings.workers.scheduleLabels.monday'), value: 'monday' },
  { label: t('components.settings.workers.scheduleLabels.tuesday'), value: 'tuesday' },
  { label: t('components.settings.workers.scheduleLabels.wednesday'), value: 'wednesday' },
  { label: t('components.settings.workers.scheduleLabels.thursday'), value: 'thursday' },
  { label: t('components.settings.workers.scheduleLabels.friday'), value: 'friday' },
  { label: t('components.settings.workers.scheduleLabels.saturday'), value: 'saturday' },
  { label: t('components.settings.workers.scheduleLabels.sunday'), value: 'sunday' }
]

const scheduleTime = ref('00:00')
const scheduleTask = ref('')
const scheduleTaskOptions = [
  { label: t('components.settings.workers.scheduleLabels.count'), value: 'count' },
  { label: t('components.settings.workers.scheduleLabels.pause'), value: 'pause' },
  { label: t('components.settings.workers.scheduleLabels.resume'), value: 'resume' }
]

const scheduleWorkerCount = ref(1)

const dialogActions = [
  {
    label: t('components.settings.workers.addEvent'),
    icon: 'add',
    color: 'positive',
    emit: 'add'
  }
]

const show = () => {
  workerEventCreateDialogRef.value.show()
}

const hide = () => {
  workerEventCreateDialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
}

const addNewScheduledEvent = () => {
  // validate
  if (typeof repetition.value.value === 'undefined' || typeof scheduleTask.value.value === 'undefined') {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.invalidWorkerEvent'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
    return
  }

  emit('ok', {
    repetition: repetition.value.value,
    scheduleTime: scheduleTime.value,
    scheduleTask: scheduleTask.value.value,
    scheduleWorkerCount: scheduleWorkerCount.value
  })
  hide()
}

defineExpose({
  show,
  hide
})
</script>