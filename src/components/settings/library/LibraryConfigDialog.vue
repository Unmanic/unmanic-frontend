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

            <div
              v-if="enableReceiveRemoteFilesOnly !== true"
              class="q-pb-sm">
              <q-skeleton
                v-if="enableWebScanner === null"
                type="QToggle"/>
              <q-item
                v-else
                tag="label"
                class="border-hover"
                style="padding-left:12px"
                :disable="enableReceiveRemoteFilesOnly === true">
                <q-item-section>
                  <q-item-label>{{ $t('components.settings.library.enableWebScanner') }}</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-toggle v-model="enableWebScanner" :disable="enableReceiveRemoteFilesOnly === true"/>
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

            <div v-if="enableWebScanner === true" class="q-pb-sm">
              <q-input
                outlined
                color="primary"
                v-model="webUrl"
                type="url"
                :label="$t('components.settings.library.webScannerUrl')"
                :hint="$t('components.settings.library.webScannerUrlHint')"
                autocomplete="url"
              />
            </div>
            <div v-if="enableWebScanner === true" class="q-pb-sm">
              <q-input
                outlined
                color="primary"
                v-model="webUsername"
                :label="$t('components.settings.library.webScannerUsername')"
                autocomplete="username"
              />
            </div>
            <div v-if="enableWebScanner === true" class="q-pb-sm">
              <q-input
                outlined
                color="primary"
                v-model="webPassword"
                type="password"
                :label="$t('components.settings.library.webScannerPassword')"
                :hint="webPasswordSet ? $t('components.settings.library.webScannerPasswordKeepHint') : undefined"
                autocomplete="current-password"
                @update:model-value="clearWebPassword = false"
              />
            </div>
            <div v-if="enableWebScanner === true && webPasswordSet" class="q-pb-sm">
              <q-checkbox
                v-model="clearWebPassword"
                :label="$t('components.settings.library.clearWebScannerPassword')"
              />
            </div>

            <div v-if="enableWebScanner === true" class="q-pt-md q-pb-sm">
              <div class="text-subtitle2 q-mb-sm">
                {{ $t('components.settings.library.webWriteConnection') }}
              </div>
              <q-input
                outlined
                color="primary"
                v-model="webWriteUrl"
                type="url"
                :label="$t('components.settings.library.webWriteUrl')"
                :hint="$t('components.settings.library.webWriteUrlHint')"
                autocomplete="url"
              />
            </div>
            <div v-if="enableWebScanner === true" class="q-pb-sm">
              <q-checkbox
                v-model="webWriteUseSeparateCredentials"
                :label="$t('components.settings.library.webWriteUseSeparateCredentials')"
              />
            </div>
            <div v-if="enableWebScanner === true && webWriteUseSeparateCredentials" class="q-pb-sm">
              <q-input
                outlined
                color="primary"
                v-model="webWriteUsername"
                :label="$t('components.settings.library.webWriteUsername')"
                autocomplete="username"
              />
            </div>
            <div v-if="enableWebScanner === true && webWriteUseSeparateCredentials" class="q-pb-sm">
              <q-input
                outlined
                color="primary"
                v-model="webWritePassword"
                type="password"
                :label="$t('components.settings.library.webWritePassword')"
                :hint="webWritePasswordSet ? $t('components.settings.library.webWritePasswordKeepHint') : undefined"
                autocomplete="current-password"
                @update:model-value="clearWebWritePassword = false"
              />
            </div>
            <div v-if="enableWebScanner === true && webWriteUseSeparateCredentials && webWritePasswordSet" class="q-pb-sm">
              <q-checkbox
                v-model="clearWebWritePassword"
                :label="$t('components.settings.library.clearWebWritePassword')"
              />
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
                        <UnmanicListActionButton
                          icon="tune"
                          color="grey-8"
                          :disable="!plugin.has_config"
                          :tooltip="$t('tooltips.configureForThisLibrary')"
                          @click="openPluginInfo(plugin.plugin_id, 'settings')"
                        />
                        <UnmanicListActionButton
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
                <UnmanicListAddButton
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
import JsonImportExportDialog from 'components/settings/library/JsonImportExportDialog.vue'
import PluginInfoDialog from 'components/settings/plugins/PluginInfoDialog'
import UnmanicListActionButton from "components/ui/buttons/UnmanicListActionButton.vue"
import UnmanicListAddButton from "components/ui/buttons/UnmanicListAddButton.vue"

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
const enableWebScanner = ref(null)
const webUrl = ref('')
const webUsername = ref('')
const webPassword = ref('')
const webPasswordSet = ref(false)
const clearWebPassword = ref(false)
const webWriteUrl = ref('')
const webWriteUseSeparateCredentials = ref(false)
const webWriteUsername = ref('')
const webWritePassword = ref('')
const webWritePasswordSet = ref(false)
const clearWebWritePassword = ref(false)
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
    enableWebScanner.value === null ||
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
    enableWebScanner: enableWebScanner.value,
    webUrl: webUrl.value,
    webUsername: webUsername.value,
    webPasswordSet: webPasswordSet.value,
    webPasswordChanged: Boolean(webPassword.value),
    clearWebPassword: clearWebPassword.value,
    webWriteUrl: webWriteUrl.value,
    webWriteUseSeparateCredentials: webWriteUseSeparateCredentials.value,
    webWriteUsername: webWriteUsername.value,
    webWritePasswordSet: webWritePasswordSet.value,
    webWritePasswordChanged: Boolean(webWritePassword.value),
    clearWebWritePassword: clearWebWritePassword.value,
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
    enableWebScanner.value = libraryConfig.enable_web_scanner
    webUrl.value = libraryConfig.web_url || ''
    webUsername.value = libraryConfig.web_username || ''
    webPassword.value = ''
    webPasswordSet.value = libraryConfig.web_password_set === true
    clearWebPassword.value = false
    webWriteUrl.value = libraryConfig.web_write_url || ''
    webWriteUseSeparateCredentials.value = libraryConfig.web_write_credentials_same_as_read === false
    webWriteUsername.value = libraryConfig.web_write_username || ''
    webWritePassword.value = ''
    webWritePasswordSet.value = libraryConfig.web_write_password_set === true
    clearWebWritePassword.value = false
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
      enable_web_scanner: enableWebScanner.value,
      web_url: webUrl.value,
      web_username: webUsername.value,
      web_write_url: webWriteUrl.value,
      web_write_username: webWriteUsername.value,
      web_write_credentials_same_as_read: !webWriteUseSeparateCredentials.value,
      priority_score: priorityScore.value,
      tags: tags.value,
    },
    plugins: {
      enabled_plugins: enabledPlugins.value,
    }
  }
  if (clearWebPassword.value) {
    data.library_config.clear_web_password = true
  } else if (webPassword.value) {
    data.library_config.web_password = webPassword.value
  }
  if (clearWebWritePassword.value) {
    data.library_config.clear_web_write_password = true
  } else if (webWritePassword.value) {
    data.library_config.web_write_password = webWritePassword.value
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
    if (clearWebPassword.value) {
      webPasswordSet.value = false
    } else if (webPassword.value) {
      webPasswordSet.value = true
    }
    webPassword.value = ''
    clearWebPassword.value = false
    if (clearWebWritePassword.value) {
      webWritePasswordSet.value = false
    } else if (webWritePassword.value) {
      webWritePasswordSet.value = true
    }
    webWritePassword.value = ''
    clearWebWritePassword.value = false
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
  let data
  try {
    data = JSON.parse(importString)
  } catch (e) {
    console.error('Failed to parse import string', e)
    return
  }
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
      enable_web_scanner: enableWebScanner.value,
      web_url: webUrl.value,
      web_username: webUsername.value,
      web_write_url: webWriteUrl.value,
      web_write_username: webWriteUsername.value,
      web_write_credentials_same_as_read: !webWriteUseSeparateCredentials.value,
      priority_score: priorityScore.value,
      tags: tags.value,
    }
    if (webPassword.value) {
      configData.library_config.web_password = webPassword.value
    }
    if (webWritePassword.value) {
      configData.library_config.web_write_password = webWritePassword.value
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
  enableWebScanner.value = null
  webUrl.value = ''
  webUsername.value = ''
  webPassword.value = ''
  webPasswordSet.value = false
  clearWebPassword.value = false
  webWriteUrl.value = ''
  webWriteUseSeparateCredentials.value = false
  webWriteUsername.value = ''
  webWritePassword.value = ''
  webWritePasswordSet.value = false
  clearWebWritePassword.value = false
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
