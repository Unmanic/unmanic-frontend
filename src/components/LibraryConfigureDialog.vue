<template>

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
    ref="libraryConfigureDialogRef"
    :maximized="$q.platform.is.mobile"
    transition-show="slide-left"
    transition-hide="slide-right"
    full-height
    position="right"
    @before-hide="beforeDialogHide"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.right="hide"
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
              icon="arrow_forward"
              v-close-popup>
              <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <!-- END DIALOG CONFIG -->

      <q-card-section class="q-pt-none">

        <div :class="$q.platform.is.mobile ? 'q-px-none' : ''">

          <q-card flat>
            <q-card-section :class="$q.platform.is.mobile ? 'q-px-none' : ''">

              <h5 class="q-mt-none q-mb-md">{{ $t('components.settings.library.configuration') }}</h5>

              <div class="q-pb-sm">
                <q-skeleton
                  v-if="name === null"
                  type="QInput"/>
                <q-input
                  v-if="name !== null"
                  outlined
                  color="primary"
                  v-model="name"
                  :label="$t('components.settings.library.name')"
                  :placeholder="name">
                </q-input>
              </div>

              <div class="q-pb-sm">
                <q-skeleton
                  v-if="path === null"
                  type="QInput"/>
                <q-input
                  v-else
                  readonly
                  outlined
                  color="primary"
                  v-model="path"
                  :label="$t('components.settings.library.path')"
                  :placeholder="path"
                  @click="updateLibraryWithDirectoryBrowser">
                  <template v-slot:append>
                    <q-icon
                      @click="updateLibraryWithDirectoryBrowser"
                      class="cursor-pointer"
                      name="folder_open"/>
                  </template>
                </q-input>
              </div>

              <div class="q-pb-sm">
                <q-skeleton
                  v-if="enableScanner === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="enableScanner"
                  :label="$t('components.settings.library.enableScanner')"
                />
              </div>

              <div class="q-pb-sm">
                <q-skeleton
                  v-if="enableInotify === null"
                  type="QToggle"/>
                <q-toggle
                  v-else
                  v-model="enableInotify"
                  :label="$t('components.settings.library.enableInotify')"
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
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import { ref } from "vue";
import DirectoryBrowserDialog from "components/DirectoryBrowserDialog";

export default {
  name: 'LibraryConfigureDialog',
  props: {
    dialogHeader: {
      type: String,
      default: ' --- header --- '
    },
    libraryID: {
      type: Number,
      default: 0
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
      this.$refs.libraryConfigureDialogRef.show();
      this.fetchLibraryConfig(this.libraryID);
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.libraryConfigureDialogRef.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('ok', {});
      this.$emit('hide');
    },

    beforeDialogHide() {
      this.saveLibraryConfig();
    },

    fetchLibraryConfig: function (libraryID) {
      this.currentID = libraryID;
      // Fetch from server
      let data = {
        id: this.currentID,
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/library/read'),
        data: data
      }).then((response) => {
        let libraryConfig = response.data.library_config;
        this.name = libraryConfig.name;
        this.path = libraryConfig.path;
        this.enableScanner = libraryConfig.enable_scanner;
        this.enableInotify = libraryConfig.enable_inotify;
      });
    },
    saveLibraryConfig: function () {
      // Fetch from server
      let data = {
        library_config: {
          id: this.currentID,
          name: this.name,
          path: this.path,
          enable_scanner: this.enableScanner,
          enable_inotify: this.enableInotify,
        },
      }
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'settings/library/write'),
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
    },
    updateLibraryWithDirectoryBrowser: function () {
      this.$q.dialog({
        component: DirectoryBrowserDialog,
        componentProps: {
          dialogHeader: this.$t('headers.selectDirectory'),
          initialPath: this.path,
          listType: 'directories'
        },
      }).onOk((payload) => {
        if (typeof payload.selectedPath !== 'undefined' && payload.selectedPath !== null) {
          this.path = payload.selectedPath
        }
      }).onDismiss(() => {
      })
    },
  },
  watch: {
    libraryID(value) {
      if (value.length > 0) {
        this.currentID = this.libraryID;
      }
    }
  },
  data: function () {
    return {
      maximizedToggle: true,
      currentID: ref(null),
      name: ref(''),
      path: ref(''),
      enableScanner: ref(false),
      enableInotify: ref(false),
      enabledPlugins: ref([1, 2]),
    }
  }
}
</script>
