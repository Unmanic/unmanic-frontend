<template>
  <!-- START DIALOG CONFIG
  Right fullscreen dialog

  All Platforms:
   - Swipe right to dismiss
  Desktop:
   - Slide in from right side
   - Minimise button top-right
   - X for close button (top-left)
  Mobile:
   - Full screen
   - Slide in from left side
   - Back button top-left
   - <- for close/back button (top-right)
  -->
  <q-dialog
    ref="configDialogRef"
    :maximized="$q.platform.is.mobile"
    :transition-show="$q.platform.is.mobile ? 'jump-right' : 'slide-left'"
    :transition-hide="$q.platform.is.mobile ? 'jump-left' : 'slide-right'"
    full-height
    position="right"
    persistent
    @before-hide="beforeDialogHide"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.right="hide"
      :style="$q.platform.is.mobile ? 'max-width:100vw;' : `max-width:95vw; width:${width};`">

      <q-card-section class="bg-card-head dialog-sticky-header">
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
              icon="close"
              @click="cancel">
              <q-tooltip class="bg-white text-primary">{{ $t("tooltips.close") }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <!--CONTENT-->
      <q-card-section class="q-pt-none">

        <template v-if="componentName === 'LibraryConfigForm'">
          <LibraryConfigForm ref="childComponent"
                             @requestHide="hide"
                             @requestSave="save"
                             @requestCancel="cancel"
                             v-bind="componentProps"/>
        </template>
        <template v-if="componentName === 'PluginInstallerForm'">
          <PluginInstallerForm ref="childComponent"
                               @requestHide="hide"
                               @requestSave="save"
                               @requestCancel="cancel"
                               v-bind="componentProps"/>
        </template>

      </q-card-section>

      <!--ACTIONS-->
      <q-card-actions v-if="!saveOnExit" align="right" class="text-primary q-mr-lg">
        <q-btn flat color="negative" label="Cancel" @click="cancel"/>
        <q-btn flat label="Save" @click="save"/>
      </q-card-actions>

    </q-card>

  </q-dialog>

  <!--UNSAVED CHANGES WARNING-->
  <q-dialog v-model="unsavedChangesDialog" persistent transition-show="scale" transition-hide="scale">
    <q-card style="width: 300px">
      <q-card-section class="bg-warning text-white">
        <div class="text-h6">Warning</div>
      </q-card-section>

      <q-card-section class="q-pt-sm">
        You have unsaved changes. Are you sure you wish to cancel?
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="No" v-close-popup/>
        <q-btn flat label="Yes" v-close-popup @click="hide"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>

import { ref } from "vue";
import LibraryConfigForm from "components/forms/LibraryConfigForm";
import PluginInstallerForm from "components/forms/PluginInstallerForm";

export default {
  name: "ConfigDrawerDialog",
  components: { LibraryConfigForm, PluginInstallerForm },
  props: {
    header: {
      type: String
    },
    width: {
      type: String,
      default: "1000px"
    },
    saveOnExit: {
      type: Boolean,
      default: true
    },
    componentName: {
      type: String
    },
    componentProps: {
      type: Object
    }
  },
  emits: [
    // REQUIRED
    "ok", "hide", "path"
  ],
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.dialogHeader = this.header;
      this.$refs.configDialogRef.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.configDialogRef.hide();
    },

    save: async function () {
      // Only execute a save function if the child component has finished loading
      if (this.$refs.childComponent.isLoading) {
        return;
      }
      // Execute a save function on the child component
      const saved = await this.$refs.childComponent.save();
      // Wait for save to complete before hiding. Show busy dialog while waiting
      if (saved) {
        // Execute a hide function on the child component
        this.$refs.childComponent.hide();
        // Execute hide function on this component
        this.hide();
      }
    },

    cancel: function () {
      if (this.saveOnExit) {
        this.save();
        return;
      }
      // Execute a cancel function on the child component
      this.$refs.childComponent.cancel();
      // Check if child component has unsaved settings
      if (this.$refs.childComponent.isSaved) {
        // Execute a hide function on the child component
        this.$refs.childComponent.hide();
        // Execute hide function on this component
        this.hide();
        // Return
        return;
      }
      this.unsavedChangesDialog = true;
    },

    beforeDialogHide: function () {
      // Execute a hide function on the child component
      this.$refs.childComponent.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit("ok", {});
      this.$emit("hide");
    }
  },
  data: function () {
    return {
      dialogHeader: ref(""),
      hiding: false,
      unsavedChangesDialog: false
    };
  }
};

</script>

<style scoped>
.dialog-sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>
