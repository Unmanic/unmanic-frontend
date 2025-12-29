<template>
  <UnmanicDialogMenu
    ref="dialogRef"
    :title="$t('headers.configureLibrary')"
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
              <div class="col-auto q-gutter-xs">
                <q-btn
                  round
                  outline
                  color="secondary"
                  icon="download"
                  @click="exportPluginConfig">
                  <q-tooltip class="bg-white text-primary">{{
                      $t('components.settings.library.exportLibraryConfig')
                    }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  round
                  outline
                  color="secondary"
                  icon="publish"
                  @click="importPluginConfig">
                  <q-tooltip class="bg-white text-primary">{{
                      $t('components.settings.library.importLibraryConfig')
                    }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  round
                  outline
                  color="secondary"
                  icon="content_copy"
                  @click="cloneLibrary">
                  <q-tooltip class="bg-white text-primary">{{
                      $t('components.settings.library.cloneLibrary')
                    }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  v-if="locked"
                  round
                  outline
                  color="negative"
                  icon="lock"
                  @click="locked = false">
                  <q-tooltip class="bg-white text-primary">{{
                      $t('components.settings.library.locked')
                    }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  v-else
                  round
                  outline
                  color="secondary"
                  icon="lock_open"
                  @click="locked = true">
                  <q-tooltip class="bg-white text-primary">{{
                      $t('components.settings.library.unlocked')
                    }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>

            <div class="q-pb-sm">
              <q-skeleton
                v-if="name === null"
                type="QInput"/>
              <q-input
                v-if="name !== null"
                outlined
                color="primary"
                v-model="name"
                :label="$t('components.settings.library.name')"
                :placeholder="name">
              </q-input>
            </div>

            <div
              v-if="enableReceiveRemoteFilesOnly !== true"
              class="q-pb-sm">
              <q-skeleton
                v-if="path === null"
                type="QInput"/>
              <q-input
                v-else
                readonly
                outlined
                color="primary"
                v-model="path"
                label-slot
                :placeholder="path"
                :disable="enableReceiveRemoteFilesOnly === true"
                @click="updateLibraryWithDirectoryBrowser">
                <template v-slot:label>
                  <div class="row items-center all-pointer-events">
                    {{ $t('components.settings.library.path') }}
                  </div>
                </template>
                <template v-slot:append>
                  <q-icon
                    @click="updateLibraryWithDirectoryBrowser"
                    class="cursor-pointer"
                    name="folder_open"/>
                </template>
              </q-input>
              <q-tooltip
                v-if="enableReceiveRemoteFilesOnly === true"
                class="bg-white text-primary"
                anchor="bottom left"
                self="bottom left">
                {{ $t('components.settings.library.pathDisabledReceiveRemoteFilesOnly') }}
              </q-tooltip>
            </div>

            <div class="q-pb-sm">
              <q-skeleton
                v-if="enableReceiveRemoteFilesOnly === null"
                type="QToggle"/>
              <q-item
                v-else
                tag="label"
                class="border-hover"
                style="padding-left:12px">
                <q-item-section>
                  <q-item-label>{{ $t('components.settings.library.enableReceiveRemoteFilesOnly') }}</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-toggle v-model="enableReceiveRemoteFilesOnly"/>
                </q-item-section>
              </q-item>
            </div>
            <div
              v-if="enableReceiveRemoteFilesOnly !== true"
              class="q-pb-sm">
              <q-skeleton
                v-if="enableScanner === null"
                type="QToggle"/>
              <q-item
                v-else
                tag="label"
                class="border-hover"
                style="padding-left:12px"
                :disable="enableReceiveRemoteFilesOnly === true">
                <q-item-section>
                  <q-item-label>{{ $t('components.settings.library.enableScanner') }}</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-toggle v-model="enableScanner" :disable="enableReceiveRemoteFilesOnly === true"/>
                </q-item-section>
              </q-item>
              <q-tooltip
                v-if="enableReceiveRemoteFilesOnly === true"
                class="bg-white text-primary"
                anchor="bottom left"
                self="bottom left">
                {{ $t('components.settings.library.pathDisabledReceiveRemoteFilesOnly') }}
              </q-tooltip>
            </div>
            <div
              v-if="enableReceiveRemoteFilesOnly !== true"
              class="q-pb-sm">
              <q-skeleton
                v-if="enableInotify === null"
                type="QToggle"/>
              <q-item
                v-else
                tag="label"
                class="border-hover"
                style="padding-left:12px"
                :disable="enableReceiveRemoteFilesOnly === true">
                <q-item-section>
                  <q-item-label>{{ $t('components.settings.library.enableInotify') }}</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-toggle v-model="enableInotify" :disable="enableReceiveRemoteFilesOnly === true"/>
                </q-item-section>
              </q-item>
              <q-tooltip
                v-if="enableReceiveRemoteFilesOnly === true"
                class="bg-white text-primary"
                anchor="bottom left"
                self="bottom left">
                {{ $t('components.settings.library.pathDisabledReceiveRemoteFilesOnly') }}
              </q-tooltip>
            </div>

            <div class="q-pb-sm">
              <q-skeleton
                v-if="priorityScore === null"
                type="QInput"/>
              <q-input
                v-if="priorityScore !== null"
                outlined
                color="primary"
                v-model.number="priorityScore"
                :label="$t('components.settings.library.priorityScore')"
                type="number"
              />
            </div>

            <div class="q-pb-sm">
              <q-skeleton
                v-if="tags === null"
                type="QInput"/>
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
              />
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-section :class="isMobile ? 'q-px-none' : ''">
            <div class="row items-center no-wrap q-mb-md">
              <div class="col">
                <div class="text-h6">
                  {{ $t('components.settings.library.plugins') }}
                </div>
              </div>
            </div>

            <div class="q-gutter-sm">
              <q-skeleton
                v-if="enabledPlugins === null"
                type="text"/>

              <q-list
                bordered
                separator
                class="rounded-borders">
                <div
                  v-for="(plugin, index) in enabledPlugins"
                  v-bind:key="index">
                  <q-item>
                    <q-item-section avatar>
                      <q-img :src="plugin.icon"/>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ plugin.name }}</q-item-label>
                      <q-item-label caption lines="2">{{ plugin.description }}</q-item-label>
                    </q-item-section>

                    <q-separator inset vertical class="q-mx-sm"/>

                    <q-item-section center side>
                      <div class="text-grey-8 q-gutter-xs">
                        <ListActionButton
                          icon="tune"
                          color="grey-8"
                          :disable="!plugin.has_config"
                          :tooltip="$t('tooltips.configureForThisLibrary')"
                          @click="openPluginInfo(plugin.plugin_id, 'settings')"
                        />
                        <ListActionButton
                          icon="remove_circle_outline"
                          color="negative"
                          :tooltip="$t('tooltips.removeFromThisLibrary')"
                          @click="removePluginFromList(index)"
                        />
                      </div>
                    </q-item-section>
                  </q-item>
                </div>
              </q-list>

              <q-bar class="bg-transparent q-mb-sm">
                <q-space/>
                <ListAddButton
                  :tooltip="$t('components.settings.library.addPluginToThisLibrary')"
                  @click="selectPluginFromList"
                />
              </q-bar>
            </div>

            <div class="text-h6">
              {{ $t('components.settings.library.pluginFlow') }}
            </div>

            <LibraryConfigurePluginFlowList :libraryId="libraryId" :key="componentKey"/>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <SelectDirectoryDialog
      ref="selectDirectoryDialogRef"
      :initialPath="selectDirectoryInitialPath"
      :listType="selectDirectoryListType"
      @selected="onDirectorySelected"
    />

    <PluginSelectorDialog
      ref="pluginSelectorDialogRef"
      :title="$t('headers.selectPlugin')"
      :hidePlugins="pluginSelectorHidePlugins"
      @selected="onPluginSelected"
    />
  </UnmanicDialogMenu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { useQuasar, Loading } from 'quasar'
import { useI18n } from 'vue-i18n'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import { useMobile } from 'src/composables/useMobile'
import UnmanicDialogMenu from 'components/ui/dialogs/UnmanicDialogMenu.vue'
import SelectDirectoryDialog from 'components/ui/pickers/SelectDirectoryDialog.vue'
import PluginSelectorDialog from 'components/settings/plugins/PluginSelectorDialog.vue'
import LibraryConfigurePluginFlowList from 'components/settings/library/partials/LibraryConfigurePluginFlowList'
import JsonImportExportDialog from 'components/JsonImportExportDialog'
import PluginInfoDialog from 'components/settings/plugins/PluginInfoDialog'
import ListActionButton from "components/ui/buttons/ListActionButton.vue"
import ListAddButton from "components/ui/buttons/ListAddButton.vue"

const props = defineProps({
  libraryId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['ok', 'hide', 'saved'])

const $q = useQuasar()
const { t } = useI18n()
const { isMobile } = useMobile()

const dialogRef = ref(null)

const currentID = ref(null)
const locked = ref(false)
const name = ref(null)
const path = ref(null)
const enableReceiveRemoteFilesOnly = ref(null)
const enableScanner = ref(null)
const enableInotify = ref(null)
const priorityScore = ref(null)
const tags = ref(null)
const enabledPlugins = ref(null)
const componentKey = ref(1)
const showLoading = ref(false)
const originalSnapshot = ref(null)
const selectDirectoryDialogRef = ref(null)
const selectDirectoryInitialPath = ref('')
const selectDirectoryListType = ref('directories')
const pluginSelectorDialogRef = ref(null)
const pluginSelectorHidePlugins = ref([])

const saveAction = computed(() => {
  const hasChanges = isDirty.value
  return {
    label: t('navigation.save'),
    icon: 'save',
    color: hasChanges ? 'positive' : 'grey-6',
    tooltip: hasChanges
      ? t('components.settings.library.saveLibraryConfig')
      : t('components.settings.common.noChangesToSave'),
    emit: 'save',
    disabled: !hasChanges
  }
})

const saveActions = computed(() => [saveAction.value])

const currentSnapshot = computed(() => {
  if (
    name.value === null ||
    path.value === null ||
    enableReceiveRemoteFilesOnly.value === null ||
    enableScanner.value === null ||
    enableInotify.value === null ||
    priorityScore.value === null ||
    tags.value === null ||
    enabledPlugins.value === null
  ) {
    return null
  }
  const pluginSnapshot = enabledPlugins.value.map((plugin) => ({
    plugin_id: plugin.plugin_id,
    name: plugin.name,
    has_config: plugin.has_config
  }))
  return JSON.stringify({
    locked: locked.value,
    name: name.value,
    path: path.value,
    enableReceiveRemoteFilesOnly: enableReceiveRemoteFilesOnly.value,
    enableScanner: enableScanner.value,
    enableInotify: enableInotify.value,
    priorityScore: priorityScore.value,
    tags: [...tags.value],
    enabledPlugins: pluginSnapshot
  })
})

const isDirty = computed(() => {
  if (!originalSnapshot.value || !currentSnapshot.value) {
    return false
  }
  return originalSnapshot.value !== currentSnapshot.value
})

const updateSnapshot = () => {
  if (currentSnapshot.value) {
    originalSnapshot.value = currentSnapshot.value
  }
}

const fetchLibraryConfig = (libraryId) => {
  const data = { id: libraryId }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'settings/library/read'),
    data: data
  }).then((response) => {
    const libraryConfig = response.data.library_config
    currentID.value = libraryConfig.id
    locked.value = libraryConfig.locked
    name.value = libraryConfig.name
    path.value = libraryConfig.path
    enableReceiveRemoteFilesOnly.value = libraryConfig.enable_remote_only
    enableScanner.value = libraryConfig.enable_scanner
    enableInotify.value = libraryConfig.enable_inotify
    priorityScore.value = libraryConfig.priority_score
    tags.value = libraryConfig.tags
    enabledPlugins.value = response.data.plugins.enabled_plugins
    updateSnapshot()
  })
}

const saveLibraryConfig = async ({ hideOnSuccess = false } = {}) => {
  const data = {
    library_config: {
      id: currentID.value,
      locked: locked.value,
      name: name.value,
      path: path.value,
      enable_remote_only: enableReceiveRemoteFilesOnly.value,
      enable_scanner: enableScanner.value,
      enable_inotify: enableInotify.value,
      priority_score: priorityScore.value,
      tags: tags.value,
    },
    plugins: {
      enabled_plugins: enabledPlugins.value,
    }
  }
  try {
    await axios({
      method: 'post',
      url: getUnmanicApiUrl('v2', 'settings/library/write'),
      data: data
    })
    $q.notify({
      color: 'positive',
      position: 'top',
      icon: 'cloud_done',
      message: t('notifications.saved'),
      timeout: 200
    })
    componentKey.value += 1
    updateSnapshot()
    if (hideOnSuccess) {
      emit('saved')
      hide()
    }
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

const save = async () => saveLibraryConfig({ hideOnSuccess: true })

const updateLibraryWithDirectoryBrowser = () => {
  selectDirectoryInitialPath.value = path.value
  selectDirectoryListType.value = 'directories'
  if (selectDirectoryDialogRef.value) {
    selectDirectoryDialogRef.value.show()
  }
}

const onDirectorySelected = (payload) => {
  if (payload && payload.selectedPath) {
    path.value = payload.selectedPath
  }
}

const selectPluginFromList = () => {
  pluginSelectorHidePlugins.value = enabledPlugins.value.map(p => p.plugin_id)
  if (pluginSelectorDialogRef.value) {
    pluginSelectorDialogRef.value.show()
  }
}

const onPluginSelected = (plugin) => {
  if (!plugin) {
    return
  }
  const list = [...enabledPlugins.value]
  list.push(plugin)
  list.sort((a, b) => a.name.localeCompare(b.name))
  enabledPlugins.value = list
  saveLibraryConfig()
}

const removePluginFromList = (index) => {
  const list = [...enabledPlugins.value]
  list.splice(index, 1)
  enabledPlugins.value = list
  saveLibraryConfig()
}

const openPluginInfo = (pluginId, tab) => {
  if (!pluginId) {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('components.plugins.failedToOpenPluginInfo'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
    return
  }
  $q.dialog({
    component: PluginInfoDialog,
    componentProps: {
      pluginId: pluginId,
      startTab: (tab === 'settings') ? 'settings' : 'info',
      libraryId: currentID.value,
    },
  })
}

const exportPluginConfig = () => {
  const data = { id: currentID.value }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'settings/library/export'),
    data: data
  }).then((response) => {
    $q.dialog({
      component: JsonImportExportDialog,
      componentProps: {
        dialogHeader: t('components.settings.library.exportLibraryConfig'),
        jsonData: JSON.stringify(response.data, null, 2),
        mode: 'export',
      }
    })
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.failedToSaveSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const importData = (importString, silent) => {
  const data = JSON.parse(importString)
  data.library_id = currentID.value
  if (silent) {
    showLoading.value = false
  } else {
    showLoading.value = true
    Loading.show({
      message: t('components.settings.library.importPluginConfigMessage'),
      messageColor: 'transparent',
    })
  }
  setTimeout(() => {
    if (showLoading.value) {
      Loading.show({
        message: t('components.settings.library.importPluginConfigMessage'),
        messageColor: 'white',
      })
    }
  }, 1000)

  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'settings/library/import'),
    data: data
  }).then(() => {
    $q.notify({
      color: 'positive',
      position: 'top',
      icon: 'cloud_done',
      message: t('notifications.saved'),
      timeout: 200
    })
    showLoading.value = false
    Loading.hide()
    componentKey.value += 1
    fetchLibraryConfig(currentID.value)
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.failedToSaveSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
    showLoading.value = false
    Loading.hide()
  })
}

const importPluginConfig = () => {
  $q.dialog({
    component: JsonImportExportDialog,
    componentProps: {
      dialogHeader: t('components.settings.library.importLibraryConfig'),
      jsonData: '',
      mode: 'import',
    }
  }).onOk((payload) => {
    if (payload.importString !== undefined && payload.importString !== null) {
      importData(payload.importString)
    }
  })
}

const cloneLibrary = () => {
  const data = { id: currentID.value }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'settings/library/export'),
    data: data
  }).then((response) => {
    const configData = response.data
    const randomString = (Math.random() + 1).toString(36).substring(7)
    const newName = name.value + ' (' + t('navigation.copy') + ' - ' + randomString + ')'
    configData.library_config = {
      name: newName,
      path: path.value,
      enable_remote_only: enableReceiveRemoteFilesOnly.value,
      enable_scanner: enableScanner.value,
      enable_inotify: enableInotify.value,
      priority_score: priorityScore.value,
      tags: tags.value,
    }
    const importString = JSON.stringify(configData, null, 2)
    currentID.value = 0
    importData(importString, true)
    currentID.value = props.libraryId
    hide()
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.failedToSaveSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const show = () => {
  dialogRef.value.show()
}

const hide = () => {
  dialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
}

const resetLibraryConfig = () => {
  currentID.value = null
  locked.value = false
  name.value = null
  path.value = null
  enableReceiveRemoteFilesOnly.value = null
  enableScanner.value = null
  enableInotify.value = null
  priorityScore.value = null
  tags.value = null
  enabledPlugins.value = null
  originalSnapshot.value = null
}

watch(() => props.libraryId, (value) => {
  if (!value || value <= 0) {
    return
  }
  resetLibraryConfig()
  fetchLibraryConfig(value)
}, { immediate: true })

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
