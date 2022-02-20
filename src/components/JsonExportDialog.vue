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
    ref="jsonDialogRef"
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

      <q-card-section>

        <q-card
          flat
          bordered
          class="q-pa-sm"
          style="width:100%">

          <q-card-section class="q-pt-none">
            <pre>{{ jsonData }}</pre>
          </q-card-section>
        </q-card>

      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="q-mt-md float-right">
          <q-btn
            :label="$t('components.settings.library.copy')"
            color="secondary"
            @click="copyJson"/>
        </div>
      </q-card-section>

    </q-card>

  </q-dialog>
</template>

<script>
import { copyToClipboard } from "quasar";

export default {
  props: {
    dialogHeader: {
      type: String,
      default: ' --- header --- ',
      required: true,
    },
    jsonData: {
      type: String,
      default: ' --- jsonData --- ',
      required: true,
    }
  },

  emits: [
    // REQUIRED
    'ok', 'hide'
  ],

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.jsonDialogRef.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.jsonDialogRef.hide()
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    copyJson() {
      copyToClipboard(this.jsonData)
        .then(() => {
          // success!
          this.$q.notify({
            color: 'secondary',
            position: 'top',
            message: this.$t('notifications.copied'),
            timeout: 200
          })
        })
        .catch(() => {
          // fail
        })
    }
  },
  data: function () {
    return {
      maximizedToggle: true,
    }
  }
}
</script>
