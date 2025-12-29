<template>
  <UnmanicDialogPopup
    ref="dialogRef"
    :title="dialogTitle"
    @hide="onDialogHide"
  >
    <div class="q-pa-md">
      <q-card flat>
        <q-card-section>
          <div class="row q-col-gutter-sm q-mt-xs justify-between">
            <div class="col-12 col-sm-auto">
              <q-btn
                @click="openPluginInstaller"
                color="secondary"
                icon-right="add"
                outline
                class="full-width"
                :label="t('components.plugins.installPluginFromRepo')"/>
            </div>
            <div
              class="col-12 col-sm-auto"
              :style="isMobile ? '' : 'max-width: 240px'">
              <q-input
                outlined
                dense
                debounce="300"
                color="secondary"
                class="full-width"
                v-model="filter"
                :placeholder="t('navigation.search')">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-card-section :class="isMobile ? 'q-px-none' : ''">
          <q-card flat>
            <q-card-section class="q-pa-none">
              <q-list bordered padding>
                <q-separator spaced inset/>
                <div
                  v-for="(plugin, index) in plugins"
                  :key="index">
                  <q-item
                    clickable
                    v-ripple
                    @click="selectPlugin(plugin)">
                    <q-item-section avatar>
                      <q-img :src="plugin.icon"/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ plugin.name }}</q-item-label>
                      <q-item-label caption lines="2">{{ plugin.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator spaced inset/>
                </div>
              </q-list>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>
    </div>
  </UnmanicDialogPopup>

  <PluginInstallerDialog
    ref="pluginInstallerDialog"
    @hide="onPluginInstallerHide"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { getUnmanicApiUrl } from 'src/js/unmanicGlobals'
import { useMobile } from 'src/composables/useMobile'
import UnmanicDialogPopup from 'components/ui/dialogs/UnmanicDialogPopup.vue'
import PluginInstallerDialog from 'components/settings/plugins/PluginInstallerDialog.vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  hidePlugins: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['hide', 'selected'])

const { t } = useI18n()
const { isMobile } = useMobile()

const dialogRef = ref(null)
const pluginInstallerDialog = ref(null)
const plugins = ref([])
const filter = ref('')
const currentPlugin = ref(null)

const dialogTitle = computed(() => props.title || t('headers.selectPlugin'))

const fetchPluginsList = () => {
  const data = {
    start: 0,
    length: 1000,
    search_value: filter.value,
    order_by: 'name',
    order_direction: 'asc',
  }
  axios({
    method: 'post',
    url: getUnmanicApiUrl('v2', 'plugins/installed'),
    data: data
  }).then((response) => {
    const results = response.data.results || []
    const pluginList = results
      .filter((plugin) => !props.hidePlugins.includes(plugin.plugin_id))
      .map((plugin) => ({
        plugin_id: plugin.plugin_id,
        name: plugin.name,
        author: plugin.author,
        description: plugin.description,
        version: plugin.version,
        icon: plugin.icon,
        tags: plugin.tags,
        has_config: plugin.has_config,
      }))
    plugins.value = pluginList
  })
}

const selectPlugin = (plugin) => {
  currentPlugin.value = plugin
  emit('selected', plugin)
  hide()
}

const openPluginInstaller = () => {
  if (pluginInstallerDialog.value) {
    pluginInstallerDialog.value.show()
  }
}

const onPluginInstallerHide = () => {
  fetchPluginsList()
}

const show = () => {
  if (!dialogRef.value) {
    return
  }
  currentPlugin.value = null
  dialogRef.value.show()
  fetchPluginsList()
}

const hide = () => {
  if (dialogRef.value) {
    dialogRef.value.hide()
  }
}

const onDialogHide = () => {
  emit('hide')
}

watch(filter, () => {
  fetchPluginsList()
})

watch(() => props.hidePlugins, () => {
  fetchPluginsList()
})

defineExpose({
  show,
  hide
})
</script>
