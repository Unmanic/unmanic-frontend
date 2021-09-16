<template>
  <q-dialog
    ref="pluginFlowDialogRef"
    :maximized="$q.platform.is.mobile"
    transition-show="slide-right"
    transition-hide="slide-left"
    full-height
    position="left"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.left="hide"
      style="max-width: 100vw;">

      <q-card-section class="bg-grey-2">
        <div class="row items-center no-wrap">

          <div class="col-auto">
            <q-btn
              color="grey-7"
              dense
              round
              flat
              icon="arrow_back" v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.back') }}</q-tooltip>
            </q-btn>
          </div>

          <div class="col">
            <div class="text-h6 text-secondary">
              <q-icon name="low_priority"/>
              {{ $t('headers.pluginFlow') }}
            </div>
          </div>

        </div>
      </q-card-section>

      <q-card-section class="q-pt-none q-pa-none">

        <div class="q-pt-md q-px-lg" style="width: 1000px; max-width: 90vw;">
          <p class="q-mb-xs" v-html="$t('components.plugins.configurePluginFlowSection.line1')"></p>
          <p class="q-mb-xs" v-html="$t('components.plugins.configurePluginFlowSection.line2')"></p>
          <p class="q-mb-xs" v-html="$t('components.plugins.configurePluginFlowSection.line3')"></p>
          <p class="q-mb-xs" v-html="$t('components.plugins.configurePluginFlowSection.line4')"></p>
        </div>

      </q-card-section>

      <q-card-section class="q-pt-none q-pa-none">

        <div class="q-pa-md">

          <!-- START PLUGIN TYPES LIST-->
          <div class="row">

            <q-list>
              <q-expansion-item
                v-for="pt in pluginTypes"
                :key="pt.type"
                v-bind="pt"
                group="pluginTypes"
                icon="list_alt"
                :label="($t(pt.labelCode).length<50) ? $t(pt.labelCode) : $t(pt.labelCode).substring(0, 48) + '..'"
                :caption="($t(pt.labelCode + 'Caption') !== pt.labelCode + 'Caption') ? $t(pt.labelCode + 'Caption') : ''"
                caption-lines="4"
                style="width: 1000px; max-width: 90vw;"
                class="text-h8 text-primary">

                <q-card
                  inline
                  style="width: 1000px; max-width: 90vw;" class="q-ma-lg-xs q-pa-lg-sm q-pa-sm-none">

                  <div class="row">
                    <q-card-section class="col justify-center full-height full-width text-center">

                      <q-list
                        bordered
                        class="rounded-borders"
                        style="max-width: 1500px">

                        <draggable
                          class="plugin-flow-group"
                          item-key="order"
                          tag="transition-group"
                          :component-data="{ tag: 'ul', name: 'flip-list', type: 'transition' }"
                          v-model="pluginFlowByType[pt.type]"
                          v-bind="dragOptions"
                          @end="savePluginFlow(pt.type)"
                        >
                          <template #item="{ element, index }">
                            <q-item
                              :key="index"
                              class="q-pa-none rounded-borders"
                              active-class="plugin-flow-item">

                              <q-item-section side class="gt-xs q-px-sm">
                                <q-item-label lines="1" class="text-left">
                                  <span class="text-weight-medium">{{ index + 1 }}</span>
                                  <q-tooltip
                                    anchor="center right"
                                    self="center left"
                                    class="bg-white text-primary">{{ $t('tooltips.position') }}
                                  </q-tooltip>
                                </q-item-label>
                              </q-item-section>

                              <q-separator inset vertical class="gt-xs q-mx-sm"/>

                              <q-item-section avatar class="q-px-sm q-mx-sm">
                                <q-skeleton v-if="!element.icon" width="35px" height="35px"/>
                                <q-avatar v-else rounded size="35px">
                                  <q-img :src="element.icon" class="" style="max-width: 30px;"/>
                                </q-avatar>
                              </q-item-section>

                              <q-item-section top class="q-mx-md">
                                <q-item-label lines="1" class="text-left">
                                  <span class="text-weight-medium">{{ element.name }}</span>
                                </q-item-label>
                                <q-item-label caption lines="1" class="text-left q-ml-sm">
                                  <!--TODO: Limit length of description-->
                                  {{ element.description }}
                                </q-item-label>
                                <q-tooltip
                                  anchor="center middle"
                                  self="center middle"
                                  class="bg-white text-primary lt-sm">
                                  {{ element.name }}
                                </q-tooltip>
                              </q-item-section>

                              <q-separator inset vertical class="q-mx-sm"/>

                              <q-item-section avatar>
                                <q-avatar rounded>
                                  <q-icon name="drag_handle" class="" style="max-width: 30px;"/>
                                </q-avatar>
                              </q-item-section>

                            </q-item>
                          </template>
                        </draggable>

                      </q-list>

                    </q-card-section>
                  </div>
                </q-card>

              </q-expansion-item>
            </q-list>

          </div>
          <!-- END PLUGIN TYPES LIST-->

        </div>

      </q-card-section>

    </q-card>

  </q-dialog>
</template>

<script>
import { ref } from 'vue';
import axios from "axios";
import draggable from "vuedraggable";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";

const defaultOrder = []

export default {
  name: 'PluginFlowDialog',
  components: {
    draggable
  },
  props: {},
  emits: [
    // REQUIRED
    'ok', 'hide', 'path'
  ],
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.pluginFlowDialogRef.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.pluginFlowDialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },
    fetchPluginTypes: function () {
      // Fetch from server
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'plugins/flow/types'),
      }).then((response) => {
        let results = response.data.results;
        let pluginTypes = []
        for (let i = 0; i < results.length; i++) {
          let labelCode = results[i].split('_').map((word, index) => {
            if (index === 0) return word
            return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase()
          }).join('');
          pluginTypes[pluginTypes.length] = {
            type: results[i],
            labelCode: 'components.plugins.types.' + labelCode,
          }
        }
        this.pluginTypes = pluginTypes;

        this.fetchPluginFlow()
      });
    },
    fetchPluginFlow: function () {
      for (let i = 0; i < this.pluginTypes.length; i++) {
        let data = {
          plugin_type: this.pluginTypes[i].type
        }
        axios({
          method: 'post',
          url: getUnmanicApiUrl('v2', 'plugins/flow'),
          data: data
        }).then((response) => {
          this.pluginFlowByType[this.pluginTypes[i].type] = response.data.results;
        });
      }
    },
    savePluginFlow: function (pluginType) {
      let data = {
        plugin_type: pluginType,
        plugin_flow: this.pluginFlowByType[pluginType],
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/flow/save'),
        data: data
      }).then((response) => {
        // Notify save
        /*this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('notifications.saved'),
          icon: 'cloud_done',
          actions: [{ icon: 'close', color: 'white' }]
        })*/
      }).catch(() => {
        // Notify failure
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.plugins.errorSavingFlow'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    movePluginInFlow: function (pluginType, currentIndex, pluginId, direction) {
      let pluginFlow = this.pluginFlowByType[pluginType].slice();

      // Generate new index
      let newIndex;
      if (direction === 'up') {
        // Dont move up if already at the top
        if (currentIndex === 0) {
          console.debug('Cannot move up - already at the top')
          return
        }
        newIndex = (currentIndex - 1)
      }
      if (direction === 'down') {
        newIndex = (currentIndex + 1)
        // Dont move down if already at the bottom
        if (newIndex === pluginFlow.length) {
          console.debug('Cannot move down - already at the bottom')
          return
        }
      }

      // Extract item data to insert below
      let pluginData = pluginFlow[currentIndex];

      // Reorder flow and reorder
      pluginFlow.splice(currentIndex, 1);
      pluginFlow.splice(newIndex, 0, pluginData);

      // Save new order
      this.pluginFlowByType[pluginType] = pluginFlow;
      this.savePluginFlow(pluginType);
    }
  },
  created() {
    this.fetchPluginTypes();
  },
  data: function () {
    return {
      options: {
        dropzoneSelector: ".q-list",
        draggableSelector: ".q-item"
      },
      pluginTypes: ref([]),
      pluginFlowByType: ref({}),
      files: ref([])
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 100,
        group: "pluginFlow",
        disabled: false,
        ghostClass: "ghost",
        direction: "vertical",
        delay: 200,
        delayOnTouchOnly: true,
      };
    }
  }
}
</script>
<style>
.plugin-flow-group {
  padding-left: 20px;
  padding-right: 20px;
}

.ghost {
  opacity: 0;
}

.plugin-flow-item {
  background: #F2C037;
}
</style>
