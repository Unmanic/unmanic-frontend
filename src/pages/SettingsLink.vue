<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <div class="row">
        <div class="col-sm-12 col-md-10 col-lg-8">
          <div :class="$q.platform.is.mobile ? 'q-ma-sm' : 'q-ma-sm q-pa-md'">

            <q-form
              @submit="save"
              class="q-gutter-md"
            >

              <!--START THIS INSTALLATION-->
              <h5 class="q-mb-none">{{ $t('components.settings.link.thisInstallation') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="installationName === null"
                  type="QInput"/>
                <q-input
                  v-if="installationName !== null"
                  outlined
                  color="primary"
                  v-model="installationName"
                  :label="$t('components.settings.link.nameThisInstall')"
                  :placeholder="installationName">
                </q-input>
              </div>
              <!--END THIS INSTALLATION-->

              <q-separator class="q-my-lg"/>

              <!--START REMOTE INSTALLATIONS-->
              <h5 class="q-mb-none">{{ $t('components.settings.link.remoteInstallations') }}</h5>
              <div class="q-gutter-sm">
                <q-skeleton
                  v-if="remoteInstallations === null"
                  type="text"/>

                <q-list
                  bordered
                  separator
                  class="rounded-borders">

                  <q-item
                    v-for="(installation, index) in remoteInstallations"
                    v-bind:key="index">

                    <q-item-section avatar>
                      <q-img
                        v-if="installation.available"
                        src="~assets/unmanic-logo-white.png"/>
                      <q-img
                        v-else
                        :img-style="{ filter: 'grayscale(100%)' }"
                        src="~assets/unmanic-logo-white.png"/>
                      <q-tooltip v-if="installation.available">
                        {{ $t('tooltips.available') }}
                      </q-tooltip>
                      <q-tooltip v-else>
                        {{ $t('tooltips.unavailable') }}
                      </q-tooltip>
                    </q-item-section>

                    <q-separator inset vertical class="q-mr-sm"/>

                    <q-item-section class="q-px-sm q-mx-sm">
                      <!--Link Address-->
                      <q-item-label lines="1">
                        {{ installation.address }}
                      </q-item-label>

                      <!--Link Name-->
                      <q-item-label caption lines="2">
                        <div class="row q-mt-sm">
                          <div class="col-3">
                            <span class="text-weight-bold">{{ $t('components.settings.link.name') }}:</span>
                          </div>
                          <div class="col-grow">
                            <span class="q-pl-none">{{ installation.name }}</span>
                          </div>
                        </div>
                      </q-item-label>

                      <!--Link Version-->
                      <q-item-label caption lines="2">
                        <div class="row">
                          <div class="col-3">
                            <span class="text-weight-bold">{{ $t('components.settings.link.version') }}:</span>
                          </div>
                          <div class="col-grow">
                            <span class="q-pl-none">{{ installation.version }}</span>
                          </div>
                        </div>
                      </q-item-label>
                    </q-item-section>

                    <q-item-section v-if="!$q.platform.is.mobile">
                      <q-item-label lines="1">
                        <div class="row">
                          <div class="col-6 text-left">
                            <span :class="installation.enableReceivingTasks ? 'text-primary' : 'text-grey-8'">
                              <q-icon v-if="installation.enableReceivingTasks" color="check" name="check"/>
                              <q-icon v-else color="close" name="close"/>
                              |
                              {{ $t('components.settings.link.linkReceivingTasksStatusLabel') }}
                            </span>
                          </div>
                        </div>
                      </q-item-label>
                      <q-item-label lines="1">
                        <div class="row">
                          <div class="col-6 text-left">
                            <span :class="installation.enableSendingTasks ? 'text-primary' : 'text-grey-8'">
                              <q-icon v-if="installation.enableSendingTasks" color="check" name="check"/>
                              <q-icon v-else color="close" name="close"/>
                              |
                              {{ $t('components.settings.link.linkSendingTasksStatusLabel') }}
                            </span>
                          </div>
                        </div>
                      </q-item-label>
                      <q-item-label v-if="installation.enableSendingTasks" lines="1">
                        <div class="row">
                          <div class="col-6 text-left">
                            <span :class="installation.enableTaskPreloading ? 'text-primary' : 'text-grey-8'">
                              <q-icon v-if="installation.enableTaskPreloading" color="check" name="check"/>
                              <q-icon v-else color="close" name="close"/>
                              |
                              {{ $t('components.settings.link.linkPreloadRemoteTasksStatusLabel') }}
                            </span>
                          </div>
                        </div>
                      </q-item-label>
                      <q-item-label v-if="installation.enableSendingTasks" lines="1">
                        <div class="row">
                          <div class="col-6 text-left">
                            <span :class="installation.enableChecksumValidation ? 'text-primary' : 'text-grey-8'">
                              <q-icon v-if="installation.enableChecksumValidation" color="check" name="check"/>
                              <q-icon v-else color="close" name="close"/>
                              |
                              {{ $t('components.settings.link.linkConfigChecksumValidationStatusLabel') }}
                            </span>
                          </div>
                        </div>
                      </q-item-label>
                      <q-item-label v-if="installation.enableSendingTasks" lines="1">
                        <div class="row">
                          <div class="col-6 text-left">
                            <span :class="installation.enableConfigMissingLibraries ? 'text-primary' : 'text-grey-8'">
                              <q-icon v-if="installation.enableConfigMissingLibraries" color="check" name="check"/>
                              <q-icon v-else color="close" name="close"/>
                              |
                              {{ $t('components.settings.link.linkConfigRemoteLibrariesStatusLabel') }}
                            </span>
                          </div>
                        </div>
                      </q-item-label>
                      <q-item-label lines="1">
                        <div class="row">
                          <div class="col-6 text-left">
                            <span :class="installation.enableDistributedWorkers ? 'text-primary' : 'text-grey-8'">
                              <q-icon v-if="installation.enableDistributedWorkers" color="check" name="check"/>
                              <q-icon v-else color="close" name="close"/>
                              |
                              {{ $t('components.settings.link.linkDistributedWorkersStatusLabel') }}
                            </span>
                          </div>
                        </div>
                      </q-item-label>
                    </q-item-section>

                    <q-separator inset vertical class="q-mx-sm"/>

                    <q-item-section center side>
                      <div class="text-grey-8 q-gutter-xs">
                        <q-btn
                          size="12px"
                          flat dense round icon="tune"
                          @click="configureRemoteInstallation(index)">
                          <q-tooltip class="bg-white text-primary">
                            {{ $t('tooltips.configure') }}
                          </q-tooltip>
                        </q-btn>
                        <q-btn
                          flat dense round
                          size="12px"
                          color="negative"
                          icon="delete"
                          @click="deleteRemoteInstallation(index)">
                          <q-tooltip class="bg-white text-primary">
                            {{ $t('tooltips.delete') }}
                          </q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>

                  </q-item>

                </q-list>

                <q-bar class="bg-transparent">
                  <q-space/>
                  <q-btn
                    round
                    flat
                    color="primary"
                    icon="add"
                    @click="newRemoteInstallation = true">
                    <q-tooltip class="bg-white text-primary">{{ $t('tooltips.add') }}</q-tooltip>
                  </q-btn>
                </q-bar>

                <q-dialog v-model="newRemoteInstallation" persistent>
                  <q-card style="min-width: 350px">

                    <q-card-section>
                      <div class="text-h6">{{ $t('components.settings.link.addRemoteInstallation') }}</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-input
                        outlined
                        color="primary"
                        v-model="newRemoteInstallationAddress"
                        :label="$t('components.settings.link.address')"
                        placeholder="192.168.1.2:8888">
                      </q-input>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-select
                        outlined
                        v-model="newRemoteInstallationAuthenticationType"
                        :options="newRemoteInstallationAuthenticationOptions"
                        :label="$t('components.settings.link.authentication')"
                      />
                    </q-card-section>

                    <q-card-section v-if="newRemoteInstallationAuthenticationType !== 'None'" class="q-pt-none">
                      <q-input
                        outlined
                        color="primary"
                        v-model="newRemoteInstallationUsername"
                        :label="$t('components.settings.link.username')">
                      </q-input>
                    </q-card-section>

                    <q-card-section v-if="newRemoteInstallationAuthenticationType !== 'None'" class="q-pt-none">
                      <q-input
                        outlined
                        color="primary"
                        v-model="newRemoteInstallationPassword"
                        :label="$t('components.settings.link.password')">
                      </q-input>
                    </q-card-section>

                    <q-card-actions align="right" class="text-primary">
                      <q-btn flat :label="$t('navigation.cancel')" v-close-popup/>
                      <q-btn
                        @click="addNewRemoteInstallation"
                        flat :label="$t('components.settings.link.add')" v-close-popup/>
                    </q-card-actions>
                  </q-card>
                </q-dialog>

              </div>
              <!--END REMOTE INSTALLATIONS-->

              <div>
                <q-btn :label="$t('navigation.submit')" type="submit" color="secondary"/>
              </div>
            </q-form>

          </div>
        </div>
      </div>

      <MobileSettingsQuickNav
        v-bind:prevEnabled="true"
        v-bind:prevLabel="$t('navigation.plugins')"
        v-bind:prevPath="'/ui/settings-plugins'"
        v-bind:nextEnabled="false"
        v-bind:nextLabel="'none'"
        v-bind:nextPath="'/ui/settings-plugins'"/>

    </div>
  </q-page>
</template>

<script>
import { UnmanicWebsocketHandler } from "src/js/unmanicWebsocket";
import { onMounted, onUnmounted, ref } from "vue";
import { useQuasar } from 'quasar'
import { useI18n } from "vue-i18n";
import LinkConfigureDialog from "components/LinkConfigureDialog";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import MobileSettingsQuickNav from "components/MobileSettingsQuickNav";

export default {
  name: 'SettingsLink',
  components: { MobileSettingsQuickNav },
  setup() {
    const $q = useQuasar()
    const { t: $t } = useI18n();

    /**
     * Unmanic WS handle
     * @type {null}
     */
    let ws = null;
    let unmanicWSHandler = UnmanicWebsocketHandler($t);

    function initUnmanicWebsocket() {
      ws = unmanicWSHandler.init();
    }

    function closeUnmanicWebsocket() {
      unmanicWSHandler.close();
    }

    // END UNMANIC WS HANDLE

    onMounted(() => {
      // Start the websocket
      initUnmanicWebsocket();
    })
    onUnmounted(() => {
      // Close the websocket
      closeUnmanicWebsocket();
    })
  },
  data() {
    return {
      installationName: ref(null),
      remoteInstallations: ref(null),
      newRemoteInstallation: ref(false),
      newRemoteInstallationAddress: ref(''),
      newRemoteInstallationAuthenticationType: ref('None'),
      newRemoteInstallationAuthenticationOptions: ref(['None', 'Basic']),
      newRemoteInstallationUsername: ref(null),
      newRemoteInstallationPassword: ref(null),
    }
  },
  methods: {
    fetchSettings: function () {
      // Fetch current settings
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v2', 'settings/read')
      }).then((response) => {
        // Set the installation name
        this.installationName = response.data.settings.installation_name
        // Set the list of remote installations
        let remoteInstallationsList = []
        for (let i = 0; i < response.data.settings.remote_installations.length; i++) {
          let remoteInstallation = response.data.settings.remote_installations[i];
          remoteInstallationsList[remoteInstallationsList.length] = {
            address: remoteInstallation.address,
            enableReceivingTasks: remoteInstallation.enable_receiving_tasks,
            enableSendingTasks: remoteInstallation.enable_sending_tasks,
            enableTaskPreloading: remoteInstallation.enable_task_preloading,
            enableChecksumValidation: remoteInstallation.enable_checksum_validation,
            enableConfigMissingLibraries: remoteInstallation.enable_config_missing_libraries,
            enableDistributedWorkers: remoteInstallation.enable_distributed_worker_count,
            name: remoteInstallation.name,
            version: remoteInstallation.version,
            uuid: remoteInstallation.uuid,
            available: remoteInstallation.available,
          }
        }
        this.remoteInstallations = remoteInstallationsList;
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchSettings'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    save: function () {
      // Save settings
      let remoteInstallationsList = []
      for (let i = 0; i < this.remoteInstallations.length; i++) {
        remoteInstallationsList[remoteInstallationsList.length] = {
          address: this.remoteInstallations[i].address,
          enable_receiving_tasks: this.remoteInstallations[i].enableReceivingTasks,
          enable_sending_tasks: this.remoteInstallations[i].enableSendingTasks,
          name: this.remoteInstallations[i].name,
          version: this.remoteInstallations[i].version,
          uuid: this.remoteInstallations[i].uuid,
          available: this.remoteInstallations[i].available,
        };
      }
      let data = {
        settings: {
          installation_name: this.installationName,
        }
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/write'),
        data: data
      }).then((response) => {
        // Save success, show feedback
        this.fetchSettings();
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
    },
    addNewRemoteInstallation: function () {
      // Ensure this remote installation is not already in the list
      for (let i = 0; i < this.remoteInstallations.length; i++) {
        if (this.newRemoteInstallationAddress === this.remoteInstallations[i].address) {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: this.$t('notifications.remoteInstallationAlreadyInList'),
            icon: 'report_problem',
            actions: [{ icon: 'close', color: 'white' }]
          })
          return;
        }
      }

      // Validate connection to the provided address and add to list
      let data = {
        address: this.newRemoteInstallationAddress,
        auth: this.newRemoteInstallationAuthenticationType,
        username: this.newRemoteInstallationUsername,
        password: this.newRemoteInstallationPassword,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/link/validate'),
        data: data
      }).then((response) => {
        // Ensure this remote installation was compatible with linking
        if (typeof response.data.installation.settings.installation_name === 'undefined') {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: this.$t('notifications.incompatibleRemoteInstallation'),
            icon: 'report_problem',
            actions: [{ icon: 'close', color: 'white' }]
          })
        } else {
          // Get name and version from API validation
          let name = response.data.installation.settings.installation_name;
          let version = response.data.installation.version;
          let uuid = response.data.installation.session.uuid;
          // Add to list
          this.remoteInstallations[this.remoteInstallations.length] = {
            address: this.newRemoteInstallationAddress,
            auth: this.newRemoteInstallationAuthenticationType,
            username: this.newRemoteInstallationUsername,
            password: this.newRemoteInstallationPassword,
            enable_receiving_tasks: false,
            enable_sending_tasks: false,
            name: name,
            version: version,
            uuid: uuid,
            available: true,
          }
          // Trigger a save event
          let data = {
            link_config: {
              uuid: uuid,
              name: name,
              version: version,
              available: true,
              address: this.newRemoteInstallationAddress,
              auth: this.newRemoteInstallationAuthenticationType,
              username: this.newRemoteInstallationUsername,
              password: this.newRemoteInstallationPassword,
              enable_receiving_tasks: false,
              enable_sending_tasks: false,
            },
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
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.invalidRemoteInstallationAddress'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      });
    },
    deleteRemoteInstallation: function (index) {
      let newList = []
      for (let i = 0; i < this.remoteInstallations.length; i++) {
        if (i === index) {
          // Request a DELETE from server
          let data = {
            uuid: this.remoteInstallations[i].uuid,
          }
          axios({
            method: 'delete',
            url: getUnmanicApiUrl('v2', 'settings/link/remove'),
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
            // Update list
            //this.fetchLibraryList();
          }).catch(() => {
            this.$q.notify({
              color: 'negative',
              position: 'top',
              message: this.$t('notifications.failedToSaveSettings'),
              icon: 'report_problem',
              actions: [{ icon: 'close', color: 'white' }]
            })
          });
          // Remove item from the list by skipping it this loop
          continue;
        }
        newList[newList.length] = this.remoteInstallations[i];
      }
      this.remoteInstallations = newList;
    },
    configureRemoteInstallation: function (index) {
      let installation = this.remoteInstallations[index]
      this.$q.dialog({
        component: LinkConfigureDialog,
        componentProps: {
          dialogHeader: this.$t('headers.configureRemoteInstallationLink'),
          uuid: installation.uuid
        },
      }).onOk((payload) => {
      }).onDismiss(() => {
        this.fetchSettings()
      })
    }
  },
  created() {
    this.fetchSettings();
  },
  computed: {
    dragOptions() {
      return {
        animation: 100,
        group: "scheduleOrder",
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

.ghost {
  opacity: 0;
}

div.sub-setting {
  margin-left: 30px;
  padding-top: 8px;
  padding-left: 8px;
  border-left: solid thin var(--q-primary);
}
</style>
