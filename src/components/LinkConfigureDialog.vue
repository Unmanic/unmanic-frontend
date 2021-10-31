<template>
  <q-dialog
    ref="linkConfigureDialogRef"
    :maximized="$q.platform.is.mobile"
    transition-show="slide-left"
    transition-hide="slide-right"
    full-height
    position="right"
    @before-hide="saveInstallationLinkConfig"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.right="hide"
      style="width: 700px; max-width: 90vw;">
      <q-card-section class="bg-grey-2">
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 text-blue-10">
              {{ dialogHeader }}
            </div>
          </div>

          <div class="col-auto">
            <q-btn
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

      <q-card-section class="q-pt-none">

        <div class="q-pa-md">

          <q-card flat>

            <q-card-section>
              <div class="row">
                <div class="col-4 text-h6">{{ $t('components.settings.link.name') }}:</div>
                <div class="col-4">{{ name }}</div>
              </div>
              <div class="row">
                <div class="col-4 text-h6">{{ $t('components.settings.link.address') }}:</div>
                <div class="col-4">{{ address }}</div>
              </div>
              <div class="row">
                <div class="col-4 text-h6">{{ $t('components.settings.link.version') }}:</div>
                <div class="col-4">{{ version }}</div>
              </div>
            </q-card-section>

            <q-separator/>

            <q-card-section class="q-pa-none">

              <h5 class="">{{ $t('components.settings.link.connection') }}</h5>

              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="address === null"
                  type="QInput"/>
                <q-input
                  outlined
                  color="primary"
                  v-model="address"
                  :label="$t('components.settings.link.address')"
                  :placeholder="address"/>
              </div>

              <h5 class="">{{ $t('components.settings.link.configuration') }}</h5>

              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="enableReceivingTasks === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="enableReceivingTasks"
                  :label="$t('components.settings.link.allowReceivingTasks')"
                />
              </div>

              <!--TODO: Disable this field if the IP address is not valid-->
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="enableSendingTasks === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="enableSendingTasks"
                  :label="$t('components.settings.link.allowSendingTasks')"
                />
              </div>

            </q-card-section>

          </q-card>

        </div>

      </q-card-section>

    </q-card>

  </q-dialog>
</template>

<script>
/*
dialogHeader  - Sets the dialog header
uuid          - The UUID of the remote installation
*/

import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { useI18n } from "vue-i18n";
import { ref } from "vue";

export default {
  name: 'LinkConfigureDialog',
  props: {
    dialogHeader: {
      type: String,
      default: ' --- header --- '
    },
    uuid: {
      type: String,
      default: ' - '
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
      this.$refs.linkConfigureDialogRef.show();
      this.fetchInstallationLinkConfig(this.uuid);
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.linkConfigureDialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('ok', {})
      this.$emit('hide')
    },

    fetchInstallationLinkConfig: function (uuid) {
      this.currentUuid = uuid;
      // Fetch from server
      let data = {
        uuid: this.currentUuid,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/link/read'),
        data: data
      }).then((response) => {
        let link_config = response.data.link_config;
        this.address = link_config.address;
        this.name = link_config.name;
        this.version = link_config.version;
        this.enableReceivingTasks = link_config.enable_receiving_tasks;
        this.enableSendingTasks = link_config.enable_sending_tasks;
      });
    },

    saveInstallationLinkConfig: function () {
      // Fetch from server
      let data = {
        link_config: {
          uuid: this.currentUuid,
          address: this.address,
          enable_receiving_tasks: this.enableReceivingTasks,
          enable_sending_tasks: this.enableSendingTasks,
        }
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/link/write'),
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
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToSaveSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
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
      maximizedToggle: true,
      currentUuid: ref(null),
      address: ref(null),
      name: ref(null),
      version: ref(null),
      enableReceivingTasks: ref(null),
      enableSendingTasks: ref(null),
    }
  }
}
</script>