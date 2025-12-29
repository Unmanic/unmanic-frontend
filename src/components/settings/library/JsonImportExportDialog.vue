<template>
  <UnmanicDialogPopup
    ref="dialogRef"
    :title="dialogHeader"
    :persistent="isDirty"
    :actions="dialogActions"
    @hide="onDialogHide"
    @copy="copyJson"
    @submit="submit"
  >
    <div class="q-pa-md">
      <q-card
        flat
        bordered
        class="q-pa-sm"
        style="width:100%"
      >
        <q-card-section class="q-pt-none">
          <pre v-if="mode === 'export'" style="white-space: pre-wrap; word-wrap: break-word;">{{ jsonData }}</pre>
          <q-input
            v-else
            v-model="importString"
            rows="30"
            type="textarea"
            filled
            class="monospace-input"
          />
        </q-card-section>
      </q-card>
    </div>
  </UnmanicDialogPopup>
</template>

<script setup>
import { ref, computed } from 'vue'
import { copyToClipboard, useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import UnmanicDialogPopup from 'components/ui/dialogs/UnmanicDialogPopup.vue'

const props = defineProps({
  dialogHeader: {
    type: String,
    required: true,
    default: ' --- header --- '
  },
  jsonData: {
    type: String,
    required: true,
    default: ' --- jsonData --- '
  },
  mode: {
    type: String,
    required: true,
    default: 'export'
  }
})

const emit = defineEmits(['ok', 'hide'])

const $q = useQuasar()
const { t } = useI18n()

const dialogRef = ref(null)
const importString = ref('')

const isDirty = computed(() => {
  if (props.mode !== 'import') {
    return false
  }
  if (!importString.value || importString.value.trim().length === 0) {
    console.log(importString.value)
    return false
  }
  return true
})

const dialogActions = computed(() => {
  if (props.mode === 'export') {
    return [
      {
        label: t('navigation.copy'),
        icon: 'content_copy',
        color: 'secondary',
        emit: 'copy'
      }
    ]
  } else {
    return [
      {
        label: t('navigation.submit'),
        icon: 'check',
        color: isDirty.value ? 'positive' : 'grey-6',
        emit: 'submit',
        disabled: !isDirty.value,
        tooltip: isDirty.value
          ? t('components.settings.library.importLibraryConfig')
          : t('components.settings.common.noChangesToSave')
      }
    ]
  }
})

const show = () => {
  dialogRef.value.show()
}

const hide = () => {
  dialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
}

const copyJson = () => {
  copyToClipboard(props.jsonData)
    .then(() => {
      $q.notify({
        color: 'secondary',
        position: 'top',
        message: t('notifications.copied'),
        timeout: 200
      })
    })
    .catch(() => {
      // fail
    })
}

const submit = () => {
  try {
    JSON.parse(importString.value)
    emit('ok', { importString: importString.value })
    hide()
  } catch (e) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.invalidJson'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  }
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.monospace-input :deep(textarea) {
  font-family: monospace;
}
</style>
