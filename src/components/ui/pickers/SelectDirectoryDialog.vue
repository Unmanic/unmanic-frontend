<template>
  <UnmanicDialogPopup
    ref="dialogRef"
    :title="dialogTitle"
    @hide="onDialogHide"
  >
    <div class="q-pa-md">
      <q-card flat>
        <q-card-section>
          <q-input
            disable
            readonly
            borderless
            v-model="currentPath">
            <template v-slot:before>
              <q-icon name="folder_open"/>
            </template>
          </q-input>
        </q-card-section>

        <q-separator/>

        <q-card-section class="q-pa-none">
          <q-list bordered padding>
            <q-item
              v-for="(directory, index) in directories"
              :key="index"
              clickable
              v-ripple
              @click="fetchDirectoryListing(directory.full_path)">
              <q-item-section avatar>
                <q-icon color="primary" name="folder_open"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ directory.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </UnmanicDialogPopup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import UnmanicDialogPopup from 'components/ui/dialogs/UnmanicDialogPopup.vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  initialPath: {
    type: String,
    default: ''
  },
  listType: {
    type: String,
    default: 'directories'
  }
})

const emit = defineEmits(['hide', 'selected'])

const { t } = useI18n()

const dialogRef = ref(null)
const isOpen = ref(false)
const currentPath = ref('')
const directories = ref([])
const files = ref([])

const dialogTitle = computed(() => props.title || t('headers.selectDirectory'))

const fetchDirectoryListing = (path) => {
  currentPath.value = path
  const data = {
    current_path: currentPath.value,
    list_type: props.listType,
  }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'filebrowser/list'),
    data: data
  }).then((response) => {
    directories.value = response.data.directories
    files.value = response.data.files
  })
}

const show = () => {
  if (!dialogRef.value) {
    return
  }
  isOpen.value = true
  dialogRef.value.show()
  fetchDirectoryListing(props.initialPath)
}

const hide = () => {
  if (dialogRef.value) {
    dialogRef.value.hide()
  }
}

const onDialogHide = () => {
  isOpen.value = false
  emit('selected', { selectedPath: currentPath.value })
  emit('hide')
}

watch(() => props.initialPath, (value) => {
  if (!value || !isOpen.value) {
    return
  }
  fetchDirectoryListing(value)
})

defineExpose({
  show,
  hide
})
</script>
