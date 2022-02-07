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
              icon="close_fullscreen"
              v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <!-- END DIALOG CONFIG -->

      <q-card-section class="q-pt-none">

        <div class="q-pa-md">

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

        </div>

      </q-card-section>

    </q-card>

  </q-dialog>
</template>

<script>

import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { ref } from "vue";

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
          };
        }
        this.plugins = pluginList;

      });
    },

    selectPlugin(plugin) {
      this.currentPlugin = plugin;
      this.hide();
    },

  },
  watch: {
    initialPath(value) {
      if (value.length > 0) {
        this.currentPlugin = this.initialPath;
      }
    }
  },
  data: function () {
    return {
      maximizedToggle: true,
      currentPlugin: ref(null),
      plugins: ref([]),
    }
  }
}
</script>
