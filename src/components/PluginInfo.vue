<template>

  <q-dialog
    v-model="pluginInfoShowDialog"
    full-height
    :maximized="$q.platform.is.mobile"
    :transition-show="($q.platform.is.mobile) ? 'slide-left' : 'scale'"
    :transition-hide="($q.platform.is.mobile) ? 'slide-right' : 'scale'"
    :position="($q.platform.is.mobile) ? 'right' : 'standard'"
    @before-hide="beforeDialogHide"
    @hide="onDialogHide">

    <q-card
      style="width:1200px; max-width: 95vw;">
      <q-card-section class="bg-card-head">
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 text-secondary">
              <q-icon name="extension"/>
              {{ header }}
            </div>
          </div>

          <div class="col-auto">
            <q-btn
              v-if="!$q.platform.is.mobile"
              color="grey-7"
              dense
              round
              flat
              icon="close_fullscreen" v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
            <q-btn
              v-else
              color="grey-7"
              dense
              round
              flat
              icon="arrow_forward" v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-tabs
        v-if="settings.length > 0"
        v-model="tab"
        align="left"
        class="text-primary">
        <q-tab
          :label="$t('navigation.info')" name="info" @click="setHeader('info')"/>
        <q-tab
          :label="$t('navigation.settings')" name="settings" @click="setHeader('settings')"/>
      </q-tabs>

      <q-separator/>

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="info">
          <!--ICON AND INFO-->
          <div class="row">
            <!--ICON-->
            <div
              v-if="!$q.platform.is.mobile"
              class="col col-md-auto col-12 q-pa-xs">
              <q-skeleton v-if="!icon" width="350px" height="350px" class="shadow-1"/>
              <q-avatar
                v-else
                rounded
                size="350px"
                font-size="82px"
                text-color="white"
                class="shadow-1">
                <q-img :src="icon" class="" style="max-width: 300px;"/>
              </q-avatar>
            </div>
            <!--INFO-->
            <div class="col col-md-grow col-12 q-pa-xs">
              <q-skeleton v-if="!name" width="100%" max-height="350px" class="shadow-1"/>
              <q-card
                v-else
                :style="($q.platform.is.mobile && changelog.length === 0) ? 'height: 128px;' : ''">
                <q-card-section style="max-height: 128px;">
                  <!--META-->
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
                  v-if="($q.platform.is.mobile && changelog.length > 0) || (!$q.platform.is.mobile)"
                  style="max-height: 222px;">
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

          <!--DESCRIPTION-->
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
                  style="width:100%">

                  <q-card-section class="q-pt-none">

                    <q-list
                      v-if="settings.length > 0"
                      separator>
                      <q-item
                        v-for="item in settings"
                        :class="item.display"
                        :key="item.key_id"
                        class="q-py-lg"
                        v-bind="item">

                        <!-- Text input -->
                        <q-item-section
                          v-if="item.input_type === 'text'">
                          <q-input filled v-model="item.value" :label="item.label" :placeholder="item.label"/>
                        </q-item-section>

                        <!-- Textarea input -->
                        <q-item-section
                          v-if="item.input_type === 'textarea'">
                          <q-input filled type="textarea" v-model="item.value" :label="item.label"/>
                        </q-item-section>

                        <!-- Checkbox input -->
                        <q-item-section
                          @click="item.value = !item.value"
                          v-if="item.input_type === 'checkbox'">
                          <div
                            :style="$q.dark.isActive ? 'background:rgba(255,255,255,.07)' : 'background:rgba(0, 0, 0, 0.05);'"
                            class="q-pa-sm rounded-borders">
                            <q-checkbox
                              @update:model-value="value=>{updateAndTriggerSave(item.key_id, value)}"
                              v-model="item.value"
                              :label="item.label"/>
                          </div>
                        </q-item-section>

                        <!-- Select input -->
                        <q-item-section
                          v-if="item.input_type === 'select'">
                          <q-select
                            @update:model-value="value=>{updateAndTriggerSave(item.key_id, value)}"
                            filled
                            v-model="item.value"
                            emit-value
                            map-options
                            :options="item.select_options"
                            :option-value="opt => Object(opt) === opt && 'value' in opt ? opt.value : null"
                            :option-label="opt => Object(opt) === opt && 'label' in opt ? opt.label : '- Null -'"
                            :label="item.label"/>
                        </q-item-section>

                        <!-- Slider input -->
                        <q-item-section
                          :class="item.display"
                          avatar
                          v-if="item.input_type === 'slider'">
                          <q-icon color="primary" name="chevron_right"/>
                        </q-item-section>
                        <q-item-section
                          :class="item.display"
                          v-if="item.input_type === 'slider'">
                          <q-slider
                            v-model="item.value"
                            :min="Number(item.slider_options.min)"
                            :max="Number(item.slider_options.max)"
                            :step="Number(item.slider_options.step)"
                            label
                            :label-value="item.label + ': ' + item.value + item.slider_options.suffix"
                            label-always
                            color="primary"
                          />
                        </q-item-section>
                        <q-item-section
                          :class="item.display"
                          avatar
                          v-if="item.input_type === 'slider'">
                          <q-icon color="primary" name="chevron_left"/>
                        </q-item-section>

                        <!-- Directory browser input -->
                        <q-item-section
                          v-if="item.input_type === 'browse_directory'">

                          <q-input
                            readonly
                            filled
                            color="primary"
                            v-model="item.value"
                            :label="item.label"
                            :placeholder="item.label"
                            @click="updateWithDirectoryBrowser(item)">
                            <template v-slot:append>
                              <q-icon
                                @click="updateWithDirectoryBrowser(item)"
                                class="cursor-pointer"
                                name="folder_open"/>
                            </template>
                          </q-input>

                        </q-item-section>


                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>

                <div
                  class="q-mt-md float-right"
                  v-if="libraryId">
                  <q-btn
                    :label="$t('components.plugins.resetConfiguration')"
                    color="secondary"
                    @click="resetPluginLibraryConfig()"/>
                </div>

              </div>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>

    </q-card>
  </q-dialog>

</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { markdownToHTML } from "src/js/markupParser";
import DirectoryBrowserDialog from "components/DirectoryBrowserDialog";

export default {
  name: 'PluginInfo',
  components: {},
  data() {
    return {
      header: ref(''),
      pluginInfoShowDialog: ref(false),
      tab: ref('info'),
      id: ref(null),
      pluginId: ref(''),
      icon: ref(null),
      name: ref(null),
      description: ref(null),
      tags: ref(null),
      author: ref(null),
      version: ref(null),
      changelog: ref(null),
      status: ref(null),
      settings: ref([]),
      originalSettings: ref([]),
    }
  },
  watch: {
    showPluginInfo(value) {
      if (value.length > 0) {
        this.selectedPluginId = value;
        this.setHeader('info');
        this.fetchPluginInfo();
        this.pluginInfoShowDialog = true;
      } else {
        this.pluginInfoShowDialog = false;
        this.resetData();
      }
    },
    showPluginSettings(value) {
      if (value.length > 0) {
        this.selectedPluginId = value;
        this.tab = 'settings';
        this.setHeader('settings');
        this.fetchPluginInfo();
        this.pluginInfoShowDialog = true;
      } else {
        this.pluginInfoShowDialog = false;
        this.resetData();
      }
    }
  },
  methods: {
    resetData() {
      this.selectedPluginId = '';
      this.tab = 'info';
      this.id = null;
      this.pluginId = '';
      this.icon = null;
      this.name = null;
      this.description = null;
      this.tags = null;
      this.author = null;
      this.version = null;
      this.changelog = null;
      this.status = null;
      this.settings = [];
      this.currentSettings = [];
    },
    setHeader(tab) {
      if (tab === 'info') {
        this.header = this.$t('headers.pluginInfo');
      } else {
        if (this.libraryId) {
          this.header = this.$t('headers.libraryPluginConfig');
        } else {
          this.header = this.$t('headers.globalPluginConfig');
        }
      }
    },
    resetPluginLibraryConfig() {
      let data = {
        plugin_id: this.pluginId
      }
      if (this.libraryId) {
        data.library_id = this.libraryId;
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/settings/reset'),
        data: data
      }).then((response) => {
        // Save success
        // Refresh plugin info
        this.fetchPluginInfo();
        // Show feedback
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('notifications.SavedPluginSettings'),
          icon: 'check_circle',
          timeout: 200,
          actions: [{ icon: 'close', color: 'white' }]
        })
        // Hide dialog
        this.$emit('hide');
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSavePluginSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    fetchPluginInfo() {
      console.debug('Fetching info for ' + this.selectedPluginId)
      // Fetch from server
      let data = {
        plugin_id: this.selectedPluginId,
        prefer_local: true,
      }
      if (this.viewingRemoteInfo) {
        data.prefer_local = false;
      }
      if (this.libraryId) {
        data.library_id = this.libraryId;
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/info'),
        data: data
      }).then((response) => {
        this.id = response.data.id
        this.pluginId = response.data.plugin_id
        this.icon = response.data.icon
        this.name = response.data.name
        this.tags = response.data.tags
        this.author = response.data.author
        this.version = response.data.version
        this.changelog = response.data.changelog
        this.status = response.data.status
        if (!this.viewingRemoteInfo) {
          this.settings = response.data.settings
          // Create a copy of the settings object for the "current settings".
          // We will compare this later on.
          this.currentSettings = JSON.parse(JSON.stringify(response.data.settings))
        }

        // Parse the changelog
        this.changelog = markdownToHTML(response.data.changelog);

        // Parse the description
        this.description = markdownToHTML(response.data.description);
      });
    },

    settingsHaveBeenModified() {
      // This is a little complicated than it should be. Bot lists are just arrays.
      // Therefore we need to loop over both and ensure the key value pairs in each are still the same
      // Extract values from settings
      let newSettings = {}
      for (let i = 0; i < this.settings.length; i++) {
        newSettings[this.settings[i].key_id] = this.settings[i].value;
      }
      // Loop over currently saved values and check they are the same
      for (let i = 0; i < this.currentSettings.length; i++) {
        if (newSettings[this.currentSettings[i].key_id] !== this.currentSettings[i].value) {
          // Settings have changed
          return true;
        }
      }

      // All parsed settings are the same
      return false;
    },

    beforeDialogHide() {
      if (typeof this.currentSettings !== 'undefined') {
        if (this.currentSettings.length > 0) {
          // Only save if settings are different
          if (this.settingsHaveBeenModified()) {
            // Settings have changed since they were last saved... save them again.
            this.savePluginSettings();
          }
        }
      }
    },

    onDialogHide() {
      this.$emit('hide');
    },

    savePluginSettings: function () {
      console.debug('Fetching info for ' + this.pluginId)

      let data = {
        plugin_id: this.pluginId,
        settings: this.settings
      }
      if (this.libraryId) {
        data.library_id = this.libraryId;
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/settings/update'),
        data: data
      }).then((response) => {
        // Save success
        // Refresh plugin info
        this.fetchPluginInfo();
        // Show feedback
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('notifications.SavedPluginSettings'),
          icon: 'check_circle',
          timeout: 200,
          actions: [{ icon: 'close', color: 'white' }]
        })
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSavePluginSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    updateAndTriggerSave: function (key, value) {
      for (let i = 0; i < this.settings.length; i++) {
        if (this.settings[i].key_id === key) {
          this.settings[i].value = value;
          break
        }
      }
      this.savePluginSettings()
    },
    updateWithDirectoryBrowser: function (input) {
      this.$q.dialog({
        component: DirectoryBrowserDialog,
        // props forwarded to your custom component
        componentProps: {
          dialogHeader: this.$t('headers.selectDirectory'),
          initialPath: input.value,
          listType: 'directories'
        },
      }).onOk((payload) => {
        if (typeof payload.selectedPath !== 'undefined' && payload.selectedPath !== null) {
          input.value = payload.selectedPath
        }
      }).onDismiss(() => {
      })
    }

  },
  props: {
    showPluginInfo: {
      type: String,
      required: false,
    },
    showPluginSettings: {
      type: String,
      required: false,
    },
    viewingRemoteInfo: {
      type: Boolean,
      required: false,
    },
    libraryId: {
      type: Number,
      required: false,
    }
  },
  setup() {
    return {}
  }
}
</script>

<style>
span.plugin-changelog * {
  margin-top: 0;
  margin-bottom: 0;
}

span.plugin-description {
  width: 100%;
}

span.plugin-description p {
  margin-bottom: 5px;
}

span.plugin-description h2,
span.plugin-description h3,
span.plugin-description h4,
span.plugin-description h5,
span.plugin-description h6 {
  margin-top: 10px;
  margin-bottom: 0;
}

span.plugin-description ul {
  margin-top: 10px;
  margin-bottom: 10px;
}

span.plugin-description pre {
  border: inset thin;
  padding: 10px;
}

.body--light span.plugin-description pre {
  background: #EEE;
}

.body--dark span.plugin-description pre {
  background: #222;
}

span.plugin-description hr {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
