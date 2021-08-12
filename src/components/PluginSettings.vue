<template>
  <q-card style="width:100%">
    <q-card-section class="">
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6 text-secondary">
            <q-icon name="settings"/>
            {{ $t('headers.pluginSettings') }}
          </div>
        </div>

        <div class="col-auto">
          <q-btn
            v-if="$q.platform.is.mobile"
            @click="savePluginSettings"
            round
            color="secondary"
            icon="save"/>
        </div>
      </div>


    </q-card-section>

    <q-separator/>

    <q-card-section class="q-pt-none">

      <q-list
        v-if="pluginSettings"
        separator>
        <q-item
          v-for="item in pluginSettings"
          :class="item.display"
          :key="item.key_id"
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
            <div class="bg-grey-2 q-pa-sm rounded-borders">
              <q-checkbox
                @update:model-value="savePluginSettings"
                v-model="item.value"
                :label="item.label"/>
            </div>
          </q-item-section>

          <!-- Select input -->
          <q-item-section
            v-if="item.input_type === 'select'">
            <q-select
              @update:model-value="savePluginSettings"
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
              :min="item.slider_options.min"
              :max="item.slider_options.max"
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


        </q-item>
      </q-list>
    </q-card-section>

    <q-card-section>
      <div class="row">
        <div class="col">
          <q-btn
            @click="savePluginSettings"
            class="float-right"
            color="secondary"
            icon-right="save"
            :label="$t('navigation.save')"/>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { ref } from "vue";

export default {
  name: 'PluginSettings',
  props: {
    pluginId: {
      type: String,
      required: true
    },
    settings: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      settingsClasses: ref({}),
      pluginSettings: ref([]),
    }
  },
  methods: {
    fetchPluginSettings: function () {
      // Fetch from server
      let data = {
        plugin_id: this.pluginId,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/info'),
        data: data
      }).then((response) => {
        this.pluginSettings = response.data.settings;
      });
    },
    savePluginSettings: function () {
      console.debug('Fetching info for ' + this.pluginId)

      let data = {
        plugin_id: this.pluginId,
        settings: this.pluginSettings
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'plugins/settings/update'),
        data: data
      }).then((response) => {
        // Save success, show feedback
        this.fetchPluginSettings();
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSavePluginSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    }
  },
  watch: {
    settings(value) {
      if (value.length > 0) {
        this.pluginSettings = this.settings;
      }
    }
  },
  setup() {
    return {}
  }

}
</script>

<style scoped>
.hide-option {
  display: none;
}
</style>
