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
      <q-card-section class="bg-card-head">
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

            <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

              <div class="row items-center no-wrap q-mb-md">
                <div class="col">
                  <div class="text-h6">
                    {{ $t('components.settings.link.connection') }}
                  </div>
                </div>
              </div>

              <div class="q-gutter-sm">
                <q-input
                  outlined
                  color="primary"
                  v-model="address"
                  :label="$t('components.settings.link.address')"
                  :placeholder="address"/>
              </div>

              <div class="q-gutter-sm q-mt-sm">
                <q-select
                  outlined
                  v-model="authType"
                  :options="authOptions"
                  :label="$t('components.settings.link.authentication')"
                />
              </div>

              <div v-if="authType !== 'None'"
                   class="sub-setting q-pt-none q-mt-sm">
                <q-input
                  outlined
                  color="primary"
                  v-model="username"
                  :label="$t('components.settings.link.username')">
                </q-input>
              </div>

              <div v-if="authType !== 'None'"
                   class="sub-setting q-pt-none q-pb-sm">
                <q-input
                  outlined
                  color="primary"
                  v-model="password"
                  :type="showPassword ? 'password' : 'text'"
                  :label="$t('components.settings.link.password')">
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>
            </q-card-section>

            <q-separator/>

            <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

              <div class="row items-center no-wrap q-mb-md">
                <div class="col">
                  <div class="text-h6">
                    {{ $t('components.settings.link.remoteTaskProcessing') }}
                  </div>
                </div>
              </div>

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

              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="enableSendingTasks === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="enableSendingTasks"
                  :label="$t('components.settings.link.allowSendingTasks')"
                  :disable="address === '???'"
                />
              </div>

              <div
                v-if="enableSendingTasks"
                class="sub-setting">
                <div class="q-gutter-sm">
                  <q-skeleton
                    v-if="enableTaskPreloading === null"
                    type="QToggle"/>
                  <q-toggle
                    v-else
                    v-model="enableTaskPreloading"
                    :label="$t('components.settings.link.enableTaskPreloading')"
                  />
                </div>
                <div
                  v-if="enableTaskPreloading"
                  class="sub-setting">
                  <div class="q-gutter-sm">
                    <q-skeleton
                      v-if="preloadingCount === null"
                      type="QInput"/>
                    <q-input
                      v-if="preloadingCount !== null"
                      readonly
                      outlined
                      color="primary"
                      v-model="preloadingCount"
                      :label="$t('components.settings.link.preloadingCount')"
                      :placeholder="preloadingCount">
                    </q-input>
                    <q-skeleton
                      v-if="preloadingCount === null"
                      type="QSlider"/>
                    <q-slider
                      v-if="preloadingCount !== null"
                      v-model="preloadingCount"
                      :min="0"
                      :max="10"
                      color="primary"
                    />
                  </div>

                </div>
              </div>
              <div
                v-if="enableSendingTasks"
                class="sub-setting">
                <div class="q-gutter-sm">
                  <q-skeleton
                    v-if="enableChecksumValidation === null"
                    type="QToggle"/>
                  <q-toggle
                    v-else
                    v-model="enableChecksumValidation"
                    :label="$t('components.settings.link.enableChecksumValidation')"
                  />
                </div>
              </div>
              <div
                v-if="enableSendingTasks"
                class="sub-setting">
                <div class="q-gutter-sm">
                  <q-skeleton
                    v-if="enableConfigMissingLibraries === null"
                    type="QToggle"/>
                  <q-toggle
                    v-else
                    v-model="enableConfigMissingLibraries"
                    :label="$t('components.settings.link.enableConfigMissingLibraries')"
                  />
                </div>
              </div>

            </q-card-section>

            <q-separator/>

            <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

              <div class="row items-center no-wrap q-mb-md">
                <div class="col">
                  <div class="text-h6">
                    {{ $t('components.settings.link.collectiveManagement') }}
                  </div>
                </div>
              </div>

              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="enableDistributedWorkerCount === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="enableDistributedWorkerCount"
                  :label="$t('components.settings.link.enableDistributedWorkerCount')"
                />
              </div>

              <div
                v-if="enableDistributedWorkerCount"
                class="sub-setting">
                <div class="q-gutter-sm">
                  <q-skeleton
                    v-if="distributedWorkerCountTarget === null"
                    type="QSlider"/>
                  <div
                    class="q-pl-lg"
                    style="width: 80%">
                    <q-slider
                      v-if="distributedWorkerCountTarget !== null"
                      v-model="distributedWorkerCountTarget"
                      :min="0"
                      :max="12"
                      label
                      :label-value="$t('components.settings.link.workerTarget') + ': ' + distributedWorkerCountTarget"
                      label-always
                      color="primary"
                    />
                  </div>
                </div>
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
      // Fetch from server
      let data = {
        uuid: uuid,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/link/read'),
        data: data
      }).then((response) => {
        let link_config = response.data.link_config;
        this.currentUuid = uuid;
        this.address = link_config.address;
        this.authType = link_config.auth;
        this.username = link_config.username;
        this.password = link_config.password;
        this.available = link_config.available;
        this.name = link_config.name;
        this.version = link_config.version;
        this.enableReceivingTasks = link_config.enable_receiving_tasks;
        this.enableSendingTasks = link_config.enable_sending_tasks;
        this.enableTaskPreloading = link_config.enable_task_preloading;
        this.preloadingCount = link_config.preloading_count;
        this.enableChecksumValidation = link_config.enable_checksum_validation;
        this.enableConfigMissingLibraries = link_config.enable_config_missing_libraries;
        this.enableDistributedWorkerCount = link_config.enable_distributed_worker_count;
        this.distributedWorkerCountTarget = response.data.distributed_worker_count_target;
      });
    },

    saveInstallationLinkConfig: function () {
      // Fetch from server
      let data = {
        link_config: {
          uuid: this.currentUuid,
          address: this.address,
          auth: this.authType,
          username: this.username,
          password: this.password,
          enable_receiving_tasks: this.enableReceivingTasks,
          enable_sending_tasks: this.enableSendingTasks,
          enable_task_preloading: this.enableTaskPreloading,
          preloading_count: this.preloadingCount,
          enable_checksum_validation: this.enableChecksumValidation,
          enable_config_missing_libraries: this.enableConfigMissingLibraries,
          enable_distributed_worker_count: this.enableDistributedWorkerCount,
        },
        distributed_worker_count_target: this.distributedWorkerCountTarget,
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
      address: ref(''),
      authType: ref('None'),
      authOptions: ref(['None', 'Basic']),
      username: ref(null),
      password: ref(null),
      showPassword: ref(true),
      available: ref(false),
      name: ref(''),
      version: ref(''),
      enableReceivingTasks: ref(null),
      enableSendingTasks: ref(null),
      enableTaskPreloading: ref(null),
      preloadingCount: ref(null),
      enableChecksumValidation: ref(null),
      enableConfigMissingLibraries: ref(null),
      enableDistributedWorkerCount: ref(null),
      distributedWorkerCountTarget: ref(null),
    }
  }
}
</script>
