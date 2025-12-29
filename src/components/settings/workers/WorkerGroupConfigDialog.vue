<template>
  <UnmanicDialogMenu
    ref="dialogRef"
    :title="$t('headers.configureWorkerGroup')"
    :persistent="isDirty"
    :closeTooltip="$t('components.settings.common.closeWithoutSaving')"
    :actions="saveActions"
    @save="save"
    @hide="onDialogHide"
  >
    <div class="q-pa-md">
      <div
        v-if="isDirty"
        :class="isMobile ? 'unsaved-indicator-mobile' : 'unsaved-indicator'">
        {{ $t('components.settings.common.unsavedChanges') }}
      </div>
      <div :class="isMobile ? 'q-px-none' : ''">
        <q-card flat>
          <q-card-section :class="isMobile ? 'q-px-none' : ''">
            <div class="row items-center no-wrap q-mb-md">
              <div class="col">
                <div class="text-h5">
                  {{ $t('components.settings.common.configuration') }}
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  v-if="locked"
                  outline
                  dense
                  round
                  color="secondary"
                  icon="lock"
                  @click="locked = false">
                  <q-tooltip class="bg-white text-primary">
                    {{ $t('components.settings.workers.locked') }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  v-else
                  outline
                  dense
                  round
                  color="secondary"
                  icon="lock_open"
                  @click="locked = true">
                  <q-tooltip class="bg-white text-primary">
                    {{ $t('components.settings.workers.unlocked') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>

            <div class="q-pb-sm">
              <q-skeleton v-if="name === null" type="QInput"/>
              <q-input
                v-if="name !== null"
                outlined
                color="primary"
                v-model="name"
                :label="$t('components.settings.workers.workerGroupName')"
                :placeholder="name"
              />
            </div>

            <div class="q-gutter-sm">
              <q-skeleton v-if="workerCount === null" type="QInput"/>
              <q-input
                v-if="workerCount !== null"
                readonly
                outlined
                color="primary"
                v-model="workerCount"
                :label="$t('components.settings.workers.workerCount')"
                :placeholder="workerCount"
              />
              <q-skeleton v-if="workerCount === null" type="QSlider"/>
              <q-slider
                v-if="workerCount !== null"
                v-model="workerCount"
                :min="0"
                :max="12"
                color="primary"
              />
            </div>

            <div class="q-pb-sm">
              <q-skeleton v-if="tags === null" type="QInput"/>
              <q-select
                filled
                use-input
                use-chips
                multiple
                hide-dropdown-icon
                input-debounce="0"
                new-value-mode="add-unique"
                v-model="tags"
                :label="$t('components.settings.common.tags')"
                @keyup.tab="addTag"
              />
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-section :class="isMobile ? 'q-px-none' : ''">
            <h5 class="q-mb-none">{{ $t('components.settings.workers.schedule') }}</h5>
            <div class="q-gutter-sm">
              <q-skeleton v-if="schedules === null" type="text"/>

              <q-list
                bordered
                separator
                class="rounded-borders">
                <draggable
                  class="schedule-list-group"
                  item-key="order"
                  :component-data="{ tag: 'ul', name: 'flip-list', type: 'transition' }"
                  v-model="schedules"
                  v-bind="dragOptions">
                  <template #item="{ element, index }">
                    <q-item
                      :key="index"
                      class="q-pa-none rounded-borders"
                      active-class="schedule-list-item">
                      <q-item-section avatar class="q-px-sm q-mx-sm">
                        <q-avatar rounded>
                          <q-icon name="drag_handle" style="max-width: 30px;">
                            <q-tooltip class="bg-white text-primary">
                              {{ $t('tooltips.move') }}
                            </q-tooltip>
                          </q-icon>
                        </q-avatar>
                      </q-item-section>

                      <q-separator inset vertical class="q-mr-sm"/>

                      <q-item-section class="q-px-sm q-mx-sm">
                        <q-item-label lines="1">
                          {{ element.repetitionLabel }} @ {{ element.scheduleTime }}
                        </q-item-label>
                        <q-item-label
                          v-if="element.scheduleTask === 'count'"
                          caption
                          lines="2">
                          <span class="text-weight-bold">{{ element.scheduleTaskLabel }}</span>
                          = {{ element.scheduleWorkerCount }}
                        </q-item-label>
                        <q-item-label
                          v-else
                          caption
                          lines="2">
                          <span class="text-weight-bold">{{ element.scheduleTaskLabel }}</span>
                        </q-item-label>
                      </q-item-section>

                      <q-separator inset vertical class="q-mx-sm"/>

                      <q-item-section center side>
                        <div class="text-grey-8 q-gutter-xs">
                          <q-btn
                            outline
                            dense
                            round
                            size="12px"
                            color="negative"
                            icon="delete"
                            @click="deleteSchedule(index)">
                            <q-tooltip class="bg-white text-primary">
                              {{ $t('tooltips.delete') }}
                            </q-tooltip>
                          </q-btn>
                        </div>
                      </q-item-section>
                    </q-item>
                  </template>
                </draggable>
              </q-list>

              <q-bar class="bg-transparent">
                <q-space/>
                <q-btn
                  outline
                  dense
                  round
                  color="secondary"
                  icon="add"
                  @click="addNewScheduledEvent">
                  <q-tooltip class="bg-white text-primary">{{ $t('tooltips.add') }}</q-tooltip>
                </q-btn>
              </q-bar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </UnmanicDialogMenu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import draggable from 'vuedraggable'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import { useMobile } from 'src/composables/useMobile'
import UnmanicDialogMenu from 'components/ui/dialogs/UnmanicDialogMenu.vue'
import WorkerEventCreateDialog from 'components/WorkerEventCreateDialog'

const props = defineProps({
  workerGroupId: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['hide', 'saved'])

const $q = useQuasar()
const { t } = useI18n()
const { isMobile } = useMobile()

const dialogRef = ref(null)
const isOpen = ref(false)
const originalSnapshot = ref(null)

const currentID = ref(null)
const locked = ref(false)
const name = ref(null)
const workerCount = ref(null)
const newTag = ref('')
const tags = ref(null)
const schedules = ref(null)

const saveAction = computed(() => {
  const hasChanges = isDirty.value
  return {
    label: t('navigation.save'),
    icon: 'save',
    color: hasChanges ? 'positive' : 'grey-6',
    tooltip: hasChanges
      ? t('components.settings.workers.saveWorkerConfig')
      : t('components.settings.common.noChangesToSave'),
    emit: 'save',
    disabled: !hasChanges
  }
})

const saveActions = computed(() => [saveAction.value])

const currentSnapshot = computed(() => {
  if (name.value === null || workerCount.value === null || tags.value === null || schedules.value === null) {
    return null
  }
  const scheduleSnapshot = schedules.value.map((schedule) => ({
    repetition: schedule.repetition,
    scheduleTime: schedule.scheduleTime,
    scheduleTask: schedule.scheduleTask,
    scheduleWorkerCount: schedule.scheduleWorkerCount,
  }))
  return JSON.stringify({
    locked: locked.value,
    name: name.value,
    workerCount: workerCount.value,
    tags: [...tags.value],
    schedules: scheduleSnapshot
  })
})

const isDirty = computed(() => {
  if (!originalSnapshot.value || !currentSnapshot.value) {
    return false
  }
  return originalSnapshot.value !== currentSnapshot.value
})

const dragOptions = computed(() => ({
  animation: 100,
  group: 'scheduleOrder',
  disabled: false,
  ghostClass: 'ghost',
  direction: 'vertical',
  delay: 200,
  delayOnTouchOnly: true,
}))

const resetState = () => {
  currentID.value = null
  locked.value = false
  name.value = null
  workerCount.value = null
  newTag.value = ''
  tags.value = null
  schedules.value = null
  originalSnapshot.value = null
}

const updateSnapshot = () => {
  if (currentSnapshot.value) {
    originalSnapshot.value = currentSnapshot.value
  }
}

const fetchWorkerGroupConfig = (workerGroupId) => {
  if (workerGroupId === 0) {
    currentID.value = 0
    locked.value = false
    name.value = ''
    workerCount.value = 1
    tags.value = []
    schedules.value = []
    updateSnapshot()
    return
  }
  const data = { id: workerGroupId }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'settings/worker_group/read'),
    data: data
  }).then((response) => {
    currentID.value = response.data.id
    locked.value = response.data.locked
    name.value = response.data.name
    workerCount.value = response.data.number_of_workers
    tags.value = response.data.tags
    const workerEventSchedules = response.data.worker_event_schedules.map((schedule) => ({
      repetition: schedule.repetition,
      repetitionLabel: t(`components.settings.workers.scheduleLabels.${schedule.repetition}`),
      scheduleTime: schedule.schedule_time,
      scheduleTask: schedule.schedule_task,
      scheduleTaskLabel: t(`components.settings.workers.scheduleLabels.${schedule.schedule_task}`),
      scheduleWorkerCount: schedule.schedule_worker_count,
    }))
    schedules.value = workerEventSchedules
    updateSnapshot()
  })
}

const saveWorkerGroupConfig = async () => {
  const workerEventSchedule = schedules.value.map((schedule) => ({
    repetition: schedule.repetition,
    schedule_time: schedule.scheduleTime,
    schedule_task: schedule.scheduleTask,
    schedule_worker_count: schedule.scheduleWorkerCount,
  }))
  const data = {
    id: currentID.value,
    locked: locked.value,
    name: name.value,
    number_of_workers: workerCount.value,
    worker_event_schedules: workerEventSchedule,
    tags: tags.value,
  }
  try {
    await axios({
      method: 'post',
      url: getUnmanicApiUrl('v2', 'settings/worker_group/write'),
      data: data
    })
    $q.notify({
      color: 'positive',
      position: 'top',
      icon: 'cloud_done',
      message: t('notifications.saved'),
      timeout: 200
    })
    return true
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.failedToSaveSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
    return false
  }
}

const save = async () => {
  const saved = await saveWorkerGroupConfig()
  if (saved) {
    updateSnapshot()
    emit('saved')
    hide()
  }
}

const addTag = () => {
  if (newTag.value) {
    tags.value = [...tags.value, newTag.value]
    newTag.value = null
  }
}

const addNewScheduledEvent = () => {
  $q.dialog({
    component: WorkerEventCreateDialog,
    componentProps: {},
  }).onOk((payload) => {
    if (payload.repetition === null || payload.scheduleTask === null) {
      return
    }
    schedules.value = [
      ...schedules.value,
      {
        repetition: payload.repetition,
        repetitionLabel: t(`components.settings.workers.scheduleLabels.${payload.repetition}`),
        scheduleTime: payload.scheduleTime,
        scheduleTask: payload.scheduleTask,
        scheduleTaskLabel: t(`components.settings.workers.scheduleLabels.${payload.scheduleTask}`),
        scheduleWorkerCount: payload.scheduleWorkerCount
      }
    ]
  })
}

const deleteSchedule = (index) => {
  schedules.value = schedules.value.filter((_, scheduleIndex) => scheduleIndex !== index)
}

const show = () => {
  if (!dialogRef.value) {
    return
  }
  isOpen.value = true
  resetState()
  fetchWorkerGroupConfig(props.workerGroupId)
  dialogRef.value.show()
}

const hide = () => {
  if (dialogRef.value) {
    dialogRef.value.hide()
  }
}

const onDialogHide = () => {
  isOpen.value = false
  emit('hide')
}

watch(() => props.workerGroupId, (value) => {
  if (value === null || value === undefined) {
    return
  }
  if (isOpen.value) {
    resetState()
    fetchWorkerGroupConfig(value)
  }
})

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.unsaved-indicator {
  position: absolute;
  top: 6px;
  right: 12px;
  z-index: 100;
  font-size: 0.75rem;
  color: var(--q-warning);
}

.unsaved-indicator-mobile {
  position: absolute;
  top: 6px;
  left: 12px;
  z-index: 100;
  font-size: 0.75rem;
  color: var(--q-warning);
}
</style>
