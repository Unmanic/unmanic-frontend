<template>
  <!-- NOTE: notice the 'dialogRef' here -->
  <q-dialog
    ref="dialogRef"
    :maximized="$q.platform.is.mobile?maximizedToggle:false"
    transition-show="slide-left"
    transition-hide="slide-right"
    full-height
    position="right"
    @hide="onDialogHide">

    <q-card
      v-touch-swipe.touch.right="hide"
      class="markdown-dialog"
      style="max-width:1000px;">
      <q-card-section class="bg-card-head">
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 text-primary">
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

        <div class="q-pa-md markdown-dialog-content">
          <span v-html="dialogContent"></span>
        </div>
      </q-card-section>

    </q-card>

  </q-dialog>
</template>

<script>
export default {
  props: {
    dialogHeader: {
      type: String,
      default: ' --- header --- '
    },
    dialogContent: {
      type: String,
      default: ' --- content --- '
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
      this.$refs.dialogRef.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialogRef.hide()
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    }
  },
  data: function () {
    return {
      maximizedToggle: true
    }
  }
}
</script>

<style>
.markdown-dialog-content h1 {
  font-size: 2.125rem;
  line-height: 2.125rem;
}

.markdown-dialog-content h2 {
  font-size: 1.75rem;
  line-height: 1.75rem;
}

.markdown-dialog-content h3 {
  font-size: 1.5rem;
  line-height: 1.5rem;
}

.markdown-dialog-content h4 {
  font-size: 1.25rem;
  line-height: 1.5rem;
}

.markdown-dialog-content h5 {
  font-size: 1rem;
  line-height: 1.5rem;
}

.markdown-dialog-content h6 {
  font-size: 1rem;
  line-height: 1.5rem;
}
</style>
