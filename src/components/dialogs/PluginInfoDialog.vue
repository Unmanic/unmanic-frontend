<template>
  <!--
    TODO:
      - Configure mobile view such that the form elements on the settings tab are not padded
      - Fix header wrapping on mobile view
    -->

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
    ref="pluginInfoDialogRef"
    :maximized="$q.platform.is.mobile"
    :transition-show="$q.platform.is.mobile ? 'jump-left' : 'slide-left'"
    :transition-hide="$q.platform.is.mobile ? 'jump-right' : 'slide-right'"
    full-height
    position="right"
    @before-hide="beforeDialogHide"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.right="hide"
      :style="$q.platform.is.mobile ? 'max-width: 100vw;' : 'max-width: 95vw;'"
      style="width:2000px;">

      <q-card-section class="bg-card-head">
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
                      v-if="settings.length > 0">
                      <q-item
                        v-for="item in settings"
                        :class="item.sub_setting ? item.display + ' sub-setting': item.display"
                        :key="item.key_id"
                        class="q-py-sm"
                        v-bind="item">

                        <!-- Text input -->
                        <q-item-section
                          v-if="item.input_type === 'text'">
                          <q-input filled v-model="item.value"
                                   :bottom-slots="item.description.length > 0"
                                   :disable="item.display === 'disabled'"
                                   :label="item.label"
                                   :placeholder="item.label">
                            <template v-slot:hint v-if="item.description.length > 0">
                              {{ item.description }}
                            </template>
                          </q-input>
                          <q-tooltip v-if="item.tooltip" anchor="bottom start" self="top start">
                            {{ item.tooltip }}
                          </q-tooltip>
                        </q-item-section>

                        <!-- Textarea input -->
                        <q-item-section
                          v-if="item.input_type === 'textarea'">
                          <q-input filled v-model="item.value"
                                   type="textarea"
                                   :bottom-slots="item.description.length > 0"
                                   :disable="item.display === 'disabled'"
                                   :label="item.label">
                            <template v-slot:hint v-if="item.description.length > 0">
                              {{ item.description }}
                            </template>
                          </q-input>
                          <q-tooltip v-if="item.tooltip" anchor="bottom start" self="top start">
                            {{ item.tooltip }}
                          </q-tooltip>
                        </q-item-section>

                        <!-- Checkbox input -->
                        <q-item-section
                          v-if="item.input_type === 'checkbox'">
                          <div
                            @click="item.value = !item.value"
                            :style="$q.dark.isActive ? 'background:rgba(255,255,255,.07)' : 'background:rgba(0, 0, 0, 0.05);'"
                            class="q-pa-sm rounded-borders">
                            <q-checkbox
                              @update:model-value="value=>{updateAndTriggerSave(item.key_id, value)}"
                              v-model="item.value"
                              :disable="item.display === 'disabled'"
                              :label="item.label"/>
                          </div>
                          <div v-if="item.description.length > 0"
                               class="checkbox-hint">
                            {{ item.description }}
                          </div>
                          <q-tooltip v-if="item.tooltip" anchor="bottom start" self="top start">
                            {{ item.tooltip }}
                          </q-tooltip>
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
                            :bottom-slots="item.description.length > 0"
                            :options="item.select_options"
                            :option-value="opt => Object(opt) === opt && 'value' in opt ? opt.value : null"
                            :option-label="opt => Object(opt) === opt && 'label' in opt ? opt.label : '- Null -'"
                            :disable="item.display === 'disabled'"
                            :label="item.label">
                            <template v-slot:hint v-if="item.description.length > 0">
                              {{ item.description }}
                            </template>
                          </q-select>
                          <q-tooltip v-if="item.tooltip" anchor="bottom start" self="top start">
                            {{ item.tooltip }}
                          </q-tooltip>
                        </q-item-section>

                        <!-- Slider input -->
                        <q-item-section
                          v-if="item.input_type === 'slider'">
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
                          <div v-if="item.description.length > 0"
                               class="checkbox-hint">
                            {{ item.description }}
                          </div>
                        </q-item-section>

                        <!-- Directory browser input -->
                        <q-item-section
                          v-if="item.input_type === 'browse_directory'">
                          <q-input
                            readonly
                            filled
                            color="primary"
                            v-model="item.value"
                            :disable="item.display === 'disabled'"
                            :label="item.label"
                            :placeholder="item.label"
                            :hint="item.description"
                            @click="updateWithDirectoryBrowser(item)">
                            <template v-slot:append>
                              <q-icon
                                @click="updateWithDirectoryBrowser(item)"
                                class="cursor-pointer"
                                name="folder_open"/>
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
/*
tab          - The tab to display first ['info', 'settings']
*/

import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { markdownToHTML } from "src/js/markupParser";
import DirectoryBrowserDialog from "components/DirectoryBrowserDialog";

export default {
  name: 'LinkConfigureDialog',
  props: {
    pluginId: {
      type: String
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
  },
  emits: [
    // REQUIRED
    'ok', 'hide', 'path'
  ],
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.pluginInfoDialogRef.show();
      this.tab = this.startTab;
      this.setHeader(this.startTab);
      this.fetchPluginData();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.pluginInfoDialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('ok', {})
      this.$emit('hide')
    },

    beforeDialogHide: function () {
      // Execute any functions prior to closing the dialog
      this.ensurePluginSettingsAreSaved();
    },

    setHeader(tab) {
      if (tab === 'info') {
        this.dialogHeader = this.$t('headers.pluginInfo');
      } else {
        if (this.libraryId) {
          this.dialogHeader = this.$t('headers.libraryPluginConfig');
        } else {
          this.dialogHeader = this.$t('headers.globalPluginConfig');
        }
      }
    },

    fetchPluginData: function () {
      // Fetch from server
      let postData = {
        plugin_id: this.pluginId,
        prefer_local: true,
      }
      if (this.viewingRemoteInfo) {
        postData.prefer_local = false;
      }
      if (this.libraryId) {
        postData.library_id = this.libraryId;
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/info'),
        data: postData
      }).then((response) => {
        this.id = response.data.id
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
        // Refresh plugin data
        this.fetchPluginData();
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

    settingsHaveBeenModified() {
      // This is a little complicated than it should be. Bot lists are just arrays.
      // Therefore, we need to loop over both and ensure the key value pairs in each are still the same
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

    ensurePluginSettingsAreSaved() {
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
        // Refresh plugin data
        this.fetchPluginData();
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
  watch: {
    uuid(value) {
      if (value.length > 0) {
        this.currentUuid = this.uuid;
      }
    }
  },
  data: function () {
    return {
      dialogHeader: ref(''),
      tab: ref('info'),
      id: ref(null),
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

.checkbox-hint {
  line-height: 1;
  font-size: 12px;
  min-height: 20px;
  color: rgba(0, 0, 0, 0.54);
  padding: 8px 12px 0;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.q-list--dark .checkbox-hint {
  color: rgba(255, 255, 255, 0.7);
}

.sub-setting {
  margin-left: 30px;
  padding-top: 8px;
  padding-left: 8px;
  border-left: solid thin var(--q-primary);
}

</style>
