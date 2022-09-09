<template>

  <!-- START DIALOG CONFIG
  Center full-screen pop-up
  Note: Update template q-dialog ref="" value

  All Platforms:
   - Swipe left/right to dismiss
  Desktop:
   - Width 700px
   - Minimise button top-right
  Mobile:
   - Full screen
   - Back button top-left
  -->
  <q-dialog
    ref="pluginSelectorDialogRef"
    :maximized="$q.platform.is.mobile"
    transition-show="jump-left"
    transition-hide="jump-right"
    full-height
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.left.right="hide"
      :style="$q.platform.is.mobile ? 'max-width: 100vw;' : 'max-width: 95vw;'"
      style="width:700px;">

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
              icon="close_fullscreen"
              v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <!-- END DIALOG CONFIG -->

      <q-card-section>
        <div class="row q-gutter-xs q-mt-xs justify-between">
          <div class="col-auto">
            <q-btn
              @click="openPluginInstaller"
              class=""
              color="secondary"
              icon-right="add"
              :label="$t('components.plugins.installPluginFromRepo')"/>
          </div>
          <div class="col-auto" style="max-width: 200px">
            <q-input
              filled dense
              class="shadow-1"
              debounce="300"
              color="primary"
              v-model="filter"
              :placeholder="$t('navigation.search')"
              @update="fetchPluginsList">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

        <q-card flat>

          <q-card-section class="q-pa-none">

            <q-list bordered padding>

              <q-separator spaced inset/>
              <div
                v-for="(plugin, index) in plugins"
                v-bind:key="index">
                <q-item
                  clickable v-ripple
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

  </q-dialog>
</template>

<script>

import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { ref } from "vue";
import ConfigDrawerDialog from "components/dialogs/ConfigDrawerDialog";

export default {
  name: 'PluginSelectorDialog',
  props: {
    dialogHeader: {
      type: String,
      default: ' --- header --- '
    },
    hidePlugins: {
      type: Array
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
      this.$refs.pluginSelectorDialogRef.show();
      this.fetchPluginsList();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.pluginSelectorDialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('ok', { selectedPlugin: this.currentPlugin })
      this.$emit('hide')
    },

    fetchPluginsList: function () {
      // Fetch from server
      let data = {
        start: 0,
        length: 1000,
        search_value: this.filter,
        order_by: "name",
        order_direction: "asc",
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/installed'),
        data: data
      }).then((response) => {
        let results = response.data.results;

        let pluginList = []
        for (let i = 0; i < results.length; i++) {
          if (this.hidePlugins.indexOf(results[i].plugin_id) > -1) {
            continue
          }
          pluginList[pluginList.length] = {
            plugin_id: results[i].plugin_id,
            name: results[i].name,
            author: results[i].author,
            description: results[i].description,
            version: results[i].version,
            icon: results[i].icon,
            tags: results[i].tags,
            has_config: results[i].has_config,
          };
        }
        this.plugins = pluginList;

      });
    },

    selectPlugin(plugin) {
      this.currentPlugin = plugin;
      this.hide();
    },

    openPluginInstaller() {
      this.$q.dialog({
        component: ConfigDrawerDialog,
        componentProps: {
          header: this.$t('headers.pluginInstaller'),
          componentName: "PluginInstallerForm",
          width: "2000px",
          componentProps: {},
        },
      }).onOk((payload) => {
      }).onDismiss(() => {
        this.fetchPluginsList();
      })
    },

  },
  watch: {
    initialPath(value) {
      if (value.length > 0) {
        this.currentPlugin = this.initialPath;
      }
    },
    filter(value) {
      this.fetchPluginsList();
    }
  },
  data: function () {
    return {
      maximizedToggle: true,
      currentPlugin: ref(null),
      plugins: ref([]),
      filter: ref(''),
    }
  }
}
</script>
