<template>

  <q-dialog
    v-model="pluginInfoShowDialog"
    :full-width="settings.length > 0"
    full-height
    :maximized="$q.platform.is.mobile"
    @hide="onDialogHide">
    <q-card
      :style="settings.length > 0 ? '' : 'max-width: 1200px;'"
      style="width:100%;">
      <q-card-section class="bg-grey-2">
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 text-secondary">
              <q-icon name="extension"/>
              {{ $t('headers.pluginInfo') }}
            </div>
          </div>

          <div class="col-auto">
            <q-btn
              color="grey-7"
              dense
              round
              flat
              icon="close_fullscreen" v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <div class="row">

          <div
            :class="settings.length > 0 ? 'col-md-6 col-12' : 'col-12'"
            class="col q-pa-xs">
            <!--INFO-->
            <div class="row">
              <div class="col col-md-auto col-12 q-pa-xs">
                <q-skeleton v-if="!icon" width="350px" height="350px" class="shadow-1"/>
                <q-avatar v-else rounded size="350px" font-size="82px" text-color="white" class="shadow-1">
                  <q-img :src="icon" class="" style="max-width: 300px;"/>
                </q-avatar>
              </div>
              <div class="col col-md-grow col-12 q-pa-xs">
                <q-skeleton v-if="!name" width="100%" max-height="350px" class="shadow-1"/>
                <q-card v-else style="height: 350px;">
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

                  <q-card-section style="max-height: 222px;">
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

                      <div class="row q-mt-sm">
                        <b>Description:</b>
                      </div>

                      <div class="row q-mt-md">
                        <span class="plugin-description" v-html="description"></span>
                      </div>

                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="!viewingRemoteInfo"
            class="col col-md-6 col-sm-12 q-pa-xs">
            <!--SETTINGS-->
            <div class="row">
              <div class="col col-12 q-pa-xs">
                <div class="plugin-info-settings">
                  <PluginSettings v-bind:pluginId="plugin_id" v-bind:settings="settings"/>
                </div>
              </div>
            </div>
          </div>
        </div>

      </q-card-section>

    </q-card>
  </q-dialog>

</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { markdownToHTML } from "src/js/markupParser";
import PluginSettings from "components/PluginSettings";

export default {
  name: 'PluginInfo',
  components: { PluginSettings },
  data() {
    return {
      pluginInfoShowDialog: ref(false),
      id: ref(null),
      plugin_id: ref(''),
      icon: ref(null),
      name: ref(null),
      description: ref(null),
      tags: ref(null),
      author: ref(null),
      version: ref(null),
      changelog: ref(null),
      status: ref(null),
      settings: ref([]),
    }
  },
  watch: {
    showPluginInfo(value) {
      if (value.length > 0) {
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
      this.id = null;
      this.plugin_id = '';
      this.icon = null;
      this.name = null;
      this.description = null;
      this.tags = null;
      this.author = null;
      this.version = null;
      this.changelog = null;
      this.status = null;
      this.settings = [];
    },
    fetchPluginInfo() {
      console.debug('Fetching info for ' + this.showPluginInfo)
      // Fetch from server
      let data = {
        plugin_id: this.showPluginInfo,
        prefer_local: true,
      }
      if (this.viewingRemoteInfo) {
        data.prefer_local = false;
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/info'),
        data: data
      }).then((response) => {
        this.id = response.data.id
        this.plugin_id = response.data.plugin_id
        this.icon = response.data.icon
        this.name = response.data.name
        this.tags = response.data.tags
        this.author = response.data.author
        this.version = response.data.version
        this.changelog = response.data.changelog
        this.status = response.data.status
        if (!this.viewingRemoteInfo) {
          this.settings = response.data.settings
        }

        // Parse the changelog
        this.changelog = markdownToHTML(response.data.changelog);

        // Parse the description
        this.description = markdownToHTML(response.data.description);
      });
    },
    onDialogHide() {
      this.$emit('hide')
    }
  },
  props: {
    showPluginInfo: {
      type: String,
      required: true
    },
    viewingRemoteInfo: {
      type: Boolean,
      required: false
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
span.plugin-description * {
  margin-bottom: 0;
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
}
span.plugin-description ul {
  margin-top: 10px;
  margin-bottom: 10px;
}
span.plugin-description pre {
  background: #EEE;
  border: inset thin;
}
</style>
