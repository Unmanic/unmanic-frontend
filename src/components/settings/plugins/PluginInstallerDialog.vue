<template>
  <UnmanicDialogWindow
    ref="dialogRef"
    :title="t('headers.pluginInstaller')"
    width="2000px"
    @hide="onDialogHide"
  >
    <div class="plugin-installer-dialog">
      <div class="plugin-table-actions-bar q-pa-sm">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-auto">
            <q-input
              outlined dense
              color="secondary"
              class="shadow-1"
              debounce="300"
              v-model="filter"
              :placeholder="t('navigation.search')"
            >
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto">
            <q-select
              outlined dense
              color="secondary"
              class="shadow-1"
              @update:model-value="loadInstallablePlugins"
              :label="t('components.plugins.categoryFilter')"
              v-model="tagFilter"
              :options="tags"
              :style="$q.screen.gt.sm ? 'min-width: 300px' : ''"
            >
              <template v-slot:append>
                <q-icon name="style"/>
              </template>
            </q-select>
          </div>

          <q-space v-if="$q.screen.gt.sm"/>

          <div class="col-12 col-md-auto text-right">
            <PluginInstallerManageRepos v-on:repoReloaded="reloadPluginsPostRepoReloaded"/>
          </div>
        </div>
      </div>

      <div :class="[isMobile ? 'q-px-none' : 'q-px-sm', 'plugin-table-wrapper']">
        <q-table
          grid
          card-class="bg-primary text-white"
          :rows="rows"
          :columns="columns"
          row-key="name"
          :filter="filter"
          hide-header
          v-model:pagination="pagination"
          hide-pagination
          class="plugin-table"
        >
          <template v-slot:no-data>
            <div class="full-width row flex-center text-accent q-gutter-sm">
              <q-icon size="2em" name="sentiment_dissatisfied"/>
              <q-item-label>{{ t('headers.listEmpty') }}</q-item-label>
              <q-icon size="2em" name="priority_high"/>
            </div>
          </template>

          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
              <q-card class="plugin-card">
                <q-card-section class="plugin-card-header">
                  <div class="row items-center no-wrap">
                    <div class="plugin-title text-weight-bold ellipsis">
                      {{ props.row.name }}
                    </div>
                  </div>
                </q-card-section>

                <q-separator v-if="props.row.update_available" color="warning"/>
                <q-separator v-else-if="props.row.installed" color="positive"/>
                <q-separator v-else/>

                <q-card-section class="plugin-card-body">
                  <div class="row q-col-gutter-md no-wrap">
                    <div class="col-auto">
                      <q-skeleton v-if="!props.row.icon" class="plugin-card-icon"/>
                      <q-avatar v-else rounded class="bg-transparent plugin-card-icon">
                        <q-img :src="props.row.icon" fit="contain" class="plugin-card-icon">
                          <template v-slot:error>
                            <div class="absolute-full flex flex-center bg-negative text-white text-caption text-center">
                              {{ t('status.cannotLoadImage') }}
                            </div>
                          </template>
                        </q-img>
                      </q-avatar>
                    </div>
                    <div class="col">
                      <div class="plugin-meta">
                        <div class="plugin-meta-row">
                          <div class="plugin-meta-label">{{ t('components.plugins.author') }}</div>
                          <div class="plugin-meta-value">{{ props.row.author }}</div>
                        </div>
                        <div class="plugin-meta-row">
                          <div class="plugin-meta-label">{{ t('components.plugins.version') }}</div>
                          <div class="plugin-meta-value">{{ props.row.version }}</div>
                        </div>
                        <div class="plugin-meta-row">
                          <div class="plugin-meta-label">{{ t('components.plugins.repo') }}</div>
                          <div class="plugin-meta-value plugin-meta-repo" :title="props.row.repo_name">
                            {{ props.row.repo_name }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row q-col-gutter-md no-wrap">
                    <div class="col-auto">
                      <div v-if="props.row.description" class="plugin-description text-grey-8">
                        {{ props.row.description }}
                      </div>
                    </div>
                  </div>
                </q-card-section>

                <q-card-section class="q-pt-none plugin-card-actions">
                  <div class="row items-center">
                    <div class="col self-start items-end">
                      <q-btn
                        v-if="props.row.update_available"
                        @click="installPlugin(props.row.plugin_id, props.row.repo_id)"
                        color="accent"
                        dense
                        round
                        flat
                        icon="update"
                      >
                        <q-tooltip class="bg-white text-primary">{{ t('tooltips.update') }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-else-if="props.row.installed"
                        @click="installPlugin(props.row.plugin_id, props.row.repo_id)"
                        color="accent"
                        dense
                        round
                        flat
                        icon="download_for_offline"
                      >
                        <q-tooltip class="bg-white text-primary">{{ t('tooltips.reinstall') }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-else
                        @click="installPlugin(props.row.plugin_id, props.row.repo_id)"
                        color="accent"
                        dense
                        round
                        flat
                        icon="download_for_offline"
                      >
                        <q-tooltip class="bg-white text-primary">{{ t('tooltips.install') }}</q-tooltip>
                      </q-btn>

                      <q-btn
                        @click="openPluginInfo(props.row.plugin_id, 'info')"
                        color="secondary"
                        dense
                        round
                        flat
                        icon="info"
                      >
                        <q-tooltip class="bg-white text-primary">{{ t('tooltips.pluginInfo') }}</q-tooltip>
                      </q-btn>
                    </div>
                    <div class="col self-end text-right">
                      <q-btn
                        v-if="props.row.update_available"
                        color="warning"
                        dense
                        round
                        flat
                        class="float-right"
                        icon="check_circle"
                      >
                        {{ t('components.plugins.updateAvailable') }}
                      </q-btn>
                      <q-btn
                        v-else-if="props.row.installed"
                        color="positive"
                        dense
                        round
                        flat
                        class="float-right"
                        icon="check_circle"
                      >
                        {{ t('components.plugins.installed') }}
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>

                <q-inner-loading :showing="pluginInstalling[props.row.repo_id + props.row.plugin_id]">
                  <q-spinner size="100px" color="secondary"/>
                </q-inner-loading>
              </q-card>
            </div>
          </template>
        </q-table>
      </div>
    </div>
  </UnmanicDialogWindow>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import { useMobile } from 'src/composables/useMobile'
import UnmanicDialogWindow from 'components/dialogs/standard/UnmanicDialogWindow.vue'
import PluginInstallerManageRepos from 'components/settings/plugins/partials/PluginInstallerManageRepos'
import PluginInfoDialog from 'components/dialogs/PluginInfoDialog'

const emit = defineEmits(['hide'])

const { t } = useI18n()
const $q = useQuasar()
const { isMobile } = useMobile()

const dialogRef = ref(null)
const filter = ref('')
const rows = ref([])
const pagination = ref({
  page: 1,
  rowsPerPage: 0
})
const tags = ref([])
const tagFilter = ref(t('status.all'))
const pluginInstalling = ref({})

const columns = computed(() => ([
  {
    name: 'icon',
    required: true,
    label: '',
    align: 'left',
    field: 'icon',
    sortable: true
  },
  {
    name: 'name',
    required: true,
    label: t('components.plugins.name'),
    align: 'left',
    field: 'name',
    sortable: true
  },
  {
    name: 'author',
    align: 'center',
    label: t('components.plugins.author'),
    field: 'author',
    sortable: false
  },
  {
    name: 'version',
    align: 'center',
    label: t('components.plugins.version'),
    field: 'version',
    sortable: false
  }
]))

const show = () => {
  dialogRef.value.show()
  loadInstallablePlugins()
}

const hide = () => {
  dialogRef.value.hide()
}

const onDialogHide = () => {
  emit('hide')
}

const installPlugin = (pluginId, repoId) => {
  const installKey = repoId + pluginId
  pluginInstalling.value[installKey] = true

  const data = {
    plugin_id: pluginId,
    repo_id: repoId,
  }

  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'plugins/install'),
    data: data
  }).then(() => {
    $q.notify({
      color: 'positive',
      position: 'top',
      message: t('notifications.installed'),
      icon: 'check_circle',
      actions: [{ icon: 'close', color: 'white' }]
    })

    for (let i = 0; i < rows.value.length; i++) {
      const plugin = rows.value[i]
      if (plugin.plugin_id === pluginId) {
        plugin.installed = true
        plugin.update_available = false
      }
    }

    pluginInstalling.value[installKey] = false
  }).catch(() => {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: t('notifications.failedToInstallPlugin'),
      icon: 'report_problem',
      actions: [{ icon: 'close', color: 'white' }]
    })

    pluginInstalling.value[installKey] = false
  })
}

const loadInstallablePlugins = () => {
  axios({
    method: 'get',
    url: getUnmanicApiUrl('v2', 'plugins/installable')
  }).then((response) => {
    const allPluginsList = response.data.plugins
    const pluginList = []
    const allTagsList = []
    const allLabel = t('status.all')

    for (let i = 0; i < allPluginsList.length; i++) {
      const plugin = allPluginsList[i]

      const pluginTags = plugin.tags.split(',')
      for (let x = 0; x < pluginTags.length; x++) {
        const tag = pluginTags[x].trim()
        if (!tag) {
          continue
        }
        if (allTagsList.includes(tag)) {
          continue
        }
        allTagsList.push(tag)
      }

      if (tagFilter.value !== allLabel) {
        if (!plugin.tags.includes(tagFilter.value)) {
          continue
        }
      }

      pluginList.push({
        plugin_id: plugin.plugin_id,
        name: plugin.name,
        author: plugin.author,
        description: plugin.description,
        version: plugin.version,
        icon: plugin.icon,
        tags: plugin.tags,
        installed: plugin.status.installed,
        update_available: plugin.status.update_available,
        package_url: plugin.package_url,
        changelog_url: plugin.changelog_url,
        repo_name: plugin.repo_name,
        repo_id: plugin.repo_id,
      })
    }

    if (tagFilter.value !== allLabel) {
      pagination.value.page = 1
    }

    tags.value = [allLabel].concat(allTagsList.sort())
    rows.value = pluginList
  })
}

const reloadPluginsPostRepoReloaded = () => {
  pagination.value.page = 1
  loadInstallablePlugins()
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
      viewingRemoteInfo: true,
    },
  }).onOk(() => {
  }).onDismiss(() => {
  })
}

onMounted(() => {
  loadInstallablePlugins()
})

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.plugin-installer-dialog {
  display: block;
  width: 100%;
}

.plugin-table-actions-bar {
  position: sticky;
  top: 0;
  z-index: 90;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.q-dark .plugin-table-actions-bar {
  background: var(--q-dark) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.plugin-table {
  margin-bottom: 50px;
}

.plugin-table-wrapper {
  display: block;
  width: 100%;
}

.plugin-card {
  container-type: inline-size;
  min-height: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.plugin-card-header {
  min-height: 52px;
  padding-bottom: 0;
}

.plugin-title {
  max-width: 100%;
}

.plugin-card-body {
  flex: 1;
}

.plugin-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.plugin-meta-row {
  display: grid;
  grid-template-columns: 70px 1fr;
  column-gap: 8px;
  align-items: start;
}

.plugin-meta-label {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plugin-card-icon {
  width: 80px;
  height: 80px;
}

@container (max-width: 350px) {
  .plugin-meta-label {
    display: none;
  }

  .plugin-meta-row {
    grid-template-columns: 1fr;
  }

  .plugin-card-icon {
    width: 70px;
    height: 70px;
  }
}

.plugin-meta-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plugin-meta-repo {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
}

.plugin-description {
  margin-top: 10px;
  font-size: 0.85rem;
  line-height: 1.3;
  max-height: 3.4em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.plugin-card-actions {
  padding-top: 0;
}

.q-dark .plugin-meta-label {
  color: rgba(255, 255, 255, 0.7);
}
</style>
