<template>

  <div :class="$q.platform.is.mobile ? 'q-px-none' : ''">

    <q-card flat>
      <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

        <div class="row items-center no-wrap q-mb-md">
          <div class="col">
            <div class="text-h5">
              {{ $t('components.settings.common.configuration') }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              round
              flat
              color="primary"
              icon="download"
              @click="exportPluginConfig">
              <q-tooltip class="bg-white text-primary">{{
                  $t('components.settings.library.exportLibraryConfig')
                }}
              </q-tooltip>
            </q-btn>
            <q-btn
              round
              flat
              color="primary"
              icon="publish"
              @click="importPluginConfig">
              <q-tooltip class="bg-white text-primary">{{
                  $t('components.settings.library.importLibraryConfig')
                }}
              </q-tooltip>
            </q-btn>
            <q-btn
              round
              flat
              color="primary"
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
              flat
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
              flat
              color="primary"
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
            @keyup.tab="addTag"
          />
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

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
                    <q-btn
                      flat dense round
                      size="12px"
                      color="grey-8"
                      icon="tune"
                      :disable="!plugin.has_config"
                      @click="openPluginInfo(plugin.plugin_id, 'settings')">
                      <q-tooltip class="bg-white text-primary">
                        {{ $t('tooltips.configureForThisLibrary') }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      flat dense round
                      size="12px"
                      color="negative"
                      icon="remove_circle_outline"
                      @click="removePluginFromList(index)">
                      <q-tooltip class="bg-white text-primary">
                        {{ $t('tooltips.removeFromThisLibrary') }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>

              </q-item>
            </div>

          </q-list>

          <q-bar class="bg-transparent q-mb-sm">
            <q-space/>
            <q-btn
              round
              flat
              color="primary"
              icon="add"
              @click="selectPluginFromList">
              <q-tooltip class="bg-white text-primary">{{
                  $t('components.settings.library.addPluginToThisLibrary')
                }}
              </q-tooltip>
            </q-btn>
          </q-bar>
        </div>

        <div class="text-h6">
          {{ $t('components.settings.library.pluginFlow') }}
        </div>

        <LibraryConfigurePluginFlowList v-bind:libraryId="libraryId" :key="componentKey"/>

      </q-card-section>

    </q-card>

  </div>

</template>

<script>
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { ref } from "vue";
import DirectoryBrowserDialog from "components/DirectoryBrowserDialog";
import PluginSelectorDialog from "components/PluginSelectorDialog";
import LibraryConfigurePluginFlowList from "components/LibraryConfigurePluginFlowList";
import JsonImportExportDialog from "components/JsonImportExportDialog";
import { Loading } from "quasar";
import PluginInfoDialog from "components/dialogs/PluginInfoDialog";

export default {
  name: 'LibraryConfigForm',
  components: { LibraryConfigurePluginFlowList },
  props: {
    libraryId: {
      type: Number,
      default: 0
    }
  },
  data: function () {
    return {
      /*
      Required data:
        - isLoading
        - isSaved
      */
      isLoading: false,
      isSaved: true,

      currentID: ref(null),
      locked: ref(false),
      name: ref(''),
      path: ref(''),
      enableReceiveRemoteFilesOnly: ref(false),
      enableScanner: ref(false),
      enableInotify: ref(false),
      priorityScore: ref(0),
      newTag: ref(''),
      tags: ref([]),
      enabledPlugins: ref([]),
      componentKey: 1,
      showLoading: ref(false),
    }
  },
  mounted() {
    this.fetchLibraryConfig(this.libraryId);
  },
  methods: {
    /*
    Required methods:
      - hide()
      - save()
      - cancel()
    */
    hide() {
      return true;
    },
    save() {
      return this.saveLibraryConfig();
    },
    cancel() {
      return true;
    },

    fetchLibraryConfig: function (libraryId) {
      // Fetch from server
      let data = {
        id: libraryId,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/library/read'),
        data: data
      }).then((response) => {
        // Library configuration
        let libraryConfig = response.data.library_config;
        this.currentID = libraryConfig.id;
        this.locked = libraryConfig.locked;
        this.name = libraryConfig.name;
        this.path = libraryConfig.path;
        this.enableReceiveRemoteFilesOnly = libraryConfig.enable_remote_only;
        this.enableScanner = libraryConfig.enable_scanner;
        this.enableInotify = libraryConfig.enable_inotify;
        this.priorityScore = libraryConfig.priority_score;
        this.tags = libraryConfig.tags;

        // Plugins
        this.enabledPlugins = response.data.plugins.enabled_plugins;
      });
    },
    saveLibraryConfig: async function () {
      let data = {
        library_config: {
          id: this.currentID,
          locked: this.locked,
          name: this.name,
          path: this.path,
          enable_remote_only: this.enableReceiveRemoteFilesOnly,
          enable_scanner: this.enableScanner,
          enable_inotify: this.enableInotify,
          priority_score: this.priorityScore,
          tags: this.tags,
        },
        plugins: {
          enabled_plugins: this.enabledPlugins,
        }
      }
      return await axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/library/write'),
        data: data
      }).then((response) => {
        // Save success, show feedback
        this.$q.notify({
          color: 'positive',
          position: 'top',
          icon: 'cloud_done',
          message: this.$t('notifications.saved'),
          timeout: 200
        })
        this.componentKey += 1;
        return true;
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSaveSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
        return false;
      });
    },
    addTag: function () {
      if (this.newTag) {
        this.tags[this.tags.length] = this.newTag;
        this.newTag = null;
      }
    },
    deleteTag: function (tag) {
      for (let i = 0; i < this.tags.length; i++) {
        if (this.tags[i] === tag) {
          this.tags.splice(i, 1);
        }
      }
    },
    updateLibraryWithDirectoryBrowser: function () {
      this.$q.dialog({
        component: DirectoryBrowserDialog,
        componentProps: {
          dialogHeader: this.$t('headers.selectDirectory'),
          initialPath: this.path,
          listType: 'directories'
        },
      }).onOk((payload) => {
        if (typeof payload.selectedPath !== 'undefined' && payload.selectedPath !== null) {
          this.path = payload.selectedPath
        }
      }).onDismiss(() => {
      })
    },
    selectPluginFromList: function () {
      let hidePlugins = []
      for (let i = 0; i < this.enabledPlugins.length; i++) {
        hidePlugins[hidePlugins.length] = this.enabledPlugins[i].plugin_id;
      }
      this.$q.dialog({
        component: PluginSelectorDialog,
        componentProps: {
          dialogHeader: this.$t('headers.selectPlugin'),
          hidePlugins: hidePlugins,
        },
      }).onOk((payload) => {
        if (typeof payload.selectedPlugin !== 'undefined' && payload.selectedPlugin !== null) {
          // Add selected plugin to library (sorting the list alphabetically)
          let enabledPluginList = this.enabledPlugins
          enabledPluginList.push(payload.selectedPlugin);
          enabledPluginList.sort((a, b) => a.name.localeCompare(b.name));
          this.enabledPlugins = enabledPluginList;

          // Save the current settings
          this.saveLibraryConfig()
        }
      }).onDismiss(() => {
      })
    },
    removePluginFromList: function (index) {
      let enabledPluginList = [];
      for (let i = 0; i < this.enabledPlugins.length; i++) {
        let plugin = this.enabledPlugins[i];
        if (i !== index) {
          enabledPluginList[enabledPluginList.length] = plugin
        }
      }
      this.enabledPlugins = enabledPluginList;

      // Save the current settings
      this.saveLibraryConfig()
    },
    openPluginInfo: function (pluginId, tab) {
      // Ensure we have the info for the plugin to be displayed
      if (pluginId === '') {
        // Display error notification
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'An error was encountered while attempting to open plugin info',
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
        return
      }
      // Display the dialog
      this.$q.dialog({
        component: PluginInfoDialog,
        componentProps: {
          pluginId: pluginId,
          startTab: (tab === 'settings') ? 'settings' : 'info',
          libraryId: this.currentID,
        },
      }).onOk((payload) => {
      }).onDismiss(() => {
      })
    },
    exportPluginConfig: function () {
      let data = {
        id: this.currentID,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/library/export'),
        data: data
      }).then((response) => {
        // Display dialog with exported json
        this.$q.dialog({
          component: JsonImportExportDialog,
          componentProps: {
            dialogHeader: this.$t('components.settings.library.exportLibraryConfig'),
            jsonData: JSON.stringify(response.data, null, 2),
            mode: 'export',
          }
        }).onDismiss(() => {
        })
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSaveSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    importData: function (importString, silent) {
      // Setup POST data
      let data = JSON.parse(importString);
      data.library_id = this.currentID;
      // Show loading dialog
      if (silent) {
        this.showLoading = false;
      } else {
        this.showLoading = true;
        Loading.show({
          message: this.$t('components.settings.library.importPluginConfigMessage'),
          messageColor: 'transparent',
        });
      }
      // After 1 second, update loading dialog to display the message.
      // This keeps it a simple busy dialog for most imports and it would only go for
      // more that about a second if the import also needs to install some plugins.
      setTimeout(() => {
        if (this.showLoading) {
          Loading.show({
            message: this.$t('components.settings.library.importPluginConfigMessage'),
            messageColor: 'white',
          });
        }
      }, 1000)
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/library/import'),
        data: data
      }).then((response) => {
        // Save success, show feedback
        this.$q.notify({
          color: 'positive',
          position: 'top',
          icon: 'cloud_done',
          message: this.$t('notifications.saved'),
          timeout: 200
        })
        this.showLoading = false;
        Loading.hide();
        this.componentKey += 1;
        this.fetchLibraryConfig(this.currentID);
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSaveSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
        this.showLoading = false;
        Loading.hide();
      });
    },
    importPluginConfig: function () {
      console.log("importPluginConfig");
      this.$q.dialog({
        component: JsonImportExportDialog,
        componentProps: {
          dialogHeader: this.$t('components.settings.library.importLibraryConfig'),
          jsonData: '',
          mode: 'import',
        }
      }).onOk((payload) => {
        if (typeof payload.importString !== 'undefined' && payload.importString !== null) {
          this.importData(payload.importString);
        }
      }).onDismiss(() => {
      })
    },
    cloneLibrary: function () {
      // Fetch the current library config using the the export feature
      let data = {
        id: this.currentID,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/library/export'),
        data: data
      }).then((response) => {
        // Modify data
        let configData = response.data;
        // Name the library as a clone
        let randomString = (Math.random() + 1).toString(36).substring(7);
        let newName = this.name + ' (' + this.$t('navigation.copy') + ' - ' + randomString + ')';
        configData.library_config = {
          name: newName,
          path: this.path,
          enable_remote_only: this.enableReceiveRemoteFilesOnly,
          enable_scanner: this.enableScanner,
          enable_inotify: this.enableInotify,
          priority_score: this.priorityScore,
          tags: this.tags,
        }
        // Create JSON string
        let importString = JSON.stringify(configData, null, 2);
        // Setting the ID to 0 will create a new library
        this.currentID = 0;
        // Import the exported data
        this.importData(importString, true);
        // Reset the current ID and hide dialog
        this.currentID = this.libraryId;
        // Hide dialog via the parent component
        this.$emit('requestHide')
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSaveSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
  },
  watch: {
    libraryId(value) {
      if (value.length > 0) {
        this.currentID = this.libraryId;
      }
    }
  }
}
</script>

<style scoped>

</style>
