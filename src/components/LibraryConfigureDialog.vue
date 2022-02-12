<template>

  <!-- START DIALOG CONFIG
  Right fullscreen pop-up
  Note: Update template q-dialog ref="" value

  All Platforms:
   - Swipe right to dismiss
  Desktop:
   - Width 700px
   - Minimise button top-right
  Mobile:
   - Full screen
   - Back button top-left
  -->
  <q-dialog
    ref="libraryConfigureDialogRef"
    :maximized="$q.platform.is.mobile"
    transition-show="slide-left"
    transition-hide="slide-right"
    full-height
    position="right"
    @before-hide="beforeDialogHide"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.right="hide"
      :style="$q.platform.is.mobile ? 'max-width: 100vw;' : 'max-width: 95vw;'"
      style="width:700px;">

      <q-card-section class="bg-grey-2">
        <div class="row items-center no-wrap">
          <div
            v-if="$q.platform.is.mobile"
            class="col">
            <q-btn
              color="grey-7"
              dense
              round
              flat
              icon="arrow_back"
              v-close-popup>
            </q-btn>
          </div>

          <div class="col">
            <div class="text-h6 text-blue-10">
              {{ dialogHeader }}
            </div>
          </div>

          <div
            v-if="!$q.platform.is.mobile"
            class="col-auto">
            <q-btn
              color="grey-7"
              dense
              round
              flat
              icon="arrow_forward"
              v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <!-- END DIALOG CONFIG -->

      <q-card-section class="q-pt-none">

        <div :class="$q.platform.is.mobile ? 'q-px-none' : ''">

          <q-card flat>
            <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

              <h5 class="q-mt-none q-mb-md">{{ $t('components.settings.library.configuration') }}</h5>

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

              <div class="q-pb-sm">
                <q-skeleton
                  v-if="path === null"
                  type="QInput"/>
                <q-input
                  v-else
                  readonly
                  outlined
                  color="primary"
                  v-model="path"
                  :label="$t('components.settings.library.path')"
                  :placeholder="path"
                  @click="updateLibraryWithDirectoryBrowser">
                  <template v-slot:append>
                    <q-icon
                      @click="updateLibraryWithDirectoryBrowser"
                      class="cursor-pointer"
                      name="folder_open"/>
                  </template>
                </q-input>
              </div>

              <div class="q-pb-sm">
                <q-skeleton
                  v-if="enableScanner === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="enableScanner"
                  :label="$t('components.settings.library.enableScanner')"
                />
              </div>

              <div class="q-pb-sm">
                <q-skeleton
                  v-if="enableInotify === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="enableInotify"
                  :label="$t('components.settings.library.enableInotify')"
                />
              </div>
            </q-card-section>

            <q-separator/>

            <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

              <h5 class="q-mt-none q-mb-md">{{ $t('components.settings.library.enabledPlugins') }}</h5>

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
                            @click="showPluginInfo = plugin.plugin_id">
                            <q-tooltip class="bg-white text-primary">{{ $t('tooltips.configure') }}</q-tooltip>
                          </q-btn>
                          <q-btn
                            flat dense round
                            size="12px"
                            color="negative"
                            icon="remove_circle_outline"
                            @click="removePluginFromList(index)">
                            <q-tooltip class="bg-white text-primary">{{ $t('tooltips.remove') }}</q-tooltip>
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
                    <q-tooltip class="bg-white text-primary">{{ $t('tooltips.add') }}</q-tooltip>
                  </q-btn>
                </q-bar>
              </div>

            </q-card-section>

            <q-separator/>

            <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

              <h5 class="q-mt-none q-mb-md">{{ $t('components.settings.library.pluginFlow') }}</h5>

              <LibraryConfigurePluginFlowList v-bind:libraryId="libraryId" :key="componentKey"/>

            </q-card-section>

          </q-card>

        </div>

      </q-card-section>

    </q-card>

    <PluginInfo v-bind:showPluginInfo="showPluginInfo"
                v-bind:libraryId="libraryId"
                v-on:hide="closePluginInfo"/>

  </q-dialog>
</template>

<script>
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { ref } from "vue";
import PluginInfo from "components/PluginInfo";
import DirectoryBrowserDialog from "components/DirectoryBrowserDialog";
import PluginSelectorDialog from "components/PluginSelectorDialog";
import LibraryConfigurePluginFlowList from "components/LibraryConfigurePluginFlowList";

export default {
  name: 'LibraryConfigureDialog',
  components: { LibraryConfigurePluginFlowList, PluginInfo },
  props: {
    dialogHeader: {
      type: String,
      default: ' --- header --- '
    },
    libraryId: {
      type: Number,
      default: 0
    }
  },
  emits: [
    // REQUIRED
    'ok', 'hide', 'path'
  ],
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.libraryConfigureDialogRef.show();
      this.fetchLibraryConfig(this.libraryId);
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.libraryConfigureDialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('ok', {});
      this.$emit('hide');
    },

    beforeDialogHide() {
      this.saveLibraryConfig();
    },

    fetchLibraryConfig: function (libraryId) {
      this.currentID = libraryId;
      // Fetch from server
      let data = {
        id: this.currentID,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/library/read'),
        data: data
      }).then((response) => {
        // Library configuration
        let libraryConfig = response.data.library_config;
        this.name = libraryConfig.name;
        this.path = libraryConfig.path;
        this.enableScanner = libraryConfig.enable_scanner;
        this.enableInotify = libraryConfig.enable_inotify;

        // Plugins
        this.enabledPlugins = response.data.plugins.enabled_plugins;
      });
    },
    saveLibraryConfig: function () {
      let data = {
        library_config: {
          id: this.currentID,
          name: this.name,
          path: this.path,
          enable_scanner: this.enableScanner,
          enable_inotify: this.enableInotify,
        },
        plugins: {
          enabled_plugins: this.enabledPlugins,
        }
      }
      axios({
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
    closePluginInfo: function () {
      this.showPluginInfo = '';
    },
  },
  watch: {
    libraryId(value) {
      if (value.length > 0) {
        this.currentID = this.libraryId;
      }
    }
  },
  data: function () {
    return {
      maximizedToggle: true,
      showPluginInfo: ref(''),
      currentID: ref(null),
      name: ref(''),
      path: ref(''),
      enableScanner: ref(false),
      enableInotify: ref(false),
      enabledPlugins: ref([]),
      componentKey: 1,
    }
  }
}
</script>
