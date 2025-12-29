<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="dialogTitle"
    width="2000px"
    :persistent="isDirty"
    :actions="headerActions"
    :closeTooltip="closeTooltip"
    @save="savePluginSettings"
    @reset="resetPluginLibraryConfig"
    @hide="onDialogHide"
  >
    <div class="plugin-info-dialog">
      <div v-if="isDirty" class="unsaved-indicator">
        {{ t('components.settings.common.unsavedChanges') }}
      </div>
      <div class="plugin-info-tabs bg-card-head q-px-md">
        <q-tabs
          v-if="showSettingsTab"
          v-model="tab"
          align="left"
          class="text-primary"
        >
          <q-tab :label="t('navigation.info')" name="info"/>
          <q-tab :label="t('navigation.settings')" name="settings"/>
        </q-tabs>
        <q-separator v-if="showSettingsTab"/>
      </div>

      <q-tab-panels v-model="tab" animated class="plugin-info-panels">
        <q-tab-panel name="info">
          <div class="row">
            <div v-if="!isMobile" class="col col-md-auto col-12 q-pa-xs">
              <q-skeleton v-if="!icon" width="350px" height="350px" class="shadow-1"/>
              <q-avatar
                v-else
                rounded
                size="350px"
                font-size="82px"
                text-color="white"
                class="shadow-1"
              >
                <q-img :src="icon" style="max-width: 300px;"/>
              </q-avatar>
            </div>
            <div class="col col-md-grow col-12 q-pa-xs">
              <q-skeleton v-if="!name" width="100%" max-height="350px" class="shadow-1"/>
              <q-card
                v-else
                :style="(isMobile && changelog.length === 0) ? 'height: 128px;' : ''"
              >
                <q-card-section style="max-height: 128px;">
                  <q-list>
                    <q-item dense>
                      <q-item-section>
                        <b>Name:</b>
                      </q-item-section>
                      <q-item-section side>
                        {{ name }}
                      </q-item-section>
                    </q-item>

                    <q-item dense>
                      <q-item-section>
                        <b>Author:</b>
                      </q-item-section>
                      <q-item-section side>
                        {{ author }}
                      </q-item-section>
                    </q-item>

                    <q-item dense>
                      <q-item-section>
                        <b>Version:</b>
                      </q-item-section>
                      <q-item-section side>
                        {{ version }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>

                <q-separator/>

                <q-card-section
                  v-if="(isMobile && changelog.length > 0) || (!isMobile)"
                  style="max-height: 222px;"
                >
                  <q-list>
                    <q-item>
                      <q-item-section>
                        <b>Changelog:</b>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <q-scroll-area style="height: 150px; max-width: 100%;">
                    <span class="plugin-changelog" v-html="changelog"></span>
                  </q-scroll-area>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="row">
            <div class="col col-12 q-pa-xs">
              <div class="plugin-info-description">
                <q-card style="width:100%">
                  <q-skeleton v-if="!description" width="100%" height="550px" class="shadow-1"/>
                  <q-card-section v-else class="q-pa-md">
                    <div class="row q-mt-md">
                      <span class="plugin-description" v-html="description"></span>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="settings">
          <div class="row">
            <div class="col col-12 q-pa-xs">
              <div>
                <q-card
                  flat
                  bordered
                  class="q-pa-sm"
                  style="width:100%"
                >
                  <q-card-section class="q-pt-none">
                    <q-list v-if="settings.length > 0">
                      <q-item
                        v-for="item in settings"
                        :class="item.sub_setting ? item.display + ' sub-setting' : item.display"
                        :key="item.key_id"
                        class="q-py-sm"
                        v-bind="item"
                      >
                        <q-item-section v-if="item.input_type === 'text'">
                          <q-input
                            filled
                            v-model="item.value"
                            :bottom-slots="item.description.length > 0"
                            :disable="item.display === 'disabled'"
                            :label="item.label"
                            :placeholder="item.label"
                          >
                            <template v-slot:hint v-if="item.description.length > 0">
                              {{ item.description }}
                            </template>
                          </q-input>
                          <q-tooltip v-if="item.tooltip" anchor="bottom start" self="top start">
                            {{ item.tooltip }}
                          </q-tooltip>
                        </q-item-section>

                        <q-item-section v-if="item.input_type === 'textarea'">
                          <q-input
                            filled
                            v-model="item.value"
                            type="textarea"
                            :bottom-slots="item.description.length > 0"
                            :disable="item.display === 'disabled'"
                            :label="item.label"
                          >
                            <template v-slot:hint v-if="item.description.length > 0">
                              {{ item.description }}
                            </template>
                          </q-input>
                          <q-tooltip v-if="item.tooltip" anchor="bottom start" self="top start">
                            {{ item.tooltip }}
                          </q-tooltip>
                        </q-item-section>

                        <q-item-section v-if="item.input_type === 'checkbox'">
                          <div
                            @click="item.value = !item.value"
                            :style="$q.dark.isActive ? 'background:rgba(255,255,255,.07)' : 'background:rgba(0, 0, 0, 0.05);'"
                            class="q-pa-sm rounded-borders"
                          >
                            <q-checkbox
                              v-model="item.value"
                              :disable="item.display === 'disabled'"
                              :label="item.label"
                            />
                          </div>
                          <div v-if="item.description.length > 0" class="checkbox-hint">
                            {{ item.description }}
                          </div>
                          <q-tooltip v-if="item.tooltip" anchor="bottom start" self="top start">
                            {{ item.tooltip }}
                          </q-tooltip>
                        </q-item-section>

                        <q-item-section v-if="item.input_type === 'select'">
                          <q-select
                            filled
                            v-model="item.value"
                            emit-value
                            map-options
                            :bottom-slots="item.description.length > 0"
                            :options="item.select_options"
                            :option-value="opt => Object(opt) === opt && 'value' in opt ? opt.value : null"
                            :option-label="opt => Object(opt) === opt && 'label' in opt ? opt.label : '- Null -'"
                            :disable="item.display === 'disabled'"
                            :label="item.label"
                          >
                            <template v-slot:hint v-if="item.description.length > 0">
                              {{ item.description }}
                            </template>
                          </q-select>
                          <q-tooltip v-if="item.tooltip" anchor="bottom start" self="top start">
                            {{ item.tooltip }}
                          </q-tooltip>
                        </q-item-section>

                        <q-item-section v-if="item.input_type === 'slider'">
                          <q-item class="q-pa-none q-ma-none">
                            <q-item-section :class="item.display" avatar>
                              <q-icon color="primary" name="chevron_right"/>
                            </q-item-section>
                            <q-item-section class="q-pt-lg q-pb-none" :class="item.display">
                              <q-slider
                                v-model="item.value"
                                :min="Number(item.slider_options.min)"
                                :max="Number(item.slider_options.max)"
                                :step="Number(item.slider_options.step)"
                                :disable="item.display === 'disabled'"
                                label
                                :label-value="item.label + ': ' + item.value + item.slider_options.suffix"
                                :hint="item.description"
                                label-always
                                color="primary"
                              />
                            </q-item-section>
                            <q-item-section :class="item.display" avatar>
                              <q-icon color="primary" name="chevron_left"/>
                            </q-item-section>
                          </q-item>
                          <div v-if="item.description.length > 0" class="checkbox-hint">
                            {{ item.description }}
                          </div>
                        </q-item-section>

                        <q-item-section v-if="item.input_type === 'browse_directory'">
                          <q-input
                            readonly
                            filled
                            color="primary"
                            v-model="item.value"
                            :disable="item.display === 'disabled'"
                            :label="item.label"
                            :placeholder="item.label"
                            :hint="item.description"
                            @click="updateWithDirectoryBrowser(item)"
                          >
                            <template v-slot:append>
                              <q-icon
                                @click="updateWithDirectoryBrowser(item)"
                                class="cursor-pointer"
                                name="folder_open"
                              />
                            </template>
                          </q-input>
                          <q-tooltip v-if="item.tooltip" anchor="bottom start" self="top start">
                            {{ item.tooltip }}
                          </q-tooltip>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </UnmanicDialogWindow>

  <SelectDirectoryDialog
    ref="selectDirectoryDialogRef"
    :initialPath="selectDirectoryInitialPath"
    :listType="selectDirectoryListType"
    @selected="onDirectorySelected"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import { markdownToHTML } from 'src/js/markupParser'
import { useMobile } from 'src/composables/useMobile'
import UnmanicDialogWindow from 'components/ui/dialogs/UnmanicDialogWindow.vue'
import SelectDirectoryDialog from 'components/ui/pickers/SelectDirectoryDialog.vue'

const props = defineProps({
  pluginId: {
    type: String,
    default: ''
  },
  startTab: {
    type: String,
    default: 'info'
  },
  viewingRemoteInfo: {
    type: Boolean,
    required: false,
  },
  libraryId: {
    type: Number,
    required: false,
  }
})

const emit = defineEmits(['hide'])

const { t } = useI18n()
const { isMobile } = useMobile()
const $q = useQuasar()

const dialogRef = ref(null)
const isOpen = ref(false)

const tab = ref('info')
const id = ref(null)
const icon = ref(null)
const name = ref(null)
const description = ref(null)
const tags = ref(null)
const author = ref(null)
const version = ref(null)
const changelog = ref('')
const status = ref(null)
const settings = ref([])
const originalSettings = ref([])

const directoryInputTarget = ref(null)
const selectDirectoryInitialPath = ref('')
const selectDirectoryListType = ref('directories')

const showSettingsTab = computed(() => settings.value.length > 0)

const settingsHaveBeenModified = () => {
  if (!originalSettings.value.length || !settings.value.length) {
    return false
  }
  const newSettings = {}
  settings.value.forEach((setting) => {
    newSettings[setting.key_id] = setting.value
  })
  for (let i = 0; i < originalSettings.value.length; i++) {
    if (newSettings[originalSettings.value[i].key_id] !== originalSettings.value[i].value) {
      return true
    }
  }
  return false
}

const hasChanges = computed(() => settingsHaveBeenModified())
const isDirty = computed(() => showSettingsTab.value && hasChanges.value)
const closeTooltip = computed(() => isDirty.value
  ? t('components.settings.common.closeWithoutSaving')
  : ''
)

const dialogTitle = computed(() => {
  if (tab.value === 'info') {
    return t('headers.pluginInfo')
  }
  if (props.libraryId) {
    return t('headers.libraryPluginConfig')
  }
  return t('headers.globalPluginConfig')
})

const saveAction = computed(() => {
  const hasChangesValue = hasChanges.value
  return {
    label: t('navigation.save'),
    icon: 'save',
    color: hasChangesValue ? 'positive' : 'grey-6',
    tooltip: hasChangesValue
      ? t('components.plugins.savePluginConfig')
      : t('components.settings.common.noChangesToSave'),
    emit: 'save',
    disabled: !hasChangesValue
  }
})

const resetAction = computed(() => ({
  label: t('components.plugins.resetConfiguration'),
  icon: 'restart_alt',
  color: 'secondary',
  tooltip: t('components.plugins.resetConfiguration'),
  emit: 'reset'
}))

const headerActions = computed(() => {
  if (!showSettingsTab.value) {
    return []
  }
  const actions = [saveAction.value]
  if (props.libraryId) {
    actions.push(resetAction.value)
  }
  return actions
})

const fetchPluginData = () => {
  const postData = {
    plugin_id: props.pluginId,
    prefer_local: !props.viewingRemoteInfo,
  }
  if (props.libraryId) {
    postData.library_id = props.libraryId
  }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'plugins/info'),
    data: postData
  }).then((response) => {
    id.value = response.data.id
    icon.value = response.data.icon
    name.value = response.data.name
    tags.value = response.data.tags
    author.value = response.data.author
    version.value = response.data.version
    status.value = response.data.status
    changelog.value = markdownToHTML(response.data.changelog)
    description.value = markdownToHTML(response.data.description)

    if (!props.viewingRemoteInfo) {
      settings.value = response.data.settings || []
      originalSettings.value = JSON.parse(JSON.stringify(response.data.settings || []))
    } else {
      settings.value = []
      originalSettings.value = []
    }

    if (!settings.value.length) {
      tab.value = 'info'
    }
  })
}

const resetPluginLibraryConfig = () => {
  if (!props.libraryId) {
    return
  }
  const data = {
    plugin_id: props.pluginId,
    library_id: props.libraryId
  }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'plugins/settings/reset'),
    data: data
  }).then(() => {
    fetchPluginData()
    $q.notify({
      color: 'positive',
      position: 'top',
      message: t('notifications.SavedPluginSettings'),
      icon: 'check_circle',
      timeout: 200,
      actions: [{ icon: 'close', color: 'white' }]
    })
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.failedToSavePluginSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const savePluginSettings = () => {
  if (!settings.value.length) {
    return
  }
  const data = {
    plugin_id: props.pluginId,
    settings: settings.value
  }
  if (props.libraryId) {
    data.library_id = props.libraryId
  }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'plugins/settings/update'),
    data: data
  }).then(() => {
    fetchPluginData()
    $q.notify({
      color: 'positive',
      position: 'top',
      message: t('notifications.SavedPluginSettings'),
      icon: 'check_circle',
      timeout: 200,
      actions: [{ icon: 'close', color: 'white' }]
    })
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.failedToSavePluginSettings'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })
  })
}

const updateWithDirectoryBrowser = (input) => {
  directoryInputTarget.value = input
  selectDirectoryInitialPath.value = input.value
  selectDirectoryListType.value = 'directories'
  if (selectDirectoryDialogRef.value) {
    selectDirectoryDialogRef.value.show()
  }
}

const onDirectorySelected = (payload) => {
  if (directoryInputTarget.value && payload && payload.selectedPath) {
    directoryInputTarget.value.value = payload.selectedPath
  }
}

const show = () => {
  if (!dialogRef.value) {
    return
  }
  isOpen.value = true
  tab.value = props.startTab
  dialogRef.value.show()
  fetchPluginData()
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

watch(() => props.pluginId, (value) => {
  if (!value || !isOpen.value) {
    return
  }
  fetchPluginData()
})

watch(() => props.startTab, (value) => {
  if (!value || !isOpen.value) {
    return
  }
  tab.value = value
})

const selectDirectoryDialogRef = ref(null)

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.plugin-info-tabs {
  position: sticky;
  top: 0;
  z-index: 2;
}

.plugin-info-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  position: relative;
}

.plugin-info-panels {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

:deep(.q-card-section.col.scroll) {
  overflow: hidden;
}

.unsaved-indicator {
  position: absolute;
  top: 6px;
  right: 12px;
  z-index: 3;
  font-size: 0.75rem;
  color: var(--q-warning);
}


:deep(span.plugin-changelog *) {
  margin-top: 0;
  margin-bottom: 0;
}

:deep(span.plugin-description) {
  width: 100%;
}

:deep(span.plugin-description p) {
  margin-bottom: 5px;
}

:deep(span.plugin-description h1),
:deep(span.plugin-description h2),
:deep(span.plugin-description h3),
:deep(span.plugin-description h4),
:deep(span.plugin-description h5),
:deep(span.plugin-description h6) {
  margin-top: 10px;
  margin-bottom: 0;
}

:deep(span.plugin-description h1) {
  font-size: 2.25rem;
  font-weight: 400;
  line-height: 2.6rem;
  letter-spacing: 0.00735em;
}

:deep(span.plugin-description h2) {
  font-size: 1.95rem;
  font-weight: 400;
  line-height: 2.3rem;
  letter-spacing: 0.00735em;
}

:deep(span.plugin-description h3) {
  font-size: 1.65rem;
  font-weight: 400;
  line-height: 2.1rem;
  letter-spacing: 0.00735em;
}

:deep(span.plugin-description h4) {
  font-size: 1.35rem;
  font-weight: 400;
  line-height: 1.8rem;
  letter-spacing: 0.00735em;
}

:deep(span.plugin-description ul) {
  margin-top: 10px;
  margin-bottom: 10px;
}

:deep(span.plugin-description pre) {
  border: inset thin;
  padding: 10px;
}

:deep(.body--light span.plugin-description pre) {
  background: #EEE;
}

:deep(.body--dark span.plugin-description pre) {
  background: #222;
}

:deep(span.plugin-description hr) {
  margin-top: 10px;
  margin-bottom: 10px;
}

.checkbox-hint {
  line-height: 1;
  font-size: 12px;
  min-height: 20px;
  color: rgba(0, 0, 0, 0.54);
  padding: 8px 12px 0;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

:deep(.q-list--dark) .checkbox-hint {
  color: rgba(255, 255, 255, 0.7);
}

.sub-setting {
  margin-left: 30px;
  padding-top: 8px;
  padding-left: 8px;
  border-left: solid thin var(--q-primary);
}
</style>
